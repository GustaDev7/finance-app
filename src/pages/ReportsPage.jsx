import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import MonthlyReport from '@/components/MonthlyReport';
import ReportGenerator from '@/components/reports/ReportGenerator';
import BudgetManager from '@/components/budget/BudgetManager';
import AutoCategorizer from '@/components/transactions/AutoCategorizer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Target, Brain, BarChart3 } from 'lucide-react';

export default function ReportsPage() {
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
        .order('date', { ascending: false});

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Erro ao buscar transações:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (transactionId, updates) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId);

      if (error) throw error;
      
      // Atualizar estado local
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? { ...t, ...updates } : t)
      );
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      throw error;
    }
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
        <h1 className="text-3xl font-bold text-foreground">Relatórios e Análises</h1>
        <p className="text-muted-foreground mt-1">
          Análises detalhadas, geração de relatórios e ferramentas avançadas
        </p>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="budgets" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Orçamentos
          </TabsTrigger>
          <TabsTrigger value="categorizer" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Categorização
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Análises
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <ReportGenerator transactions={transactions} />
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <BudgetManager />
        </TabsContent>

        <TabsContent value="categorizer" className="space-y-6">
          <AutoCategorizer 
            transactions={transactions}
            onUpdateTransaction={updateTransaction}
          />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Análise Mensal Detalhada</CardTitle>
              <CardDescription>
                Selecione um mês para ver o relatório detalhado com gráficos e insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyReport transactions={transactions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

