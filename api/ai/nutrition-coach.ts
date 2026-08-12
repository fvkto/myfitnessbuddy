import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini SDK lazily / safely (reused across warm invocations)
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não configurada no ambiente.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "vercel-build",
        },
      },
    });
  }
  return aiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { userQuestion, dailyContext } = req.body || {};
    const ai = getGemini();

    const systemPrompt = `Você é o Coach de Nutrição do MyFitnessBuddy.
Seu objetivo é fornecer orientações práticas, científicas, empáticas e personalizadas em Português do Brasil.
Responda de forma clara, amigável e direta, usando markdown com tópicos quando útil.
Mantenha a resposta focada no alcance saudável das metas do usuário.`;

    const userMessage = `Contexto do Dia do Usuário:
- Meta de Calorias: ${dailyContext?.calorieGoal || 2000} kcal
- Consumido hoje: ${dailyContext?.consumedCalories || 0} kcal
- Exercício hoje: ${dailyContext?.burnedCalories || 0} kcal
- Proteínas atingidas: ${dailyContext?.protein || 0}g / ${dailyContext?.proteinGoal || 150}g
- Carboidratos atingidos: ${dailyContext?.carbs || 0}g / ${dailyContext?.carbsGoal || 200}g
- Gorduras atingidas: ${dailyContext?.fat || 0}g / ${dailyContext?.fatGoal || 65}g

Pergunta do Usuário:
${userQuestion}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.status(200).json({ success: true, answer: response.text });
  } catch (error: any) {
    console.error("Erro no Coach Nutricional:", error);
    res.status(500).json({ error: error.message || "Erro no serviço do Coach IA." });
  }
}
