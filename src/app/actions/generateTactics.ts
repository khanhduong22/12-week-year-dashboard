"use server";

import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({}); // Automatically picks up process.env.GEMINI_API_KEY

const tacticSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A cool, motivating title for the 12-week cycle based on the goals (e.g. 'Q4 - Mùa săn AI Architect', '12 Tuần Thổi Bùng Năng Lượng', 'The Coding Sprint')."
    },
    strategicBlockDesc: {
      type: Type.STRING,
      description: "Proposed activity for the 3-hour Strategic Block (Deep Work) based on goals (e.g. '3h uninterrupted coding AI logic', '3h writing manuscript')."
    },
    bufferBlockDesc: {
      type: Type.STRING,
      description: "Proposed activity for the 1-hour Buffer Block (Admin/Routing) based on goals (e.g. '1h checking emails and Jira', '1h doing household chores and bills')."
    },
    breakoutBlockDesc: {
      type: Type.STRING,
      description: "Proposed activity for the 3-hour Breakout Block (Rest/Recharge) to prevent burnout (e.g. '3h playing Black Myth Wukong', '3h hiking with family')."
    },
    tactics: {
      type: Type.ARRAY,
      description: "The list of 5-8 daily or weekly tactics to achieve the goals.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "A specific, measurable daily or weekly action (e.g. 'Luyện 2 bài LeetCode', 'Chạy bộ 5km')."
          },
          category: {
            type: Type.STRING,
            description: "The category of the tactic mapping to Life Wheel domains.",
            enum: ["Health & Fitness", "Career & Business", "Finances", "Relationships & Family", "Personal Growth", "Recreation & Fun", "Physical Environment", "Community & Contribution", "Spiritual & Faith"]
          },
          weight: {
            type: Type.INTEGER,
            description: "Importance weight of the tactic. 1 for minor habits, 2 for medium, 3 for high impact tasks."
          }
        },
        required: ["name", "category", "weight"]
      }
    }
  },
  required: ["title", "strategicBlockDesc", "bufferBlockDesc", "breakoutBlockDesc", "tactics"]
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
