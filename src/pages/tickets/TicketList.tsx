import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketStore } from '@/store/ticketStore';
import { ticketService } from '@/services/ticket.service';
import { usePagination } from '@/hooks/usePagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Plus, Search, Ticket, LayoutList, LayoutGrid, Loader2, RefreshCw } from 'lucide-react';
import { formatDate, getRelativeTime, getStatusColor, getPriorityColor, getStatusLabel, getPriorityLabel } from '@/lib/utils';
import { KanbanView } from '@/components/tickets/KanbanView';
import { TicketListSkeleton } from '@/components/tickets/TicketListSkeleton';
import type { Ticket as TicketType } from '@/types';

export function TicketListPage() {
  const navigate = useNavigate();
  const { fetchStats, handleRealtimeUpdate } = useTicketStore();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [refreshing, setRefreshing] = useState(false);
  const statsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [paginationState, paginationActions] = usePagination({ initialPageSize: 20 });

  // Debounce search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      paginationActions.setPage(1); // Reset to first page on search
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]); // Only depend on searchTerm

  // Fetch tickets when pagination or filters change
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationState.page, paginationState.pageSize, debouncedSearch, filterStatus]);

  // Subscription otimizada em tempo real - TEMPORARIAMENTE DESABILITADA
  // devido a erro de "mismatch between server and client bindings"
  /*
  useEffect(() => {
    const channel = ticketService.subscribeToTickets((payload) => {
      // Update tickets in real-time
      handleRealtimeUpdate(payload);

      // Debounce stats update para evitar múltiplas chamadas
      if (statsUpdateTimeoutRef.current) {
        clearTimeout(statsUpdateTimeoutRef.current);
      }
      statsUpdateTimeoutRef.current = setTimeout(() => {
        fetchStats();
      }, 1000); // Atualiza stats 1 segundo após última mudança
    });

    return () => {
      channel?.unsubscribe();
      if (statsUpdateTimeoutRef.current) {
        clearTimeout(statsUpdateTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount
  */

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, total } = await ticketService.getTicketsPaginated({
        page: paginationState.page,
        pageSize: paginationState.pageSize,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: debouncedSearch || undefined,
      });
      setTickets(data);
      paginationActions.setTotalItems(total);
      await fetchStats();
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Tickets</h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe seus tickets de suporte
            {loading && <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin" />}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="h-4 w-4 mr-2" />
              Lista
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Kanban
            </Button>
          </div>
          <Button onClick={() => navigate('/tickets/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Ticket
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Only show status filters in list view */}
            {viewMode === 'list' && (
              <div className="flex gap-2 flex-wrap">
                {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status === 'all' ? 'Todos' : getStatusLabel(status)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tickets Display - List or Kanban */}
      {viewMode === 'kanban' ? (
        // Kanban View
        tickets.length === 0 ? (
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Ticket className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-semibold">
                  {searchTerm ? 'Nenhum ticket encontrado' : 'Nenhum ticket ainda'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm ? 'Tente outro termo de busca' : 'Crie seu primeiro ticket para começar'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => navigate('/tickets/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Ticket
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <KanbanView tickets={tickets} />
        )
      ) : (
        // List View
        <div className="space-y-4">
          {loading ? (
            <TicketListSkeleton count={paginationState.pageSize} />
          ) : tickets.length === 0 ? (
            <Card className="glass">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Ticket className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-semibold">
                    {searchTerm || filterStatus !== 'all'
                      ? 'Nenhum ticket encontrado'
                      : 'Nenhum ticket ainda'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchTerm || filterStatus !== 'all'
                      ? 'Tente ajustar os filtros de busca'
                      : 'Crie seu primeiro ticket para começar'}
                  </p>
                  {!searchTerm && filterStatus === 'all' && (
                    <Button onClick={() => navigate('/tickets/new')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Ticket
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className="glass hover:border-primary/50 cursor-pointer transition-all"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-lg">{ticket.title}</CardTitle>
                          <Badge className={getStatusColor(ticket.status)}>
                            {getStatusLabel(ticket.status)}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                            {getPriorityLabel(ticket.priority)}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {ticket.description}
                        </CardDescription>
                        {(ticket.customer_name || ticket.customer_email) && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                            <span className="text-foreground font-medium">
                              {ticket.customer_name || ticket.customer_email?.split('@')[0]}
                            </span>
                            {ticket.customer_email && (
                              <span className="text-xs">({ticket.customer_email})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>Categoria: <span className="text-foreground">{ticket.category}</span></span>
                        <span>Criado {getRelativeTime(ticket.created_at)}</span>
                      </div>
                      <span className="text-xs">{formatDate(ticket.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination Controls */}
              {paginationState.totalPages > 1 && (
                <Card className="glass">
                  <Pagination
                    currentPage={paginationState.page}
                    totalPages={paginationState.totalPages}
                    pageSize={paginationState.pageSize}
                    totalItems={paginationState.totalItems}
                    onPageChange={paginationActions.setPage}
                    onPageSizeChange={paginationActions.setPageSize}
                  />
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default TicketListPage;
