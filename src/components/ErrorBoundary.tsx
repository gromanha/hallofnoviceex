import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
          <div className="glass rounded-2xl max-w-md w-full p-8 text-center space-y-4 border border-[var(--color-outline)]/50">
            <div className="w-14 h-14 bg-[var(--color-crimson)]/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-[var(--color-crimson)]" />
            </div>
            <h2 className="text-xl font-display font-bold text-[var(--color-on-surface)]">
              Algo deu errado
            </h2>
            <p className="text-xs text-[var(--color-on-surface-variant)]">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            {this.state.error && (
              <p className="text-[10px] font-mono text-[var(--color-on-surface-variant)] bg-[var(--color-surface-alt)] rounded-lg p-3 break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-deep)] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-[var(--color-primary)]/20 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
