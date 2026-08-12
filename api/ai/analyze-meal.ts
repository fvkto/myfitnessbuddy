import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

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
    const { prompt, imageBase64, mimeType } = req.body || {};

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
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error("Erro ao analisar refeição com Gemini:", error);
    res.status(500).json({ error: error.message || "Falha ao processar refeição com IA." });
  }
}
