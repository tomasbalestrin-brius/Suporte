/**
 * Database types - Strong typing for Supabase entities
 * This file contains precise type definitions to replace 'any' usage
 */

// Base types
export type UUID = string;
export type Timestamp = string;

// User roles
export type UserRole = 'admin' | 'student';

// Ticket statuses
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

// Ticket priorities
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

// AI Feedback ratings
export type FeedbackRating = 'positive' | 'negative';

/**
 * Create Ticket DTO (Data Transfer Object)
 */
export interface CreateTicketDTO {
  user_id: UUID;
  title: string;
  description: string;
  priority: TicketPriority;
  category: string;
  customer_name?: string;
  customer_email?: string;
  customer_cpf?: string;
  customer_phone?: string;
  product?: string;
}

/**
 * Update Ticket DTO
 */
export interface UpdateTicketDTO {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  assigned_to?: UUID;
  resolution?: string;
  resolved_at?: Timestamp;
}

/**
 * Webhook Event Payload
 */
export interface WebhookPayload {
  event: 'ticket.created' | 'ticket.updated' | 'status.changed';
  ticket_id: UUID;
  timestamp: Timestamp;
  data: Record<string, any>;
}

/**
 * Supabase Realtime Payload
 */
export interface RealtimePayload<T = any> {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: T | null;
  errors: string[] | null;
}

/**
 * Email Integration Token
 */
export interface EmailIntegrationToken {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  token_type: string;
  scope: string;
}

/**
 * OAuth Callback State
 */
export interface OAuthState {
  returnUrl?: string;
  integrationId?: UUID;
}

/**
 * AI Service Configuration
 */
export interface AIServiceConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  systemPrompt?: string;
}

/**
 * Quick Response Template
 */
export interface QuickResponseTemplate {
  id?: UUID;
  title: string;
  content: string;
  category?: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

/**
 * API Error Response
 */
export interface APIErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
