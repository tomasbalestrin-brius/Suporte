import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { emailIntegrationService } from '@/services/emailIntegration.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GmailCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setError(`Erro na autorização: ${error}`);
        setStatus('error');
        return;
      }

      if (!code) {
        setError('Código de autorização não encontrado');
        setStatus('error');
        return;
      }

      // Troca código por tokens
      const tokens = await emailIntegrationService.exchangeCodeForTokens(code);

      // Cria a integração no banco
      await emailIntegrationService.createIntegration({
        provider: 'gmail',
        email_address: tokens.email,
        display_name: tokens.email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        active: true,
        sync_enabled: true,
        settings: {},
      });

      setStatus('success');

      // Redireciona após 2 segundos
      setTimeout(() => {
        navigate('/admin/email-integration');
      }, 2000);
    } catch (err) {
      console.error('Callback error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar autorização');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <Card className="glass max-w-md w-full">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              </div>
              <CardTitle className="text-2xl text-white">Processando autorização...</CardTitle>
              <CardDescription>Aguarde enquanto conectamos sua conta do Gmail</CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-white">Conectado com sucesso!</CardTitle>
              <CardDescription>Sua conta do Gmail foi conectada. Redirecionando...</CardDescription>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-white">Erro na conexão</CardTitle>
              <CardDescription className="text-red-400">{error}</CardDescription>
            </>
          )}
        </CardHeader>

        {status === 'error' && (
          <CardContent>
            <Button
              onClick={() => navigate('/admin/email-integration')}
              className="w-full"
              variant="outline"
            >
              Voltar para Integrações
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default GmailCallbackPage;
