'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Target } from 'lucide-react';

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900/50 border border-white/10 p-8 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-emerald-500/20 p-4">
            <Target className="h-10 w-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h2>
          <p className="text-sm text-zinc-400">Sign in to your 12-Week Year Architect</p>
        </div>

        <div className="mt-8">
          <button
            onClick={() => signIn('google')}
            className="group relative flex w-full justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition-all hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
