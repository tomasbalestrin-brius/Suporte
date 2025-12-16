export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const faqData: FAQItem[] = [
  {
    id: '1',
    question: '🔐 Como acesso meu produto após a compra?',
    answer: `**Produtos Julia Ottoni:**
• Link: https://juliaacademy.com.br/
• Senha padrão: ottoni123

**Produtos Cleiton:**
• Link: https://cleitonquerobin1.com.br/area-de-membros/
• Senha padrão: performance123

**Script GO:**
• Link: https://www.scriptgo.app/login
• Senha padrão: Script@2025

**Couply:**
• Link: www.usecouply.app/login
• Senha padrão: Couply@2025

**AutentiQ:**
• Link: www.autentiq.app/login
• Senha padrão: Autentiq@2025

Use o e-mail que você fez a compra como login.`,
    category: 'Acesso'
  },
  {
    id: '2',
    question: '🔑 Esqueci minha senha, e agora?',
    answer: `1. Clique em "Perdeu sua senha?" na tela de login
2. Digite seu e-mail de compra
3. Verifique sua caixa de entrada (e spam e promoções!)
4. Aguarde até 15 minutos

**Não recebeu?** Abra um ticket de suporte.`,
    category: 'Acesso'
  },
  {
    id: '3',
    question: '⏰ Por quanto tempo tenho acesso?',
    answer: `• **Maioria dos produtos:** 1 ano
• **Materiais no Trello:** Vitalício (salve o link!)
• **Script GO e Couply:** Conforme plano contratado

Você recebe aviso por e-mail no mês de expiração.`,
    category: 'Acesso'
  },
  {
    id: '4',
    question: '💳 Quais formas de pagamento vocês aceitam?',
    answer: `**Aceitos:**
✅ PIX (aprovação instantânea)
✅ Cartão de crédito (até 12x)

**Não disponíveis:**
❌ Boleto
❌ PayPal`,
    category: 'Pagamento'
  },
  {
    id: '5',
    question: '🔄 Como funciona o reembolso?',
    answer: `• **Prazo:** 7 dias de garantia
• **Como solicitar:** Pela plataforma onde comprou (Hotmart ou Pagtrust)
• **Parcelado:** Ao solicitar reembolso dentro de 7 dias, todas as parcelas são canceladas`,
    category: 'Pagamento'
  },
  {
    id: '6',
    question: '📱 Posso acessar pelo celular?',
    answer: `**Sim!** Todos os produtos funcionam em:
📱 Celular (Android/iOS)
💻 Computador
📲 Tablet`,
    category: 'Acesso'
  },
  {
    id: '7',
    question: '🤝 Posso compartilhar meu acesso?',
    answer: `**NÃO!** O acesso é individual e intransferível.

⚠️ **Atenção:** Compartilhar pode resultar em bloqueio permanente da conta.`,
    category: 'Acesso'
  },
  {
    id: '8',
    question: '📥 Posso baixar os materiais?',
    answer: `✅ **PDFs:** Sim, podem ser baixados
✅ **Materiais de apoio:** Alguns sim
❌ **Vídeos das aulas:** Não (apenas online)

💡 **Dica:** Salve os PDFs antes do acesso expirar!`,
    category: 'Materiais'
  },
  {
    id: '9',
    question: '📞 Como falo com o suporte?',
    answer: `**Melhor forma:** Abra um ticket na plataforma de suporte

**Também disponível:**
📧 E-mail: suporte@betheleducacao.com.br

**Horário:** Segunda a sexta, 8h30 às 20h
**Tempo de resposta:** Até 24h`,
    category: 'Suporte'
  },
  {
    id: '10',
    question: '🔄 Não consigo fazer login. O que faço?',
    answer: `**Checklist rápido:**
✅ E-mail está correto?
✅ Senha padrão está correta?
✅ Já tentou limpar o cache?
✅ Já testou outro navegador?

**Não resolveu?** Abra um ticket de suporte.`,
    category: 'Acesso'
  },
  {
    id: '11',
    question: '✏️ Posso usar os materiais comercialmente?',
    answer: `**Sim, pode usar para:**
✅ Sua própria marca
✅ Posts do seu negócio
✅ Aplicar estratégias em clientes

**Não pode:**
❌ Revender os materiais originais
❌ Redistribuir PDFs/vídeos
❌ Compartilhar seu acesso`,
    category: 'Uso'
  },
  {
    id: '12',
    question: '🔄 Como renovo meu acesso após 1 ano?',
    answer: `**Com condição especial:**
Entre em contato com o suporte antes ou logo após expirar.

**Sem desconto:**
Recompre pela página de vendas normal.

✅ **Seu histórico e progresso são mantidos ao renovar!**`,
    category: 'Renovação'
  },
  {
    id: '13',
    question: '💰 Produtos com créditos - como funciona?',
    answer: `**Quais produtos:** Script GO, Couply e AutentiQ

**Como funciona:**
• Vem com plano base incluído
• Para funções premium ou uso ilimitado, assine planos maiores
• Upgrades disponíveis dentro da plataforma

**Valores:**
• Script GO: R$ 29,90/mês (plano base)
• Couply: R$ 29,90/mês
• AutentiQ: Valores dentro da plataforma`,
    category: 'Produtos'
  },
  {
    id: '14',
    question: '📧 Não recebi e-mail de confirmação da compra',
    answer: `**Passo a passo:**
1. Verifique spam/lixo eletrônico
2. Aguarde 15 minutos
3. Confirme se pagamento foi aprovado

**Não apareceu?** Abra ticket com:
• Nome completo
• E-mail usado
• Produto comprado
• Comprovante (se tiver)`,
    category: 'Suporte'
  },
  {
    id: '15',
    question: '🎯 Qual a diferença entre os produtos de conteúdo?',
    answer: `**50 Modelos de Conteúdo:**
50 roteiros prontos com exemplos práticos

**100 Ideias de Conteúdo:**
100 sugestões de temas (mais variedade)

**Modelos Prontos:**
Estruturas adaptáveis para diversos formatos

**Máquinas de Conteúdos IA:**
GPT que cria conteúdos personalizados para você

**Método Máquina de Conteúdos:**
Treinamento de como usar IA + 50 modelos juntos

💡 **Dica:** Escolha baseado em: prefere exemplos prontos (50 Modelos), mais variedade (100 Ideias) ou criação com IA (Máquinas IA)?`,
    category: 'Produtos'
  }
];

export const faqCategories = [
  'Todos',
  'Acesso',
  'Pagamento',
  'Materiais',
  'Suporte',
  'Uso',
  'Renovação',
  'Produtos'
];
