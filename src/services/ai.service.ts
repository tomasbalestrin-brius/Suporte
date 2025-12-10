import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIChatMessage } from '@/types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Inicializa o Google Generative AI
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const SYSTEM_PROMPT = `Você é um assistente de suporte técnico especializado em ajudar alunos.
Seja sempre prestativo, educado e profissional.
Forneça respostas claras e objetivas.
Se não souber a resposta, seja honesto e sugira que o aluno aguarde um atendente humano.
Sempre que possível, forneça passos detalhados para resolver problemas.
Use linguagem acessível e evite termos muito técnicos.`;

export const aiService = {
  async generateResponse(messages: AIChatMessage[]): Promise<string> {
    try {
      if (!GEMINI_API_KEY || !genAI) {
        return 'Desculpe, o serviço de IA não está configurado no momento. Por favor, aguarde o atendimento humano.';
      }

      // Usa o modelo Gemini Pro
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
            parts: [{ text: 'Entendido! Estou aqui para ajudar os alunos da melhor forma possível. Como posso ajudá-lo?' }],
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

      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
