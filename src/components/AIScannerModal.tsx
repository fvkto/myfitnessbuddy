import React, { useState } from "react";
import { MealType, LoggedFood } from "../types";
import { Camera, Upload, Sparkles, X, Check, Loader2, Utensils, AlertCircle } from "lucide-react";

interface AIScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMultipleFoods: (foods: Omit<LoggedFood, "id">[]) => void;
}

export const AIScannerModal: React.FC<AIScannerModalProps> = ({
  isOpen,
  onClose,
  onAddMultipleFoods,
}) => {
  if (!isOpen) return null;

  const [promptText, setPromptText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [selectedMeal, setSelectedMeal] = useState<MealType>("lunch");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!promptText && !selectedImage) {
      setErrorMessage("Por favor, descreva a refeição ou envie uma foto do prato.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/ai/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          imageBase64: selectedImage,
          mimeType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Falha ao analisar a refeição.");
      }

      setAnalysisResult(data.data);
    } catch (err: any) {
      setErrorMessage(err.message || "Ocorreu um erro ao conectar ao serviço de IA.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAndAddAll = () => {
    if (!analysisResult || !analysisResult.items) return;

    const loggedItems: Omit<LoggedFood, "id">[] = analysisResult.items.map((item: any) => ({
      foodId: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: item.name,
      mealType: selectedMeal,
      servings: 1,
      servingSize: item.servingSize,
      calories: Math.round(item.calories),
      protein: Number(item.protein) || 0,
      carbs: Number(item.carbs) || 0,
      fat: Number(item.fat) || 0,
      fiber: Number(item.fiber) || 0,
    }));

    onAddMultipleFoods(loggedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-linear-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Camera className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Scanner de Alimentos por IA</h2>
              <p className="text-xs text-blue-100">Análise instantânea de fotos ou descrições</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Meal Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Refeição de Destino:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "breakfast" as MealType, name: "Café" },
                { id: "lunch" as MealType, name: "Almoço" },
                { id: "dinner" as MealType, name: "Jantar" },
                { id: "snacks" as MealType, name: "Lanches" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMeal(m.id)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all ${
                    selectedMeal === m.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Photo upload area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              1. Envie uma foto do seu prato (Opcional)
            </label>

            {selectedImage ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500 max-h-48 group">
                <img src={selectedImage} alt="Foto da refeição" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-full hover:bg-rose-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all group">
                <Upload className="w-7 h-7 text-slate-400 group-hover:text-blue-600 mb-2 transition-colors" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Clique para carregar ou tirar foto
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP até 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Text Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              2. Descreva os alimentos ou ingredientes (ou complete a foto):
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Prato feito com 150g de filé de frango grelhado, 1 concha de feijão carioca, 3 colheres de arroz branco e salada de alface e tomate com azeite de oliva."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          {!analysisResult && (
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analisando foto e macros com Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Analisar Refeição com IA</span>
                </>
              )}
            </button>
          )}

          {/* Analysis Results View */}
          {analysisResult && (
            <div className="bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-200 dark:border-blue-900 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-900 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Resultado da Análise IA
                  </span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {analysisResult.dishTitle}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-blue-600 block">
                    {analysisResult.totalCalories} kcal
                  </span>
                  <span className="text-[10px] text-slate-500">
                    P: {analysisResult.totalProtein}g | C: {analysisResult.totalCarbs}g | G: {analysisResult.totalFat}g
                  </span>
                </div>
              </div>

              {/* Items breakdown list */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Itens Detectados ({analysisResult.items?.length || 0}):
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {analysisResult.items?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs flex justify-between items-center border border-slate-100 dark:border-slate-700/60"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.servingSize} &bull; P: {item.protein}g | C: {item.carbs}g | G: {item.fat}g
                        </span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.calories} kcal
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutritional advice */}
              {analysisResult.nutritionalAdvice && (
                <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-blue-100 dark:border-blue-900/60 italic">
                  "{analysisResult.nutritionalAdvice}"
                </div>
              )}

              {/* Confirm Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAnalysisResult(null)}
                  className="w-1/3 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs"
                >
                  Refazer
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndAddAll}
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Adicionar Tudo ao Diário</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
