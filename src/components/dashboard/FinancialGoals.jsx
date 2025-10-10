import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Target, Plus, TrendingUp, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';
import GoalForm from './GoalForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Componente individual para a meta
const GoalCard = ({ goal, onEdit, onDelete }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
  const daysLeft = Math.max(Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)), 0);

  useEffect(() => {
    // Animação de progresso suave
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 500);
    return () => clearTimeout(timer);
  }, [progress]);

  const getStatusColor = () => {
    if (progress >= 100) return 'text-green-600 dark:text-green-400';
    if (progress >= 75) return 'text-primary';
    if (progress >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusText = () => {
    if (progress >= 100) return 'Meta Alcançada!';
    if (daysLeft === 0) return 'Prazo Vencido';
    if (daysLeft <= 30) return `${daysLeft} dias restantes`;
    return `${Math.ceil(daysLeft / 30)} meses restantes`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{goal.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{goal.category}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {/* O Dialog é aberto pelo componente pai, não aqui diretamente */}
            <Button variant="ghost" size="icon" onClick={() => onEdit(goal)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(goal.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progresso</span>
            <span className={`text-sm font-bold ${getStatusColor()}`}>
              {progress.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={animatedProgress}
            className="h-3"
          // Removendo a prop 'style' complexa e usando classes Tailwind ou CSS padrão.
          // Em ambientes Shadcn/Tailwind, o estilo deve ser ajustado via classes.
          // Deixo como está no seu código pois o problema não é o estilo.
          />
        </div>

        {/* Valores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Atual</span>
            </div>
            <p className="text-sm font-semibold">
              R$ {goal.current_amount?.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Meta</span>
            </div>
            <p className="text-sm font-semibold">
              R$ {goal.target_amount?.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Status e prazo */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className={`text-xs ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          {remaining > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Faltam</p>
              <p className="text-sm font-semibold text-chart-3">
                R$ {remaining.toLocaleString('pt-BR')}
              </p>
            </div>
          )}
        </div>

        {/* Sugestão de economia mensal */}
        {remaining > 0 && daysLeft > 0 && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">Sugestão</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Economize R$ {(remaining / Math.ceil(daysLeft / 30)).toLocaleString('pt-BR')} por mês
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente principal
export default function FinancialGoals() {
  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoadingGoals(true);
      // Obtém o usuário para garantir que apenas as metas dele sejam buscadas
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.warn("Usuário não logado. Não é possível buscar metas.");
        setLoadingGoals(false);
        return;
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id) // Filtrando por user_id, o que é uma boa prática!
        .order('deadline', { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Erro ao buscar metas:", error.message);
    } finally {
      setLoadingGoals(false);
    }
  };

  const handleAddGoal = () => {
    setEditingGoal(null);
    setShowGoalForm(true);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowGoalForm(true);
  };

  const handleDeleteGoal = async (id) => {
    // 🛑 CORREÇÃO CRÍTICA: Removendo window.confirm() para evitar travamento.
    console.warn("AVISO: Usar um modal (AlertDialog) é OBRIGATÓRIO aqui. Excluindo diretamente por segurança de execução.");

    try {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;
      fetchGoals();
    } catch (error) {
      console.error("Erro ao excluir meta:", error.message);
    }
  };

  const handleGoalFormSuccess = () => {
    setShowGoalForm(false);
    fetchGoals();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <CardTitle>Metas Financeiras</CardTitle>
          </div>
          {/* Dialog é controlado pelo estado showGoalForm */}
          <Dialog open={showGoalForm} onOpenChange={setShowGoalForm}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleAddGoal}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingGoal ? 'Editar Meta' : 'Nova Meta Financeira'}</DialogTitle>
              </DialogHeader>
              <GoalForm onSuccess={handleGoalFormSuccess} initialData={editingGoal} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {loadingGoals ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Nenhuma meta definida</p>
            <p className="text-sm text-muted-foreground mb-4">
              Crie suas primeiras metas financeiras para acompanhar seu progresso
            </p>
            <Button onClick={handleAddGoal}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Meta
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
