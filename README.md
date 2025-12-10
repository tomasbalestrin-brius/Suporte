# 🎯 Sistema de Suporte Automatizado com IA

Sistema completo de tickets de suporte com chat integrado usando Inteligência Artificial (OpenAI GPT ou Google Gemini) para responder automaticamente às dúvidas dos alunos.

![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)

## ✨ Funcionalidades

### 🎨 Interface Moderna
- Design dark mode profissional inspirado no código fornecido
- Tema cyan/azul com gradientes customizados
- Componentes glassmorphism
- Totalmente responsivo

### 🤖 Chat com IA
- Respostas automáticas usando Google Gemini AI
- Análise inteligente de tickets para categorização e priorização
- Sugestões automáticas de resposta

### 📊 Dashboard Completo
- Estatísticas de tickets (Total, Abertos, Em Andamento, Resolvidos)
- Visualização de tickets recentes
- Cards informativos com métricas

### 🎫 Sistema de Tickets
- Criar, visualizar, editar e acompanhar tickets
- Status: Aberto, Em Andamento, Resolvido, Fechado
- Prioridades: Baixa, Média, Alta, Urgente
- Categorias customizáveis
- Filtros e busca avançada

### 💬 Chat em Tempo Real
- Conversas integradas em cada ticket
- Mensagens em tempo real com Supabase Realtime
- Interface de chat intuitiva
- Histórico completo de conversas

### 🔐 Autenticação Segura
- Sistema de login e registro
- Autenticação via Supabase Auth
- Rotas protegidas
- Gestão de perfil de usuário

## 🚀 Tecnologias

- **Frontend:**
  - React 18 + TypeScript
  - Vite (Build tool)
  - React Router DOM (Navegação)
  - Zustand (State management)
  - Tailwind CSS (Estilização)
  - Radix UI (Componentes acessíveis)
  - Lucide React (Ícones)

- **Backend:**
  - Supabase (Database + Auth + Realtime)
  - PostgreSQL (Database)
  - Row Level Security (RLS)

- **IA:**
  - Google Gemini API

## 📋 Pré-requisitos

- Node.js 18+
- NPM ou Yarn
- Conta no Supabase
- Chave da API Google Gemini

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd Suporte
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Acesse o SQL Editor e execute o script `supabase-schema.sql`
3. Copie as credenciais do projeto (URL e Anon Key)

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase

# Google Gemini
VITE_GEMINI_API_KEY=sua_chave_gemini
```

### 5. Execute o projeto

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas

#### `users`
- `id` - UUID (referência ao auth.users)
- `email` - Email do usuário
- `name` - Nome completo
- `role` - Papel (admin/student)
- `avatar_url` - URL do avatar
- `created_at` - Data de criação

#### `tickets`
- `id` - UUID
- `user_id` - ID do usuário
- `title` - Título do ticket
- `description` - Descrição detalhada
- `status` - Status (open/in_progress/resolved/closed)
- `priority` - Prioridade (low/medium/high/urgent)
- `category` - Categoria
- `created_at` - Data de criação
- `updated_at` - Data de atualização
- `resolved_at` - Data de resolução

#### `messages`
- `id` - UUID
- `ticket_id` - ID do ticket
- `user_id` - ID do usuário (null se for IA)
- `content` - Conteúdo da mensagem
- `is_ai` - Boolean (true se for mensagem da IA)
- `created_at` - Data de criação

#### `categories`
- `id` - UUID
- `name` - Nome da categoria
- `description` - Descrição
- `icon` - Ícone (nome do Lucide React)
- `color` - Cor
- `created_at` - Data de criação

## 🔒 Segurança

O sistema implementa Row Level Security (RLS) no Supabase:

- ✅ Usuários só podem ver seus próprios tickets
- ✅ Usuários só podem criar tickets em seu próprio nome
- ✅ Admins podem ver e gerenciar todos os tickets
- ✅ Mensagens são protegidas pelo ticket associado
- ✅ Categorias são públicas para leitura, admin para escrita

## 🎨 Tema e Personalização

O tema é baseado no código fornecido com:

- **Background:** `#0f172a` (slate-900)
- **Primary:** Cyan (`hsl(195 100% 43%)`)
- **Secondary:** Roxo (`hsl(262 75% 62%)`)
- **Accent:** Azul (`hsl(217 91% 60%)`)
- **Gradientes customizados**
- **Glass effects**

Para personalizar, edite `src/index.css` e `tailwind.config.js`

## 🤖 Configuração da IA

### Google Gemini

1. Obtenha sua API key em [ai.google.dev](https://ai.google.dev)
2. Adicione ao `.env`: `VITE_GEMINI_API_KEY=sua_chave_aqui`
3. O sistema usa o modelo `gemini-pro` por padrão
4. A API do Gemini é gratuita para uso moderado

## 📱 Páginas

### `/login` - Login
Página de autenticação com email e senha

### `/register` - Registro
Criação de nova conta de estudante

### `/dashboard` - Dashboard
Visão geral com estatísticas e tickets recentes

### `/tickets` - Lista de Tickets
Todos os tickets do usuário com filtros e busca

### `/tickets/new` - Novo Ticket
Formulário para criar novo ticket com análise de IA

### `/tickets/:id` - Detalhes do Ticket
Chat em tempo real com IA e detalhes completos

## 🌐 Deploy

### Vercel (Recomendado)

```bash
npm run build
# Deploy da pasta dist/ na Vercel
```

### Netlify

```bash
npm run build
# Deploy da pasta dist/ na Netlify
```

**Importante:** Configure as variáveis de ambiente no serviço de deploy!

## 🔧 Troubleshooting

### Erro de autenticação
- Verifique se as credenciais do Supabase estão corretas
- Confirme que o RLS está configurado corretamente

### IA não responde
- Verifique se a VITE_GEMINI_API_KEY está configurada
- Confirme que a API Key do Gemini está ativa
- Veja os logs no console do navegador

### Mensagens não aparecem em tempo real
- Verifique se o Supabase Realtime está habilitado
- Confirme as políticas de RLS nas tabelas

## 📄 Licença

MIT

## 👨‍💻 Desenvolvido por

Sistema criado com base no design fornecido, utilizando as melhores práticas de desenvolvimento React e TypeScript.

---

**Dica:** Para primeiro uso, registre uma conta e crie alguns tickets de teste para explorar todas as funcionalidades!

## 🎯 Próximos Passos

- [ ] Adicionar suporte para anexos de arquivos
- [ ] Implementar notificações por email
- [ ] Dashboard administrativo
- [ ] Métricas e relatórios avançados
- [ ] Sistema de tags
- [ ] Exportação de tickets
- [ ] Modo claro (light mode)