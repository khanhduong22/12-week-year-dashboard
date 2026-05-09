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
            description: "The strategic objective name (e.g. 'Body Transformation', 'Career Growth')."
          },
          category: {
            type: Type.STRING,
            description: "The category of the tactic mapping to Life Wheel domains.",
            enum: ["Health & Fitness", "Career & Business", "Finances", "Relationships & Family", "Personal Growth", "Recreation & Fun", "Physical Environment", "Community & Contribution", "Spiritual & Faith"]
          },
          weight: {
            type: Type.INTEGER,
            description: "Importance weight of the tactic. 1 for minor, 2 for medium, 3 for high impact."
          },
          indicators: {
            type: Type.ARRAY,
            description: "The list of indicators (both LEAD and LAG) for this objective.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: "A specific, measurable signal or target (e.g. 'Luyện 2 bài LeetCode', 'Chạy bộ 5km', 'Giảm 5kg')."
                },
                type: {
                  type: Type.STRING,
                  description: "Whether this is a LEAD indicator (daily/weekly execution task) or LAG indicator (final target/outcome).",
                  enum: ["LEAD", "LAG"]
                },
                targetCount: {
                  type: Type.INTEGER,
                  description: "For LEAD: Number of times this indicator should be executed per week (1-7). For LAG: usually 1."
                },
                targetValue: {
                  type: Type.NUMBER,
                  description: "The numeric target value. For LEAD: daily target (e.g. 5 for 'Run 5km'). For LAG: final target (e.g. 5 for 'Lose 5kg')."
                },
                unit: {
                  type: Type.STRING,
                  description: "The unit of measurement (e.g. 'km', 'bài', 'kg', 'điểm', '$')."
                }
              },
              required: ["name", "type", "targetCount"]
            }
          }
        },
        required: ["name", "category", "weight", "indicators"]
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

Your task is to break down these goals into overarching Strategic Objectives (Tactics).
Create 2-4 core Tactics. For each Tactic, provide nested Indicators (both LEAD and LAG types) that guarantee its achievement.

CRITICAL INSTRUCTIONS FOR INDICATORS:
- LEAD Indicators (Chỉ số dẫn dắt): These are daily/weekly actions you can control. Set \`type\` to "LEAD". Determine \`targetCount\` (1-7 days per week). If the action has a quantifiable daily metric (e.g. 'Run 5km'), provide \`targetValue\` (5) and \`unit\` ('km'). If it's just a boolean task, omit them.
- LAG Indicators (Chỉ số kết quả): These are the final outcomes you want to achieve. Set \`type\` to "LAG". Provide the \`targetValue\` (e.g., 5) and \`unit\` (e.g., 'kg'). Set \`targetCount\` to 1.
Each Tactic MUST have at least 1 LAG indicator and 2-3 LEAD indicators nested inside it.
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
