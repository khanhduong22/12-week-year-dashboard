"use client";

import { useState } from "react";
import { generateTactics } from "@/app/actions/generateTactics";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthFetch } from "@/lib/useAuthFetch";

export function AiGoalPlanner() {
  const [goals, setGoals] = useState<string[]>(["", "", ""]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const authFetch = useAuthFetch();

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const handleGenerate = async () => {
    // Validate inputs
    if (goals.every(g => g.trim() === "")) {
      setError("Vui lòng nhập ít nhất một mục tiêu.");
      return;
    }
    
    setError(null);
    setIsGenerating(true);

    try {
      // Call Server Action to generate tactics
      const data = await generateTactics(goals);
      
      setIsGenerating(false);
      setIsSaving(true);

      // Save generated tactics as a new draft cycle to the backend API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://12wy-api.khanhdp.com";
      
      const payload = {
        name: data.title,
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().getTime() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: false, // Save as Draft!
        strategicBlockDesc: data.strategicBlockDesc,
        bufferBlockDesc: data.bufferBlockDesc,
        breakoutBlockDesc: data.breakoutBlockDesc,
        tactics: {
          create: data.tactics.map((t: { name: string; category: string; weight: number; indicatorType: string; targetCount: number; targetValue?: number; unit?: string }) => ({
            name: t.name,
            category: t.category,
            weight: t.weight,
            indicatorType: t.indicatorType || "LEAD",
            targetCount: t.targetCount ? parseInt(String(t.targetCount), 10) : 7,
            targetValue: t.targetValue !== undefined && t.targetValue !== null ? parseFloat(String(t.targetValue)) : null,
            currentValue: t.indicatorType === "LAG" ? 0 : null,
            unit: t.unit ? String(t.unit) : null
          }))
        }
      };

      const cycleResponse = await authFetch(`${apiUrl}/cycles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!cycleResponse.ok) {
        const errorText = await cycleResponse.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Failed to save: ${errorText}`);
      }
      
      setIsSaving(false);
      setSuccess(true);
      
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage || "Có lỗi xảy ra trong quá trình tạo hoặc lưu Tactic.");
      setIsGenerating(false);
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">AI Goal Planner</h2>
        </div>
        
        <p className="text-zinc-400 mb-6 max-w-2xl">
          Don&apos;t know how to break down your goals? Just enter 1 to 3 big goals you want to achieve in the next 12 weeks. Our AI will automatically generate the right daily and weekly tactics and add them to your configuration.
        </p>

        {success ? (
          <div className="bg-green-900/30 border border-green-500/30 p-6 rounded-lg text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-300 mb-2">Tactics Generated Successfully!</h3>
            <p className="text-zinc-300 mb-6">
              Your goals have been broken down and automatically added to your current 12-Week cycle.
            </p>
            <button
              onClick={() => router.push("/config")}
              className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors"
            >
              Review Your Tactics Now
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Goal {i + 1}
                </label>
                <input
                  type="text"
                  value={goals[i]}
                  onChange={(e) => handleGoalChange(i, e.target.value)}
                  placeholder={i === 0 ? "e.g., Get a senior software engineering job" : "e.g., Lose 5kg and run 10k"}
                  className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                  disabled={isGenerating || isSaving}
                />
              </div>
            ))}

            {error && (
              <div className="text-red-400 text-sm py-2 px-4 bg-red-900/20 border border-red-900/50 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || isSaving}
              className="w-full mt-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI is analyzing and breaking down your goals...
                </>
              ) : isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving tactics to your configuration...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate My 12-Week Tactics
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
