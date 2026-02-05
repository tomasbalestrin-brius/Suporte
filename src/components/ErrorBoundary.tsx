import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BethelLogo } from '@/components/ui/BethelLogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Aqui você pode enviar o erro para um serviço de monitoramento
    // como Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 flex items-center justify-center p-4">
          <Card className="glass max-w-2xl w-full border-red-500/20">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <BethelLogo variant="full" className="text-white" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="bg-red-500/20 p-4 rounded-full">
                    <AlertCircle className="w-16 h-16 text-red-500" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-white">
                  Ops! Algo Deu Errado
                </CardTitle>
                <CardDescription className="text-lg">
                  Desculpe, encontramos um erro inesperado. Nossa equipe já foi notificada.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Mensagem de erro (somente em desenvolvimento) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold text-red-400">
                    Erro (visível apenas em desenvolvimento):
                  </p>
                  <pre className="text-xs text-red-300 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <details className="text-xs text-red-300">
                      <summary className="cursor-pointer hover:text-red-200">
                        Stack trace
                      </summary>
                      <pre className="mt-2 overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Ações */}
              <div className="grid gap-3">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  onClick={this.handleReset}
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Tentar Novamente
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={this.handleGoHome}
                >
                  <Home className="mr-2 h-5 w-5" />
                  Voltar para Início
                </Button>
              </div>

              {/* Dicas */}
              <div className="border-t border-white/10 pt-6 mt-6">
                <p className="text-center text-sm text-muted-foreground mb-3">
                  O que você pode fazer:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    Recarregue a página (Ctrl+R ou Cmd+R)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    Limpe o cache do navegador
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    Se o problema persistir, entre em contato com o suporte
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
