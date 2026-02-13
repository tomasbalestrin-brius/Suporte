import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ticketService } from '@/services/ticket.service';
import { messageService } from '@/services/message.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, CheckCircle2, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { SafeContent } from '@/components/ui/safe-content';
import { BethelLogo } from '@/components/ui/BethelLogo';
import type { Ticket, Message } from '@/types';

export function TicketChatPage() {
  const { ticketId } = useParams<{ ticketId: string }>();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Carrega ticket e mensagens
  useEffect(() => {
    if (!ticketId) return;
    loadData();
  }, [ticketId]);

  // Auto-scroll apenas após carregamento inicial
  useEffect(() => {
    if (!isInitialLoad && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isInitialLoad, scrollToBottom]);

  // Subscription em tempo real para novas mensagens
  useEffect(() => {
    if (!ticketId) return;

    const channel = messageService.subscribeToMessages(ticketId, (payload) => {
      if (payload.new) {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
        scrollToBottom();
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [ticketId, scrollToBottom]);

  const loadData = async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      const [ticketData, messagesData] = await Promise.all([
        ticketService.getTicketById(ticketId),
        messageService.getMessages(ticketId),
      ]);
      setTicket(ticketData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
      setTimeout(() => scrollToBottom('auto'), 100);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticketId || sending) return;
    if (ticket?.status === 'closed' || ticket?.status === 'resolved') return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Optimistic update — adiciona mensagem imediatamente na UI
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      ticket_id: ticketId,
      user_id: undefined,
      content,
      is_ai: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const saved = await messageService.createMessage({
        ticket_id: ticketId,
        content,
        is_ai: false,
      });

      // Substitui a mensagem otimista pela real
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? saved : m));
    } catch (error) {
      // Remove mensagem otimista em caso de erro
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setNewMessage(content);
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const getStatusIcon = () => {
    switch (ticket?.status) {
      case 'resolved': return <CheckCircle2 className="h-4 w-4" />;
      case 'closed': return <CheckCircle2 className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const isClosed = ticket?.status === 'closed' || ticket?.status === 'resolved';

  // Determina de que lado mostrar a mensagem no ponto de vista do cliente:
  // - Mensagens sem user_id e não AI = mensagens do cliente (lado direito)
  // - Mensagens com user_id ou AI = mensagens do suporte (lado esquerdo)
  const isCustomerMessage = (msg: Message) => !msg.user_id && !msg.is_ai;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ticket não encontrado</h2>
          <p className="text-muted-foreground">Verifique o link ou entre em contato com o suporte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header fixo */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{ticket.title}</p>
            <div className="flex items-center gap-1.5">
              {getStatusIcon()}
              <Badge className={`text-xs px-1.5 py-0 ${getStatusColor(ticket.status)}`}>
                {getStatusLabel(ticket.status)}
              </Badge>
            </div>
          </div>
          <BethelLogo variant="icon" className="text-muted-foreground opacity-60 flex-shrink-0" />
        </div>
      </div>

      {/* Info do ticket */}
      <div className="max-w-2xl mx-auto w-full px-4 pt-4">
        <div className="bg-muted/40 rounded-xl px-4 py-3 text-sm text-muted-foreground border border-border/50">
          <p className="font-medium text-foreground mb-0.5">{ticket.description}</p>
          <span className="text-xs">Aberto em {formatDate(ticket.created_at)}</span>
          {ticket.category && (
            <span className="text-xs ml-3">· Categoria: {ticket.category}</span>
          )}
        </div>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="mx-auto h-12 w-12 text-muted-foreground opacity-30 mb-3" />
              <p className="text-muted-foreground text-sm">
                Nossa equipe de suporte responderá em breve.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isFromCustomer = isCustomerMessage(message);
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isFromCustomer ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                    isFromCustomer
                      ? 'bg-primary text-primary-foreground'
                      : message.is_ai
                      ? 'bg-violet-500/10 text-violet-500'
                      : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {isFromCustomer ? (
                      <User className="h-3.5 w-3.5" />
                    ) : message.is_ai ? (
                      <Bot className="h-3.5 w-3.5" />
                    ) : (
                      <User className="h-3.5 w-3.5" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[75%] ${isFromCustomer ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    {/* Label */}
                    <span className="text-[11px] text-muted-foreground px-1">
                      {isFromCustomer
                        ? (ticket.customer_name || 'Você')
                        : message.is_ai
                        ? 'Assistente IA'
                        : 'Suporte'}
                    </span>
                    {/* Bubble content */}
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isFromCustomer
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : message.is_ai
                        ? 'bg-violet-500/10 text-foreground border border-violet-500/20 rounded-tl-sm'
                        : 'bg-card border border-border text-foreground rounded-tl-sm'
                    } ${message.id?.startsWith('temp-') ? 'opacity-60' : ''}`}>
                      <SafeContent content={message.content} preserveWhitespace />
                    </div>
                    {/* Timestamp */}
                    <span className="text-[10px] text-muted-foreground px-1">
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input fixo no rodapé */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {isClosed ? (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>
                {ticket.status === 'resolved'
                  ? 'Este ticket foi marcado como resolvido.'
                  : 'Este ticket está fechado.'}
              </span>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
                className="flex-1 rounded-full bg-muted border-transparent focus-visible:ring-1"
                autoComplete="off"
              />
              <Button
                type="submit"
                size="icon"
                disabled={sending || !newMessage.trim()}
                className="rounded-full flex-shrink-0"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default TicketChatPage;
