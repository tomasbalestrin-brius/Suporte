/**
 * AI Configuration Constants
 */

export const AI_CONFIG = {
  MODEL: 'gpt-3.5-turbo',
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
  TIMEOUT: 30000, // 30 segundos
} as const;

/**
 * AI Feedback Types
 */
export const AI_FEEDBACK = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
} as const;

export type AIFeedbackType = typeof AI_FEEDBACK[keyof typeof AI_FEEDBACK];

/**
 * AI System Prompts
 */
export const AI_PROMPTS = {
  SYSTEM: `Você é um assistente virtual especializado em atendimento ao cliente da Bethel Educação.
Seja educado, prestativo e profissional. Responda em português brasileiro.
Use a base de conhecimento fornecida para dar respostas precisas.`,
  
  NO_KNOWLEDGE_BASE: `Não encontrei informações específicas sobre isso na base de conhecimento.
Vou encaminhar sua dúvida para um atendente humano que poderá ajudá-lo melhor.`,
} as const;
