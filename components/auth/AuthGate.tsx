'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, init, signIn, signUp, signOut } = useAuthStore();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { init(); }, [init]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-[#E8593C] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-100">Gainz</h1>
            <p className="text-sm text-zinc-500 mt-1">Your personal fitness tracker</p>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-zinc-900 rounded-xl p-1">
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                mode === 'signin' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                mode === 'signup' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500'
              }`}
            >
              Create account
            </button>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              setError(null);
              const fn = mode === 'signin' ? signIn : signUp;
              const { error } = await fn(email, password);
              if (error) setError(error);
              setSubmitting(false);
            }}
            className="space-y-3"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#E8593C] transition-colors"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#E8593C] transition-colors"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#E8593C] hover:bg-[#d44e33] disabled:opacity-50 text-white font-bold transition-colors"
            >
              {submitting
                ? (mode === 'signin' ? 'Signing in…' : 'Creating account…')
                : (mode === 'signin' ? 'Sign in' : 'Create account')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <button
        onClick={signOut}
        className="fixed top-3 right-3 z-40 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        Sign out
      </button>
    </>
  );
}
