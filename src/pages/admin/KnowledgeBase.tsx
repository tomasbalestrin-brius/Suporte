import { useState, useEffect } from 'react';
import { knowledgeService } from '@/services/knowledge.service';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  Loader2,
  Tag
} from 'lucide-react';
import type { KnowledgeBase } from '@/types';

export function KnowledgeBasePage() {
  const { toast } = useToast();
  const [knowledge, setKnowledge] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [keywords, setKeywords] = useState('');
  const [product, setProduct] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      setLoading(true);
      const data = await knowledgeService.getAll(false); // Get all, including inactive
      setKnowledge(data);
    } catch (error) {
      console.error('Error loading knowledge:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setContent('');
    setKeywords('');
    setProduct('');
    setActive(true);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item: KnowledgeBase) => {
    setTitle(item.title);
    setCategory(item.category);
    setContent(item.content);
    setKeywords(item.keywords.join(', '));
    setProduct(item.product || '');
    setActive(item.active);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title || !category || !content) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios!",
      });
      return;
    }

    setSaving(true);
    try {
      const keywordsArray = keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const data = {
        title,
        category,
        content,
        keywords: keywordsArray,
        product: product || undefined,
        active,
      };

      if (editingId) {
        await knowledgeService.update(editingId, data);
      } else {
        await knowledgeService.create(data as any);
      }

      await loadKnowledge();
      resetForm();
    } catch (error) {
      console.error('Error saving knowledge:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar. Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este conhecimento?')) return;

    try {
      await knowledgeService.delete(id);
      await loadKnowledge();
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir. Tente novamente.",
      });
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await knowledgeService.toggleActive(id, !currentActive);
      await loadKnowledge();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const filteredKnowledge = knowledge.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Base de Conhecimento
          </h1>
          <p className="text-muted-foreground">
            Gerencie o conhecimento que a IA usa para responder tickets
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Conhecimento
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle>{editingId ? 'Editar' : 'Novo'} Conhecimento</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para adicionar conhecimento à base da IA
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
                  placeholder="Ex: Como acessar o produto"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Acesso, Financeiro, Dúvida"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo / Resposta *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Descreva a solução ou resposta que a IA deve fornecer..."
                rows={6}
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">
                  Palavras-chave (separadas por vírgula) *
                </Label>
                <Input
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Ex: acesso, login, entrar, não consigo"
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                  A IA usa essas palavras para encontrar o conhecimento relevante
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Produto (opcional)</Label>
                <Input
                  id="product"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="Ex: Curso React Avançado"
                  disabled={saving}
                />
              </div>
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
                Ativo (disponível para a IA usar)
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
              placeholder="Buscar conhecimento..."
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
        ) : filteredKnowledge.length === 0 ? (
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-semibold">
                  {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum conhecimento ainda'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'Tente outro termo de busca' : 'Adicione conhecimento para a IA usar'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredKnowledge.map((item) => (
            <Card
              key={item.id}
              className={`glass ${!item.active ? 'opacity-60' : ''}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <Badge variant={item.active ? 'default' : 'secondary'}>
                        {item.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Badge variant="outline">{item.category}</Badge>
                      {item.product && (
                        <Badge variant="outline" className="bg-purple-500/10">
                          {item.product}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {item.content}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleToggleActive(item.id, item.active)}
                    >
                      {item.active ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  {item.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default KnowledgeBasePage;
