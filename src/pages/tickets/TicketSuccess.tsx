import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService } from '@/services/ticket.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Search, PlayCircle, CheckCircle } from 'lucide-react';
import type { Ticket } from '@/types';

const STATUS_STEPS = [
  { key: 'open', label: 'Aberto', icon: CheckCircle2, color: 'text-blue-500' },
  { key: 'in_progress', label: 'Em Análise', icon: Search, color: 'text-yellow-500' },
  { key: 'pending', label: 'Em Andamento', icon: PlayCircle, color: 'text-orange-500' },
  { key: 'resolved', label: 'Resolvido', icon: CheckCircle, color: 'text-green-500' },
];

export function TicketSuccessPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  useEffect(() => {
    // Subscribe to ticket updates for real-time status changes
    if (!ticketId || !ticket) return;

    const channel = ticketService.subscribeToTicket(ticketId, (payload) => {
      if (payload.new && payload.new.id === ticketId) {
        // Update only if status changed to avoid unnecessary renders
        setTicket(prev => {
          if (!prev || prev.status !== payload.new.status) {
            return payload.new as Ticket;
          }
          return prev;
        });
      }
    });

    return () => {
      channel?.unsubscribe();
    };
  }, [ticketId, ticket?.status]);

  const loadTicket = async () => {
    if (!ticketId) return;

    try {
      const data = await ticketService.getTicketById(ticketId);
      setTicket(data);
    } catch (error) {
      console.error('Error loading ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!ticket) return 0;
    return STATUS_STEPS.findIndex(step => step.key === ticket.status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Success Message */}
        <Card className="glass border-green-500/20 bg-green-500/5">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-white">Ticket Aberto com Sucesso!</CardTitle>
            <CardDescription className="text-lg">
              Protocolo: <span className="font-mono font-bold text-white">{ticket?.id.slice(0, 8).toUpperCase()}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-yellow-400 mb-2">
                <Clock className="w-5 h-5" />
                <p className="font-semibold">Prazo de Atendimento</p>
              </div>
              <p className="text-white text-lg">
                Nosso time entrará em contato em até <strong className="text-yellow-400">24 horas</strong>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Segunda à Sexta-feira
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Você receberá atualizações no email: <strong className="text-white">{ticket?.customer_email}</strong>
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-sm text-blue-300">
                💡 <strong>Dica:</strong> Guarde o número do seu protocolo para acompanhar o andamento
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracker */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white">Acompanhamento do Ticket</CardTitle>
            <CardDescription>Veja o status atual do seu atendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {STATUS_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.key} className="relative">
                    {/* Connector Line */}
                    {index < STATUS_STEPS.length - 1 && (
                      <div
                        className={`absolute left-6 top-12 w-0.5 h-8 ${
                          index < currentStepIndex ? 'bg-green-500' : 'bg-white/20'
                        }`}
                      />
                    )}

                    {/* Step */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isCompleted
                            ? 'bg-green-500/20 border-2 border-green-500'
                            : 'bg-white/5 border-2 border-white/20'
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            isCompleted ? 'text-green-500' : 'text-white/40'
                          }`}
                        />
                      </div>
                      <div className="flex-1 pt-2">
                        <h3
                          className={`font-semibold ${
                            isCompleted ? 'text-white' : 'text-white/60'
                          }`}
                        >
                          {step.label}
                          {isCurrent && (
                            <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                              Atual
                            </span>
                          )}
                        </h3>
                        {isCompleted && (
                          <p className="text-sm text-gray-400 mt-1">
                            {index === 0 && 'Seu ticket foi registrado com sucesso'}
                            {index === 1 && 'Nossa equipe está analisando sua solicitação'}
                            {index === 2 && 'Estamos trabalhando na resolução do seu problema'}
                            {index === 3 && 'Seu problema foi resolvido!'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
              <p className="text-sm text-gray-400">Título</p>
              <p className="text-white font-medium">{ticket?.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Categoria</p>
              <p className="text-white">{ticket?.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Descrição</p>
              <p className="text-white whitespace-pre-wrap">{ticket?.description}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Prioridade</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  ticket?.priority === 'high'
                    ? 'bg-red-500/20 text-red-400'
                    : ticket?.priority === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-green-500/20 text-green-400'
                }`}
              >
                {ticket?.priority === 'high' && 'Alta'}
                {ticket?.priority === 'medium' && 'Média'}
                {ticket?.priority === 'low' && 'Baixa'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate('/')}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            Voltar para Início
          </Button>
          <Button
            onClick={() => navigate('/new')}
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

export default TicketSuccessPage;
