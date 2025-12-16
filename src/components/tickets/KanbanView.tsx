import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { getRelativeTime, getPriorityColor, getPriorityLabel } from '@/lib/utils';
import type { Ticket } from '@/types';

interface KanbanViewProps {
  tickets: Ticket[];
}

export function KanbanView({ tickets }: KanbanViewProps) {
  const navigate = useNavigate();

  const columns = [
    {
      id: 'open',
      title: 'Aberto',
      icon: AlertCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      id: 'in_progress',
      title: 'Em Andamento',
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
    },
    {
      id: 'resolved',
      title: 'Resolvido',
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      id: 'closed',
      title: 'Fechado',
      icon: XCircle,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20',
    },
  ];

  const getTicketsByStatus = (status: string) => {
    return tickets.filter((ticket) => ticket.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => {
        const Icon = column.icon;
        const columnTickets = getTicketsByStatus(column.id);

        return (
          <div key={column.id} className="space-y-3">
            {/* Column Header */}
            <div className={`rounded-lg p-4 ${column.bgColor} border ${column.borderColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${column.color}`} />
                  <h3 className="font-semibold text-foreground">{column.title}</h3>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {columnTickets.length}
                </Badge>
              </div>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 min-h-[200px]">
              {columnTickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum ticket
                </div>
              ) : (
                columnTickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="glass hover:border-primary/50 cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm line-clamp-2">
                          {ticket.title}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={`${getPriorityColor(ticket.priority)} flex-shrink-0`}
                        >
                          {getPriorityLabel(ticket.priority)}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs line-clamp-2">
                        {ticket.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {ticket.category}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {getRelativeTime(ticket.created_at)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
