
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSafetyCondition = async (description: string, imageBase64?: string | null) => {
  try {
    const prompt = `
      Actúa como experto en SST. Analiza este hallazgo: "${description}".
      Devuelve un JSON estrictamente con:
      1. dangerType: (Físico, Químico, Biológico, Psicosocial, Biomecánicos, Seguridad, Fenómenos Naturales).
      2. actionImplementation: Medida correctiva detallada.
      3. actionType: (Correctiva, Preventiva, De mejora).
      4. riskLevel: (Bajo, Medio, Alto, Crítico).
    `;

    const parts: any[] = [{ text: prompt }];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dangerType: { type: Type.STRING },
            actionImplementation: { type: Type.STRING },
            actionType: { type: Type.STRING },
            riskLevel: { type: Type.STRING }
          },
          required: ['dangerType', 'actionImplementation', 'actionType', 'riskLevel']
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};
