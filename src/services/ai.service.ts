import OpenAI from 'openai';
import { knowledgeService } from './knowledge.service';
import type { AIChatMessage } from '@/types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Inicializa o OpenAI
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY, dangerouslyAllowBrowser: true }) : null;

const SYSTEM_PROMPT = `Você é Sofia, a atendente virtual da Bethel Educação.
Seja sempre prestativa, educada e profissional.
Forneça respostas claras e objetivas.
Quando tiver informações da base de conhecimento, use-as para fornecer respostas precisas.
Se não souber a resposta, seja honesta e sugira que o cliente aguarde um atendente humano.
Sempre que possível, forneça passos detalhados para resolver problemas.
Use linguagem acessível e evite termos muito técnicos.`;

/**
 * Extrai palavras-chave relevantes de um texto
 */
function extractKeywords(text: string): string[] {
  // Remove pontuação e divide em palavras
  const words = text
    .toLowerCase()
    .replace(/[^\w\sáàâãéèêíïóôõöúçñ]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3); // Apenas palavras com mais de 3 letras

  // Remove palavras comuns (stop words)
  const stopWords = new Set([
    'este', 'esta', 'esse', 'essa', 'aquele', 'aquela',
    'para', 'com', 'por', 'sobre', 'entre', 'desde',
    'até', 'após', 'antes', 'durante', 'depois',
    'muito', 'mais', 'menos', 'outro', 'outra',
    'como', 'quando', 'onde', 'porque', 'qual',
    'ser', 'estar', 'ter', 'fazer', 'poder',
  ]);

  return words.filter(word => !stopWords.has(word));
}

/**
 * Busca conhecimento relevante na base
 */
async function searchRelevantKnowledge(text: string, product?: string): Promise<string | null> {
  try {
    const keywords = extractKeywords(text);

    if (keywords.length === 0) {
      return null;
    }

    // Busca por palavras-chave
    let results = await knowledgeService.searchByKeywords(keywords);

    // Se tiver produto, prioriza resultados específicos do produto
    if (product && results.length === 0) {
      results = await knowledgeService.searchByProduct(product);
    }

    // Se ainda não encontrou, tenta busca por texto
    if (results.length === 0) {
      results = await knowledgeService.searchByText(text.substring(0, 100));
    }

    if (results.length === 0) {
      return null;
    }

    // Monta o contexto com os conhecimentos encontrados
    const context = results
      .slice(0, 3) // Pega os 3 mais relevantes
      .map((kb, index) => `
## Conhecimento ${index + 1}: ${kb.title}
Categoria: ${kb.category}
${kb.product ? `Produto: ${kb.product}` : ''}

${kb.content}
`)
      .join('\n\n');

    return context;
  } catch (error) {
    console.error('Error searching knowledge:', error);
    return null;
  }
}

export const aiService = {
  /**
   * Gera resposta para mensagens de chat
   */
  async generateResponse(messages: AIChatMessage[]): Promise<string> {
    try {
      if (!OPENAI_API_KEY || !openai) {
        return 'Desculpe, o serviço de IA não está configurado no momento. Por favor, aguarde o atendimento humano.';
      }

      // Converte mensagens para formato OpenAI
      const openaiMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...messages.map(msg => ({
          role: (msg.role === 'model' ? 'assistant' : msg.role) as 'user' | 'assistant',
          content: msg.content,
        })),
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: openaiMessages,
        max_tokens: 500,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
    } catch (error) {
      console.error('OpenAI Service Error:', error);
      return 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente ou aguarde um atendente humano.';
    }
  },

  /**
   * Gera resposta inicial para um ticket usando base de conhecimento
   */
  async generateTicketResponse(
    customerName: string,
    product: string | undefined,
    necessity: string
  ): Promise<string> {
    try {
      if (!OPENAI_API_KEY || !openai) {
        return `Olá ${customerName}! Recebemos seu ticket e nossa equipe irá analisá-lo em breve. Agradecemos o contato!`;
      }

      // Busca conhecimento relevante
      const knowledgeContext = await searchRelevantKnowledge(necessity, product);

      const prompt = `Você é Sofia, a atendente virtual da Bethel Educação. Um cliente abriu um ticket:

Nome: ${customerName}
${product ? `Produto: ${product}` : ''}
Necessidade/Problema: ${necessity}

${knowledgeContext ? `
IMPORTANTE: Use a seguinte base de conhecimento para responder:

${knowledgeContext}

Baseie sua resposta principalmente nessas informações da base de conhecimento.
` : ''}

Gere uma resposta inicial útil, empática e profissional:
1. Cumprimente o cliente pelo nome
2. Demonstre que entendeu o problema
3. ${knowledgeContext ? 'Forneça a solução baseada na base de conhecimento' : 'Informe que está analisando e responderá em breve'}
4. Seja clara e objetiva
5. Mantenha um tom amigável

Limite: 200 palavras.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || `Olá ${customerName}! Recebemos seu ticket e nossa equipe irá analisá-lo em breve.`;
    } catch (error) {
      console.error('Error generating ticket response:', error);
      return `Olá ${customerName}! Recebemos seu ticket e nossa equipe irá analisá-lo em breve. Agradecemos o contato!`;
    }
  },

  /**
   * Analisa ticket e sugere categoria/prioridade
   */
  async analyzeTicket(title: string, description: string): Promise<{
    category: string;
    priority: string;
    suggestedResponse: string;
  }> {
    try {
      if (!OPENAI_API_KEY || !openai) {
        return {
          category: 'Outro',
          priority: 'medium',
          suggestedResponse: 'Aguarde, um atendente irá responder em breve.',
        };
      }

      const prompt = `Analise o seguinte ticket de suporte e retorne um JSON com:
1. category: uma das opções (Técnico, Dúvida, Acesso, Financeiro, Sugestão, Outro)
2. priority: uma das opções (low, medium, high, urgent)
3. suggestedResponse: uma resposta inicial útil e empática

Ticket:
Título: ${title}
Descrição: ${description}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional, sem markdown, sem \`\`\`json. Apenas o objeto JSON puro.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Você é um assistente que analisa tickets de suporte e retorna apenas JSON.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.5,
      });

      const text = completion.choices[0]?.message?.content || '{}';

      // Remove possíveis marcadores de código
      const cleanText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanText);
      return {
        category: parsed.category || 'Outro',
        priority: parsed.priority || 'medium',
        suggestedResponse: parsed.suggestedResponse || 'Obrigado por entrar em contato. Estamos analisando seu ticket e responderemos em breve.',
      };
    } catch (error) {
      console.error('Ticket Analysis Error:', error);
      return {
        category: 'Outro',
        priority: 'medium',
        suggestedResponse: 'Obrigado por entrar em contato. Estamos analisando seu ticket e responderemos em breve.',
      };
    }
  },
};
