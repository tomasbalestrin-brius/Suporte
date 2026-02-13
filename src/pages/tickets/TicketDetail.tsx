import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTicketStore } from '@/store/ticketStore';
import { messageService } from '@/services/message.service';
import { aiFeedbackService } from '@/services/aiFeedback.service';
import { emailNotificationService } from '@/services/emailNotification.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Bot, User, Loader2, CheckCircle2, ThumbsUp, ThumbsDown, RefreshCw, MessageSquare, Copy, ExternalLink } from 'lucide-react';
import { formatDate, getStatusColor, getPriorityColor, getStatusLabel, getPriorityLabel } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { SafeContent } from '@/components/ui/safe-content';
import type { Message } from '@/types';

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentTicket, fetchTicketById, updateTicket, updating: storeUpdating } = useTicketStore();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<Record<string, 'positive' | 'negative'>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      setIsInitialLoad(true);
      loadTicket();
      loadMessages();
    }
  }, [id]);

  useEffect(() => {
    // Only auto-scroll if it's not the initial load
    if (!isInitialLoad && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isInitialLoad]);

  useEffect(() => {
    if (!id) return;

    // Subscribe to new messages
    const channel = messageService.subscribeToMessages(id, (payload) => {
      if (payload.new) {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      }
    });

    // Polling a cada 4s como fallback confiável para mensagens
    const pollMessages = setInterval(async () => {
      try {
        const latest = await messageService.getMessages(id);
        setMessages(prev => {
          const realPrev = prev.filter(m => !m.id.startsWith('temp-'));
          if (latest.length !== realPrev.length) {
            setTimeout(() => scrollToBottom(), 50);
            return latest;
          }
          return prev;
        });
      } catch { /* ignora erros silenciosos de polling */ }
    }, 4000);

    // Polling a cada 5s para status do ticket
    const pollTicket = setInterval(async () => {
      try {
        await fetchTicketById(id);
      } catch { /* ignora erros silenciosos de polling */ }
    }, 5000);

    return () => {
      channel.unsubscribe();
      clearInterval(pollMessages);
      clearInterval(pollTicket);
    };
  }, [id]);

  const loadTicket = async () => {
    if (!id) return;
    try {
      await fetchTicketById(id);
    } catch (error) {
      console.error('Error loading ticket:', error);
      navigate('/tickets');
    }
  };

  const loadMessages = async () => {
    if (!id) return;
    try {
      const data = await messageService.getMessages(id);
      setMessages(data);

      // Load feedback for AI messages (optimized - single query)
      const aiMessages = data.filter(m => m.is_ai);
      const aiMessageIds = aiMessages.map(m => m.id);

      if (aiMessageIds.length > 0) {
        try {
          const feedbacks = await aiFeedbackService.getFeedbackByMessages(aiMessageIds);
          const feedbackMap: Record<string, 'positive' | 'negative'> = {};

          Object.entries(feedbacks).forEach(([messageId, feedback]) => {
            feedbackMap[messageId] = feedback.rating;
          });

          setMessageFeedback(feedbackMap);
        } catch (error) {
          console.error('Error loading feedback:', error);
        }
      }

      // Mark initial load as complete
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      setIsInitialLoad(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !id) return;

    const userMessageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Send admin message (human response, not AI)
      await messageService.createMessage({
        ticket_id: id,
        user_id: user.id,
        content: userMessageContent,
        is_ai: false,
      });

      // Scroll to bottom after sending message
      setTimeout(() => scrollToBottom(), 100);

      // If ticket is open, change to in_progress
      if (currentTicket?.status === 'open') {
        await updateTicket(id, { status: 'in_progress' });
        // O store já atualiza o currentTicket automaticamente
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
      });
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!id || storeUpdating) {
      return;
    }

    try {
      const previousStatus = currentTicket?.status;

      await updateTicket(id, { status: status as 'open' | 'in_progress' | 'resolved' | 'closed' });

      // Show success toast
      toast({
        variant: "success",
        title: "Status atualizado!",
        description: `O ticket foi marcado como "${status}".`,
      });

      // Se mudou para "resolved" e tem email do cliente, envia notificação
      if (status === 'resolved' && previousStatus !== 'resolved' && currentTicket?.customer_email) {
        try {
          // Verifica se o Resend está configurado
          const isConfigured = emailNotificationService.isConfigured();

          if (isConfigured) {

            await emailNotificationService.sendTicketResolvedEmail({
              ticketId: id,
              ticketTitle: currentTicket.title,
              customerName: currentTicket.customer_name || 'Cliente',
              customerEmail: currentTicket.customer_email,
              resolvedAt: new Date().toISOString(),
              resolution: messages.length > 0
                ? messages[messages.length - 1].content
                : undefined,
            });

            toast({
              variant: "success",
              title: "Email enviado!",
              description: `Notificação de resolução enviada para ${currentTicket.customer_email}`,
            });
          } else {
            toast({
              variant: "destructive",
              title: "Email não configurado",
              description: "Configure VITE_RESEND_API_KEY no arquivo .env",
            });
          }
        } catch (emailError) {
          // Não bloqueia a atualização do ticket se o email falhar
          toast({
            variant: "destructive",
            title: "Aviso",
            description: "Ticket atualizado, mas não foi possível enviar o email de notificação.",
          });
        }
      }

      // O store já atualiza o currentTicket automaticamente, não precisa recarregar
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status. Tente novamente.",
      });
    }
  };

  const handleFeedback = async (messageId: string, rating: 'positive' | 'negative') => {
    if (!id) return;

    try {
      // Check if feedback already exists
      const existingFeedback = await aiFeedbackService.getFeedbackByMessage(messageId);

      if (existingFeedback) {
        // Update existing feedback
        await aiFeedbackService.updateFeedback(existingFeedback.id!, { rating });
      } else {
        // Create new feedback
        await aiFeedbackService.submitFeedback({
          ticket_id: id,
          message_id: messageId,
          rating,
        });
      }

      // Update local state
      setMessageFeedback(prev => ({
        ...prev,
        [messageId]: rating,
      }));
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleRefresh = async () => {
    if (!id) return;
    setRefreshing(true);
    try {
      await loadTicket();
      await loadMessages();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!currentTicket) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/tickets')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h1 className="text-3xl font-bold">{currentTicket.title}</h1>
            <Badge className={getStatusColor(currentTicket.status)}>
              {getStatusLabel(currentTicket.status)}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(currentTicket.priority)}>
              {getPriorityLabel(currentTicket.priority)}
            </Badge>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const chatUrl = `${window.location.origin}/tickets/${id}/chat`;
                  navigator.clipboard.writeText(chatUrl);
                  toast({ title: 'Link do chat copiado!', description: chatUrl });
                }}
                title="Copiar link do chat para o cliente"
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copiar link do chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/tickets/${id}/chat`, '_blank')}
                title="Abrir chat do cliente"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Ver chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">{currentTicket.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>Categoria: <span className="text-foreground">{currentTicket.category}</span></span>
            <span>Criado em {formatDate(currentTicket.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Chat Area */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Conversa</CardTitle>
                  <CardDescription>
                    Resolução e atendimento ao cliente
                  </CardDescription>
                </div>
                {currentTicket.status !== 'closed' && currentTicket.status !== 'resolved' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus('resolved')}
                    disabled={storeUpdating}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {storeUpdating ? 'Atualizando...' : 'Marcar como Resolvido'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto pr-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Nenhuma mensagem ainda. Comece a conversa!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    // Admin (eu): mensagens com user_id do admin logado → lado direito
                    // Cliente: mensagens sem user_id e não AI → lado esquerdo com cor diferente
                    // IA: is_ai = true → lado esquerdo
                    const isAdminMessage = !!message.user_id && !message.is_ai;
                    const isCustomerMessage = !message.user_id && !message.is_ai;
                    const isRightSide = isAdminMessage;

                    return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isRightSide ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.is_ai
                          ? 'bg-primary/10 text-primary'
                          : isCustomerMessage
                          ? 'bg-orange-500/10 text-orange-500'
                          : 'bg-secondary/10 text-secondary'
                      }`}>
                        {message.is_ai ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <div className={`flex-1 max-w-[80%] ${isRightSide ? 'flex flex-col items-end' : ''}`}>
                        <p className="text-xs text-muted-foreground mb-1 px-1">
                          {message.is_ai ? 'Assistente IA' : isCustomerMessage ? 'Cliente' : 'Suporte'}
                        </p>
                        <div className={`rounded-lg p-3 ${
                          message.is_ai
                            ? 'bg-muted'
                            : isCustomerMessage
                            ? 'bg-orange-500/10 border border-orange-500/20'
                            : 'bg-primary text-primary-foreground'
                        }`}>
                          <SafeContent
                            content={message.content}
                            className="text-sm"
                            preserveWhitespace
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(message.created_at)}
                          </span>
                          {message.is_ai && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleFeedback(message.id, 'positive')}
                                className={`p-1 rounded hover:bg-muted transition-colors ${
                                  messageFeedback[message.id] === 'positive'
                                    ? 'text-green-500'
                                    : 'text-muted-foreground'
                                }`}
                                title="Resposta útil"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleFeedback(message.id, 'negative')}
                                className={`p-1 rounded hover:bg-muted transition-colors ${
                                  messageFeedback[message.id] === 'negative'
                                    ? 'text-red-500'
                                    : 'text-muted-foreground'
                                }`}
                                title="Resposta não útil"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );})
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {currentTicket.status !== 'closed' && (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()}>
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Customer Information */}
          {(currentTicket.customer_name || currentTicket.customer_email || currentTicket.customer_cpf || currentTicket.customer_phone) && (
            <Card className="glass border-blue-500/20 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="text-blue-400">Informações do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {currentTicket.customer_name && (
                  <div>
                    <span className="text-muted-foreground">Nome Completo:</span>
                    <p className="mt-1 font-medium text-foreground">{currentTicket.customer_name}</p>
                  </div>
                )}
                {currentTicket.customer_email && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="mt-1 font-medium text-foreground break-all">{currentTicket.customer_email}</p>
                  </div>
                )}
                {currentTicket.customer_cpf && (
                  <div>
                    <span className="text-muted-foreground">CPF:</span>
                    <p className="mt-1 font-medium text-foreground font-mono">{currentTicket.customer_cpf}</p>
                  </div>
                )}
                {currentTicket.customer_phone && (
                  <div>
                    <span className="text-muted-foreground">Telefone:</span>
                    <p className="mt-1 font-medium text-foreground">{currentTicket.customer_phone}</p>
                  </div>
                )}
                {currentTicket.product && (
                  <div>
                    <span className="text-muted-foreground">Produto:</span>
                    <p className="mt-1 font-medium text-foreground">{currentTicket.product}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="glass">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Alterar Status</label>
                <Select
                  value={currentTicket.status}
                  onValueChange={handleUpdateStatus}
                  disabled={storeUpdating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {currentTicket.resolved_at && (
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Resolvido em {formatDate(currentTicket.resolved_at)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">ID:</span>
                <p className="font-mono text-xs mt-1">{currentTicket.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Categoria:</span>
                <p className="mt-1">{currentTicket.category}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Prioridade:</span>
                <p className="mt-1">{getPriorityLabel(currentTicket.priority)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Criado:</span>
                <p className="mt-1">{formatDate(currentTicket.created_at)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Última Atualização:</span>
                <p className="mt-1">{formatDate(currentTicket.updated_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Link do Chat para o Cliente */}
          <Card className="glass border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Chat do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Compartilhe este link com o cliente para que ele acompanhe o ticket em tempo real.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => {
                    const chatUrl = `${window.location.origin}/tickets/${id}/chat`;
                    navigator.clipboard.writeText(chatUrl);
                    toast({ title: 'Link copiado!', description: 'Envie para o cliente.' });
                  }}
                >
                  <Copy className="h-3 w-3 mr-1.5" />
                  Copiar link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/tickets/${id}/chat`, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TicketDetailPage;
