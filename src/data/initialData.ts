import { DayLog, UserGoals, WeightEntry } from "../types";

export const DEFAULT_USER_GOALS: UserGoals = {
  calorieGoal: 2000,
  proteinGrams: 150, // 30%
  carbsGrams: 200,   // 40%
  fatGrams: 67,      // 30%
  waterTargetMl: 2500,
  weightKg: 78.5,
  targetWeightKg: 72.0,
  weeklyGoalKg: -0.5,
  heightCm: 178,
  age: 28,
  gender: "male",
  activityLevel: "moderate",
  primaryGoal: "lose",
};

export const INITIAL_WEIGHT_HISTORY: WeightEntry[] = [
  { id: "w-1", date: "2026-07-01", weightKg: 82.0, note: "Início do plano nutricional" },
  { id: "w-2", date: "2026-07-15", weightKg: 80.8, note: "Primeiros resultados visíveis" },
  { id: "w-3", date: "2026-08-01", weightKg: 79.4, note: "Mantendo rotina de treinos" },
  { id: "w-4", date: "2026-08-11", weightKg: 78.5, note: "Peso atual verificado" },
];

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const INITIAL_DAY_LOG: DayLog = {
  date: getTodayDateString(),
  foods: [
    {
      id: "lf-1",
      foodId: "f-6",
      name: "Pão Francês / Pão de Sal",
      mealType: "breakfast",
      servings: 1,
      servingSize: "1 unidade (50g)",
      calories: 150,
      protein: 4.7,
      carbs: 28.5,
      fat: 1.5,
      fiber: 1.2,
      timeLogged: "08:15",
    },
    {
      id: "lf-2",
      foodId: "f-12",
      name: "Ovo Frito na Manteiga",
      mealType: "breakfast",
      servings: 2,
      servingSize: "2 unidades (100g)",
      calories: 220,
      protein: 12.6,
      carbs: 1.2,
      fat: 18.0,
      fiber: 0.0,
      timeLogged: "08:18",
    },
    {
      id: "lf-3",
      foodId: "f-1",
      name: "Arroz Branco Cozido",
      mealType: "lunch",
      servings: 1.5,
      servingSize: "1.5 colher de servir (150g)",
      calories: 195,
      protein: 3.8,
      carbs: 42.2,
      fat: 0.3,
      fiber: 2.4,
      timeLogged: "12:30",
    },
    {
      id: "lf-4",
      foodId: "f-3",
      name: "Feijão Carioca Cozido",
      mealType: "lunch",
      servings: 1,
      servingSize: "1 concha média (100g)",
      calories: 76,
      protein: 4.8,
      carbs: 13.6,
      fat: 0.5,
      fiber: 8.5,
      timeLogged: "12:30",
    },
    {
      id: "lf-5",
      foodId: "f-9",
      name: "Peito de Frango Grelhado",
      mealType: "lunch",
      servings: 1.5,
      servingSize: "1.5 filé médio (150g)",
      calories: 248,
      protein: 46.5,
      carbs: 0.0,
      fat: 5.4,
      fiber: 0.0,
      timeLogged: "12:30",
    },
  ],
  exercises: [
    {
      id: "ex-1",
      name: "Corrida Moderada",
      type: "cardio",
      durationMinutes: 30,
      caloriesBurned: 320,
      timeLogged: "07:00",
    },
  ],
  waterMl: 1500,
  notes: "Treino de corrida matinal produtivo!",
};

export const COMMON_EXERCISES = [
  { name: "Caminhada (Apressada)", calPerHourKg: 4.3, type: "cardio" as const },
  { name: "Corrida Moderada (8-10 km/h)", calPerHourKg: 8.5, type: "cardio" as const },
  { name: "Ciclismo / Bike", calPerHourKg: 7.0, type: "cardio" as const },
  { name: "Musculação (Intensa)", calPerHourKg: 6.0, type: "strength" as const },
  { name: "Natação (Livre)", calPerHourKg: 7.5, type: "cardio" as const },
  { name: "Futebol / Esportes", calPerHourKg: 8.0, type: "cardio" as const },
  { name: "Crossfit / Calistenia", calPerHourKg: 8.5, type: "strength" as const },
  { name: "Dança / Zumba", calPerHourKg: 5.5, type: "cardio" as const },
];
