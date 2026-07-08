import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
        <div className="min-h-screen bg-[#FAF6ED] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#D4AF37] rounded-2xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-[#FFDAD6] rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-[#BA1A1A]" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#124949]">
              Algo saiu do controle
            </h2>
            <p className="text-sm text-[#3E4A56]">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            {this.state.error && (
              <p className="text-[10px] font-mono text-[#6B7A8A] bg-[#F6F3EA] rounded-lg p-3 break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="bg-[#1D6A6A] hover:brightness-110 text-white text-xs font-caps uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer border border-[#E8F4F4]/20"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                Tentar novamente
              </button>
              <a
                href="#/"
                onClick={this.handleReset}
                className="bg-[#E8F4F4] hover:bg-[#D4E8E8] text-[#3E4A56] text-xs font-caps uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer no-underline"
              >
                Voltar ao início
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
