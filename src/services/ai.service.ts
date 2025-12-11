import { GoogleGenerativeAI } from '@google/generative-ai';
import { knowledgeService } from './knowledge.service';
import type { AIChatMessage } from '@/types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Inicializa o Google Generative AI
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

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
      if (!GEMINI_API_KEY || !genAI) {
        return 'Desculpe, o serviço de IA não está configurado no momento. Por favor, aguarde o atendimento humano.';
      }

      // Usa o modelo Gemini 1.5 Pro
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      // Converte o histórico de mensagens para o formato do Gemini
      const chatHistory = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // Inicia o chat com histórico
      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: SYSTEM_PROMPT }],
          },
          {
            role: 'model',
            parts: [{ text: 'Entendido! Estou aqui para ajudar da melhor forma possível. Como posso ajudá-lo?' }],
          },
          ...chatHistory.slice(0, -1), // Todas menos a última mensagem
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      // Envia a última mensagem
      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;

      return response.text() || 'Desculpe, não consegui gerar uma resposta.';
    } catch (error) {
      console.error('Gemini AI Service Error:', error);
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
      if (!GEMINI_API_KEY || !genAI) {
        return `Olá ${customerName}! Recebemos seu ticket e nossa equipe irá analisá-lo em breve. Agradecemos o contato!`;
      }

      // Busca conhecimento relevante
      const knowledgeContext = await searchRelevantKnowledge(necessity, product);

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const prompt = `Você é um assistente de suporte. Um cliente abriu um ticket com os seguintes dados:

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
4. Seja claro e objetivo
5. Mantenha um tom amigável

Limite: 200 palavras.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      return response.text() || `Olá ${customerName}! Recebemos seu ticket e nossa equipe irá analisá-lo em breve.`;
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
      if (!GEMINI_API_KEY || !genAI) {
        return {
          category: 'Outro',
          priority: 'medium',
          suggestedResponse: 'Aguarde, um atendente irá responder em breve.',
        };
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const prompt = `Analise o seguinte ticket de suporte e retorne um JSON com:
1. category: uma das opções (Técnico, Dúvida, Acesso, Financeiro, Sugestão, Outro)
2. priority: uma das opções (low, medium, high, urgent)
3. suggestedResponse: uma resposta inicial útil e empática

Ticket:
Título: ${title}
Descrição: ${description}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional, sem markdown, sem \`\`\`json. Apenas o objeto JSON puro.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

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
