import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketStore } from '@/store/ticketStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, Clock, CheckCircle2, Plus, MessageSquare } from 'lucide-react';
import { formatDate, getStatusColor, getPriorityColor, getStatusLabel } from '@/lib/utils';

export function DashboardPage() {
  const navigate = useNavigate();
  const { tickets, stats, fetchTickets, fetchStats } = useTicketStore();

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, []);

  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Sistema de Suporte Automatizado
          </p>
        </div>
        <Button onClick={() => navigate('/tickets/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Tickets
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Todos os seus tickets
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Abertos
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {stats?.open || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando resposta
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Em Andamento
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {stats?.in_progress || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Sendo resolvidos
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolvidos
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats?.resolved || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Problemas solucionados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tickets Recentes</CardTitle>
              <CardDescription>
                Seus últimos tickets criados
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate('/tickets')}>
              Ver Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentTickets.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum ticket ainda</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie seu primeiro ticket para começar
              </p>
              <Button onClick={() => navigate('/tickets/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Ticket
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{ticket.title}</h4>
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {ticket.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(ticket.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
