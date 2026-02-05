import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';
import { BethelLogo } from '@/components/ui/BethelLogo';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 flex items-center justify-center p-4">
      <Card className="glass max-w-2xl w-full">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <BethelLogo variant="full" className="text-white" />
          </div>

          <div className="space-y-2">
            <div className="text-8xl font-bold text-white/20">404</div>
            <CardTitle className="text-3xl">Página Não Encontrada</CardTitle>
            <CardDescription className="text-lg">
              Desculpe, a página que você está procurando não existe ou foi movida.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Ilustração */}
          <div className="flex justify-center py-8">
            <div className="relative">
              <Search className="w-32 h-32 text-white/10" />
              <HelpCircle className="w-16 h-16 text-yellow-500 absolute -top-4 -right-4 animate-bounce" />
            </div>
          </div>

          {/* Ações */}
          <div className="grid gap-3">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => navigate('/')}
            >
              <Home className="mr-2 h-5 w-5" />
              Ir para Página Inicial
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Voltar para Página Anterior
            </Button>
          </div>

          {/* Links úteis */}
          <div className="border-t border-white/10 pt-6 mt-6">
            <p className="text-center text-sm text-muted-foreground mb-3">
              Precisa de ajuda? Confira essas páginas:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/tickets/new')}
              >
                Abrir Ticket
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Fazer Login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotFoundPage;
