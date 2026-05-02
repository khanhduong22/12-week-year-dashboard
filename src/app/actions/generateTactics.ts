"use server";

import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({}); // Automatically picks up process.env.GEMINI_API_KEY

const tacticSchema: Schema = {
  type: Type.ARRAY,
  description: "A list of actionable daily or weekly tactics derived from the user's goals. Generate 5-8 tactics total.",
  items: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "The name of the tactic. Must be actionable and concise. E.g., 'Read 10 pages of tech book', 'Run 5km', 'Review weekly metrics'."
      },
      category: {
        type: Type.STRING,
        description: "Category of the tactic. Choose the best fit.",
        enum: ["internal", "learning", "health", "value"]
      },
      weight: {
        type: Type.INTEGER,
        description: "Importance weight of the tactic. 1 for minor habits, 2 for medium, 3 for high impact tasks."
      }
    },
    required: ["name", "category", "weight"]
  }
};

export async function generateTactics(goals: string[]) {
  if (!goals || goals.length === 0 || goals.every(g => g.trim() === '')) {
    throw new Error("Vui lòng nhập ít nhất một mục tiêu.");
  }

  const prompt = `
You are an expert 12-Week Year execution coach. The user wants to achieve the following goals in the next 12 weeks:
1. ${goals[0] || "Not specified"}
2. ${goals[1] || "Not specified"}
3. ${goals[2] || "Not specified"}

Your task is to break down these goals into actionable, specific daily or weekly habits/tasks (Tactics).
Create a comprehensive list of 5-8 tactics that, if executed consistently, will guarantee the achievement of these goals.
Make the tactics clear, measurable, and action-oriented.
Categorize them correctly and assign a weight based on their impact (3 is highest impact).
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: tacticSchema,
        temperature: 0.4,
      }
    });

    if (!response.text) {
      throw new Error("No response from AI.");
    }

    const tactics = JSON.parse(response.text);
    return tactics;
  } catch (error: unknown) {
    console.error("AI Generation Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Có lỗi xảy ra khi tạo tactic từ AI: " + errorMessage);
  }
}
