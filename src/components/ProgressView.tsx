import React, { useState } from "react";
import { UserGoals, WeightEntry } from "../types";
import { calculateBMI } from "../lib/calculators";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import {
  Scale,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Target,
  Award,
  Calendar,
  X,
  Check
} from "lucide-react";

interface ProgressViewProps {
  userGoals: UserGoals;
  weightHistory: WeightEntry[];
  onAddWeightEntry: (entry: Omit<WeightEntry, "id">) => void;
  onRemoveWeightEntry: (id: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  userGoals,
  weightHistory,
  onAddWeightEntry,
  onRemoveWeightEntry,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState(userGoals.weightKg.toString());
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newNote, setNewNote] = useState("");

  const bmiInfo = calculateBMI(userGoals.weightKg, userGoals.heightCm);

  // Sorted history for chart
  const sortedHistory = [...weightHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const initialWeight = sortedHistory.length > 0 ? sortedHistory[0].weightKg : userGoals.weightKg;
  const currentWeight = userGoals.weightKg;
  const targetWeight = userGoals.targetWeightKg;

  const totalToLoseOrGain = Math.abs(initialWeight - targetWeight);
  const achievedSoFar = Math.abs(initialWeight - currentWeight);
  const progressPercent = totalToLoseOrGain > 0 ? Math.min(100, Math.round((achievedSoFar / totalToLoseOrGain) * 100)) : 100;

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;

    onAddWeightEntry({
      date: newDate,
      weightKg: parseFloat(newWeight),
      note: newNote,
    });

    setIsModalOpen(false);
    setNewNote("");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Overall Progress */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Acompanhamento de Peso & Metas
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            Evolução Corporal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mantenha registros periódicos para acompanhar sua jornada com precisão.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all shrink-0"
        >
          <Scale className="w-4 h-4" />
          <span>Registrar Novo Peso</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Current Weight */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Peso Atual
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {currentWeight}
            </span>
            <span className="text-xs font-bold text-slate-500">kg</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-2">
            Meta: {targetWeight} kg
          </span>
        </div>

        {/* BMI Card */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Índice de Massa Corporal (IMC)
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {bmiInfo.bmi}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${bmiInfo.colorClass}`}>
              {bmiInfo.category}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-2">
            Altura: {userGoals.heightCm} cm
          </span>
        </div>

        {/* Goal Progress Card */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Progresso da Meta
          </span>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-lg font-black text-blue-600">
              {progressPercent}%
            </span>
            <span className="text-[11px] text-slate-500">
              {Math.abs(currentWeight - targetWeight).toFixed(1)} kg restantes
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recharts Weight History Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
          <TrendingDown className="w-4 h-4 text-blue-600" />
          <span>Gráfico de Evolução (kg)</span>
        </h2>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sortedHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  color: "#FFFFFF",
                  fontSize: "12px",
                }}
              />
              <ReferenceLine y={targetWeight} label={{ value: `Meta: ${targetWeight}kg`, fill: "#10B981", fontSize: 11 }} stroke="#10B981" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="weightKg"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ r: 5, fill: "#2563EB" }}
                activeDot={{ r: 8 }}
                name="Peso (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Histórico de Registros
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                <th className="pb-2 font-bold">Data</th>
                <th className="pb-2 font-bold">Peso (kg)</th>
                <th className="pb-2 font-bold">Nota / Observação</th>
                <th className="pb-2 font-bold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedHistory.map((entry) => (
                <tr key={entry.id}>
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">
                    {entry.date}
                  </td>
                  <td className="py-3 font-black text-blue-600">
                    {entry.weightKg} kg
                  </td>
                  <td className="py-3 text-slate-500 italic">
                    {entry.note || "—"}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onRemoveWeightEntry(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Excluir registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weight Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Registrar Novo Peso
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWeight} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Peso em Kg *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nota / Sentimento (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Treino em jejum / Sensação de leveza"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20"
              >
                Salvar Peso
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
