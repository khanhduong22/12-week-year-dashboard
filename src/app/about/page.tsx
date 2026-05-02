import Link from "next/link";
import { ArrowLeft, Target, Activity, CalendarDays, BarChart3 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 pt-12 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-4">
          <Link href="/" className="inline-flex items-center text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            The 12-Week Year Framework
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            Annual goals often fail because a year is too long, creating a false sense of security. The 12-Week Year compresses execution, creating healthy urgency and intense focus.
          </p>
        </header>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-zinc-800 pb-2">Core Concepts</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <Target className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">1. Vision & Goals</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Define what you want to achieve in the next 12 weeks. Do not plan for the entire year. Focus on 1-3 highly impactful goals.
              </p>
            </div>
            
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <Activity className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">2. Tactics (Lead Indicators)</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Tactics are the specific, daily/weekly actions you must take to reach your goal. In this app, these are configured in the <strong>Config</strong> section.
              </p>
            </div>

            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <CalendarDays className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">3. Weekly Execution</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Execution happens daily. Use the <strong>Daily Log</strong> to track which tactics you completed today. Don&apos;t worry about the results yet, just execute the plan.
              </p>
            </div>

            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <BarChart3 className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">4. Weekly Scorecard</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                At the end of the week, your execution is scored as a percentage. <strong>85% or higher</strong> means you are highly likely to hit your goals.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-zinc-800 pb-2">How to use this Dashboard</h2>
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-900 text-slate-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                1
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-md">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-zinc-100">Configure Tactics</div>
                </div>
                <div className="text-zinc-400 text-sm">
                  Click the <strong>Config</strong> button. Add your daily/weekly habits. Assign them weights based on their impact.
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-900 text-slate-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                2
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-md">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-zinc-100">Log Daily</div>
                </div>
                <div className="text-zinc-400 text-sm">
                  Every evening, open the <strong>Daily Log</strong>. Check off what you did, and rate your energy/sleep. Honesty is key.
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-900 text-slate-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                3
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-md">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-zinc-100">Monitor Scorecard</div>
                </div>
                <div className="text-zinc-400 text-sm">
                  Check your <strong>Weekly Scorecard</strong> on the dashboard. Keep it above 85%. If it drops, the dashboard warns you!
                </div>
              </div>
            </div>

          </div>
        </section>

        <div className="text-center pt-8">
          <Link href="/" className="bg-white text-black px-8 py-3 rounded-full font-bold shadow-lg hover:bg-zinc-200 transition-colors inline-block">
            Start Executing
          </Link>
        </div>
      </div>
    </div>
  );
}
