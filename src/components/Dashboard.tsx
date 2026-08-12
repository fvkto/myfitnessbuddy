import React from "react";
import { DayLog, UserGoals, MealType, LoggedFood } from "../types";
import { calculateDayNutrients, calculateExerciseCalories } from "../lib/calculators";
import { WaterWidget } from "./WaterWidget";
import {
  Flame,
  Plus,
  Camera,
  Sparkles,
  ChevronRight,
  Trash2,
  Dumbbell,
  Apple,
  TrendingUp,
  Utensils
} from "lucide-react";

interface DashboardProps {
  dayLog: DayLog;
  userGoals: UserGoals;
  streakDays: number;
  onOpenFoodSearch: (mealType: MealType) => void;
  onOpenAIScanner: () => void;
  onOpenExerciseModal: () => void;
  onOpenGoalsModal: () => void;
  onUpdateWater: (waterMl: number) => void;
  onUpdateWaterTarget: (targetMl: number) => void;
  onRemoveFood: (foodId: string) => void;
  onNavigateToDiary: () => void;
  onNavigateToCoach: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  dayLog,
  userGoals,
  streakDays,
  onOpenFoodSearch,
  onOpenAIScanner,
  onOpenExerciseModal,
  onOpenGoalsModal,
  onUpdateWater,
  onUpdateWaterTarget,
  onRemoveFood,
  onNavigateToDiary,
  onNavigateToCoach,
}) => {
  const nutrients = calculateDayNutrients(dayLog);
  const exerciseCalories = calculateExerciseCalories(dayLog);

  const totalBudget = userGoals.calorieGoal;
  const consumed = nutrients.calories;
  const remaining = totalBudget - consumed + exerciseCalories;

  // Macro calculations
  const proteinPercent = Math.min(100, Math.round((nutrients.protein / userGoals.proteinGrams) * 100));
  const carbsPercent = Math.min(100, Math.round((nutrients.carbs / userGoals.carbsGrams) * 100));
  const fatPercent = Math.min(100, Math.round((nutrients.fat / userGoals.fatGrams) * 100));

  const mealLabels: Record<MealType, { label: string; iconName: string }> = {
    breakfast: { label: "Café da Manhã", iconName: "☕" },
    lunch: { label: "Almoço", iconName: "🥗" },
    dinner: { label: "Jantar", iconName: "🍲" },
    snacks: { label: "Lanches", iconName: "🍎" },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick AI Scan Callout */}
      <div className="bg-linear-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Resumo Nutricional de Hoje</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Calorias Restantes: <span className={remaining < 0 ? "text-rose-300" : "text-emerald-300"}>{remaining} kcal</span>
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-lg">
              Mantenha seu balanço calórico para atingir sua meta de{" "}
              <strong className="text-white underline">{userGoals.targetWeightKg} kg</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAIScanner}
              className="flex items-center space-x-2 bg-white text-blue-800 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md hover:bg-blue-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Escanear Refeição com IA</span>
            </button>
            <button
              onClick={onNavigateToCoach}
              className="flex items-center space-x-2 bg-purple-900/60 hover:bg-purple-900/80 text-purple-100 px-3.5 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm backdrop-blur-md border border-purple-400/30 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Perguntar ao Coach</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Calorie Summary Card (MyFitnessBuddy Style Equation) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-blue-600" />
            <span>Balanço Calórico</span>
          </h2>
          <button
            onClick={onOpenGoalsModal}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center space-x-1"
          >
            <span>Ajustar Metas</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calorie Equation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Meta
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {totalBudget}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">kcal</span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">
              Alimentos (-)
            </span>
            <span className="text-xl font-black text-rose-700 dark:text-rose-300">
              {consumed}
            </span>
            <span className="text-[10px] text-rose-500/80 block mt-0.5">kcal</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
              Exercício (+)
            </span>
            <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">
              {exerciseCalories}
            </span>
            <span className="text-[10px] text-emerald-500/80 block mt-0.5">kcal</span>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider block mb-1">
              Restantes (=)
            </span>
            <span className={`text-xl font-black ${remaining < 0 ? "text-rose-600" : "text-blue-700 dark:text-blue-300"}`}>
              {remaining}
            </span>
            <span className="text-[10px] text-blue-500/80 block mt-0.5">kcal</span>
          </div>
        </div>

        {/* Macronutrient Progress Bars */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Macronutrientes de Hoje
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Proteína */}
            <div>
              <div className="flex justify-between items-baseline mb-1 text-xs font-bold">
                <span className="text-blue-600 dark:text-blue-400">Proteínas</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {Math.round(nutrients.protein)}g / {userGoals.proteinGrams}g
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Faltam {Math.max(0, userGoals.proteinGrams - Math.round(nutrients.protein))}g
              </span>
            </div>

            {/* Carboidratos */}
            <div>
              <div className="flex justify-between items-baseline mb-1 text-xs font-bold">
                <span className="text-amber-600 dark:text-amber-400">Carboidratos</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {Math.round(nutrients.carbs)}g / {userGoals.carbsGrams}g
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${carbsPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Faltam {Math.max(0, userGoals.carbsGrams - Math.round(nutrients.carbs))}g
              </span>
            </div>

            {/* Gorduras */}
            <div>
              <div className="flex justify-between items-baseline mb-1 text-xs font-bold">
                <span className="text-rose-600 dark:text-rose-400">Gorduras</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {Math.round(nutrients.fat)}g / {userGoals.fatGrams}g
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${fatPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Faltam {Math.max(0, userGoals.fatGrams - Math.round(nutrients.fat))}g
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Meal Add Buttons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Adicionar Refeição
          </h2>
          <button
            onClick={onNavigateToDiary}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Ver Diário Completo &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { type: "breakfast" as MealType, name: "Café da Manhã", emoji: "☕" },
            { type: "lunch" as MealType, name: "Almoço", emoji: "🥗" },
            { type: "dinner" as MealType, name: "Jantar", emoji: "🍲" },
            { type: "snacks" as MealType, name: "Lanches", emoji: "🍎" },
          ].map((meal) => (
            <button
              key={meal.type}
              onClick={() => onOpenFoodSearch(meal.type)}
              className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl shadow-2xs transition-all group"
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-xl">{meal.emoji}</span>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 transition-colors">
                    {meal.name}
                  </span>
                  <span className="text-[10px] text-slate-400">Clique para buscar</span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white text-slate-500 flex items-center justify-center transition-all">
                <Plus className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Water Widget */}
      <WaterWidget
        currentWaterMl={dayLog.waterMl}
        targetWaterMl={userGoals.waterTargetMl}
        onUpdateWater={onUpdateWater}
        onUpdateWaterTarget={onUpdateWaterTarget}
      />

      {/* Exercise Callout & Today's Meals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logged Foods List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Apple className="w-4 h-4 text-emerald-500" />
              <span>Alimentos Registrados Hoje ({dayLog.foods.length})</span>
            </h3>

            <button
              onClick={onNavigateToDiary}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Editar diário
            </button>
          </div>

          {dayLog.foods.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-xs font-semibold text-slate-500">Nenhum alimento registrado ainda hoje.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Toque nos botões acima ou use o Scanner IA para analisar uma foto!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {dayLog.foods.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs">{mealLabels[food.mealType].iconName}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {food.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {food.servingSize} ({food.servings}x) &bull; P: {food.protein}g | C: {food.carbs}g | G: {food.fat}g
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {food.calories} kcal
                    </span>
                    <button
                      onClick={() => onRemoveFood(food.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Excluir item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exercise Quick Card & Streaks */}
        <div className="space-y-6">
          {/* Exercise Log */}
          <div className="bg-linear-to-br from-emerald-500/10 to-transparent bg-white dark:bg-slate-900 rounded-3xl p-5 border border-emerald-100 dark:border-emerald-900/40 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Dumbbell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Exercícios</h3>
              </div>

              <button
                onClick={onOpenExerciseModal}
                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar</span>
              </button>
            </div>

            <div className="flex items-baseline space-x-1 mb-2">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {exerciseCalories}
              </span>
              <span className="text-xs font-semibold text-slate-500">kcal queimadas hoje</span>
            </div>

            {dayLog.exercises.length > 0 ? (
              <div className="space-y-2 mt-3">
                {dayLog.exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-2.5 bg-white dark:bg-slate-800/80 rounded-xl text-xs flex justify-between items-center border border-emerald-100 dark:border-emerald-900/30"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{ex.name}</span>
                      <span className="text-[10px] text-slate-400">{ex.durationMinutes} minutos</span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      -{ex.caloriesBurned} kcal
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-2">
                Registrar exercícios aumenta suas calorias disponíveis no dia!
              </p>
            )}
          </div>

          {/* Streak Flame Card */}
          <div className="bg-linear-to-r from-amber-500/10 via-orange-500/10 to-transparent bg-white dark:bg-slate-900 rounded-3xl p-5 border border-amber-200 dark:border-amber-900/40 flex items-center space-x-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Flame className="w-7 h-7 fill-amber-500 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Sequência de {streakDays} Dias! 🔥
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Continuar registrando diariamente garante 2x mais chances de atingir sua meta!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
