import { useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle, Sparkles, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BethelLogo } from '@/components/ui/BethelLogo';
import { AIChat } from '@/components/chat/AIChat';
import { faqData, faqCategories } from '@/data/faq';

export function WelcomePage() {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [ticketSearch, setTicketSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState('Todos');
  const [faqSearchTerm, setFaqSearchTerm] = useState('');

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  // Filter FAQs by category and search term
  const filteredFaqs = faqData.filter((faq) => {
    const matchesCategory = faqCategory === 'Todos' || faq.category === faqCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(faqSearchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTicketSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketSearch.trim()) {
      navigate(`/tickets/${ticketSearch.trim()}/success`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <BethelLogo variant="full" className="text-white" subtitle="Central de Ajuda" />

              {/* Busca de Protocolo */}
              <form onSubmit={handleTicketSearch} className="hidden md:flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    placeholder="Digite o código do protocolo"
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-64"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Buscar
                </button>
              </form>
            </div>

            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/20"
            >
              Login Admin
            </Link>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleTicketSearch} className="md:hidden mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                placeholder="Digite o código do protocolo"
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Buscar
            </button>
          </form>
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

            {/* FAQ Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={faqSearchTerm}
                onChange={(e) => setFaqSearchTerm(e.target.value)}
                placeholder="Buscar nas perguntas frequentes..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {faqCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFaqCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    faqCategory === category
                      ? 'bg-cyan-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* FAQ List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma pergunta encontrada. Tente outro termo de busca.</p>
                </div>
              ) : (
                filteredFaqs.map((faq, index) => (
                  <div
                    key={faq.id}
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
                        <div className="whitespace-pre-wrap">{faq.answer}</div>
                      </div>
                    )}
                  </div>
                ))
              )}
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
                  href="mailto:suporte@betheleducacao.com.br"
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
