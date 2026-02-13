import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiFeedbackService, type AIFeedback } from '@/services/aiFeedback.service';
import { messageService } from '@/services/message.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertTriangle, Bot, RefreshCw, ExternalLink, Loader2,
  XCircle, CheckCircle2, TrendingDown, MessageSquare,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { SafeContent } from '@/components/ui/safe-content';

interface ErrorEntry {
  feedback: AIFeedback;
  messageContent?: string;
  ticketTitle?: string;
}

export function ErrorLogPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<ErrorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [days, setDays] = useState('30');
  const [stats, setStats] = useState({ total: 0, negative: 0, positive: 0, errorRate: 0 });

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allFeedback, periodStats] = await Promise.all([
        aiFeedbackService.getAllFeedback(200),
        aiFeedbackService.getStats(Number(days)),
      ]);

      // Filtra apenas os negativos (erros da IA)
      const negative = allFeedback.filter(f => f.rating === 'negative');

      // Filtra pelo período selecionado
      const since = new Date();
      since.setDate(since.getDate() - Number(days));
      const filteredNegative = negative.filter(f =>
        f.created_at ? new Date(f.created_at) >= since : true
      );

      // Busca o conteúdo das mensagens para mostrar o que a IA disse
      const messageIds = filteredNegative.map(f => f.message_id).filter(Boolean) as string[];
      let messageContents: Record<string, string> = {};

      if (messageIds.length > 0) {
        try {
          // Busca tickets únicos para obter as mensagens
          const ticketIds = [...new Set(filteredNegative.map(f => f.ticket_id))];
          for (const ticketId of ticketIds) {
            const msgs = await messageService.getMessages(ticketId);
            msgs.forEach(m => {
              if (m.is_ai) messageContents[m.id] = m.content;
            });
          }
        } catch {
          // ignora erros ao buscar mensagens individualmente
        }
      }

      const enriched: ErrorEntry[] = filteredNegative.map(f => ({
        feedback: f,
        messageContent: f.message_id ? messageContents[f.message_id] : undefined,
        ticketTitle: (f as any).tickets?.title,
      }));

      setEntries(enriched);
      setStats({
        total: periodStats.total,
        negative: periodStats.negative,
        positive: periodStats.positive,
        errorRate: periodStats.negativeRate,
      });
    } catch (error) {
      console.error('Erro ao carregar log de erros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            Log de Erros da IA
          </h1>
          <p className="text-muted-foreground mt-1">
            Respostas da IA avaliadas negativamente pelos atendentes — indicam falhas ou respostas inadequadas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total de Avaliações</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="glass border-red-500/20 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-3.5 w-3.5 text-red-500" />
              <p className="text-xs text-muted-foreground">Erros (Negativo)</p>
            </div>
            <p className="text-2xl font-bold text-red-500">{stats.negative}</p>
          </CardContent>
        </Card>
        <Card className="glass border-green-500/20 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <p className="text-xs text-muted-foreground">Aprovadas (Positivo)</p>
            </div>
            <p className="text-2xl font-bold text-green-500">{stats.positive}</p>
          </CardContent>
        </Card>
        <Card className={`glass ${stats.errorRate > 40 ? 'border-red-500/20 bg-red-500/5' : stats.errorRate > 20 ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-green-500/20 bg-green-500/5'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className={`h-3.5 w-3.5 ${stats.errorRate > 40 ? 'text-red-500' : stats.errorRate > 20 ? 'text-yellow-500' : 'text-green-500'}`} />
              <p className="text-xs text-muted-foreground">Taxa de Erro</p>
            </div>
            <p className={`text-2xl font-bold ${stats.errorRate > 40 ? 'text-red-500' : stats.errorRate > 20 ? 'text-yellow-500' : 'text-green-500'}`}>
              {stats.errorRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert de saúde da IA */}
      {stats.total > 0 && (
        <Card className={`glass ${
          stats.errorRate > 40
            ? 'border-red-500/30 bg-red-500/5'
            : stats.errorRate > 20
            ? 'border-yellow-500/30 bg-yellow-500/5'
            : 'border-green-500/30 bg-green-500/5'
        }`}>
          <CardContent className="p-4 flex items-start gap-3">
            {stats.errorRate > 40 ? (
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            ) : stats.errorRate > 20 ? (
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium text-sm">
                {stats.errorRate > 40
                  ? 'Desempenho crítico — IA precisa de ajustes urgentes'
                  : stats.errorRate > 20
                  ? 'Atenção — taxa de erro acima do ideal, revise a Base de Conhecimento'
                  : 'IA funcionando bem — taxa de erro dentro do aceitável'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats.errorRate > 20
                  ? 'Revise os itens abaixo e atualize a Base de Conhecimento com informações mais precisas.'
                  : `${stats.positive} de ${stats.total} avaliações foram positivas nos últimos ${days} dias.`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de erros */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-orange-500" />
            Respostas com Problema
            {entries.length > 0 && (
              <Badge variant="destructive" className="ml-2">{entries.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Respostas da IA que receberam avaliação negativa (👎) pelos atendentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-3 opacity-70" />
              <p className="text-muted-foreground font-medium">Nenhum erro registrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                A IA não recebeu avaliações negativas nos últimos {days} dias.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, idx) => (
                <div
                  key={entry.feedback.id ?? idx}
                  className="border border-red-500/20 bg-red-500/5 rounded-lg p-4 space-y-3"
                >
                  {/* Cabeçalho do item */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span className="font-medium text-sm">
                        {entry.ticketTitle ?? `Ticket ${entry.feedback.ticket_id.slice(0, 8).toUpperCase()}`}
                      </span>
                      <Badge variant="outline" className="text-xs font-mono text-muted-foreground">
                        #{entry.feedback.ticket_id.slice(0, 8).toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {entry.feedback.created_at ? formatDate(entry.feedback.created_at) : '—'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => navigate(`/tickets/${entry.feedback.ticket_id}`)}
                        title="Abrir ticket"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Conteúdo da mensagem da IA */}
                  {entry.messageContent ? (
                    <div className="bg-muted/50 border border-border rounded-md p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">Resposta da IA</span>
                      </div>
                      <SafeContent
                        content={entry.messageContent.slice(0, 300) + (entry.messageContent.length > 300 ? '…' : '')}
                        className="text-sm text-foreground/80"
                        preserveWhitespace
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-md p-2">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Conteúdo da mensagem não disponível</span>
                    </div>
                  )}

                  {/* Comentário do avaliador */}
                  {entry.feedback.comment && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground text-xs font-medium mt-0.5">Comentário:</span>
                      <span className="text-foreground/80 text-xs italic">"{entry.feedback.comment}"</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ErrorLogPage;
