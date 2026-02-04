import { useState, useEffect } from 'react';
import { instagramIntegrationService, type InstagramIntegration } from '@/services/instagramIntegration.service';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Instagram,
  Plus,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Power,
  Webhook,
  MessageCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function InstagramIntegrationPage() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<InstagramIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    webhookVerified: 0,
    messagesLast24h: 0,
  });

  useEffect(() => {
    loadIntegrations();
    loadStats();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await instagramIntegrationService.getUserIntegrations();
      setIntegrations(data);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await instagramIntegrationService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleConnect = () => {
    const url = instagramIntegrationService.getInstagramOAuthUrl();
    window.location.href = url;
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await instagramIntegrationService.toggleActive(id, !currentActive);
      await loadIntegrations();
      await loadStats();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta integração?')) return;

    try {
      await instagramIntegrationService.deleteIntegration(id);
      await loadIntegrations();
      await loadStats();
    } catch (error) {
      console.error('Error deleting integration:', error);
    }
  };

  const handleSubscribeWebhook = async (id: string) => {
    try {
      await instagramIntegrationService.subscribeToWebhooks(id);
      toast({
        variant: "success",
        title: "Webhook configurado!",
        description: "Webhook configurado com sucesso.",
      });
      await loadIntegrations();
    } catch (error) {
      console.error('Error subscribing webhook:', error);
      toast({
        variant: "destructive",
        title: "Erro ao configurar webhook",
        description: "Veja o console para mais detalhes.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Instagram className="h-8 w-8 text-primary" />
            Integração Instagram DM
          </h1>
          <p className="text-muted-foreground">
            Conecte sua conta Instagram Business para receber e responder mensagens diretas
          </p>
        </div>
        <Button onClick={handleConnect}>
          <Plus className="mr-2 h-4 w-4" />
          Conectar Instagram
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contas</CardTitle>
            <Instagram className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="glass border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="glass border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhooks Ativos</CardTitle>
            <Webhook className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{stats.webhookVerified}</div>
          </CardContent>
        </Card>

        <Card className="glass border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens 24h</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.messagesLast24h}</div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Instructions */}
      <Card className="glass border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-3">
              <p className="font-semibold text-foreground">Configuração Necessária</p>

              <div>
                <p className="font-medium text-foreground mb-2">1. Pré-requisitos:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Conta Instagram convertida para <strong>Instagram Business</strong></li>
                  <li>Página do Facebook vinculada ao Instagram</li>
                  <li>App criado no Meta Developer Portal</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-foreground mb-2">2. Configurar App no Meta:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    Acesse o{' '}
                    <a
                      href="https://developers.facebook.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Meta Developer Portal
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>Crie um app do tipo "Business"</li>
                  <li>Adicione o produto "Instagram" ao app</li>
                  <li>Configure permissões: <code className="px-1 py-0.5 bg-muted rounded text-xs">instagram_basic</code>, <code className="px-1 py-0.5 bg-muted rounded text-xs">instagram_manage_messages</code></li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-foreground mb-2">3. Variáveis de Ambiente:</p>
                <ul className="list-none ml-2 font-mono text-xs space-y-1">
                  <li className="bg-muted px-2 py-1 rounded">VITE_FACEBOOK_APP_ID=seu_app_id</li>
                  <li className="bg-muted px-2 py-1 rounded">VITE_INSTAGRAM_VERIFY_TOKEN=token_secreto</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-foreground mb-2">4. Configurar Webhook:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>URL do webhook: <code className="px-1 py-0.5 bg-muted rounded text-xs">https://seu-dominio.com/api/webhooks/instagram</code></li>
                  <li>Subscreva aos eventos: <code className="px-1 py-0.5 bg-muted rounded text-xs">messages</code>, <code className="px-1 py-0.5 bg-muted rounded text-xs">messaging_postbacks</code></li>
                  <li>Webhook deve ser HTTPS e publicamente acessível</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <strong>Nota:</strong> Esta integração requer um backend para processar webhooks e fazer chamadas autenticadas à API do Instagram.
                  As funcionalidades de OAuth e webhook precisam ser implementadas no servidor.
                </p>
              </div>
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
                <Instagram className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-semibold">Nenhuma conta conectada</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Conecte sua conta Instagram Business para começar
                </p>
                <Button onClick={handleConnect}>
                  <Plus className="mr-2 h-4 w-4" />
                  Conectar Instagram
                </Button>
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
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Instagram className="h-5 w-5" />
                        @{integration.username}
                      </CardTitle>
                      <Badge variant={integration.active ? 'default' : 'secondary'}>
                        {integration.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {integration.webhook_verified ? (
                        <Badge variant="outline" className="border-green-500/20 text-green-500">
                          <Webhook className="h-3 w-3 mr-1" />
                          Webhook Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-orange-500/20 text-orange-500">
                          <Webhook className="h-3 w-3 mr-1" />
                          Webhook Pendente
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      ID: {integration.instagram_account_id}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {integration.last_message_at && (
                        <span>Última mensagem: {formatDate(integration.last_message_at)}</span>
                      )}
                      {integration.created_at && (
                        <span>Conectado em {formatDate(integration.created_at)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!integration.webhook_verified && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSubscribeWebhook(integration.id!)}
                      >
                        <Webhook className="h-4 w-4 mr-2" />
                        Ativar Webhook
                      </Button>
                    )}
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

      {/* How it Works */}
      {integrations.length > 0 && (
        <Card className="glass border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-2">Como Funciona</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Quando alguém envia uma DM para seu Instagram, um webhook é disparado</li>
                  <li>O sistema cria automaticamente um ticket com a mensagem</li>
                  <li>Você responde o ticket normalmente pela interface</li>
                  <li>A resposta é enviada de volta como DM no Instagram</li>
                  <li>Todo o histórico fica centralizado no ticket</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default InstagramIntegrationPage;
