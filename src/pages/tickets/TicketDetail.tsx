import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTicketStore } from '@/store/ticketStore';
import { messageService } from '@/services/message.service';
import { aiFeedbackService } from '@/services/aiFeedback.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Bot, User, Loader2, CheckCircle2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { formatDate, getStatusColor, getPriorityColor, getStatusLabel, getPriorityLabel } from '@/lib/utils';
import type { Message } from '@/types';

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentTicket, fetchTicketById, updateTicket } = useTicketStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<Record<string, 'positive' | 'negative'>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadTicket();
      loadMessages();
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!id) return;

    // Subscribe to new messages
    const channel = messageService.subscribeToMessages(id, (payload) => {
      if (payload.new) {
        loadMessages();
      }
    });

    return () => {
      channel.unsubscribe();
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

      // Load feedback for AI messages
      const feedbackMap: Record<string, 'positive' | 'negative'> = {};
      for (const message of data.filter(m => m.is_ai)) {
        try {
          const feedback = await aiFeedbackService.getFeedbackByMessage(message.id);
          if (feedback) {
            feedbackMap[message.id] = feedback.rating;
          }
        } catch (error) {
          // Ignore errors for individual messages
        }
      }
      setMessageFeedback(feedbackMap);
    } catch (error) {
      console.error('Error loading messages:', error);
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

      // If ticket is open, change to in_progress
      if (currentTicket?.status === 'open') {
        await updateTicket(id, { status: 'in_progress' });
        // O store já atualiza o currentTicket automaticamente
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!id) return;
    setUpdating(true);
    try {
      await updateTicket(id, { status: status as 'open' | 'in_progress' | 'resolved' | 'closed' });
      // O store já atualiza o currentTicket automaticamente, não precisa recarregar
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
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
                    disabled={updating}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Marcar como Resolvido
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
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.is_ai ? '' : 'flex-row-reverse'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.is_ai
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary/10 text-secondary'
                      }`}>
                        {message.is_ai ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <div className={`flex-1 max-w-[80%] ${
                        message.is_ai ? '' : 'flex flex-col items-end'
                      }`}>
                        <div className={`rounded-lg p-3 ${
                          message.is_ai
                            ? 'bg-muted'
                            : 'bg-primary text-primary-foreground'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                  ))
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
                  disabled={updating}
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
        </div>
      </div>
    </div>
  );
}

export default TicketDetailPage;
