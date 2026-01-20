# 🤖 Configuração da Sofia - Atendente Virtual AI

## ⚙️ Como Ativar a Sofia

A Sofia é a atendente virtual baseada em IA que responde automaticamente as mensagens dos clientes. Para ativá-la, você precisa configurar a API da OpenAI.

## 📋 Passo a Passo

### 1. Obter Chave da API OpenAI

1. Acesse: https://platform.openai.com/api-keys
2. Faça login ou crie uma conta
3. Clique em **"Create new secret key"**
4. Copie a chave gerada (ela começa com `sk-...`)
5. **IMPORTANTE**: Guarde a chave em local seguro, ela só aparece uma vez!

### 2. Configurar no Projeto

1. Na raiz do projeto, crie um arquivo `.env` (copie do `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Abra o arquivo `.env` e adicione sua chave da OpenAI:
   ```env
   VITE_OPENAI_API_KEY=sk-sua-chave-aqui
   ```

3. Salve o arquivo

4. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### 3. Verificar se Funcionou

1. Acesse o chat da Sofia no sistema
2. Envie uma mensagem de teste
3. A Sofia deve responder automaticamente

## ❌ Se a Sofia Não Estiver Configurada

Quando a chave da API não está configurada, a Sofia mostra uma mensagem amigável orientando o usuário a abrir um ticket de suporte:

> "Olá! No momento estou em manutenção. Para receber atendimento imediato, recomendo que você abra um ticket de suporte. Nossa equipe responderá em até 24 horas. 😊"

Um aviso visual também aparece no topo do chat indicando que o atendimento por IA está temporariamente indisponível.

## 💰 Custos

- **Modelo usado**: GPT-3.5-Turbo
- **Custo aproximado**: $0.002 por 1.000 tokens
- **Estimativa**: Cerca de $0.01 a $0.05 por conversa (muito barato!)

## 🔒 Segurança

- **NUNCA** commite o arquivo `.env` no git
- O arquivo `.env` já está no `.gitignore`
- Guarde suas chaves API em local seguro
- Se a chave vazar, delete-a imediatamente em https://platform.openai.com/api-keys

## 🎯 Personalização

A personalidade e comportamento da Sofia podem ser ajustados em:
- **Arquivo**: `src/services/ai.service.ts`
- **Variável**: `SYSTEM_PROMPT`

## ⚠️ Solução de Problemas

### Erro: "quota exceeded" ou limite atingido
- Você atingiu o limite de uso gratuito da OpenAI
- Adicione um método de pagamento em: https://platform.openai.com/account/billing

### Erro: "Incorrect API key"
- Verifique se copiou a chave completa
- Certifique-se de que a chave começa com `sk-`
- Confira se não há espaços extras no `.env`

### Sofia não responde
1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Confirme que a variável `VITE_OPENAI_API_KEY` está configurada
3. Reinicie o servidor após adicionar a chave
4. Verifique o console do navegador para erros

## 📚 Mais Informações

- [Documentação OpenAI](https://platform.openai.com/docs)
- [Pricing OpenAI](https://openai.com/pricing)
- [API Keys OpenAI](https://platform.openai.com/api-keys)
