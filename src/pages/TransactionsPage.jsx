import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transações</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gerencie todas as suas entradas e saídas</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          {showForm ? 'Cancelar' : 'Nova Transação'}
        </Button>
      </div>

      {showForm && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <TransactionForm
            onSuccess={() => {
              fetchTransactions();
              setShowForm(false);
            }}
          />
        </div>
      )}

      <TransactionList
        transactions={transactions}
        loading={loading}
        onUpdate={fetchTransactions}
      />
    </div>
  );
}

