import OpenAI from 'openai';
import type { AIChatMessage } from '@/types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only for development
});

const SYSTEM_PROMPT = `Você é um assistente de suporte técnico especializado em ajudar alunos.
Seja sempre prestativo, educado e profissional.
Forneça respostas claras e objetivas.
Se não souber a resposta, seja honesto e sugira que o aluno aguarde um atendente humano.
Sempre que possível, forneça passos detalhados para resolver problemas.
Use linguagem acessível e evite termos muito técnicos.`;

export const aiService = {
  async generateResponse(messages: AIChatMessage[]): Promise<string> {
    try {
      if (!OPENAI_API_KEY) {
        return 'Desculpe, o serviço de IA não está configurado no momento. Por favor, aguarde o atendimento humano.';
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
    } catch (error) {
      console.error('AI Service Error:', error);
      return 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente ou aguarde um atendente humano.';
    }
  },

  async analyzeTicket(title: string, description: string): Promise<{
    category: string;
    priority: string;
    suggestedResponse: string;
  }> {
    try {
      if (!OPENAI_API_KEY) {
        return {
          category: 'Outro',
          priority: 'medium',
          suggestedResponse: 'Aguarde, um atendente irá responder em breve.',
        };
      }

      const prompt = `Analise o seguinte ticket de suporte e retorne um JSON com:
1. category: uma das opções (Técnico, Dúvida, Acesso, Financeiro, Sugestão, Outro)
2. priority: uma das opções (low, medium, high, urgent)
3. suggestedResponse: uma resposta inicial útil

Ticket:
Título: ${title}
Descrição: ${description}

Retorne apenas o JSON, sem texto adicional.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('Ticket Analysis Error:', error);
      return {
        category: 'Outro',
        priority: 'medium',
        suggestedResponse: 'Obrigado por entrar em contato. Estamos analisando seu ticket e responderemos em breve.',
      };
    }
  },

  // Alternative: Gemini API (if user prefers)
  async generateResponseWithGemini(messages: AIChatMessage[]): Promise<string> {
    // TODO: Implement Gemini API integration
    // This is a placeholder for Gemini implementation
    console.log('Gemini API not implemented yet. Using fallback.');
    return 'Função Gemini em desenvolvimento. Use OpenAI por enquanto.';
  },
};
