import React, { useState } from "react";
import { LoggedExercise } from "../types";
import { COMMON_EXERCISES } from "../data/initialData";
import { Dumbbell, Flame, X, Plus, Clock } from "lucide-react";

interface ExerciseModalProps {
  isOpen: boolean;
  userWeightKg: number;
  onClose: () => void;
  onAddExercise: (exercise: Omit<LoggedExercise, "id">) => void;
}

export const ExerciseModal: React.FC<ExerciseModalProps> = ({
  isOpen,
  userWeightKg,
  onClose,
  onAddExercise,
}) => {
  if (!isOpen) return null;

  const [selectedExerciseName, setSelectedExerciseName] = useState(COMMON_EXERCISES[0].name);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [customCalories, setCustomCalories] = useState<string>("");
  const [exerciseType, setExerciseType] = useState<"cardio" | "strength">("cardio");

  // Find exercise details
  const selectedCommon = COMMON_EXERCISES.find((e) => e.name === selectedExerciseName);

  // Calculated calories burned
  const calculatedBurn = selectedCommon
    ? Math.round((selectedCommon.calPerHourKg * userWeightKg * durationMinutes) / 60)
    : Math.round((6.0 * userWeightKg * durationMinutes) / 60);

  const finalCalories = customCalories ? Number(customCalories) : calculatedBurn;

  const handleLogExercise = (e: React.FormEvent) => {
    e.preventDefault();

    const logged: Omit<LoggedExercise, "id"> = {
      name: selectedExerciseName,
      type: selectedCommon ? selectedCommon.type : exerciseType,
      durationMinutes,
      caloriesBurned: finalCalories,
      timeLogged: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    onAddExercise(logged);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Registrar Exercício
              </h2>
              <p className="text-xs text-slate-400">Atividades físicas e queima calórica</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleLogExercise} className="p-6 space-y-5">
          {/* Select Exercise */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Selecione o Exercício:
            </label>
            <select
              value={selectedExerciseName}
              onChange={(e) => setSelectedExerciseName(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
            >
              {COMMON_EXERCISES.map((ex) => (
                <option key={ex.name} value={ex.name}>
                  {ex.name} ({ex.type === "cardio" ? "Aeróbico" : "Musculação"})
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Duração (Minutos):</span>
              </label>
              <span className="text-xs font-black text-blue-600">{durationMinutes} min</span>
            </div>

            <input
              type="range"
              min="5"
              max="180"
              step="5"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Calorie Estimate Card */}
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Flame className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                  Estimativa de Queima (com base em {userWeightKg}kg)
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  -{finalCalories} kcal
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block mb-0.5">Ajustar manual:</span>
              <input
                type="number"
                placeholder={`${calculatedBurn}`}
                value={customCalories}
                onChange={(e) => setCustomCalories(e.target.value)}
                className="w-20 px-2 py-1 text-xs text-center font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Exercício ao Diário</span>
          </button>
        </form>
      </div>
    </div>
  );
};
