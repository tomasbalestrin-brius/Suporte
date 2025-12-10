# 🚀 Início Rápido - 5 Minutos

Guia rápido para colocar o sistema no ar em 5 minutos!

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no [Supabase](https://supabase.com) (gratuita)
- API Key do [Google Gemini](https://ai.google.dev)

## ⚡ Instalação Rápida

### 1. Instale as dependências (2 min)

```bash
npm install
```

### 2. Configure o Supabase (2 min)

**a) Crie um projeto no Supabase:**
- Acesse https://supabase.com
- Clique em "New Project"
- Escolha nome e senha

**b) Configure o banco de dados:**
- No Supabase, vá em "SQL Editor"
- Clique em "New Query"
- Cole o conteúdo do arquivo `supabase-schema.sql`
- Clique em "Run"

**c) Copie as credenciais:**
- Vá em "Settings" > "API"
- Copie a "URL" e "anon public" key

### 3. Configure as variáveis de ambiente (30 seg)

Crie um arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
VITE_GEMINI_API_KEY=sua_chave_gemini_aqui
```

### 4. Inicie o sistema (30 seg)

```bash
npm run dev
```

Acesse: http://localhost:5173

## ✅ Primeiro Uso

1. **Registre-se:** Clique em "Registre-se" e crie uma conta
2. **Crie um ticket:** No dashboard, clique em "Novo Ticket"
3. **Converse com a IA:** Abra o ticket criado e comece a conversar!

## 🎯 Funcionalidades Principais

- ✅ **Dashboard:** Visão geral dos tickets
- ✅ **Criar Ticket:** Formulário com análise de IA
- ✅ **Chat IA:** Conversas em tempo real
- ✅ **Status:** Acompanhe o progresso
- ✅ **Filtros:** Busque e filtre tickets

## 🔧 Problemas Comuns

**Erro ao conectar com Supabase:**
- Verifique se a URL e a chave estão corretas no `.env`
- Certifique-se de que executou o script SQL

**IA não responde:**
- Verifique se a VITE_GEMINI_API_KEY está correta
- Confirme que a API Key do Gemini está ativa

**Página em branco:**
- Abra o console do navegador (F12)
- Verifique se há erros
- Confirme que todas as dependências foram instaladas

## 📚 Documentação Completa

Para mais detalhes, consulte o [README.md](./README.md)

## 💡 Dicas

- Use categorias para organizar tickets
- Marque tickets como "Resolvido" quando terminar
- A IA aprende com o contexto da conversa
- Admins podem ver todos os tickets (role='admin' no banco)

---

**Pronto!** Seu sistema de suporte com IA está funcionando! 🎉
