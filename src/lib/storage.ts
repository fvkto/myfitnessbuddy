import { FoodItem, DayLog, UserGoals, WeightEntry, SavedRecipe } from "../types";
import { DEFAULT_USER_GOALS, INITIAL_WEIGHT_HISTORY } from "../data/initialData";
import { INITIAL_FOOD_DATABASE } from "../data/foodDatabase";

const KEYS = {
  GOALS: "mfb_user_goals_v1",
  DAY_LOGS: "mfb_day_logs_v1",
  WEIGHT_HISTORY: "mfb_weight_history_v1",
  FOOD_DATABASE: "mfb_food_database_v1",
  SAVED_RECIPES: "mfb_saved_recipes_v1",
  STREAK: "mfb_user_streak_v1",
};

export function getStoredGoals(): UserGoals {
  try {
    const raw = localStorage.getItem(KEYS.GOALS);
    return raw ? JSON.parse(raw) : DEFAULT_USER_GOALS;
  } catch {
    return DEFAULT_USER_GOALS;
  }
}

export function saveStoredGoals(goals: UserGoals): void {
  localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
}

// IDs dos itens de exemplo que vinham pré-carregados em versões antigas do app.
// Usado só para limpar dados que porventura já foram salvos com eles misturados.
const LEGACY_SAMPLE_FOOD_IDS = new Set(["lf-1", "lf-2", "lf-3", "lf-4", "lf-5"]);
const LEGACY_SAMPLE_EXERCISE_IDS = new Set(["ex-1"]);

export function getStoredDayLog(dateStr: string): DayLog {
  try {
    const rawLogs = localStorage.getItem(KEYS.DAY_LOGS);
    const logsMap: Record<string, DayLog> = rawLogs ? JSON.parse(rawLogs) : {};

    if (logsMap[dateStr]) {
      const stored = logsMap[dateStr];
      // Remove quaisquer itens de exemplo legados que tenham ficado salvos
      // junto de registros reais do usuário.
      return {
        ...stored,
        foods: stored.foods.filter(f => !LEGACY_SAMPLE_FOOD_IDS.has(f.id)),
        exercises: stored.exercises.filter(e => !LEGACY_SAMPLE_EXERCISE_IDS.has(e.id)),
      };
    }

    // Nenhum registro para esse dia (seja hoje, um dia passado ou futuro):
    // sempre começa zerado para o usuário preencher.
    return {
      date: dateStr,
      foods: [],
      exercises: [],
      waterMl: 0,
    };
  } catch {
    return {
      date: dateStr,
      foods: [],
      exercises: [],
      waterMl: 0,
    };
  }
}

export function saveStoredDayLog(log: DayLog): void {
  try {
    const rawLogs = localStorage.getItem(KEYS.DAY_LOGS);
    const logsMap: Record<string, DayLog> = rawLogs ? JSON.parse(rawLogs) : {};
    logsMap[log.date] = log;
    localStorage.setItem(KEYS.DAY_LOGS, JSON.stringify(logsMap));
  } catch (err) {
    console.error("Erro ao salvar diário:", err);
  }
}

export function getStoredWeightHistory(): WeightEntry[] {
  try {
    const raw = localStorage.getItem(KEYS.WEIGHT_HISTORY);
    return raw ? JSON.parse(raw) : INITIAL_WEIGHT_HISTORY;
  } catch {
    return INITIAL_WEIGHT_HISTORY;
  }
}

export function saveStoredWeightHistory(history: WeightEntry[]): void {
  localStorage.setItem(KEYS.WEIGHT_HISTORY, JSON.stringify(history));
}

export function getStoredFoodDatabase(): FoodItem[] {
  try {
    const raw = localStorage.getItem(KEYS.FOOD_DATABASE);
    return raw ? JSON.parse(raw) : INITIAL_FOOD_DATABASE;
  } catch {
    return INITIAL_FOOD_DATABASE;
  }
}

export function saveCustomFoodToDb(food: FoodItem): FoodItem[] {
  const current = getStoredFoodDatabase();
  const updated = [food, ...current];
  localStorage.setItem(KEYS.FOOD_DATABASE, JSON.stringify(updated));
  return updated;
}

export function getStoredRecipes(): SavedRecipe[] {
  try {
    const raw = localStorage.getItem(KEYS.SAVED_RECIPES);
    return raw ? JSON.parse(raw) : [
      {
        id: "rec-1",
        title: "Omelete de Aveia Proteico",
        description: "Café da manhã de rápida preparação, muito saciante e rico em fibras.",
        servings: 1,
        ingredients: [
          {
            food: INITIAL_FOOD_DATABASE.find(f => f.id === "f-11") || INITIAL_FOOD_DATABASE[0],
            amountServings: 2,
          },
          {
            food: INITIAL_FOOD_DATABASE.find(f => f.id === "f-5") || INITIAL_FOOD_DATABASE[1],
            amountServings: 1,
          },
        ],
        totalCalories: 271,
        totalProtein: 16.9,
        totalCarbs: 18.2,
        totalFat: 12.8,
      }
    ];
  } catch {
    return [];
  }
}

export function saveRecipe(recipe: SavedRecipe): SavedRecipe[] {
  const current = getStoredRecipes();
  const updated = [recipe, ...current];
  localStorage.setItem(KEYS.SAVED_RECIPES, JSON.stringify(updated));
  return updated;
}

export function deleteRecipe(recipeId: string): SavedRecipe[] {
  const current = getStoredRecipes();
  const updated = current.filter(r => r.id !== recipeId);
  localStorage.setItem(KEYS.SAVED_RECIPES, JSON.stringify(updated));
  return updated;
}

// Calcula a sequência ATUAL de dias consecutivos em que o usuário registrou
// alguma informação no diário (alimento, exercício ou água). A sequência
// quebra assim que existir um dia sem nenhum registro.
export function getStreakDays(): number {
  try {
    const rawLogs = localStorage.getItem(KEYS.DAY_LOGS);
    const logsMap: Record<string, DayLog> = rawLogs ? JSON.parse(rawLogs) : {};

    const hasActivity = (log: DayLog | undefined): boolean => {
      if (!log) return false;
      return log.foods.length > 0 || log.exercises.length > 0 || log.waterMl > 0;
    };

    const today = new Date();
    let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const toDateStr = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    // Se hoje ainda não tem registro, o dia não terminou — começa a contagem
    // olhando pra ontem, sem quebrar a sequência que já existia.
    if (!hasActivity(logsMap[toDateStr(cursor)])) {
      cursor.setDate(cursor.getDate() - 1);
    }

    let streak = 0;
    while (hasActivity(logsMap[toDateStr(cursor)])) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  } catch {
    return 0;
  }
}
