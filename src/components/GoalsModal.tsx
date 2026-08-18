import React, { useState, useEffect } from "react";
import { UserGoals } from "../types";
import { calculateRecommendedCalories, calculateDefaultMacros, calculateTDEE } from "../lib/calculators";
import { supabase } from "../lib/supabaseClient";
import { Target, Check, Sparkles, Sliders, User, Flame, LogOut, Mail } from "lucide-react";

interface GoalsModalProps {
  userGoals: UserGoals;
  onSaveGoals: (updatedGoals: UserGoals) => void;
}

export const GoalsModal: React.FC<GoalsModalProps> = ({ userGoals, onSaveGoals }) => {
  const [goalsState, setGoalsState] = useState<UserGoals>({ ...userGoals });
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || null);
    });
  }, []);

  const handleLogout = async () => {
    if (!confirm("Tem certeza que deseja sair da conta?")) return;
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    // A tela de login volta a aparecer automaticamente (AuthGate escuta a sessão).
  };

  const tdee = calculateTDEE(goalsState);
  const recommendedCal = calculateRecommendedCalories(goalsState);

  const handleApplyRecommended = () => {
    const macros = calculateDefaultMacros(recommendedCal);
    setGoalsState({
      ...goalsState,
      calorieGoal: recommendedCal,
      proteinGrams: macros.proteinGrams,
      carbsGrams: macros.carbsGrams,
      fatGrams: macros.fatGrams,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGoals(goalsState);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Configurar Metas & Perfil
            </h1>
            <p className="text-xs text-slate-500">
              Calcule seu TDEE (Gasto Energético Diário) e ajuste seus alvos de calorias e macros.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Details Grid */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>Dados Pessoais & Antropometria</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Idade (Anos)
                </label>
                <input
                  type="number"
                  value={goalsState.age}
                  onChange={(e) => setGoalsState({ ...goalsState, age: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Gênero
                </label>
                <select
                  value={goalsState.gender}
                  onChange={(e) => setGoalsState({ ...goalsState, gender: e.target.value as any })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={goalsState.heightCm}
                  onChange={(e) => setGoalsState({ ...goalsState, heightCm: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Peso Atual (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={goalsState.weightKg}
                  onChange={(e) => setGoalsState({ ...goalsState, weightKg: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Peso Meta (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={goalsState.targetWeightKg}
                  onChange={(e) => setGoalsState({ ...goalsState, targetWeightKg: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nível de Atividade
                </label>
                <select
                  value={goalsState.activityLevel}
                  onChange={(e) => setGoalsState({ ...goalsState, activityLevel: e.target.value as any })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="sedentary">Sedentário (Pouco/Nenhum exercício)</option>
                  <option value="light">Levemente Ativo (1-3x por semana)</option>
                  <option value="moderate">Moderado (3-5x por semana)</option>
                  <option value="active">Ativo (6-7x por semana)</option>
                  <option value="very_active">Muito Ativo (Treino pesado diário)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Automatic Calculator & Recommendation Banner */}
          <div className="p-5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300 mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Cálculo Científico TDEE</span>
              </div>
              <h3 className="text-lg font-black">
                Seu Gasto Energético Diário (TDEE): {tdee} kcal
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Meta recomendada para perda/ganho sustentável:{" "}
                <strong className="underline text-white">{recommendedCal} kcal/dia</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={handleApplyRecommended}
              className="px-4 py-2.5 bg-white text-blue-800 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-xs shrink-0 transition-all"
            >
              Aplicar Recomendado
            </button>
          </div>

          {/* Calorie & Macro Target Editors */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Metas Personalizadas de Calorias e Macros</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Calorias Diárias (kcal)
                </label>
                <input
                  type="number"
                  value={goalsState.calorieGoal}
                  onChange={(e) => setGoalsState({ ...goalsState, calorieGoal: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-blue-500 rounded-xl text-xs font-black text-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-blue-600 block mb-1">
                  Proteínas (g)
                </label>
                <input
                  type="number"
                  value={goalsState.proteinGrams}
                  onChange={(e) => setGoalsState({ ...goalsState, proteinGrams: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-600 block mb-1">
                  Carboidratos (g)
                </label>
                <input
                  type="number"
                  value={goalsState.carbsGrams}
                  onChange={(e) => setGoalsState({ ...goalsState, carbsGrams: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-rose-600 block mb-1">
                  Gorduras (g)
                </label>
                <input
                  type="number"
                  value={goalsState.fatGrams}
                  onChange={(e) => setGoalsState({ ...goalsState, fatGrams: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            <Check className="w-5 h-5" />
            <span>Salvar Todas as Metas</span>
          </button>
        </form>

        {/* Account Section */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Conta</h3>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                {userEmail || "Carregando..."}
              </span>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center space-x-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 disabled:opacity-50 shrink-0 ml-3"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
