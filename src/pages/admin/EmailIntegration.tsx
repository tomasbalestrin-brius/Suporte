import { useState, useEffect } from 'react';
import { emailIntegrationService, type EmailIntegration } from '@/services/emailIntegration.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Trash2,
  RefreshCw,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Power,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function EmailIntegrationPage() {
  const [integrations, setIntegrations] = useState<EmailIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    gmail: 0,
    outlook: 0,
    active: 0,
    syncing: 0,
  });

  useEffect(() => {
    loadIntegrations();
    loadStats();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await emailIntegrationService.getUserIntegrations();
      setIntegrations(data);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await emailIntegrationService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleConnectGmail = () => {
    const url = emailIntegrationService.getGmailOAuthUrl();
    window.location.href = url;
  };

  const handleConnectOutlook = () => {
    const url = emailIntegrationService.getOutlookOAuthUrl();
    window.location.href = url;
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await emailIntegrationService.toggleActive(id, !currentActive);
      await loadIntegrations();
      await loadStats();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const handleToggleSync = async (id: string, currentSync: boolean) => {
    try {
      await emailIntegrationService.toggleSync(id, !currentSync);
      await loadIntegrations();
    } catch (error) {
      console.error('Error toggling sync:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta integração?')) return;

    try {
      await emailIntegrationService.deleteIntegration(id);
      await loadIntegrations();
      await loadStats();
    } catch (error) {
      console.error('Error deleting integration:', error);
    }
  };

  const getProviderBadge = (provider: string) => {
    if (provider === 'gmail') {
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
          <Mail className="h-3 w-3 mr-1" />
          Gmail
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
        <Mail className="h-3 w-3 mr-1" />
        Outlook
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            Integração de Email
          </h1>
          <p className="text-muted-foreground">
            Conecte suas contas de email para receber e responder tickets automaticamente
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleConnectGmail} variant="outline">
            <Mail className="mr-2 h-4 w-4 text-red-500" />
            Conectar Gmail
          </Button>
          <Button onClick={handleConnectOutlook} variant="outline">
            <Mail className="mr-2 h-4 w-4 text-blue-500" />
            Conectar Outlook
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="glass border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gmail</CardTitle>
            <Mail className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.gmail}</div>
          </CardContent>
        </Card>

        <Card className="glass border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outlook</CardTitle>
            <Mail className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.outlook}</div>
          </CardContent>
        </Card>

        <Card className="glass border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="glass border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sincronizando</CardTitle>
            <RefreshCw className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{stats.syncing}</div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Instructions */}
      <Card className="glass border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Configuração Necessária</p>
              <p>
                Para ativar a integração com Email, você precisa configurar credenciais OAuth:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong>Gmail:</strong> Criar projeto no Google Cloud Console e configurar OAuth 2.0
                  <a
                    href="https://console.cloud.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Acessar Console
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <strong>Outlook:</strong> Criar app no Azure AD e configurar permissões Mail.Read/Send
                  <a
                    href="https://portal.azure.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Acessar Azure
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>Adicionar variáveis de ambiente no arquivo <code className="px-1 py-0.5 bg-muted rounded text-xs">.env</code>:
                  <ul className="list-none ml-4 mt-1 font-mono text-xs">
                    <li>VITE_GOOGLE_CLIENT_ID</li>
                    <li>VITE_MICROSOFT_CLIENT_ID</li>
                  </ul>
                </li>
                <li>Implementar endpoints backend para OAuth callbacks e sincronização</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Carregando integrações...</p>
              </div>
            </CardContent>
          </Card>
        ) : integrations.length === 0 ? (
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Mail className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-semibold">Nenhuma integração configurada</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Conecte uma conta de email para começar
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleConnectGmail} variant="outline">
                    <Mail className="mr-2 h-4 w-4 text-red-500" />
                    Conectar Gmail
                  </Button>
                  <Button onClick={handleConnectOutlook} variant="outline">
                    <Mail className="mr-2 h-4 w-4 text-blue-500" />
                    Conectar Outlook
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          integrations.map((integration) => (
            <Card
              key={integration.id}
              className={`glass ${integration.active ? '' : 'opacity-60'}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">
                        {integration.display_name || integration.email_address}
                      </CardTitle>
                      {getProviderBadge(integration.provider)}
                      <Badge variant={integration.active ? 'default' : 'secondary'}>
                        {integration.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {integration.sync_enabled && (
                        <Badge variant="outline" className="border-purple-500/20 text-purple-500">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Sincronizando
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {integration.email_address}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {integration.last_sync_at && (
                        <span>Última sinc: {formatDate(integration.last_sync_at)}</span>
                      )}
                      {integration.created_at && (
                        <span>Conectado em {formatDate(integration.created_at)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleToggleActive(integration.id!, integration.active ?? true)}
                      title={integration.active ? 'Desativar' : 'Ativar'}
                    >
                      <Power className={`h-4 w-4 ${integration.active ? 'text-green-500' : 'text-gray-400'}`} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleToggleSync(integration.id!, integration.sync_enabled ?? true)}
                      title={integration.sync_enabled ? 'Pausar sincronização' : 'Ativar sincronização'}
                    >
                      <RefreshCw className={`h-4 w-4 ${integration.sync_enabled ? 'text-purple-500' : 'text-gray-400'}`} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(integration.id!)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default EmailIntegrationPage;
