
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const predictRentDefault = async (tenantHistory: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following tenant payment history and provide a risk assessment score (0-100) and a short recommendation for the property manager. Return as JSON. History: ${tenantHistory}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            recommendation: { type: Type.STRING }
          },
          required: ["riskScore", "summary", "recommendation"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const summarizeMaintenanceRequest = async (description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Categorize and summarize this maintenance request. Suggest priority (Low, Medium, High). Request: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            priority: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: ["category", "priority", "summary"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
