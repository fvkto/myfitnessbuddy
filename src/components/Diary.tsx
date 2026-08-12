import React, { useState } from "react";
import { DayLog, UserGoals, MealType, LoggedFood } from "../types";
import { calculateDayNutrients, calculateExerciseCalories } from "../lib/calculators";
import { WaterWidget } from "./WaterWidget";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  Coffee,
  Salad,
  Soup,
  Apple,
  Dumbbell,
  Sparkles,
  Info
} from "lucide-react";

interface DiaryProps {
  dayLog: DayLog;
  userGoals: UserGoals;
  currentDateStr: string;
  onDateChange: (newDateStr: string) => void;
  onOpenFoodSearch: (mealType: MealType) => void;
  onOpenExerciseModal: () => void;
  onRemoveFood: (foodId: string) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onUpdateWater: (waterMl: number) => void;
  onUpdateWaterTarget: (targetMl: number) => void;
  onCopyFromYesterday: () => void;
  onOpenAIScanner: () => void;
}

export const Diary: React.FC<DiaryProps> = ({
  dayLog,
  userGoals,
  currentDateStr,
  onDateChange,
  onOpenFoodSearch,
  onOpenExerciseModal,
  onRemoveFood,
  onRemoveExercise,
  onUpdateWater,
  onUpdateWaterTarget,
  onCopyFromYesterday,
  onOpenAIScanner,
}) => {
  const nutrients = calculateDayNutrients(dayLog);
  const exerciseCalories = calculateExerciseCalories(dayLog);

  // Format readable date
  const [year, month, day] = currentDateStr.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  const todayObj = new Date();
  
  const isToday =
    todayObj.getFullYear() === year &&
    todayObj.getMonth() === month - 1 &&
    todayObj.getDate() === day;

  const dateFormatted = dateObj.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });

  const navigateDays = (daysOffset: number) => {
    const next = new Date(dateObj);
    next.setDate(next.getDate() + daysOffset);
    const y = next.getFullYear();
    const m = String(next.getMonth() + 1).padStart(2, "0");
    const d = String(next.getDate()).padStart(2, "0");
    onDateChange(`${y}-${m}-${d}`);
  };

  const mealSections: { type: MealType; title: string; icon: any; color: string }[] = [
    { type: "breakfast", title: "Café da Manhã", icon: Coffee, color: "text-amber-500" },
    { type: "lunch", title: "Almoço", icon: Salad, color: "text-emerald-500" },
    { type: "dinner", title: "Jantar", icon: Soup, color: "text-indigo-500" },
    { type: "snacks", title: "Lanches", icon: Apple, color: "text-rose-500" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Date Navigation Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <button
          onClick={() => navigateDays(-1)}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Dia anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-center">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-black capitalize text-slate-900 dark:text-white">
            {isToday ? "Hoje, " : ""}{dateFormatted}
          </span>
        </div>

        <button
          onClick={() => navigateDays(1)}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Próximo dia"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Action shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onCopyFromYesterday}
          className="flex items-center space-x-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
        >
          <Copy className="w-4 h-4 text-slate-500" />
          <span>Copiar do Dia Anterior</span>
        </button>

        <button
          onClick={onOpenAIScanner}
          className="flex items-center space-x-2 px-3.5 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Scanner de Alimentos por IA</span>
        </button>
      </div>

      {/* Meal Sections */}
      <div className="space-y-4">
        {mealSections.map((section) => {
          const Icon = section.icon;
          const foods = dayLog.foods.filter((f) => f.mealType === section.type);
          const totalCalories = foods.reduce((acc, f) => acc + f.calories, 0);

          return (
            <div
              key={section.type}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs"
            >
              {/* Meal Group Header */}
              <div className="bg-slate-50/70 dark:bg-slate-800/50 px-5 py-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-5 h-5 ${section.color}`} />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {section.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                    {totalCalories} kcal
                  </span>

                  <button
                    onClick={() => onOpenFoodSearch(section.type)}
                    className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800/60"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>

              {/* Logged items in meal */}
              {foods.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-400">Nenhum item adicionado no {section.title.toLowerCase()}.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {foods.map((food) => (
                    <div
                      key={food.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {food.name} {food.brand ? `(${food.brand})` : ""}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {food.servingSize} &bull; Prot: {food.protein}g | Carb: {food.carbs}g | Gord: {food.fat}g
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          {food.calories} kcal
                        </span>
                        <button
                          onClick={() => onRemoveFood(food.id)}
                          className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Exercise Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="bg-slate-50/70 dark:bg-slate-800/50 px-5 py-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Dumbbell className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Exercícios</h3>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
              -{exerciseCalories} kcal
            </span>
            <button
              onClick={onOpenExerciseModal}
              className="flex items-center space-x-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/60"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>
        </div>

        {dayLog.exercises.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-xs text-slate-400">Nenhum exercício registrado para este dia.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {dayLog.exercises.map((ex) => (
              <div key={ex.id} className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {ex.name}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Duração: {ex.durationMinutes} min
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    -{ex.caloriesBurned} kcal
                  </span>
                  <button
                    onClick={() => onRemoveExercise(ex.id)}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Water Section */}
      <WaterWidget
        currentWaterMl={dayLog.waterMl}
        targetWaterMl={userGoals.waterTargetMl}
        onUpdateWater={onUpdateWater}
        onUpdateWaterTarget={onUpdateWaterTarget}
      />

      {/* Total Macros vs Goal Summary Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Totais Nutricionais do Dia</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                <th className="pb-2 font-bold">Nutriente</th>
                <th className="pb-2 font-bold">Consumido</th>
                <th className="pb-2 font-bold">Meta</th>
                <th className="pb-2 font-bold">Restante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
              <tr>
                <td className="py-2.5 font-bold text-slate-900 dark:text-white">Calorias (kcal)</td>
                <td className="py-2.5 text-rose-600">{nutrients.calories}</td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400">{userGoals.calorieGoal}</td>
                <td className="py-2.5 font-bold text-blue-600">
                  {userGoals.calorieGoal - nutrients.calories + exerciseCalories}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-900 dark:text-white">Proteínas (g)</td>
                <td className="py-2.5 text-blue-600">{Math.round(nutrients.protein)}g</td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400">{userGoals.proteinGrams}g</td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400">
                  {Math.max(0, userGoals.proteinGrams - Math.round(nutrients.protein))}g
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-900 dark:text-white">Carboidratos (g)</td>
                <td className="py-2.5 text-amber-600">{Math.round(nutrients.carbs)}g</td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400">{userGoals.carbsGrams}g</td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400">
                  {Math.max(0, userGoals.carbsGrams - Math.round(nutrients.carbs))}g
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-900 dark:text-white">Gorduras (g)</td>
                <td className="py-2.5 text-rose-500">{Math.round(nutrients.fat)}g</td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400">{userGoals.fatGrams}g</td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400">
                  {Math.max(0, userGoals.fatGrams - Math.round(nutrients.fat))}g
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-900 dark:text-white">Fibras (g)</td>
                <td className="py-2.5 text-emerald-600">{Math.round(nutrients.fiber)}g</td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400">25g</td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400">
                  {Math.max(0, 25 - Math.round(nutrients.fiber))}g
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
