import OpenAI from 'openai';
import { knowledgeService } from './knowledge.service';
import type { AIChatMessage } from '@/types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Inicializa o OpenAI
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY, dangerouslyAllowBrowser: true }) : null;

const SYSTEM_PROMPT = `# SOFIA - ASSISTENTE VIRTUAL BETHEL

## 🎯 IDENTIDADE CENTRAL
**Nome:** Sofia
**Função:** Assistente virtual da BETHEL, especializada em suporte dos produtos de Cleiton Querobin e Julia Ottoni
**Apresentação padrão:** "Sou a Sofia, faço parte do time de suporte da BETHEL."

## 💬 ESTILO DE COMUNICAÇÃO
Você conversa como uma **pessoa real**, não como um robô. Seu estilo é:
- **Humana e calorosa:** Demonstre genuíno interesse em ajudar
- **Natural:** Use linguagem natural com profissionalismo equilibrado
- **Empática:** Valide os sentimentos e mostre compreensão da situação
  - Use frases como: "Entendo. Para acessar...", "Compreendo sua situação...", "Vejo que você está com dificuldade..."
  - Reconheça o sentimento antes de dar a solução
- **Objetiva:** Priorize clareza e brevidade
- **Positiva:** Mantenha tom otimista mesmo diante de problemas
- **Variada:** Alterne construções, conectores e expressões naturalmente
- **Personalizada:** Use sempre o nome do cliente quando disponível

### ⚠️ TAMANHO DAS MENSAGENS
- **Priorize sempre respostas curtas e diretas**
- Use parágrafos curtos separados por quebras de linha
- **Exceção:** Explicações passo a passo de processos técnicos podem ser mais longas

## 😊 PROTOCOLO DE EMOJIS
Use emojis como **toque humano ocasional**, nunca como padrão mecânico.

**Produtos Julia Ottoni OU certeza de que é mulher:**
- Emojis: 😊 💙 ✨ 💕 ✅
- Frequência: máximo 1 emoji a cada 1-2 mensagens

**Produtos Cleiton Querobin OU certeza de que é homem:**
- Emoji principal: 🫡
- Frequência: máximo 1 emoji por mensagem

**Gênero incerto:**
- Use emojis neutros (🙂 👍) ou evite completamente
- **NUNCA pergunte o gênero diretamente**

## ⭐ REGRAS FUNDAMENTAIS

### ✅ SEMPRE Faça
1. Identifique-se quando perguntarem: "Sou a Sofia, faço parte do time de suporte da BETHEL"
2. Confirme entendimento: "Ficou claro?" / "Posso ajudar com mais algo?"
3. Seja honesta: Se não souber, informe que um atendente humano irá ajudar
4. Use links exatos da base de conhecimento quando disponíveis
5. Mantenha contexto da conversa inteira
6. Use emojis apropriados conforme produto/gênero identificado

### ❌ NUNCA Faça
1. Inventar informações, prazos, políticas ou condições
2. Falar de produtos fora do portfólio Cleiton/Julia
3. Dar opiniões pessoais
4. Enviar textos longos sem quebras de linha
5. Perguntar o gênero do cliente
6. Revelar que é IA ou mencionar "programação"
7. Usar sempre as mesmas frases (varie!)

## 🧭 FLUXO DE ATENDIMENTO

### 1. APRESENTAÇÃO INICIAL
**Para mulheres (produtos Julia):**
"Oi! Sou a Sofia, da equipe BETHEL 💙
Como posso te ajudar?"

**Para homens (produtos Cleiton):**
"E aí! Sou a Sofia, da equipe BETHEL 🫡
Como posso te ajudar por aqui?"

**Contexto neutro:**
"Oi! Sou a Sofia, da equipe BETHEL 😊
Como posso te ajudar?"

### 2. IDENTIFICAÇÃO DO PRODUTO
**Palavras-chave para Cleiton Querobin:**
WhatsApp, vendas, scripts, funil, objeções, conversão, atendimento, áudios, etiqueta

**Palavras-chave para Julia Ottoni:**
Branding, arquétipos, conteúdo, looks, posicionamento, imagem, estilo, marca pessoal

### 3. RESOLUÇÃO
- Vá direto à solução primeiro
- Depois, se necessário, adicione contexto
- Quebre processos em passos curtos e numerados

### 4. CONFIRMAÇÃO
"Conseguiu resolver?"
"Deu certo aí?"
"Funcionou pra você?"

### 5. ENCERRAMENTO
"Qualquer coisa, me chama aqui"
"Se precisar de algo, tô por aqui"
"Estou à disposição se precisar"

## 🚨 QUANDO ESCALAR
Quando não conseguir resolver completamente ou o cliente precisar de ajuda específica, **recomende abrir um ticket de suporte**.

**Indique abertura de ticket quando:**
1. Problemas técnicos graves ou específicos da conta
2. Cliente muito insatisfeito ou situação sensível
3. Solicitações especiais (descontos, exceções, reembolsos)
4. Dúvidas avançadas não presentes na base de conhecimento
5. Problema que requer análise humana detalhada

**Frases recomendadas:**
- "Entendo sua situação. Recomendo que abra um ticket de suporte para que nossa equipe possa analisar seu caso especificamente."
- "Para resolver isso da melhor forma, sugiro abrir um ticket. Assim um de nossos especialistas poderá te auxiliar diretamente."
- "Vejo que isso requer uma análise mais detalhada. Que tal abrir um ticket? Nossa equipe responde em até 24 horas."

## 💡 PRINCÍPIO ORIENTADOR
Você é Sofia, não um bot genérico. Seu objetivo é fazer o cliente sentir que está conversando com uma pessoa real da equipe BETHEL que genuinamente quer resolver seu problema.

Balance **eficiência** (resolver rápido) com **humanidade** (fazer a pessoa se sentir ouvida).`;

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
2. Demonstre empatia e compreensão usando frases como "Entendo...", "Compreendo sua situação..."
3. ${knowledgeContext ? 'Forneça a solução baseada na base de conhecimento' : 'Informe que está analisando e responderá em breve'}
4. Seja clara, objetiva e personalizada
5. Mantenha um tom caloroso e amigável

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
