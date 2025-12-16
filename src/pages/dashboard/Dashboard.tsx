import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketStore } from '@/store/ticketStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, Clock, CheckCircle2, Plus, MessageSquare, TrendingUp, BarChart3 } from 'lucide-react';
import { formatDate, getStatusColor, getPriorityColor, getStatusLabel } from '@/lib/utils';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = {
  open: '#3b82f6',
  in_progress: '#eab308',
  resolved: '#22c55e',
  closed: '#6b7280',
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { tickets, stats, fetchTickets, fetchStats } = useTicketStore();

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, []);

  const recentTickets = tickets.slice(0, 5);

  // Calculate additional metrics
  const metrics = useMemo(() => {
    if (!tickets.length) return { avgResolutionTime: 0, resolutionRate: 0 };

    const resolvedTickets = tickets.filter((t) => t.resolved_at);

    // Average resolution time in hours
    let totalResolutionTime = 0;
    resolvedTickets.forEach((ticket) => {
      const created = new Date(ticket.created_at).getTime();
      const resolved = new Date(ticket.resolved_at!).getTime();
      totalResolutionTime += (resolved - created) / (1000 * 60 * 60); // Convert to hours
    });

    const avgResolutionTime = resolvedTickets.length > 0
      ? Math.round(totalResolutionTime / resolvedTickets.length)
      : 0;

    // Resolution rate
    const resolutionRate = tickets.length > 0
      ? Math.round((resolvedTickets.length / tickets.length) * 100)
      : 0;

    return { avgResolutionTime, resolutionRate };
  }, [tickets]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    const distribution = [
      { name: 'Aberto', value: stats?.open || 0, color: COLORS.open },
      { name: 'Em Andamento', value: stats?.in_progress || 0, color: COLORS.in_progress },
      { name: 'Resolvido', value: stats?.resolved || 0, color: COLORS.resolved },
      { name: 'Fechado', value: stats?.closed || 0, color: COLORS.closed },
    ];
    return distribution.filter((d) => d.value > 0);
  }, [stats]);

  // Top categories for bar chart
  const topCategories = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    tickets.forEach((ticket) => {
      categoryCounts[ticket.category] = (categoryCounts[ticket.category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [tickets]);

  // Timeline data - tickets per day for last 7 days
  const timelineData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    return last7Days.map((date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const count = tickets.filter((ticket) => {
        const createdAt = new Date(ticket.created_at);
        return createdAt >= date && createdAt < nextDay;
      }).length;

      return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        tickets: count,
      };
    });
  }, [tickets]);

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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

        <Card className="glass border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tempo Médio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {metrics.avgResolutionTime}h
            </div>
            <p className="text-xs text-muted-foreground">
              Resolução média
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-cyan-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Resolução
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-500">
              {metrics.resolutionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Tickets resolvidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Timeline Chart */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Tickets nos Últimos 7 Dias</CardTitle>
            <CardDescription>Volume de tickets criados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>Visão geral dos tickets</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {statusDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8">Nenhum dado disponível</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Top 5 Categorias</CardTitle>
            <CardDescription>Problemas mais comuns</CardDescription>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8">Nenhum dado disponível</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topCategories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
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
