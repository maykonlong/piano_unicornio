import { GoogleGenAI, Type } from "@google/genai";
import { Song, NoteName } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateKidsSong = async (theme: string): Promise<Song | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Crie uma música simples e mágica para piano infantil, com tema de Unicórnios, Fadas e Princesas sobre: "${theme}". 
      A música deve ser doce e curta (entre 8 a 15 notas). 
      Use apenas notas naturais e sustenidos da oitava 3 e 4 (ex: C3, D4, F#3).
      Mantenha o ritmo simples.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Título fofo e criativo da música (Ex: Dança das Nuvens)" },
            difficulty: { type: Type.STRING, enum: ["Fácil", "Médio"], description: "Dificuldade" },
            description: { type: Type.STRING, description: "Uma frase mágica de encorajamento para a princesinha" },
            notes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  note: { type: Type.STRING, description: "Nome da nota (ex: C4, F#3)" },
                  time: { type: Type.NUMBER, description: "Tempo em ms para tocar a nota (começando de 0)" },
                  duration: { type: Type.NUMBER, description: "Duração da nota em ms" }
                },
                required: ["note", "time", "duration"]
              }
            }
          },
          required: ["title", "difficulty", "notes", "description"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    const data = JSON.parse(text);
    
    return {
      id: `gen-${Date.now()}`,
      title: data.title,
      difficulty: data.difficulty,
      description: data.description,
      notes: data.notes as { note: NoteName; time: number; duration: number }[]
    };

  } catch (error) {
    console.error("Erro ao gerar música:", error);
    return null;
  }
};