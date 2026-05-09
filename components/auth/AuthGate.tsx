'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, init, signInWithEmail, signOut } = useAuthStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
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
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-100">Gainz</h1>
            <p className="text-sm text-zinc-500 mt-1">Your personal fitness tracker</p>
          </div>

          {sent ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center space-y-2">
              <p className="text-zinc-100 font-semibold">Check your email</p>
              <p className="text-sm text-zinc-500">We sent a magic link to <span className="text-zinc-300">{email}</span></p>
              <button onClick={() => setSent(false)} className="text-xs text-zinc-600 hover:text-zinc-400 mt-2 transition-colors">
                Use a different email
              </button>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                setError(null);
                const { error } = await signInWithEmail(email);
                if (error) { setError(error); } else { setSent(true); }
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
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#E8593C] hover:bg-[#d44e33] disabled:opacity-50 text-white font-bold transition-colors"
              >
                {submitting ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {/* Sign out — small button top right, visible on all pages */}
      <button
        onClick={signOut}
        className="fixed top-3 right-3 z-40 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        Sign out
      </button>
    </>
  );
}
