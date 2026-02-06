/**
 * Ticket Status Constants
 */
export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export type TicketStatus = typeof TICKET_STATUS[keyof typeof TICKET_STATUS];

/**
 * Ticket Priority Constants
 */
export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type TicketPriority = typeof TICKET_PRIORITY[keyof typeof TICKET_PRIORITY];

/**
 * Ticket Status Labels (Portuguese)
 */
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  [TICKET_STATUS.OPEN]: 'Aberto',
  [TICKET_STATUS.IN_PROGRESS]: 'Em Andamento',
  [TICKET_STATUS.RESOLVED]: 'Resolvido',
  [TICKET_STATUS.CLOSED]: 'Fechado',
};

/**
 * Ticket Priority Labels (Portuguese)
 */
export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  [TICKET_PRIORITY.LOW]: 'Baixa',
  [TICKET_PRIORITY.MEDIUM]: 'Média',
  [TICKET_PRIORITY.HIGH]: 'Alta',
  [TICKET_PRIORITY.URGENT]: 'Urgente',
};

/**
 * Status Colors for UI
 */
export const STATUS_COLORS: Record<TicketStatus, string> = {
  [TICKET_STATUS.OPEN]: 'bg-blue-100 text-blue-800',
  [TICKET_STATUS.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [TICKET_STATUS.RESOLVED]: 'bg-green-100 text-green-800',
  [TICKET_STATUS.CLOSED]: 'bg-gray-100 text-gray-800',
};

/**
 * Priority Colors for UI
 */
export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  [TICKET_PRIORITY.LOW]: 'bg-gray-100 text-gray-800',
  [TICKET_PRIORITY.MEDIUM]: 'bg-blue-100 text-blue-800',
  [TICKET_PRIORITY.HIGH]: 'bg-orange-100 text-orange-800',
  [TICKET_PRIORITY.URGENT]: 'bg-red-100 text-red-800',
};
