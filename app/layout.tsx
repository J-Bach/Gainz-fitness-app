import type { Metadata } from 'next';
import './globals.css';
import BottomNav from '@/components/nav/BottomNav';
import AuthGate from '@/components/auth/AuthGate';

export const metadata: Metadata = {
  title: 'Fitness Tracker',
  description: 'Track your workouts, build plans, crush PRs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen font-sans antialiased">
        <AuthGate>
          <div className="relative min-h-screen pb-20">
            {children}
          </div>
          <BottomNav />
        </AuthGate>
      </body>
    </html>
  );
}
