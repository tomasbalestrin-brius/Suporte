import { useState, useEffect } from 'react';
import { aiFeedbackService, type FeedbackStats } from '@/services/aiFeedback.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Loader2,
  Calendar,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function AIFeedbackPage() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await aiFeedbackService.getStats(period);
      setStats(data);
    } catch (error) {
      console.error('Error loading AI feedback stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingBadge = (rating: 'positive' | 'negative') => {
    if (rating === 'positive') {
      return (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
          <ThumbsUp className="h-3 w-3 mr-1" />
          Positivo
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
        <ThumbsDown className="h-3 w-3 mr-1" />
        Negativo
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Feedback da IA Sofia
          </h1>
          <p className="text-muted-foreground">
            Avaliação e análise das respostas da inteligência artificial
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPeriod(7)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              period === 7
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            7 dias
          </button>
          <button
            onClick={() => setPeriod(30)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              period === 30
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            30 dias
          </button>
          <button
            onClick={() => setPeriod(90)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              period === 90
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            90 dias
          </button>
        </div>
      </div>

      {loading ? (
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Carregando estatísticas...</p>
            </div>
          </CardContent>
        </Card>
      ) : stats ? (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Feedbacks
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Últimos {period} dias
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Feedbacks Positivos
                </CardTitle>
                <ThumbsUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {stats.positive}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.positiveRate}% do total
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-red-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Feedbacks Negativos
                </CardTitle>
                <ThumbsDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {stats.negative}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.negativeRate}% do total
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Satisfação
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-500">
                  {stats.positiveRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Avaliações positivas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Feedback */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Feedbacks Recentes</CardTitle>
              <CardDescription>
                Últimas avaliações das respostas da IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentFeedback.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-semibold">Nenhum feedback ainda</h3>
                  <p className="text-sm text-muted-foreground">
                    Feedbacks aparecerão aqui quando os usuários avaliarem as respostas da IA
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentFeedback.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getRatingBadge(feedback.rating)}
                          <span className="text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {formatDate(feedback.created_at || '')}
                          </span>
                        </div>
                        {feedback.comment && (
                          <p className="text-sm text-muted-foreground">
                            {feedback.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insights */}
          {stats.total > 0 && (
            <Card className="glass border-blue-500/20 bg-blue-500/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground mb-2">Insights</p>
                    {stats.positiveRate >= 80 ? (
                      <p className="text-green-500">
                        ✨ Excelente! A IA Sofia está tendo um desempenho muito bom com {stats.positiveRate}% de aprovação.
                      </p>
                    ) : stats.positiveRate >= 60 ? (
                      <p className="text-yellow-500">
                        ⚠️ Desempenho moderado. Considere revisar a base de conhecimento para melhorar as respostas da IA.
                      </p>
                    ) : (
                      <p className="text-red-500">
                        🚨 Atenção! Taxa de satisfação baixa ({stats.positiveRate}%). É recomendado revisar urgentemente a base de conhecimento e o treinamento da IA.
                      </p>
                    )}
                    {stats.negative > stats.positive && (
                      <p className="mt-2 text-orange-500">
                        💡 Dica: Há mais feedbacks negativos que positivos. Analise os tickets com feedback negativo para identificar padrões e melhorar as respostas.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}

export default AIFeedbackPage;
