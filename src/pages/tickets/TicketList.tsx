import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketStore } from '@/store/ticketStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, Ticket, LayoutList, LayoutGrid } from 'lucide-react';
import { formatDate, getRelativeTime, getStatusColor, getPriorityColor, getStatusLabel, getPriorityLabel } from '@/lib/utils';
import { KanbanView } from '@/components/tickets/KanbanView';

export function TicketListPage() {
  const navigate = useNavigate();
  const { tickets, fetchTickets } = useTicketStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  useEffect(() => {
    // Busca TODOS os tickets (não filtra por usuário para admins verem todos)
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || ticket.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Tickets</h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe seus tickets de suporte
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        filteredTickets.length === 0 ? (
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
          <KanbanView tickets={filteredTickets} />
        )
      ) : (
        // List View
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
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
            filteredTickets.map((ticket) => (
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
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default TicketListPage;
