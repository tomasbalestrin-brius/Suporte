import { useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BethelLogo } from '@/components/ui/BethelLogo';
import { AIChat } from '@/components/chat/AIChat';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Como acesso minha compra?',
    answer: 'Após a confirmação do pagamento, você receberá um email com as instruções de acesso e suas credenciais. Verifique também sua caixa de spam.',
  },
  {
    question: 'Não recebi o email de acesso, o que faço?',
    answer: 'Primeiro, verifique sua caixa de spam ou lixo eletrônico. Se não encontrar, entre em contato conosco através do chat ou abrindo um ticket com seus dados de compra.',
  },
  {
    question: 'Como recupero minha senha?',
    answer: 'Na tela de login, clique em "Esqueci minha senha" e siga as instruções. Um email será enviado com o link para criar uma nova senha.',
  },
  {
    question: 'Tive problemas com o pagamento, o que fazer?',
    answer: 'Entre em contato conosco informando o número do pedido e forma de pagamento utilizada. Nossa equipe irá verificar e resolver o problema.',
  },
  {
    question: 'Como solicito reembolso?',
    answer: 'Para solicitar reembolso, abra um ticket informando o motivo da solicitação e os dados da sua compra. Analisaremos seu caso conforme nossa política de reembolso.',
  },
  {
    question: 'Quanto tempo demora para receber resposta?',
    answer: 'Nosso tempo médio de resposta é de até 24 horas úteis. Casos urgentes são priorizados automaticamente pelo sistema.',
  },
];

export function WelcomePage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <BethelLogo variant="full" className="text-white" subtitle="Central de Ajuda" />
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/20"
            >
              Login Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Como podemos ajudar você?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Encontre respostas rápidas no nosso FAQ ou converse com nossa IA para ajuda personalizada
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Perguntas Frequentes</h3>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden transition-all hover:bg-white/10"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <span className="text-white font-medium pr-4">{faq.question}</span>
                    {expandedFAQ === index ? (
                      <ChevronUp className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-6 pb-4 text-gray-300 border-t border-white/10 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Chat Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Atendente Sofia</h3>
            </div>

            {/* Chat Component - 600px height */}
            <div className="h-[600px]">
              <AIChat />
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <h4 className="text-lg font-bold text-white mb-4">Precisa de mais ajuda?</h4>
              <div className="space-y-3">
                <Link
                  to="/tickets/new"
                  className="block w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/20 text-center"
                >
                  Abrir Novo Ticket
                </Link>
                <a
                  href="mailto:suporte@bethel.com.br"
                  className="block w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/20 text-center"
                >
                  Enviar Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2025 Suporte Bethel. Todos os direitos reservados.</p>
            <p className="mt-2">Powered by AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
