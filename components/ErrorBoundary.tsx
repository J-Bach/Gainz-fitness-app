'use client';

import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-zinc-100 font-semibold mb-2">Something went wrong</p>
          <p className="text-xs text-zinc-500 mb-4 max-w-sm font-mono break-all">
            {this.state.error.message}
          </p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
            className="text-xs text-[#E8593C] hover:underline"
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
