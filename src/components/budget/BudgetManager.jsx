import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const BudgetCard = ({ budget, spent, onEdit, onDelete }) => {
  const percentage = Math.min((spent / budget.amount) * 100, 100);
  const remaining = Math.max(budget.amount - spent, 0);
  
  const getStatusColor = () => {
    if (percentage >= 100) return 'destructive';
    if (percentage >= 80) return 'warning';
    if (percentage >= 60) return 'secondary';
    return 'success';
  };

  const getStatusIcon = () => {
    if (percentage >= 100) return <AlertTriangle className="h-4 w-4" />;
    if (percentage >= 80) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (percentage >= 100) return 'Orçamento Excedido';
    if (percentage >= 80) return 'Próximo do Limite';
    if (percentage >= 60) return 'Em Andamento';
    return 'Dentro do Orçamento';
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{budget.category}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {budget.period === 'monthly' ? 'Mensal' : 'Anual'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor()} className="flex items-center gap-1">
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => onEdit(budget)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(budget.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progresso</span>
            <span className="text-sm font-bold">
              {percentage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={percentage} 
            className={`h-3 ${
              percentage >= 100 ? 'bg-destructive/20' :
              percentage >= 80 ? 'bg-yellow-500/20' :
              'bg-primary/20'
            }`}
          />
        </div>

        {/* Valores */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Gasto</p>
            <p className="text-sm font-semibold">
              R$ {spent.toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Orçamento</p>
            <p className="text-sm font-semibold">
              R$ {budget.amount.toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {remaining > 0 ? 'Restante' : 'Excesso'}
            </p>
            <p className={`text-sm font-semibold ${
              remaining > 0 ? 'text-chart-2' : 'text-chart-3'
            }`}>
              R$ {Math.abs(budget.amount - spent).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Insights */}
        {percentage >= 80 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              <span className="text-xs font-medium text-yellow-600">Atenção</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {percentage >= 100 
                ? `Você excedeu o orçamento em R$ ${(spent - budget.amount).toLocaleString('pt-BR')}`
                : `Restam apenas R$ ${remaining.toLocaleString('pt-BR')} neste orçamento`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const BudgetForm = ({ budget, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    category: budget?.category || '',
    amount: budget?.amount || '',
    period: budget?.period || 'monthly',
    description: budget?.description || ''
  });

  const categories = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Lazer',
    'Saúde',
    'Educação',
    'Compras',
    'Outros'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...budget,
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select value={formData.category} onValueChange={(value) => 
          setFormData(prev => ({ ...prev, category: value }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Valor do Orçamento</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0,00"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="period">Período</Label>
        <Select value={formData.period} onValueChange={(value) => 
          setFormData(prev => ({ ...prev, period: value }))
        }>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="yearly">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Input
          id="description"
          placeholder="Descrição do orçamento"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {budget ? 'Atualizar' : 'Criar'} Orçamento
        </Button>
      </div>
    </form>
  );
};

export default function BudgetManager() {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Obter usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn("Usuário não logado. Não é possível buscar orçamentos.");
        setLoading(false);
        return;
      }

      // Buscar orçamentos do usuário
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (budgetsError) throw budgetsError;
      setBudgets(budgetsData || []);

      // Buscar transações de despesas do usuário
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense');

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSpentByCategory = (category) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.category === category &&
               transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleSaveBudget = async (budgetData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("Usuário não autenticado");
        return;
      }

      if (budgetData.id) {
        // Atualizar orçamento existente
        const { error } = await supabase
          .from('budgets')
          .update({
            category: budgetData.category,
            amount: budgetData.amount,
            period: budgetData.period,
            description: budgetData.description
          })
          .eq('id', budgetData.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Criar novo orçamento
        const { error } = await supabase
          .from('budgets')
          .insert([{
            user_id: user.id,
            category: budgetData.category,
            amount: budgetData.amount,
            period: budgetData.period,
            description: budgetData.description
          }]);

        if (error) throw error;
      }
      
      setDialogOpen(false);
      setEditingBudget(null);
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("Usuário não autenticado");
        return;
      }

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId)
        .eq('user_id', user.id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Erro ao deletar orçamento:', error);
    }
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setDialogOpen(true);
  };

  const handleAddBudget = () => {
    setEditingBudget(null);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciar Orçamentos</h2>
          <p className="text-muted-foreground">
            Controle seus gastos definindo limites por categoria
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddBudget}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
              </DialogTitle>
            </DialogHeader>
            <BudgetForm
              budget={editingBudget}
              onSave={handleSaveBudget}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total de Orçamentos</span>
            </div>
            <p className="text-2xl font-bold mt-2">{budgets.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-chart-2" />
              <span className="text-sm font-medium">Dentro do Limite</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-chart-2">
              {budgets.filter(b => getSpentByCategory(b.category) / b.amount < 0.8).length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Próximo do Limite</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-yellow-500">
              {budgets.filter(b => {
                const ratio = getSpentByCategory(b.category) / b.amount;
                return ratio >= 0.8 && ratio < 1;
              }).length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-chart-3" />
              <span className="text-sm font-medium">Excedidos</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-chart-3">
              {budgets.filter(b => getSpentByCategory(b.category) / b.amount >= 1).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Orçamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {budgets.map(budget => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            spent={getSpentByCategory(budget.category)}
            onEdit={handleEditBudget}
            onDelete={handleDeleteBudget}
          />
        ))}
      </div>

      {budgets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum orçamento definido</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie seus primeiros orçamentos para controlar melhor seus gastos
            </p>
            <Button onClick={handleAddBudget}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Orçamento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

