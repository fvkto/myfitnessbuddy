import React, { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { setCloudSyncUser, pullAllFromCloud, pushAllLocalDataToCloud } from "../lib/cloudSync";
import { Loader2, Lock, Mail, Sparkles, AlertTriangle } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

interface AuthGateProps {
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined); // undefined = ainda verificando
  const [isSyncing, setIsSyncing] = useState(false);

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
      })
      .catch(() => {
        // Supabase não configurado/inacessível: cai na tela de login,
        // que já mostra o aviso de configuração pendente.
        setSession(null);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        // Logout: limpa o cache local para não vazar dados desta conta
        // caso outra pessoa entre com outra conta neste mesmo aparelho.
        setCloudSyncUser(null);
        [
          "mfb_user_goals_v1",
          "mfb_day_logs_v1",
          "mfb_weight_history_v1",
          "mfb_food_database_v1",
          "mfb_saved_recipes_v1",
        ].forEach(key => localStorage.removeItem(key));
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Sempre que a sessão mudar para "logado", sincroniza os dados com a nuvem
  // antes de liberar a renderização do app.
  useEffect(() => {
    if (!session?.user) return;

    let cancelled = false;

    (async () => {
      setIsSyncing(true);
      setCloudSyncUser(session.user.id);

      try {
        // Verifica se já existe alguma coisa salva na nuvem para este usuário.
        const { data: existingRows } = await supabase
          .from("app_storage")
          .select("key")
          .eq("user_id", session.user.id)
          .limit(1);

        if (!existingRows || existingRows.length === 0) {
          // Conta nova (ou primeiro login neste servidor): migra o que já
          // existir no localStorage deste aparelho para a nuvem.
          await pushAllLocalDataToCloud(session.user.id);
        } else {
          // Já existem dados na nuvem: eles mandam, sobrescrevendo o cache local.
          await pullAllFromCloud(session.user.id);
        }
      } catch (err) {
        console.error("Erro ao sincronizar dados após login:", err);
      }

      if (!cancelled) setIsSyncing(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setInfoMessage(null);

    if (!isSupabaseConfigured) {
      setAuthError("O Supabase ainda não foi configurado neste servidor.");
      return;
    }

    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });

    if (error) {
      setAuthError(error.message);
      setIsGoogleLoading(false);
    }
    // Em caso de sucesso, o navegador é redirecionado para o Google —
    // não há mais nada a fazer aqui.
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setInfoMessage(null);

    if (!isSupabaseConfigured) {
      setAuthError("O Supabase ainda não foi configurado neste servidor. Configure as variáveis de ambiente e tente novamente.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfoMessage(
          "Conta criada! Se a confirmação por e-mail estiver ativada no Supabase, verifique sua caixa de entrada antes de entrar."
        );
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setAuthError(err?.message || "Não foi possível concluir. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ainda verificando se já existe uma sessão salva neste aparelho.
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Logado, mas ainda sincronizando os dados com a nuvem.
  if (session?.user && isSyncing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Sincronizando seus dados...
        </p>
      </div>
    );
  }

  if (session?.user) {
    return <>{children}</>;
  }

  // Não logado: tela de login/cadastro.
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md shadow-blue-500/20 mb-3">
            <img src="/logo-icon.png" alt="MyFitnessBuddy" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-lg font-extrabold bg-linear-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
            MyFitnessBuddy
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
            {mode === "login" ? "Entre para acessar seu diário" : "Crie sua conta para começar"}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              O Supabase ainda não foi configurado neste servidor (variáveis de ambiente ausentes).
            </p>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-2xl shadow-xs flex items-center justify-center space-x-2.5 disabled:opacity-60 transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span>Continuar com Google</span>
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="px-3 text-[11px] font-semibold text-slate-400 uppercase">ou</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {authError && (
            <p className="text-xs text-red-600 dark:text-red-400 font-semibold">{authError}</p>
          )}
          {infoMessage && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{infoMessage}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 disabled:opacity-60 transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{mode === "login" ? "Entrar" : "Criar Conta"}</span>
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setAuthError(null);
            setInfoMessage(null);
          }}
          className="w-full text-center text-xs font-semibold text-blue-600 dark:text-blue-400 mt-4 hover:underline"
        >
          {mode === "login" ? "Não tem conta? Criar uma agora" : "Já tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
};
