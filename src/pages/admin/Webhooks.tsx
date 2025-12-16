import { useState, useEffect } from 'react';
import { webhookService, type WebhookConfig } from '@/services/webhook.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Webhook,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

const AVAILABLE_EVENTS = [
  { value: 'ticket_created', label: 'Ticket Criado' },
  { value: 'status_changed', label: 'Status Alterado' },
  { value: 'message_sent', label: 'Mensagem Enviada' },
  { value: 'ticket_updated', label: 'Ticket Atualizado' },
];

export function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      const data = await webhookService.getWebhooks();
      setWebhooks(data);
    } catch (error) {
      console.error('Error loading webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setUrl('');
    setSecret('');
    setSelectedEvents([]);
    setActive(true);
    setEditingId(null);
    setShowForm(false);
    setShowSecret(false);
  };

  const handleEdit = (webhook: WebhookConfig) => {
    setName(webhook.name);
    setUrl(webhook.url);
    setSecret(webhook.secret || '');
    setSelectedEvents(webhook.events);
    setActive(webhook.active);
    setEditingId(webhook.id || null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name || !url || selectedEvents.length === 0) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      alert('URL inválida!');
      return;
    }

    setSaving(true);
    try {
      const data: Omit<WebhookConfig, 'id'> = {
        name,
        url,
        events: selectedEvents,
        active,
        secret: secret || undefined,
      };

      if (editingId) {
        await webhookService.updateWebhook(editingId, data);
      } else {
        await webhookService.createWebhook(data);
      }

      await loadWebhooks();
      resetForm();
    } catch (error) {
      console.error('Error saving webhook:', error);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este webhook?')) return;

    try {
      await webhookService.deleteWebhook(id);
      await loadWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      alert('Erro ao excluir. Tente novamente.');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await webhookService.toggleWebhook(id, !currentActive);
      await loadWebhooks();
    } catch (error) {
      console.error('Error toggling webhook:', error);
    }
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Webhook className="h-8 w-8 text-primary" />
            Webhooks
          </h1>
          <p className="text-muted-foreground">
            Configure webhooks para integrar com serviços externos
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Webhook
        </Button>
      </div>

      {/* Info Alert */}
      <Card className="glass border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Como funcionam os webhooks?</p>
              <p>
                Webhooks enviam notificações HTTP POST para URLs configuradas quando eventos específicos acontecem.
                Ideal para integrar com Zapier, Make, n8n ou seus próprios serviços.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      {showForm && (
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle>{editingId ? 'Editar' : 'Novo'} Webhook</CardTitle>
            <CardDescription>
              Configure um webhook para receber notificações de eventos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Webhook *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Notificações Slack"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL de Destino *</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://hooks.example.com/..."
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret">Chave Secreta (opcional)</Label>
              <div className="relative">
                <Input
                  id="secret"
                  type={showSecret ? 'text' : 'password'}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Chave para assinar requisições"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showSecret ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enviada no header X-Webhook-Signature
              </p>
            </div>

            <div className="space-y-2">
              <Label>Eventos * (selecione pelo menos um)</Label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_EVENTS.map((event) => (
                  <button
                    key={event.value}
                    type="button"
                    onClick={() => toggleEvent(event.value)}
                    disabled={saving}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      selectedEvents.includes(event.value)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/50 border-border hover:bg-muted'
                    }`}
                  >
                    {event.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                disabled={saving}
                className="w-4 h-4"
              />
              <Label htmlFor="active" className="cursor-pointer">
                Webhook ativo (receberá notificações)
              </Label>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={saving}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Carregando...</p>
              </div>
            </CardContent>
          </Card>
        ) : webhooks.length === 0 ? (
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Webhook className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum webhook configurado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Adicione seu primeiro webhook para começar a receber notificações
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          webhooks.map((webhook) => (
            <Card
              key={webhook.id}
              className={`glass ${!webhook.active ? 'opacity-60' : ''}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{webhook.name}</CardTitle>
                      <Badge variant={webhook.active ? 'default' : 'secondary'}>
                        {webhook.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {webhook.url}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {AVAILABLE_EVENTS.find((e) => e.value === event)?.label || event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(webhook)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleToggleActive(webhook.id!, webhook.active)}
                    >
                      {webhook.active ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(webhook.id!)}
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

export default WebhooksPage;
