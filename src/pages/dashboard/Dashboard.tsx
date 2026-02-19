import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketStore } from '@/store/ticketStore';
import { ticketService } from '@/services/ticket.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ticket, Clock, CheckCircle2, Plus, MessageSquare, TrendingUp, BarChart3, RefreshCw, Loader2, Package, Calendar } from 'lucide-react';
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

const PERIOD_OPTIONS = [
  { value: '7',         label: 'Últimos 7 dias' },
  { value: '30',        label: 'Últimos 30 dias' },
  { value: '90',        label: 'Últimos 90 dias' },
  { value: 'month',     label: 'Este mês' },
  { value: 'lastmonth', label: 'Mês passado' },
  { value: 'year',      label: 'Este ano' },
  { value: 'all',       label: 'Todo o período' },
];

function getSinceDate(period: string): { since: Date | null; until: Date | null } {
  const now = new Date();
  if (period === 'all') return { since: null, until: null };
  if (period === '7')  { const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(0,0,0,0); return { since: d, until: null }; }
  if (period === '30') { const d = new Date(); d.setDate(d.getDate() - 30); d.setHours(0,0,0,0); return { since: d, until: null }; }
  if (period === '90') { const d = new Date(); d.setDate(d.getDate() - 90); d.setHours(0,0,0,0); return { since: d, until: null }; }
  if (period === 'month') {
    const since = new Date(now.getFullYear(), now.getMonth(), 1);
    return { since, until: null };
  }
  if (period === 'lastmonth') {
    const since = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const until = new Date(now.getFullYear(), now.getMonth(), 1);
    return { since, until };
  }
  if (period === 'year') {
    const since = new Date(now.getFullYear(), 0, 1);
    return { since, until: null };
  }
  return { since: null, until: null };
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { tickets, fetchTickets, fetchStats, loading, handleRealtimeUpdate } = useTicketStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('30');
  const [filterProduct, setFilterProduct] = useState('all');
  const statsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const channel = ticketService.subscribeToTickets((payload) => {
      handleRealtimeUpdate(payload);
      if (statsUpdateTimeoutRef.current) clearTimeout(statsUpdateTimeoutRef.current);
      statsUpdateTimeoutRef.current = setTimeout(() => { fetchStats(); }, 1000);
    });
    return () => {
      channel?.unsubscribe();
      if (statsUpdateTimeoutRef.current) clearTimeout(statsUpdateTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    await fetchTickets();
    await fetchStats();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Produtos únicos derivados dos tickets
  const products = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach(t => { if (t.product) set.add(t.product); });
    return Array.from(set).sort();
  }, [tickets]);

  // Tickets filtrados por período e produto
  const filteredTickets = useMemo(() => {
    const { since, until } = getSinceDate(filterPeriod);
    return tickets.filter(t => {
      const createdAt = new Date(t.created_at);
      if (since && createdAt < since) return false;
      if (until && createdAt >= until) return false;
      if (filterProduct !== 'all' && t.product !== filterProduct) return false;
      return true;
    });
  }, [tickets, filterPeriod, filterProduct]);

  // Stats computados dos tickets filtrados
  const filteredStats = useMemo(() => ({
    total:       filteredTickets.length,
    open:        filteredTickets.filter(t => t.status === 'open').length,
    in_progress: filteredTickets.filter(t => t.status === 'in_progress').length,
    resolved:    filteredTickets.filter(t => t.status === 'resolved').length,
    closed:      filteredTickets.filter(t => t.status === 'closed').length,
  }), [filteredTickets]);

  // Métricas adicionais
  const metrics = useMemo(() => {
    if (!filteredTickets.length) return { avgResolutionTime: 0, resolutionRate: 0 };
    const resolvedTickets = filteredTickets.filter(t => t.resolved_at);
    let totalTime = 0;
    resolvedTickets.forEach(t => {
      totalTime += (new Date(t.resolved_at!).getTime() - new Date(t.created_at).getTime()) / 3600000;
    });
    return {
      avgResolutionTime: resolvedTickets.length > 0 ? Math.round(totalTime / resolvedTickets.length) : 0,
      resolutionRate: Math.round((resolvedTickets.length / filteredTickets.length) * 100),
    };
  }, [filteredTickets]);

  // Distribuição de status para o gráfico de pizza
  const statusDistribution = useMemo(() => [
    { name: 'Aberto',       value: filteredStats.open,        color: COLORS.open },
    { name: 'Em Andamento', value: filteredStats.in_progress, color: COLORS.in_progress },
    { name: 'Resolvido',    value: filteredStats.resolved,    color: COLORS.resolved },
    { name: 'Fechado',      value: filteredStats.closed,      color: COLORS.closed },
  ].filter(d => d.value > 0), [filteredStats]);

  // Top categorias
  const topCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTickets.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredTickets]);

  // Top produtos
  const topProducts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTickets.forEach(t => {
      const p = t.product || 'Não informado';
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [filteredTickets]);

  // Timeline dinâmica conforme o período
  const timelineData = useMemo(() => {
    const { since, until } = getSinceDate(filterPeriod);
    const endDate = until || new Date();
    const startDate = since || (filteredTickets.length > 0
      ? new Date(Math.min(...filteredTickets.map(t => new Date(t.created_at).getTime())))
      : new Date());

    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);

    if (filterPeriod === 'year') {
      // Agrupa por mês
      const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(endDate.getFullYear(), i, 1);
        return d;
      });
      return months.map(monthStart => {
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
        const count = filteredTickets.filter(t => {
          const c = new Date(t.created_at);
          return c >= monthStart && c < monthEnd;
        }).length;
        return {
          date: monthStart.toLocaleDateString('pt-BR', { month: 'short' }),
          tickets: count,
        };
      });
    }

    if (diffDays > 30) {
      // Agrupa por semana
      const weeks: Date[] = [];
      const d = new Date(startDate);
      d.setHours(0, 0, 0, 0);
      while (d < endDate) {
        weeks.push(new Date(d));
        d.setDate(d.getDate() + 7);
      }
      return weeks.map(weekStart => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const count = filteredTickets.filter(t => {
          const c = new Date(t.created_at);
          return c >= weekStart && c < weekEnd;
        }).length;
        return {
          date: weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          tickets: count,
        };
      });
    }

    // Agrupa por dia
    const days = Array.from({ length: Math.max(diffDays, 1) }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return d;
    });
    return days.map(day => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const count = filteredTickets.filter(t => {
        const c = new Date(t.created_at);
        return c >= day && c < nextDay;
      }).length;
      return {
        date: day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        tickets: count,
      };
    });
  }, [filteredTickets, filterPeriod]);

  const recentTickets = filteredTickets.slice(0, 5);
  const periodLabel = PERIOD_OPTIONS.find(o => o.value === filterPeriod)?.label ?? '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Sistema de Suporte Automatizado
            {loading && <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin" />}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={() => navigate('/tickets/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Ticket
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="glass">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Período:
            </div>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground ml-2">
              <Package className="h-4 w-4" />
              Produto:
            </div>
            <Select value={filterProduct} onValueChange={setFilterProduct}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os produtos</SelectItem>
                {products.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
                {products.length === 0 && (
                  <SelectItem value="none" disabled>Nenhum produto cadastrado</SelectItem>
                )}
              </SelectContent>
            </Select>

            {(filterPeriod !== '30' || filterProduct !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => { setFilterPeriod('30'); setFilterProduct('all'); }}
              >
                Limpar filtros
              </Button>
            )}

            <span className="ml-auto text-xs text-muted-foreground">
              {filteredStats.total} ticket{filteredStats.total !== 1 ? 's' : ''} · {periodLabel}
              {filterProduct !== 'all' ? ` · ${filterProduct}` : ''}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats.total}</div>
            <p className="text-xs text-muted-foreground">No período selecionado</p>
          </CardContent>
        </Card>

        <Card className="glass border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abertos</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{filteredStats.open}</div>
            <p className="text-xs text-muted-foreground">Aguardando resposta</p>
          </CardContent>
        </Card>

        <Card className="glass border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <MessageSquare className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{filteredStats.in_progress}</div>
            <p className="text-xs text-muted-foreground">Sendo resolvidos</p>
          </CardContent>
        </Card>

        <Card className="glass border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{filteredStats.resolved}</div>
            <p className="text-xs text-muted-foreground">Problemas solucionados</p>
          </CardContent>
        </Card>

        <Card className="glass border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{metrics.avgResolutionTime}h</div>
            <p className="text-xs text-muted-foreground">Resolução média</p>
          </CardContent>
        </Card>

        <Card className="glass border-cyan-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
            <BarChart3 className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-500">{metrics.resolutionRate}%</div>
            <p className="text-xs text-muted-foreground">Tickets resolvidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Timeline */}
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle>Volume de Tickets</CardTitle>
            <CardDescription>
              {filterPeriod === 'year' ? 'Por mês' : timelineData.length > 20 ? 'Por semana' : 'Por dia'} · {periodLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTickets.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                Nenhum dado no período
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="tickets" name="Tickets" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
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
              <p className="text-sm text-muted-foreground py-8">Nenhum dado no período</p>
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
                    labelLine={false}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts - Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Categorias */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Top 5 Categorias</CardTitle>
            <CardDescription>Problemas mais comuns no período</CardDescription>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8">Nenhum dado no período</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topCategories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} width={90} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="count" name="Tickets" fill="#22c55e" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Produtos */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Tickets por Produto</CardTitle>
            <CardDescription>Distribuição por produto no período</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8">Nenhum produto cadastrado nos tickets</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="count" name="Tickets" fill="#a855f7" radius={[0, 6, 6, 0]} />
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
              <CardDescription>Últimos tickets no período selecionado</CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate('/tickets')}>Ver Todos</Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentTickets.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum ticket no período</h3>
              <p className="text-sm text-muted-foreground mb-4">Ajuste os filtros ou crie um novo ticket</p>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold">{ticket.title}</h4>
                      <Badge className={getStatusColor(ticket.status)}>{getStatusLabel(ticket.status)}</Badge>
                      {ticket.product && (
                        <Badge variant="outline" className="text-xs text-purple-400 border-purple-400/30">
                          <Package className="h-3 w-3 mr-1" />
                          {ticket.product}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(ticket.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
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

export default DashboardPage;
