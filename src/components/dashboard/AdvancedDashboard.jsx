import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SunburstChart from '@/components/charts/SunburstChart';
import GaugeChart from '@/components/charts/GaugeChart';
import ExpenseHeatmap from '@/components/charts/ExpenseHeatmap';
import FinancialGoals from '@/components/dashboard/FinancialGoals';
import { 
  PieChart, 
  Target, 
  TrendingUp, 
  Calendar,
  Settings,
  Plus,
  BarChart3,
  Trash2,
  Edit,
  TrendingDown

} from 'lucide-react';
import BudgetForm from '@/components/budget/BudgetForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdvancedDashboard({ transactions = [] }) {
  const [budgets, setBudgets] = useState([]);
  const [loadingBudgets, setLoadingBudgets] = useState(true);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoadingBudgets(true);
      const { data, error } = await supabase
        .from('budgets')
        .select('*');

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error.message);
    } finally {
      setLoadingBudgets(false);
    }
  };

  // Processar dados para o Sunburst (categorias de despesas)
  const getCategoryData = () => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryMap = {};
    
    expenses.forEach(transaction => {
      const category = transaction.category || 'Outros';
      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: category,
          value: 0,
          transactions: 0
        };
      }
      categoryMap[category].value += transaction.amount;
      categoryMap[category].transactions += 1;
    });
    
    return Object.values(categoryMap).sort((a, b) => b.value - a.value);
  };



  const getHeatmapData = () => {
    const heatmap = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const date = new Date(t.date).toISOString().split('T')[0];
        if (!heatmap[date]) {
          heatmap[date] = { amount: 0, transactions: 0 };
        }
        heatmap[date].amount += parseFloat(t.amount);
        heatmap[date].transactions += 1;
      }
    });

    const data = [];
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      data.push({
        date: dateString,
        amount: heatmap[dateString]?.amount || 0,
        transactions: heatmap[dateString]?.transactions || 0,
      });
    }
    return data.reverse(); // Para ter os dados em ordem crescente de data
  };

  const categoryData = getCategoryData();
  const heatmapData = getHeatmapData();
  const trendData = getTrendData();
  const insightsData = generateInsights();

  const handleAddBudget = () => {
    setEditingBudget(null);
    setShowBudgetForm(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowBudgetForm(true);
  };

  const handleDeleteBudget = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este orçamento?")) return;
    try {
      const { error } = await supabase.from("budgets").delete().eq("id", id);
      if (error) throw error;
      fetchBudgets();
    } catch (error) {
      console.error("Erro ao excluir orçamento:", error.message);
    }
  };

  const handleBudgetFormSuccess = () => {
    setShowBudgetForm(false);
    fetchBudgets();
  };

  const getTrendData = () => {
    const monthlyData = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthlyData[monthYear].income += parseFloat(t.amount);
      } else {
        monthlyData[monthYear].expense += parseFloat(t.amount);
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const trends = { incomeTrend: 0, expenseTrend: 0, savingsTrend: 0 };

    if (sortedMonths.length >= 2) {
      const lastMonth = monthlyData[sortedMonths[sortedMonths.length - 1]];
      const secondLastMonth = monthlyData[sortedMonths[sortedMonths.length - 2]];

      // Income Trend
      if (secondLastMonth.income > 0) {
        trends.incomeTrend = ((lastMonth.income - secondLastMonth.income) / secondLastMonth.income) * 100;
      }

      // Expense Trend
      if (secondLastMonth.expense > 0) {
        trends.expenseTrend = ((lastMonth.expense - secondLastMonth.expense) / secondLastMonth.expense) * 100;
      }

      // Savings Trend (Balance)
      const lastMonthBalance = lastMonth.income - lastMonth.expense;
      const secondLastMonthBalance = secondLastMonth.income - secondLastMonth.expense;
      if (secondLastMonthBalance !== 0) {
        trends.savingsTrend = ((lastMonthBalance - secondLastMonthBalance) / Math.abs(secondLastMonthBalance)) * 100;
      }
    }
    return trends;
  };

  const generateInsights = () => {
    const insights = [];

    // Insights de Orçamento
    budgets.forEach(budget => {
      if (budget.spent > budget.budget) {
        insights.push({
          type: "warning",
          title: "Orçamento Excedido",
          description: `Você excedeu o orçamento de ${budget.category} em R$ ${(budget.spent - budget.budget).toFixed(2)}. Considere ajustar seus gastos ou seu orçamento.`,
          icon: "TrendingDown",
        });
      } else if (budget.spent / budget.budget >= 0.8) {
        insights.push({
          type: "info",
          title: "Orçamento Próximo do Limite",
          description: `Você já utilizou ${((budget.spent / budget.budget) * 100).toFixed(0)}% do orçamento de ${budget.category}. Fique atento aos próximos gastos.`,
          icon: "Calendar",
        });
      }
    });

    // Insights de Metas
    goals.forEach(goal => {
      const progress = (goal.current_amount / goal.target_amount) * 100;
      if (progress >= 100) {
        insights.push({
          type: "success",
          title: "Meta Alcançada!",
          description: `Parabéns! Você alcançou sua meta de ${goal.name}.`,
          icon: "Target",
        });
      } else if (progress >= 80) {
        insights.push({
          type: "info",
          title: "Meta Quase Lá!",
          description: `Você está muito perto de alcançar sua meta de ${goal.name}. Continue assim!`,
          icon: "TrendingUp",
        });
      }
    });

    // Insights de Gastos (exemplo: maior gasto em uma categoria específica no último mês)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const recentExpenses = transactions.filter(t => t.type === 'expense' && new Date(t.date) > oneMonthAgo);

    const categorySpending = {};
    recentExpenses.forEach(t => {
      const category = t.category || 'Outros';
      categorySpending[category] = (categorySpending[category] || 0) + parseFloat(t.amount);
    });

    let highestSpendingCategory = null;
    let highestSpendingAmount = 0;
    for (const category in categorySpending) {
      if (categorySpending[category] > highestSpendingAmount) {
        highestSpendingAmount = categorySpending[category];
        highestSpendingCategory = category;
      }
    }

    if (highestSpendingCategory && highestSpendingAmount > 0) {
      insights.push({
        type: "info",
        title: "Maior Gasto Recente",
        description: `Sua maior despesa recente foi em ${highestSpendingCategory}, totalizando R$ ${highestSpendingAmount.toFixed(2)} no último mês.`,
        icon: "PieChart",
      });
    }

    return insights;
  };

  const handleAddGoal = () => {
    console.log("Adicionar nova meta");
  };

  const handleEditGoal = (goal) => {
    console.log("Editar meta:", goal);
  };

  return (
    <div className="space-y-6">
      {/* Análise por Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                <CardTitle>Despesas por Categoria</CardTitle>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="relative">
                <SunburstChart data={categoryData} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <PieChart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">Nenhuma despesa categorizada</p>
                <p className="text-sm text-muted-foreground text-center">
                  Adicione transações com categorias para visualizar a distribuição
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controle de Orçamentos */}
        <Card className="card-hover">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Controle de Orçamentos</CardTitle>
              </div>
              <Dialog open={showBudgetForm} onOpenChange={setShowBudgetForm}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleAddBudget}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Orçamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle>
                  </DialogHeader>
                  <BudgetForm onSuccess={handleBudgetFormSuccess} initialData={editingBudget} />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingBudgets ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : budgets.length > 0 ? (
                budgets.map((item, index) => (
                <div key={item.id} className="p-4 border border-border rounded-lg relative">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditBudget(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteBudget(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <GaugeChart
                    value={item.spent}
                    maxValue={item.budget}
                    title={item.category}
                    subtitle={`R$ ${item.spent} de R$ ${item.budget}`}
                    color="oklch(0.6 0.25 280)"
                  />
                </div>
              )))
              : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">Nenhum orçamento definido</p>
                  <p className="text-sm text-muted-foreground text-center">
                    Crie seus primeiros orçamentos para acompanhar seus gastos
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metas Financeiras */}
      <FinancialGoals 
        onAddGoal={handleAddGoal}
        onEditGoal={handleEditGoal}
      />

      {/* Análises Avançadas */}
      <Card className="card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle>Análises Avançadas</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="heatmap" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="heatmap" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Mapa de Calor
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Tendências
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Insights
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="heatmap" className="mt-6">
              <ExpenseHeatmap 
                data={heatmapData}
                title="Padrão de Gastos - Últimos 12 Meses"
              />
            </TabsContent>
            
            <TabsContent value="trends" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Análise de Tendências</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-chart-2/10 rounded-lg border border-chart-2/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-chart-2" />
                      <span className="text-sm font-medium">Receitas</span>
                    </div>
                    <p className="text-2xl font-bold text-chart-2">{trendData.incomeTrend.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">vs. mês anterior</p>
                  </div>
                  
                  <div className="p-4 bg-chart-3/10 rounded-lg border border-chart-3/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-chart-3" />
                      <span className="text-sm font-medium">Despesas</span>
                    </div>
                    <p className="text-2xl font-bold text-chart-3">{trendData.expenseTrend.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">vs. mês anterior</p>
                  </div>
                  
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Economia</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{trendData.savingsTrend.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">vs. mês anterior</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="insights" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Insights Inteligentes</h3>
                {insightsData.length > 0 ? (
                  <div className="space-y-3">
                    {insightsData.map((insight, index) => (
                      <div key={index} className={`p-4 rounded-lg ${insight.type === "warning" ? "bg-yellow-500/5 border border-yellow-500/20" : insight.type === "success" ? "bg-chart-2/5 border border-chart-2/20" : "bg-primary/5 border border-primary/20"}`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${insight.type === "warning" ? "bg-yellow-500/10" : insight.type === "success" ? "bg-chart-2/10" : "bg-primary/10"}`}>
                            {insight.icon === "TrendingUp" && <TrendingUp className={`h-4 w-4 ${insight.type === "warning" ? "text-yellow-500" : insight.type === "success" ? "text-chart-2" : "text-primary"}`} />}
                            {insight.icon === "TrendingDown" && <TrendingDown className={`h-4 w-4 ${insight.type === "warning" ? "text-yellow-500" : insight.type === "success" ? "text-chart-2" : "text-primary"}`} />}
                            {insight.icon === "Target" && <Target className={`h-4 w-4 ${insight.type === "warning" ? "text-yellow-500" : insight.type === "success" ? "text-chart-2" : "text-primary"}`} />}
                            {insight.icon === "Calendar" && <Calendar className={`h-4 w-4 ${insight.type === "warning" ? "text-yellow-500" : insight.type === "success" ? "text-chart-2" : "text-primary"}`} />}
                            {insight.icon === "PieChart" && <PieChart className={`h-4 w-4 ${insight.type === "warning" ? "text-yellow-500" : insight.type === "success" ? "text-chart-2" : "text-primary"}`} />}
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">Nenhum insight disponível</p>
                    <p className="text-sm text-muted-foreground text-center">
                      Adicione transações, orçamentos e metas para gerar insights inteligentes.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
