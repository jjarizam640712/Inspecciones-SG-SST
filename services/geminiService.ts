
import { GoogleGenAI, Type } from "@google/genai";

// Inicialización de la IA usando la clave de entorno
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSafetyCondition = async (description: string, imageBase64?: string | null) => {
  const prompt = `
    Actúa como un Experto Senior en SST (Seguridad y Salud en el Trabajo). 
    Analiza este hallazgo: "${description}".
    Proporciona un JSON con:
    1. dangerType: (Biológico, Físico, Químico, Psicosocial, Biomecánico, Seguridad, Fenómenos Naturales).
    2. actionImplementation: Medida correctiva técnica detallada.
    3. actionType: (Eliminación, Sustitución, Controles de Ingeniería, Controles Administrativos, EPP).
    4. riskLevel: (Bajo, Medio, Alto, Crítico).
  `;

  const parts: any[] = [{ text: prompt }];
  
  // Si hay una foto, se la enviamos a la IA para un mejor análisis
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64.split(',')[1] || imageBase64
      }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp', // Modelo optimizado para velocidad y visión
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
};