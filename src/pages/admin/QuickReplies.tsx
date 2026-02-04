import { useState, useEffect } from 'react';
import { quickReplyService, type QuickReply } from '@/services/quickReply.service';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  Search,
  Copy,
  AlertCircle,
} from 'lucide-react';

export function QuickRepliesPage() {
  const { toast } = useToast();
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [shortcut, setShortcut] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadReplies();
  }, []);

  const loadReplies = async () => {
    try {
      setLoading(true);
      const data = await quickReplyService.getAll(false);
      setReplies(data);
    } catch (error) {
      console.error('Error loading quick replies:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setShortcut('');
    setContent('');
    setCategory('');
    setActive(true);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (reply: QuickReply) => {
    setTitle(reply.title);
    setShortcut(reply.shortcut);
    setContent(reply.content);
    setCategory(reply.category);
    setActive(reply.active);
    setEditingId(reply.id || null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title || !shortcut || !content || !category) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios!",
      });
      return;
    }

    // Validate shortcut format
    if (!shortcut.startsWith('/')) {
      toast({
        variant: "destructive",
        title: "Formato inválido",
        description: "O atalho deve começar com / (ex: /senha)",
      });
      return;
    }

    setSaving(true);
    try {
      const data: Omit<QuickReply, 'id'> = {
        title,
        shortcut,
        content,
        category,
        active,
      };

      if (editingId) {
        await quickReplyService.update(editingId, data);
      } else {
        await quickReplyService.create(data);
      }

      await loadReplies();
      resetForm();
    } catch (error) {
      console.error('Error saving quick reply:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Verifique se o atalho já não existe.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta resposta rápida?')) return;

    try {
      await quickReplyService.delete(id);
      await loadReplies();
    } catch (error) {
      console.error('Error deleting quick reply:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir. Tente novamente.",
      });
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await quickReplyService.toggleActive(id, !currentActive);
      await loadReplies();
    } catch (error) {
      console.error('Error toggling quick reply:', error);
    }
  };

  const handleCopyShortcut = (shortcut: string) => {
    navigator.clipboard.writeText(shortcut);
  };

  const filteredReplies = replies.filter(reply =>
    reply.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reply.shortcut.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reply.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reply.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            Respostas Rápidas
          </h1>
          <p className="text-muted-foreground">
            Configure templates para responder tickets rapidamente
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Resposta
        </Button>
      </div>

      {/* Info Alert */}
      <Card className="glass border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Como usar respostas rápidas?</p>
              <p>
                Digite o atalho (ex: /senha) no campo de mensagem ao responder um ticket.
                O conteúdo será automaticamente preenchido para você editar antes de enviar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      {showForm && (
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle>{editingId ? 'Editar' : 'Nova'} Resposta Rápida</CardTitle>
            <CardDescription>
              Configure uma resposta rápida para usar nos tickets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Recuperação de Senha"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortcut">Atalho *</Label>
                <Input
                  id="shortcut"
                  value={shortcut}
                  onChange={(e) => setShortcut(e.target.value)}
                  placeholder="Ex: /senha"
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                  Deve começar com / (ex: /senha, /acesso)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Acesso, Pagamento, Suporte"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo da Resposta *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite o texto que será usado como resposta..."
                rows={6}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Este texto será inserido ao digitar o atalho
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                disabled={saving}
                className="w-4 h-4"
              />
              <Label htmlFor="active" className="cursor-pointer">
                Ativo (disponível para uso)
              </Label>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={saving}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar respostas rápidas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Carregando...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredReplies.length === 0 ? (
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Zap className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-semibold">
                  {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhuma resposta rápida configurada'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm ? 'Tente outro termo de busca' : 'Adicione sua primeira resposta rápida para começar'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Resposta
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredReplies.map((reply) => (
            <Card
              key={reply.id}
              className={`glass ${reply.active ? '' : 'opacity-60'}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{reply.title}</CardTitle>
                      <Badge variant={reply.active ? 'default' : 'secondary'}>
                        {reply.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Badge variant="outline">{reply.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm px-2 py-1 bg-muted rounded font-mono">
                        {reply.shortcut}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyShortcut(reply.shortcut)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {reply.content}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(reply)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleToggleActive(reply.id!, reply.active)}
                    >
                      {reply.active ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(reply.id!)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default QuickRepliesPage;
