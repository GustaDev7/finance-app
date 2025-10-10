import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, TrendingDown, Calendar, Tag } from 'lucide-react';

export default function ActivitiesPage() {
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
        .order('date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Erro ao buscar transações:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    });
  };

  const groupTransactionsByDate = () => {
    const grouped = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });
    return grouped;
  };

  const groupedTransactions = groupTransactionsByDate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Atividades Recentes</h1>
        <p className="text-muted-foreground mt-2">
          Histórico completo de todas as suas transações financeiras
        </p>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total de Atividades</span>
            </div>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-chart-2" />
              <span className="text-sm font-medium">Entradas</span>
            </div>
            <p className="text-2xl font-bold text-chart-2">
              {transactions.filter(t => t.type === 'income').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-chart-3" />
              <span className="text-sm font-medium">Saídas</span>
            </div>
            <p className="text-2xl font-bold text-chart-3">
              {transactions.filter(t => t.type === 'expense').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Atividades Agrupadas por Data */}
      <div className="space-y-6">
        {Object.keys(groupedTransactions).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma atividade encontrada</h3>
              <p className="text-muted-foreground text-center">
                Suas transações aparecerão aqui quando você começar a registrá-las
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                  {date}
                </h3>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              <div className="space-y-2">
                {dayTransactions.map((transaction) => (
                  <Card 
                    key={transaction.id} 
                    className="card-hover border-l-4"
                    style={{
                      borderLeftColor: transaction.type === 'income' 
                        ? 'oklch(0.65 0.2 140)' 
                        : 'oklch(0.65 0.25 25)'
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              transaction.type === 'income' 
                                ? 'bg-chart-2/10' 
                                : 'bg-chart-3/10'
                            }`}>
                              {transaction.type === 'income' ? (
                                <TrendingUp className="h-5 w-5 text-chart-2" />
                              ) : (
                                <TrendingDown className="h-5 w-5 text-chart-3" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <p className="font-semibold text-base">
                                {transaction.description || 'Sem descrição'}
                              </p>
                              
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant={transaction.type === 'income' ? 'success' : 'destructive'}
                                  className="text-xs"
                                >
                                  {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                                </Badge>
                                
                                {transaction.category && (
                                  <div className="flex items-center gap-1">
                                    <Tag className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      {transaction.category}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatTime(transaction.date)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`text-xl font-bold ${
                            transaction.type === 'income' ? 'text-chart-2' : 'text-chart-3'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

