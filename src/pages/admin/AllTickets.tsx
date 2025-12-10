import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '@/services/ticket.service';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Ticket, Users } from 'lucide-react';
import { formatDate, getRelativeTime, getStatusColor, getPriorityColor, getStatusLabel, getPriorityLabel } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Ticket as TicketType } from '@/types';

export function AllTicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      // Admin busca TODOS os tickets (sem passar userId)
      const data = await ticketService.getTickets();
      setTickets(data);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || ticket.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Todos os Tickets
          </h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os tickets de suporte do sistema
          </p>
        </div>
        <Badge variant="default" className="text-sm px-3 py-1">
          Admin
        </Badge>
      </div>

      {/* Filters */}
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, descrição, usuário ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{tickets.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {tickets.filter(t => t.status === 'open').length}
              </p>
              <p className="text-xs text-muted-foreground">Abertos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">
                {tickets.filter(t => t.status === 'in_progress').length}
              </p>
              <p className="text-xs text-muted-foreground">Em Andamento</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {tickets.filter(t => t.status === 'resolved').length}
              </p>
              <p className="text-xs text-muted-foreground">Resolvidos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-500">
                {tickets.filter(t => t.status === 'closed').length}
              </p>
              <p className="text-xs text-muted-foreground">Fechados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando tickets...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredTickets.length === 0 ? (
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Ticket className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-semibold">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Nenhum ticket encontrado'
                    : 'Nenhum ticket ainda'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Aguarde os alunos criarem tickets de suporte'}
                </p>
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
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-2">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span className="text-foreground font-medium">{ticket.user?.name}</span>
                      <span className="text-xs">({ticket.user?.email})</span>
                    </span>
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
    </div>
  );
}
