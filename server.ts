import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini SDK lazily / safely
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
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "MyFitnessBuddy" });
});

// Analyze meal from text description or base64 photo using Gemini
app.post("/api/ai/analyze-meal", async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType } = req.body;

    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: "Forneça uma descrição ou imagem do alimento." });
    }

    const ai = getGemini();

    const parts: any[] = [];

    if (imageBase64) {
      parts.push({
        inlineData: {
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
          mimeType: mimeType || "image/jpeg",
        },
      });
    }

    const systemPrompt = `Você é um nutricionista e expert em análise alimentar de alta precisão.
Sua tarefa é analisar a imagem ou descrição do prato/alimento fornecido pelo usuário e identificar os itens com suas estimativas nutricionais precisas em português.
Retorne SEMPRE um JSON estrito no seguinte formato:
{
  "dishTitle": "Nome geral da refeição/prato (ex: Prato Feito de Frango com Arroz e Feijão)",
  "totalCalories": número total de kcal,
  "totalCarbs": número total de carboidratos em gramas,
  "totalProtein": número total de proteínas em gramas,
  "totalFat": número total de gorduras em gramas,
  "totalFiber": número total de fibras em gramas,
  "items": [
    {
      "name": "Nome do alimento (ex: Peito de Frango Grelhado)",
      "servingSize": "Tamanho da porção estimada (ex: 120g ou 1 filé médio)",
      "calories": número de kcal,
      "protein": gramas de proteína,
      "carbs": gramas de carboidrato,
      "fat": gramas de gordura,
      "fiber": gramas de fibra
    }
  ],
  "nutritionalAdvice": "Dica rápida e encorajadora do nutricionista sobre esta refeição (máx 2 frases em português)."
}`;

    if (prompt) {
      parts.push({ text: `Descrição da refeição: ${prompt}` });
    } else {
      parts.push({ text: "Analise esta foto de refeição e forneça a decomposição detalhada de alimentos e macros." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dishTitle: { type: Type.STRING },
            totalCalories: { type: Type.NUMBER },
            totalCarbs: { type: Type.NUMBER },
            totalProtein: { type: Type.NUMBER },
            totalFat: { type: Type.NUMBER },
            totalFiber: { type: Type.NUMBER },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  servingSize: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER },
                  fat: { type: Type.NUMBER },
                  fiber: { type: Type.NUMBER },
                },
                required: ["name", "servingSize", "calories", "protein", "carbs", "fat", "fiber"],
              },
            },
            nutritionalAdvice: { type: Type.STRING },
          },
          required: ["dishTitle", "totalCalories", "totalCarbs", "totalProtein", "totalFat", "totalFiber", "items", "nutritionalAdvice"],
        },
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Erro ao analisar refeição com Gemini:", error);
    res.status(500).json({ error: error.message || "Falha ao processar refeição com IA." });
  }
});

// AI Nutrition Coach Advice
app.post("/api/ai/nutrition-coach", async (req, res) => {
  try {
    const { userQuestion, dailyContext } = req.body;
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

    res.json({ success: true, answer: response.text });
  } catch (error: any) {
    console.error("Erro no Coach Nutricional:", error);
    res.status(500).json({ error: error.message || "Erro no serviço do Coach IA." });
  }
});

// Start express server & integrate Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MyFitnessBuddy Server rodando na porta ${PORT}`);
  });
}

startServer();
