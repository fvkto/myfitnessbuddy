import React from "react";
import { LayoutDashboard, BookOpen, Camera, LineChart, Target, Flame, Bot, Plus } from "lucide-react";

interface NavigationProps {
  activeTab: "dashboard" | "diary" | "ai-scanner" | "progress" | "goals" | "ai-coach";
  setActiveTab: (tab: "dashboard" | "diary" | "ai-scanner" | "progress" | "goals" | "ai-coach") => void;
  streakDays: number;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, streakDays }) => {
  return (
    <>
      {/* Top Header */}
      <header
        className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer min-w-0" onClick={() => setActiveTab("dashboard")}>
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-blue-500/20 shrink-0">
              <img src="/logo-icon.png" alt="MyFitnessBuddy" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-lg sm:text-xl font-extrabold bg-linear-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent tracking-tight">
                MyFitnessBuddy
              </span>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Streak Counter — só aparece a partir de 7 dias consecutivos de registro */}
            {streakDays >= 7 && (
              <div className="flex items-center space-x-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800 text-xs font-bold shadow-2xs">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                <span>{streakDays} dias</span>
              </div>
            )}

            {/* AI Coach Button */}
            <button
              onClick={() => setActiveTab("ai-coach")}
              className={`flex items-center justify-center sm:justify-start p-2.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
                activeTab === "ai-coach"
                  ? "bg-purple-600 text-white shadow-purple-500/20"
                  : "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100"
              }`}
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline sm:ml-1.5">Coach IA</span>
            </button>

            {/* AI Quick Scanner Button */}
            <button
              onClick={() => setActiveTab("ai-scanner")}
              className="flex items-center justify-center sm:justify-start p-2.5 sm:px-3.5 sm:py-1.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xs font-bold shadow-md shadow-blue-500/20 hover:opacity-95 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline sm:ml-1.5">Escanear IA</span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Navigation Sub-bar */}
      <nav className="hidden md:block bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 flex space-x-8">
          {[
            { id: "dashboard", label: "Painel", icon: LayoutDashboard },
            { id: "diary", label: "Diário Alimentar", icon: BookOpen },
            { id: "ai-scanner", label: "Scanner por IA", icon: Camera },
            { id: "progress", label: "Progresso & Peso", icon: LineChart },
            { id: "goals", label: "Metas & Perfil", icon: Target },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center space-x-2 py-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Floating Bottom Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:hidden px-2 pt-1 shadow-lg"
        style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
      >
        <div className="grid grid-cols-5 items-center max-w-md mx-auto">
          {[
            { id: "dashboard", label: "Painel", icon: LayoutDashboard },
            { id: "diary", label: "Diário", icon: BookOpen },
            { id: "ai-scanner", label: "IA Scan", icon: Camera, highlight: true },
            { id: "progress", label: "Progresso", icon: LineChart },
            { id: "goals", label: "Metas", icon: Target },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.highlight) {
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className="flex flex-col items-center justify-center -mt-5"
                >
                  <div className="w-12 h-12 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-white dark:ring-slate-900">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-500 dark:text-slate-400 font-medium"
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
