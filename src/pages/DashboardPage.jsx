import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import EnhancedLineChart from '@/components/charts/EnhancedLineChart';
import EnhancedBarChart from '@/components/charts/EnhancedBarChart';
import StatCard from '@/components/dashboard/StatCard';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Erro ao buscar transações:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;
    return { income, expense, balance };
  };

  const getMonthlyData = () => {
    const monthlyMap = {};
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = { month: monthYear, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthlyMap[monthYear].income += t.amount;
      } else {
        monthlyMap[monthYear].expense += t.amount;
      }
    });
    return Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  };

  const { income, expense, balance } = calculateTotals();
  const recentTransactions = transactions.slice(0, 5);
  const monthlyData = getMonthlyData();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatMonthYear = (monthYear) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral das suas finanças</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total de Entradas"
          value={`R$ ${income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Todas as receitas"
          icon={TrendingUp}
          trend="up"
          trendValue=""
          gradientClass="gradient-success"
          borderClass="border-chart-2/20"
        />

        <StatCard
          title="Total de Saídas"
          value={`R$ ${expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Todas as despesas"
          icon={TrendingDown}
          trend="down"
          trendValue=""
          gradientClass="gradient-danger"
          borderClass="border-chart-3/20"
        />

        <StatCard
          title="Saldo Total"
          value={`R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Receitas - Despesas"
          icon={DollarSign}
          trend={balance >= 0 ? "up" : "down"}
          trendValue=""
          gradientClass="gradient-purple"
          borderClass="border-primary/20"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Evolução Mensal
            </CardTitle>
            <CardDescription>Tendência dos últimos 6 meses com área preenchida</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <EnhancedLineChart data={monthlyData} formatMonthYear={formatMonthYear} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-center text-muted-foreground">Nenhum dado disponível</p>
                <p className="text-center text-sm text-muted-foreground mt-1">
                  Adicione transações para visualizar a evolução
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
              <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
              Comparativo Mensal
            </CardTitle>
            <CardDescription>Análise detalhada de entradas vs saídas</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <EnhancedBarChart data={monthlyData} formatMonthYear={formatMonthYear} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <TrendingDown className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-center text-muted-foreground">Nenhum dado disponível</p>
                <p className="text-center text-sm text-muted-foreground mt-1">
                  Adicione transações para visualizar o comparativo
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transações Recentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>Últimas 5 transações registradas</CardDescription>
          </div>
          <Link to="/transactions">
            <Button variant="ghost" size="sm">
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma transação encontrada. Adicione sua primeira transação!
            </p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{transaction.description || 'Sem descrição'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                      </span>
                      {transaction.category && (
                        <span className="text-xs text-muted-foreground">
                          {transaction.category}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(transaction.date)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-lg font-bold ${
                      transaction.type === 'income' ? 'text-chart-2' : 'text-chart-3'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
        )}
      </CardContent>
    </Card>


  </div>
);
}

