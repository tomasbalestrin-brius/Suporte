import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService } from '@/services/ticket.service';
import { messageService } from '@/services/message.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, Clock, Search, CheckCircle,
  Send, Bot, User, Loader2, AlertCircle, MessageSquare,
} from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { SafeContent } from '@/components/ui/safe-content';
import { BethelLogo } from '@/components/ui/BethelLogo';
import type { Ticket, Message } from '@/types';

const STATUS_STEPS = [
  { key: 'open',        label: 'Aberto',        icon: CheckCircle2, description: 'Seu ticket foi registrado com sucesso' },
  { key: 'in_progress', label: 'Em Andamento',   icon: Search,       description: 'Nossa equipe está trabalhando na resolução' },
  { key: 'resolved',    label: 'Resolvido',      icon: CheckCircle,  description: 'Seu problema foi resolvido!' },
  { key: 'closed',      label: 'Fechado',        icon: CheckCircle,  description: 'Ticket encerrado' },
];

export function TicketChatPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!ticketId) return;
    loadData();
  }, [ticketId]);

  useEffect(() => {
    if (!isInitialLoad && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isInitialLoad, scrollToBottom]);

  // Subscription em tempo real para o ticket (status)
  useEffect(() => {
    if (!ticketId || !ticket) return;

    const channel = ticketService.subscribeToTicket(ticketId, (payload) => {
      if (payload.new && payload.new.id === ticketId) {
        setTicket(prev => (!prev || prev.status !== payload.new.status) ? payload.new as Ticket : prev);
      }
    });

    return () => { channel?.unsubscribe(); };
  }, [ticketId, ticket?.status]);

  // Subscription em tempo real para mensagens
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

    return () => { channel.unsubscribe(); };
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

    // Optimistic update
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
      const saved = await messageService.createMessage({ ticket_id: ticketId, content, is_ai: false });
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? saved : m));
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setNewMessage(content);
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const getCurrentStepIndex = () => {
    if (!ticket) return 0;
    const idx = STATUS_STEPS.findIndex(s => s.key === ticket.status);
    return idx === -1 ? 0 : idx;
  };

  const isCustomerMessage = (msg: Message) => !msg.user_id && !msg.is_ai;
  const isClosed = ticket?.status === 'closed' || ticket?.status === 'resolved';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Ticket não encontrado</h2>
          <p className="text-gray-400 mb-4">Verifique o link ou entre em contato com o suporte.</p>
          <Button onClick={() => navigate('/')}>Voltar para Início</Button>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Logo Header */}
        <div className="flex justify-center mb-2">
          <BethelLogo variant="full" subtitle="Suporte" className="text-white w-auto" />
        </div>

        {/* Success / Status banner */}
        <Card className="glass border-green-500/20 bg-green-500/5">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-xl text-white">Ticket Aberto com Sucesso!</CardTitle>
            <CardDescription className="text-base">
              Protocolo: <span className="font-mono font-bold text-white">{ticket.id.slice(0, 8).toUpperCase()}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-center gap-2 text-yellow-400 mb-1">
                <Clock className="w-4 h-4" />
                <p className="font-semibold text-sm">Prazo de Atendimento</p>
              </div>
              <p className="text-white text-sm">
                Nossa equipe responderá em até <strong className="text-yellow-400">24 horas</strong>
              </p>
              {ticket.customer_email && (
                <p className="text-xs text-gray-400 mt-1">
                  Atualizações serão enviadas para: <strong className="text-white">{ticket.customer_email}</strong>
                </p>
              )}
            </div>
            <div className="flex items-center justify-center gap-2">
              <Badge className={`text-sm px-3 py-1 ${getStatusColor(ticket.status)}`}>
                {getStatusLabel(ticket.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracker */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white">Acompanhamento</CardTitle>
            <CardDescription>Status atual do seu atendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {STATUS_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <div key={step.key} className="relative">
                    {index < STATUS_STEPS.length - 1 && (
                      <div className={`absolute left-5 top-10 w-0.5 h-6 ${index < currentStepIndex ? 'bg-green-500' : 'bg-white/20'}`} />
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isCompleted ? 'bg-green-500/20 border-2 border-green-500' : 'bg-white/5 border-2 border-white/20'}`}>
                        <Icon className={`w-5 h-5 ${isCompleted ? 'text-green-500' : 'text-white/40'}`} />
                      </div>
                      <div className="flex-1 pt-1.5">
                        <h3 className={`font-semibold text-sm ${isCompleted ? 'text-white' : 'text-white/50'}`}>
                          {step.label}
                          {isCurrent && (
                            <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Atual</span>
                          )}
                        </h3>
                        {isCompleted && (
                          <p className="text-xs text-gray-400">{step.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* CHAT BLOCK */}
        <Card className="glass">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle className="text-white">Chat de Atendimento</CardTitle>
            </div>
            <CardDescription>
              Acompanhe as respostas da nossa equipe em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Messages area */}
            <div className="px-4 pb-2 space-y-3 min-h-[200px] max-h-[400px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-10">
                  <Bot className="mx-auto h-10 w-10 text-gray-600 mb-3" />
                  <p className="text-gray-500 text-sm">Nossa equipe responderá em breve.</p>
                </div>
              ) : (
                messages.map((message) => {
                  const fromCustomer = isCustomerMessage(message);
                  return (
                    <div key={message.id} className={`flex gap-2 ${fromCustomer ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                        fromCustomer ? 'bg-primary text-primary-foreground'
                        : message.is_ai ? 'bg-violet-500/20 text-violet-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {message.is_ai ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                      </div>
                      {/* Bubble */}
                      <div className={`max-w-[75%] flex flex-col gap-1 ${fromCustomer ? 'items-end' : 'items-start'}`}>
                        <span className="text-[11px] text-gray-500 px-1">
                          {fromCustomer
                            ? (ticket.customer_name || 'Você')
                            : message.is_ai ? 'Assistente IA' : 'Suporte'}
                        </span>
                        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          fromCustomer
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : message.is_ai
                            ? 'bg-violet-500/10 text-white border border-violet-500/20 rounded-tl-sm'
                            : 'bg-white/10 text-white border border-white/10 rounded-tl-sm'
                        } ${message.id?.startsWith('temp-') ? 'opacity-60' : ''}`}>
                          <SafeContent content={message.content} preserveWhitespace />
                        </div>
                        <span className="text-[10px] text-gray-600 px-1">{formatDate(message.created_at)}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-white/10">
              {isClosed ? (
                <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-400">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{ticket.status === 'resolved' ? 'Ticket resolvido.' : 'Ticket encerrado.'}</span>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-full focus-visible:ring-1"
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={sending || !newMessage.trim()}
                    className="rounded-full flex-shrink-0"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ticket Details */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white">Detalhes do Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-gray-400">Título</p>
              <p className="text-white font-medium">{ticket.title}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Categoria</p>
              <p className="text-white">{ticket.category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Descrição</p>
              <p className="text-white whitespace-pre-wrap text-sm">{ticket.description}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Aberto em</p>
              <p className="text-white text-sm">{formatDate(ticket.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-6">
          <Button
            onClick={() => navigate('/')}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            Voltar para Início
          </Button>
          <Button
            onClick={() => navigate('/tickets/new')}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Abrir Novo Ticket
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TicketChatPage;
