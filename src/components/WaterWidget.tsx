import React, { useState } from "react";
import { Droplet, Plus, Minus, CheckCircle2, Pencil, Check, X } from "lucide-react";

interface WaterWidgetProps {
  currentWaterMl: number;
  targetWaterMl: number;
  onUpdateWater: (newAmountMl: number) => void;
  onUpdateWaterTarget: (newTargetMl: number) => void;
}

export const WaterWidget: React.FC<WaterWidgetProps> = ({
  currentWaterMl,
  targetWaterMl,
  onUpdateWater,
  onUpdateWaterTarget,
}) => {
  const percentage = Math.min(100, Math.round((currentWaterMl / targetWaterMl) * 100));

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [editValue, setEditValue] = useState(String(targetWaterMl));

  const addWater = (amountMl: number) => {
    onUpdateWater(currentWaterMl + amountMl);
  };

  const removeWater = (amountMl: number) => {
    onUpdateWater(Math.max(0, currentWaterMl - amountMl));
  };

  const startEditing = () => {
    setEditValue(String(targetWaterMl));
    setIsEditingTarget(true);
  };

  const cancelEditing = () => {
    setIsEditingTarget(false);
  };

  const confirmEditing = () => {
    const parsed = parseInt(editValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateWaterTarget(parsed);
    }
    setIsEditingTarget(false);
  };

  return (
    <div className="bg-linear-to-br from-cyan-500/10 via-blue-500/5 to-transparent bg-white dark:bg-slate-900 border border-cyan-100 dark:border-cyan-900/40 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Droplet className="w-5 h-5 fill-cyan-500/30" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Consumo de Água</h3>
            {isEditingTarget ? (
              <div className="flex items-center space-x-1.5 mt-0.5">
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmEditing();
                    if (e.key === "Escape") cancelEditing();
                  }}
                  autoFocus
                  min={1}
                  step={100}
                  className="w-20 text-xs font-semibold px-2 py-1 rounded-lg border border-cyan-300 dark:border-cyan-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <span className="text-xs text-slate-500">ml</span>
                <button
                  onClick={confirmEditing}
                  className="p-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                  title="Salvar"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={cancelEditing}
                  className="p-1 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Cancelar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={startEditing}
                className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors group/edit"
                title="Editar meta diária"
              >
                <span>
                  Meta diária: {(targetWaterMl / 1000).toFixed(1)} Litros ({targetWaterMl} ml)
                </span>
                <Pencil className="w-3 h-3 opacity-50 group-hover/edit:opacity-100" />
              </button>
            )}
          </div>
        </div>

        {percentage >= 100 && (
          <div className="flex items-center space-x-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Meta atingida!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Progress Display */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-baseline mb-1.5">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {currentWaterMl}
              </span>
              <span className="text-sm font-semibold text-slate-500">/ {targetWaterMl} ml</span>
            </div>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
              {percentage}%
            </span>
          </div>

          {/* Bar */}
          <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/60">
            <div
              className="h-full bg-linear-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex items-center space-x-2 justify-end">
          <button
            onClick={() => removeWater(250)}
            disabled={currentWaterMl <= 0}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Remover 250ml"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={() => addWater(250)}
            className="flex items-center space-x-1 px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>250 ml</span>
          </button>

          <button
            onClick={() => addWater(500)}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-blue-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>500 ml</span>
          </button>
        </div>
      </div>
    </div>
  );
};
