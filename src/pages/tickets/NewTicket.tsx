import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketStore } from '@/store/ticketStore';
import { categoryService } from '@/services/category.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Ticket as TicketIcon } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { validateCPF, validateEmail, validatePhone } from '@/lib/validators';
import type { Category } from '@/types';
import type { CreateTicketDTO } from '@/types/database';

export function NewTicketPage() {
  const navigate = useNavigate();
  const { createTicket } = useTicketStore();
  const { toast } = useToast();

  // Campos do formulário
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [product, setProduct] = useState('');
  const [necessity, setNecessity] = useState(''); // Descrição do problema
  const [category, setCategory] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
      if (data.length > 0) {
        setCategory(data[0].name);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const formatCPF = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);

    // Aplica a máscara XXX.XXX.XXX-XX
    if (limitedNumbers.length <= 3) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 6) {
      return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3)}`;
    } else if (limitedNumbers.length <= 9) {
      return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6)}`;
    } else {
      return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6, 9)}-${limitedNumbers.slice(9)}`;
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCustomerCpf(formatted);
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);

    // Aplica a máscara (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (limitedNumbers.length <= 2) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 6) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
    } else if (limitedNumbers.length <= 10) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
    } else {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setCustomerPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (loading) return;

    // Set loading IMMEDIATELY to prevent double clicks
    setLoading(true);

    try {
      // Validações
      if (!validateEmail(customerEmail)) {
        toast({
          variant: "destructive",
          title: "Email inválido",
          description: "Por favor, insira um email válido.",
        });
        return;
      }

      if (!validateCPF(customerCpf)) {
        toast({
          variant: "destructive",
          title: "CPF inválido",
          description: "Por favor, insira um CPF válido.",
        });
        return;
      }

      if (!validatePhone(customerPhone)) {
        toast({
          variant: "destructive",
          title: "Telefone inválido",
          description: "Por favor, insira um telefone válido com DDD.",
        });
        return;
      }

      const ticketData: Omit<CreateTicketDTO, 'user_id'> = {
        title: `${product} - ${customerName}`,
        description: necessity,
        category,
        priority: 'medium',
        customer_name: customerName,
        customer_email: customerEmail,
        customer_cpf: customerCpf,
        customer_phone: customerPhone,
        product,
      };

      const newTicket = await createTicket(ticketData);

      // Ensure ticket was created before navigating
      if (newTicket && newTicket.id) {
        toast({
          variant: "success",
          title: "Ticket criado com sucesso!",
          description: "Você será redirecionado para acompanhar o atendimento.",
        });

        // Navigate immediately - no need to wait
        navigate(`/tickets/${newTicket.id}/chat`);
      } else {
        throw new Error('Ticket criado mas ID não retornado');
      }
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar ticket",
        description: error.message || 'Ocorreu um erro. Tente novamente.',
      });
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Abrir Ticket de Suporte</h1>
          <p className="text-muted-foreground">
            Preencha os dados abaixo para receber atendimento
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketIcon className="h-5 w-5" />
              Seus Dados
            </CardTitle>
            <CardDescription>
              Informe seus dados para que possamos identificar sua compra
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nome Completo *</Label>
              <Input
                id="customerName"
                placeholder="Ex: João Silva"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email de Compra *</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="seu@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerCpf">CPF *</Label>
                <Input
                  id="customerCpf"
                  placeholder="000.000.000-00"
                  value={customerCpf}
                  onChange={handleCpfChange}
                  required
                  disabled={loading}
                  maxLength={14}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Telefone *</Label>
                <Input
                  id="customerPhone"
                  placeholder="(00) 00000-0000"
                  value={customerPhone}
                  onChange={handlePhoneChange}
                  required
                  disabled={loading}
                  maxLength={15}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product">Produto Adquirido *</Label>
                <Input
                  id="product"
                  placeholder="Ex: Curso de React Avançado"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Tipo de Suporte *</Label>
                <Select value={category} onValueChange={setCategory} required disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Descreva sua Necessidade</CardTitle>
            <CardDescription>
              Conte-nos o que aconteceu e o que você precisa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="necessity">Necessidade / Problema *</Label>
              <Textarea
                id="necessity"
                placeholder="Descreva detalhadamente o que aconteceu e o que você precisa...&#10;&#10;Exemplo: Não consigo acessar o curso após a compra. Já verifiquei meu email mas não recebi as credenciais de acesso."
                value={necessity}
                onChange={(e) => setNecessity(e.target.value)}
                required
                disabled={loading}
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Quanto mais detalhes você fornecer, mais rápida e precisa será nossa resposta.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button
            type="submit"
            size="lg"
            disabled={loading || !category}
            className="flex-1 md:flex-none"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <TicketIcon className="mr-2 h-4 w-4" />
                Abrir Ticket
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </form>

      {/* Informação adicional */}
      <Card className="glass border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>📌 Importante:</strong> Após enviar o ticket, você receberá atendimento automático da nossa IA.
            Ela irá analisar seu problema e buscar na base de conhecimento a melhor solução.
            Se necessário, um atendente humano entrará em contato.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default NewTicketPage;
