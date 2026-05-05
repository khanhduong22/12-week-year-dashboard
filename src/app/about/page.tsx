import { ArrowRight, Target, Clock, BarChart3, CalendarDays, Sparkles, Heart } from "lucide-react";
import Link from "next/link";
import { AiGoalPlanner } from "@/components/dashboard/AiGoalPlanner";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 p-8 pb-24 md:p-12 lg:p-20 font-sans selection:bg-orange-500/30">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">12-Week Year</span> Framework
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            Forget annualized thinking. A year is no longer 12 months—it is 12 weeks.
          </p>
        </header>

        <section className="space-y-16">
          {/* Theory Section */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-8 md:p-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Target className="w-6 h-6 mr-3 text-orange-500" />
              Core Concept
            </h2>
            <div className="prose prose-invert max-w-none text-zinc-300 leading-loose">
              <p>
                Most people set annual goals in January and wait until November to hustle. 
                The 12-Week Year shortens your execution cycle. You don&apos;t have time to slack off when your &quot;year&quot; ends in 12 weeks.
              </p>
              <p className="mt-4">
                <strong>Vision without execution is hallucination.</strong> This framework forces you to break down your high-level vision into 
                specific, measurable daily or weekly actions (Tactics) and tracks your execution relentlessly.
              </p>
            </div>
          </div>

          {/* Philosophy Section */}
          <div className="bg-gradient-to-br from-indigo-950/30 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-8 md:p-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-indigo-400">
              <Sparkles className="w-6 h-6 mr-3" />
              The One Thing vs. Wheel of Life
            </h2>
            <div className="prose prose-invert max-w-none text-zinc-300 leading-loose">
              <p>
                A common trap is trying to perfectly balance all 7 areas of the <strong>Wheel of Life</strong> simultaneously. This leads to burnout and mediocre results across the board. The 12-Week Year solves this through <strong>Dynamic Balance</strong>.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6 mb-6">
                <div className="bg-black/40 p-5 rounded-xl border border-white/5">
                  <h4 className="text-orange-400 font-bold mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2" /> Breakthrough Mode
                  </h4>
                  <p className="text-sm leading-relaxed">
                    Pick <strong>1 or 2 areas</strong> (e.g., Career & Finance) to be your <em>&quot;One Thing&quot;</em> for the next 12 weeks. Dedicate 80% of your focus here to achieve exponential growth.
                  </p>
                </div>
                <div className="bg-black/40 p-5 rounded-xl border border-white/5">
                  <h4 className="text-emerald-400 font-bold mb-2 flex items-center">
                    <Heart className="w-4 h-4 mr-2" /> Maintenance Mode
                  </h4>
                  <p className="text-sm leading-relaxed">
                    For the remaining areas (e.g., Health, Relationships), set <strong>Minimum Viable Habits</strong>. You aren&apos;t trying to run a marathon, you just need 3 days of gym to maintain shape.
                  </p>
                </div>
              </div>
              <p className="text-sm text-zinc-400 italic">
                At the end of the 12 weeks, rotate your focus. Over the course of 4 cycles (1 actual year), you will have leveled up every area of your Wheel of Life without burning out.
              </p>
            </div>
          </div>

          {/* Practical Application */}
          <div>
            <h2 className="text-3xl font-bold mb-8">How to apply it here</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-black border border-zinc-800 p-6 rounded-xl hover:border-zinc-700 transition-colors">
                <Clock className="w-8 h-8 text-orange-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">1. Define Tactics</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Go to <strong>Config</strong>. Add your daily/weekly habits. Assign higher weights to the most critical tasks that move the needle.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-black border border-zinc-800 p-6 rounded-xl hover:border-zinc-700 transition-colors">
                <CalendarDays className="w-8 h-8 text-orange-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">2. Daily Execution</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Execution happens daily. Use the <strong>Daily Log</strong> to track which tactics you completed today. Don&apos;t worry about the results yet, just execute the plan.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-black border border-zinc-800 p-6 rounded-xl hover:border-zinc-700 transition-colors">
                <BarChart3 className="w-8 h-8 text-orange-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">3. Weekly Scorecard</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  The dashboard calculates your execution score. <strong>Aim for 85%+</strong>. If you hit 85% execution consistently, you will achieve your goals.
                </p>
              </div>
            </div>
          </div>

          {/* AI Goal Planner Section */}
          <AiGoalPlanner />

        </section>

        <footer className="mt-20 pt-8 border-t border-zinc-800 flex justify-between items-center">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center">
            &larr; Back to Dashboard
          </Link>
          <Link href="/config" className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors flex items-center">
            Start Configuring <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </footer>
      </div>
    </div>
  );
}
