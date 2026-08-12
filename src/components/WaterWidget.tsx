import React from "react";
import { Droplet, Plus, Minus, CheckCircle2 } from "lucide-react";

interface WaterWidgetProps {
  currentWaterMl: number;
  targetWaterMl: number;
  onUpdateWater: (newAmountMl: number) => void;
}

export const WaterWidget: React.FC<WaterWidgetProps> = ({
  currentWaterMl,
  targetWaterMl,
  onUpdateWater,
}) => {
  const percentage = Math.min(100, Math.round((currentWaterMl / targetWaterMl) * 100));

  const addWater = (amountMl: number) => {
    onUpdateWater(currentWaterMl + amountMl);
  };

  const removeWater = (amountMl: number) => {
    onUpdateWater(Math.max(0, currentWaterMl - amountMl));
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
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Meta diária: {(targetWaterMl / 1000).toFixed(1)} Litros ({targetWaterMl} ml)
            </p>
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
