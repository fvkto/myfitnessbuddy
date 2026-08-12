import { DayLog, NutrientTotals, UserGoals } from "../types";

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: "male" | "female"
): number {
  if (gender === "male") {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
}

export function getActivityMultiplier(level: UserGoals["activityLevel"]): number {
  switch (level) {
    case "sedentary":
      return 1.2;
    case "light":
      return 1.375;
    case "moderate":
      return 1.55;
    case "active":
      return 1.725;
    case "very_active":
      return 1.9;
    default:
      return 1.55;
  }
}

export function calculateTDEE(goals: UserGoals): number {
  const bmr = calculateBMR(goals.weightKg, goals.heightCm, goals.age, goals.gender);
  const mult = getActivityMultiplier(goals.activityLevel);
  return Math.round(bmr * mult);
}

export function calculateRecommendedCalories(goals: UserGoals): number {
  const tdee = calculateTDEE(goals);
  // Weekly change rate: -0.5kg -> ~-500 kcal/day, -1kg -> -1000 kcal/day
  const calorieAdjustment = goals.weeklyGoalKg * 1000;
  const recommended = Math.round(tdee + calorieAdjustment);
  // Safety floor
  const floor = goals.gender === "male" ? 1500 : 1200;
  return Math.max(floor, recommended);
}

export function calculateDefaultMacros(calorieGoal: number): {
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
} {
  // Balanced 30% Protein / 40% Carbs / 30% Fat
  const proteinCal = calorieGoal * 0.3;
  const carbsCal = calorieGoal * 0.4;
  const fatCal = calorieGoal * 0.3;

  return {
    proteinGrams: Math.round(proteinCal / 4),
    carbsGrams: Math.round(carbsCal / 4),
    fatGrams: Math.round(fatCal / 9),
  };
}

export function calculateDayNutrients(dayLog: DayLog): NutrientTotals {
  return dayLog.foods.reduce(
    (acc, item) => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fat += item.fat;
      acc.fiber += item.fiber || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 }
  );
}

export function calculateExerciseCalories(dayLog: DayLog): number {
  return dayLog.exercises.reduce((acc, ex) => acc + ex.caloriesBurned, 0);
}

export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: string;
  colorClass: string;
} {
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  if (bmi < 18.5) {
    return { bmi, category: "Abaixo do peso", colorClass: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400" };
  } else if (bmi < 25) {
    return { bmi, category: "Peso normal / Saudável", colorClass: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400" };
  } else if (bmi < 30) {
    return { bmi, category: "Sobrepeso", colorClass: "text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400" };
  } else {
    return { bmi, category: "Obesidade", colorClass: "text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400" };
  }
}
