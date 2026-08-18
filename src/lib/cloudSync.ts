import { supabase } from "./supabaseClient";

// Chaves do localStorage que devem ser espelhadas na nuvem.
// Mantém a mesma lista de KEYS usada em storage.ts.
const SYNCED_KEYS = [
  "mfb_user_goals_v1",
  "mfb_day_logs_v1",
  "mfb_weight_history_v1",
  "mfb_food_database_v1",
  "mfb_saved_recipes_v1",
];

let activeUserId: string | null = null;

export function setCloudSyncUser(userId: string | null): void {
  activeUserId = userId;
}

export function getCloudSyncUser(): string | null {
  return activeUserId;
}

/**
 * Busca todos os dados salvos na nuvem para este usuário e os grava no
 * localStorage deste aparelho, sobrescrevendo o cache local. Deve ser
 * chamado logo após o login, antes do app renderizar os dados.
 */
export async function pullAllFromCloud(userId: string): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("app_storage")
      .select("key, value")
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao buscar dados da nuvem:", error);
      return;
    }

    if (data) {
      for (const row of data) {
        localStorage.setItem(row.key, JSON.stringify(row.value));
      }
    }
  } catch (err) {
    console.error("Erro ao sincronizar com a nuvem:", err);
  }
}

/**
 * Envia uma chave específica para a nuvem em segundo plano, sem bloquear
 * a interface. Chamado automaticamente por storage.ts a cada gravação local.
 */
export function pushKeyToCloud(key: string, value: unknown): void {
  if (!activeUserId) return;
  if (!SYNCED_KEYS.includes(key)) return;

  supabase
    .from("app_storage")
    .upsert(
      { user_id: activeUserId, key, value, updated_at: new Date().toISOString() },
      { onConflict: "user_id,key" }
    )
    .then(({ error }: { error: unknown }) => {
      if (error) console.error(`Erro ao enviar "${key}" para a nuvem:`, error);
    });
}

/**
 * Envia TODOS os dados atualmente no localStorage deste aparelho para a
 * nuvem. Usado uma única vez, na primeira vez que uma conta nova loga e
 * ainda não existe nada salvo no Supabase — migra o que já existia local.
 */
export async function pushAllLocalDataToCloud(userId: string): Promise<void> {
  for (const key of SYNCED_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const value = JSON.parse(raw);
      await supabase
        .from("app_storage")
        .upsert(
          { user_id: userId, key, value, updated_at: new Date().toISOString() },
          { onConflict: "user_id,key" }
        );
    } catch (err) {
      console.error(`Erro ao migrar "${key}" para a nuvem:`, err);
    }
  }
}
