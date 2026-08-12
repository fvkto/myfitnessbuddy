/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  MealType,
  LoggedFood,
  LoggedExercise,
  FoodItem,
  DayLog,
  UserGoals,
  WeightEntry,
  SavedRecipe
} from "./types";
import {
  getStoredGoals,
  saveStoredGoals,
  getStoredDayLog,
  saveStoredDayLog,
  getStoredWeightHistory,
  saveStoredWeightHistory,
  getStoredFoodDatabase,
  saveCustomFoodToDb,
  getStoredRecipes,
  saveRecipe,
  deleteRecipe,
  getStreakDays
} from "./lib/storage";
import { getTodayDateString } from "./data/initialData";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { Diary } from "./components/Diary";
import { FoodSearchModal } from "./components/FoodSearchModal";
import { AIScannerModal } from "./components/AIScannerModal";
import { ExerciseModal } from "./components/ExerciseModal";
import { ProgressView } from "./components/ProgressView";
import { GoalsModal } from "./components/GoalsModal";
import { RecipesView } from "./components/RecipesView";
import { AICoachModal } from "./components/AICoachModal";
import { Check, Sparkles, ChefHat } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "diary" | "ai-scanner" | "progress" | "goals" | "ai-coach" | "recipes"
  >("dashboard");

  const [currentDateStr, setCurrentDateStr] = useState<string>(getTodayDateString());
  const [userGoals, setUserGoals] = useState<UserGoals>(getStoredGoals());
  const [dayLog, setDayLog] = useState<DayLog>(getStoredDayLog(currentDateStr));
  const [foodDatabase, setFoodDatabase] = useState<FoodItem[]>(getStoredFoodDatabase());
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(getStoredWeightHistory());
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>(getStoredRecipes());
  const streakDays = getStreakDays();

  // Modals state
  const [isFoodSearchOpen, setIsFoodSearchOpen] = useState(false);
  const [targetSearchMeal, setTargetSearchMeal] = useState<MealType>("lunch");
  const [isAIScannerOpen, setIsAIScannerOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync day log whenever currentDateStr changes or is re-fetched
  useEffect(() => {
    setDayLog(getStoredDayLog(currentDateStr));
  }, [currentDateStr]);

  // Handlers for updating DayLog
  const updateCurrentDayLog = (updatedLog: DayLog) => {
    setDayLog(updatedLog);
    saveStoredDayLog(updatedLog);
  };

  // Add single food item
  const handleAddFood = (foodData: Omit<LoggedFood, "id">) => {
    const newFood: LoggedFood = {
      ...foodData,
      id: `lf-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };

    const updatedFoods = [...dayLog.foods, newFood];
    const updatedLog: DayLog = { ...dayLog, foods: updatedFoods };
    updateCurrentDayLog(updatedLog);

    const mealName =
      foodData.mealType === "breakfast"
        ? "Café da Manhã"
        : foodData.mealType === "lunch"
        ? "Almoço"
        : foodData.mealType === "dinner"
        ? "Jantar"
        : "Lanches";

    showToast(`"${foodData.name}" adicionado ao ${mealName}!`);
  };

  // Add multiple foods (from AI scanner or recipes)
  const handleAddMultipleFoods = (foodsData: Omit<LoggedFood, "id">[]) => {
    const newLoggedItems: LoggedFood[] = foodsData.map((f, i) => ({
      ...f,
      id: `lf-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
    }));

    const updatedFoods = [...dayLog.foods, ...newLoggedItems];
    const updatedLog: DayLog = { ...dayLog, foods: updatedFoods };
    updateCurrentDayLog(updatedLog);

    showToast(`${foodsData.length} alimentos registrados no diário!`);
  };

  // Remove food item
  const handleRemoveFood = (foodId: string) => {
    const updatedFoods = dayLog.foods.filter((f) => f.id !== foodId);
    const updatedLog: DayLog = { ...dayLog, foods: updatedFoods };
    updateCurrentDayLog(updatedLog);
    showToast("Alimento removido do diário.");
  };

  // Add exercise
  const handleAddExercise = (exerciseData: Omit<LoggedExercise, "id">) => {
    const newExercise: LoggedExercise = {
      ...exerciseData,
      id: `ex-${Date.now()}`,
    };

    const updatedExercises = [...dayLog.exercises, newExercise];
    const updatedLog: DayLog = { ...dayLog, exercises: updatedExercises };
    updateCurrentDayLog(updatedLog);

    showToast(`Exercício "${exerciseData.name}" registrado (-${exerciseData.caloriesBurned} kcal)!`);
  };

  // Remove exercise
  const handleRemoveExercise = (exerciseId: string) => {
    const updatedExercises = dayLog.exercises.filter((e) => e.id !== exerciseId);
    const updatedLog: DayLog = { ...dayLog, exercises: updatedExercises };
    updateCurrentDayLog(updatedLog);
    showToast("Exercício removido.");
  };

  // Water intake update
  const handleUpdateWater = (newWaterMl: number) => {
    const updatedLog: DayLog = { ...dayLog, waterMl: newWaterMl };
    updateCurrentDayLog(updatedLog);
  };

  // Save custom food item
  const handleSaveCustomFood = (food: FoodItem) => {
    const updatedDb = saveCustomFoodToDb(food);
    setFoodDatabase(updatedDb);
    showToast(`"${food.name}" salvo no seu banco de alimentos!`);
  };

  // Copy foods from yesterday
  const handleCopyFromYesterday = () => {
    const [y, m, d] = currentDateStr.split("-").map(Number);
    const curr = new Date(y, m - 1, d);
    curr.setDate(curr.getDate() - 1);

    const prevYear = curr.getFullYear();
    const prevMonth = String(curr.getMonth() + 1).padStart(2, "0");
    const prevDay = String(curr.getDate()).padStart(2, "0");
    const prevDateStr = `${prevYear}-${prevMonth}-${prevDay}`;

    const prevLog = getStoredDayLog(prevDateStr);

    if (!prevLog || prevLog.foods.length === 0) {
      showToast("Nenhuma refeição registrada no dia anterior.");
      return;
    }

    const copiedFoods: LoggedFood[] = prevLog.foods.map((f) => ({
      ...f,
      id: `lf-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    }));

    const updatedLog: DayLog = { ...dayLog, foods: [...dayLog.foods, ...copiedFoods] };
    updateCurrentDayLog(updatedLog);
    showToast(`${copiedFoods.length} itens copiados do dia anterior!`);
  };

  // Save updated goals
  const handleSaveGoals = (updatedGoals: UserGoals) => {
    setUserGoals(updatedGoals);
    saveStoredGoals(updatedGoals);
    showToast("Metas nutricionais atualizadas com sucesso!");
    setActiveTab("dashboard");
  };

  // Weight History
  const handleAddWeightEntry = (entry: Omit<WeightEntry, "id">) => {
    const newEntry: WeightEntry = {
      ...entry,
      id: `w-${Date.now()}`,
    };
    const updated = [...weightHistory, newEntry];
    setWeightHistory(updated);
    saveStoredWeightHistory(updated);

    // Update user current weight
    const updatedGoals = { ...userGoals, weightKg: entry.weightKg };
    setUserGoals(updatedGoals);
    saveStoredGoals(updatedGoals);

    showToast(`Novo peso de ${entry.weightKg} kg registrado!`);
  };

  const handleRemoveWeightEntry = (id: string) => {
    const updated = weightHistory.filter((w) => w.id !== id);
    setWeightHistory(updated);
    saveStoredWeightHistory(updated);
    showToast("Registro de peso excluído.");
  };

  // Save recipe
  const handleSaveRecipe = (recipe: SavedRecipe) => {
    const updated = saveRecipe(recipe);
    setSavedRecipes(updated);
    showToast(`Receita "${recipe.title}" salva com sucesso!`);
  };

  const handleDeleteRecipe = (recipeId: string) => {
    const updated = deleteRecipe(recipeId);
    setSavedRecipes(updated);
    showToast("Receita excluída.");
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* App Navigation Header & Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === "ai-scanner") {
            setIsAIScannerOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        streakDays={streakDays}
      />

      {/* Main App Canvas */}
      <main className="max-w-5xl mx-auto px-4 pt-6 pb-24 md:pb-20">
        {/* Sub-navigation bar for Recipes shortcut */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setActiveTab("recipes")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "recipes"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            }`}
          >
            <ChefHat className="w-4 h-4 text-amber-500" />
            <span>Banco de Receitas</span>
          </button>
        </div>

        {activeTab === "dashboard" && (
          <Dashboard
            dayLog={dayLog}
            userGoals={userGoals}
            streakDays={streakDays}
            onOpenFoodSearch={(mealType) => {
              setTargetSearchMeal(mealType);
              setIsFoodSearchOpen(true);
            }}
            onOpenAIScanner={() => setIsAIScannerOpen(true)}
            onOpenExerciseModal={() => setIsExerciseModalOpen(true)}
            onOpenGoalsModal={() => setActiveTab("goals")}
            onUpdateWater={handleUpdateWater}
            onRemoveFood={handleRemoveFood}
            onNavigateToDiary={() => setActiveTab("diary")}
            onNavigateToCoach={() => setActiveTab("ai-coach")}
          />
        )}

        {activeTab === "diary" && (
          <Diary
            dayLog={dayLog}
            userGoals={userGoals}
            currentDateStr={currentDateStr}
            onDateChange={setCurrentDateStr}
            onOpenFoodSearch={(mealType) => {
              setTargetSearchMeal(mealType);
              setIsFoodSearchOpen(true);
            }}
            onOpenExerciseModal={() => setIsExerciseModalOpen(true)}
            onRemoveFood={handleRemoveFood}
            onRemoveExercise={handleRemoveExercise}
            onUpdateWater={handleUpdateWater}
            onCopyFromYesterday={handleCopyFromYesterday}
            onOpenAIScanner={() => setIsAIScannerOpen(true)}
          />
        )}

        {activeTab === "progress" && (
          <ProgressView
            userGoals={userGoals}
            weightHistory={weightHistory}
            onAddWeightEntry={handleAddWeightEntry}
            onRemoveWeightEntry={handleRemoveWeightEntry}
          />
        )}

        {activeTab === "goals" && (
          <GoalsModal userGoals={userGoals} onSaveGoals={handleSaveGoals} />
        )}

        {activeTab === "recipes" && (
          <RecipesView
            foodDatabase={foodDatabase}
            savedRecipes={savedRecipes}
            onSaveRecipe={handleSaveRecipe}
            onDeleteRecipe={handleDeleteRecipe}
            onAddMultipleFoods={handleAddMultipleFoods}
          />
        )}

        {activeTab === "ai-coach" && (
          <AICoachModal userGoals={userGoals} dayLog={dayLog} />
        )}
      </main>

      {/* Search Food Modal */}
      <FoodSearchModal
        isOpen={isFoodSearchOpen}
        mealType={targetSearchMeal}
        foodDatabase={foodDatabase}
        onClose={() => setIsFoodSearchOpen(false)}
        onAddFood={handleAddFood}
        onSaveCustomFood={handleSaveCustomFood}
        onOpenAIScanner={() => {
          setIsFoodSearchOpen(false);
          setIsAIScannerOpen(true);
        }}
      />

      {/* AI Multimodal Scanner Modal */}
      <AIScannerModal
        isOpen={isAIScannerOpen}
        onClose={() => setIsAIScannerOpen(false)}
        onAddMultipleFoods={handleAddMultipleFoods}
      />

      {/* Exercise Modal */}
      <ExerciseModal
        isOpen={isExerciseModalOpen}
        userWeightKg={userGoals.weightKg}
        onClose={() => setIsExerciseModalOpen(false)}
        onAddExercise={handleAddExercise}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className="fixed right-6 md:bottom-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-2.5 text-xs font-bold animate-bounce"
          style={{ bottom: "max(5.5rem, calc(env(safe-area-inset-bottom) + 5rem))" }}
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
