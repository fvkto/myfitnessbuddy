import React, { useState } from "react";
import { UserGoals, DayLog } from "../types";
import { calculateDayNutrients, calculateExerciseCalories } from "../lib/calculators";
import { Bot, Send, Sparkles, Loader2, User, MessageSquare } from "lucide-react";

interface AICoachModalProps {
  userGoals: UserGoals;
  dayLog: DayLog;
}

interface Message {
  sender: "user" | "coach";
  text: string;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({ userGoals, dayLog }) => {
  const nutrients = calculateDayNutrients(dayLog);
  const exerciseCalories = calculateExerciseCalories(dayLog);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "coach",
      text: "Olá! Sou seu Coach de Nutrição MyFitnessBuddy com IA. Como posso te ajudar hoje? Pode me pedir receitas, sugestões de substituições, estratégias para bater suas metas ou tirar dúvidas sobre suplementos!",
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    "Sugerir janta saudável de até 500 kcal com bastante proteína",
    "Como bater minha meta de fibras hoje?",
    "Quais alimentos são ótimos pré-treino para ter energia?",
    "Opções práticas de lanche da tarde com baixo carboidrato",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const question = textToSend || inputQuestion;
    if (!question.trim() || isLoading) return;

    const newMsgList: Message[] = [...messages, { sender: "user", text: question }];
    setMessages(newMsgList);
    setInputQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/nutrition-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuestion: question,
          dailyContext: {
            calorieGoal: userGoals.calorieGoal,
            consumedCalories: nutrients.calories,
            burnedCalories: exerciseCalories,
            protein: Math.round(nutrients.protein),
            proteinGoal: userGoals.proteinGrams,
            carbs: Math.round(nutrients.carbs),
            carbsGoal: userGoals.carbsGrams,
            fat: Math.round(nutrients.fat),
            fatGoal: userGoals.fatGrams,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Falha na resposta do Coach IA.");
      }

      setMessages([...newMsgList, { sender: "coach", text: data.answer }]);
    } catch (err: any) {
      setMessages([
        ...newMsgList,
        {
          sender: "coach",
          text: "Desculpe, ocorreu um erro ao consultar o Coach Nutricional. Por favor, tente novamente em instantes.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-purple-700 via-indigo-700 to-blue-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
            <Bot className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Inteligência Artificial Personalizada</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">Coach Nutricional IA</h1>
            <p className="text-xs text-purple-100">
              Respostas e planejamentos adaptados às suas metas de {userGoals.calorieGoal} kcal/dia.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 hover:bg-purple-50 text-purple-800 dark:text-purple-300 rounded-2xl text-xs font-semibold whitespace-nowrap shadow-2xs transition-all shrink-0"
          >
            💡 {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 min-h-[380px] max-h-[500px] overflow-y-auto flex flex-col">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 ${
              msg.sender === "user" ? "flex-row-reverse space-x-reverse self-end" : "self-start"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-purple-600 text-white"
              }`}
            >
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl text-xs max-w-lg leading-relaxed whitespace-pre-wrap ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white font-medium rounded-tr-none"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700/60"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-3 self-start">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span>O Coach está analisando suas metas...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Faça uma pergunta sobre sua dieta ou alimentos..."
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-2xs"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputQuestion.trim()}
          className="px-5 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all flex items-center space-x-1.5 shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Enviar</span>
        </button>
      </div>
    </div>
  );
};
