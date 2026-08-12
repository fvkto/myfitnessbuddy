export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: string; // e.g., "100g", "1 unidade (50g)", "1 xícara"
  servingWeightGrams: number;
  calories: number; // per serving
  protein: number;  // grams
  carbs: number;    // grams
  fat: number;      // grams
  fiber?: number;   // grams
  sodiumMg?: number;
  category?: string;
  isCustom?: boolean;
  barcode?: string;
}

export interface LoggedFood {
  id: string;
  foodId: string;
  name: string;
  brand?: string;
  mealType: MealType;
  servings: number; // e.g. 1.5 servings
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  timeLogged?: string;
}

export interface LoggedExercise {
  id: string;
  name: string;
  type: "cardio" | "strength";
  durationMinutes: number;
  caloriesBurned: number;
  sets?: number;
  reps?: number;
  weightKg?: number;
  timeLogged?: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  foods: LoggedFood[];
  exercises: LoggedExercise[];
  waterMl: number;
  notes?: string;
}

export interface UserGoals {
  calorieGoal: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterTargetMl: number;
  weightKg: number;
  targetWeightKg: number;
  weeklyGoalKg: number; // -0.5, -1.0, 0, +0.25, +0.5
  heightCm: number;
  age: number;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  primaryGoal: "lose" | "maintain" | "gain";
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
}

export interface SavedRecipe {
  id: string;
  title: string;
  description?: string;
  servings: number;
  ingredients: {
    food: FoodItem;
    amountServings: number;
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface NutrientTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}
