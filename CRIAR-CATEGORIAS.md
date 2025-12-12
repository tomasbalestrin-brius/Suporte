# Como Adicionar as Categorias de Suporte

As categorias já estão configuradas no sistema, mas você precisa criar a tabela no banco de dados Supabase.

## Passo a Passo:

### 1. Acesse o Supabase
- Entre em https://supabase.com
- Acesse seu projeto: **vopttekniimrfjlhmxfd**

### 2. Abra o SQL Editor
- No menu lateral, clique em **SQL Editor**
- Clique em **New Query**

### 3. Cole e Execute o SQL
Copie TODO o conteúdo do arquivo `add-categories-table.sql` e cole no editor SQL, depois clique em **Run** ou pressione **Ctrl+Enter**.

## Resultado Esperado

Após executar, você terá 6 categorias criadas:

- ✅ Acesso à Plataforma
- ✅ Pagamento
- ✅ Certificado
- ✅ Conteúdo do Curso
- ✅ Suporte Técnico
- ✅ Outros

## Verificar

Você pode verificar executando este SQL:

```sql
SELECT name, description FROM categories ORDER BY order_index;
```

Ou na interface do Supabase:
- Vá em **Table Editor**
- Selecione a tabela **categories**
- Você verá as 6 categorias listadas

---

**Importante:** Após executar o SQL, as categorias aparecerão automaticamente no formulário de abertura de ticket, no campo "Tipo de Suporte".
