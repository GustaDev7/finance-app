import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MonthlyReport({ transactions }) {
  const [selectedMonth, setSelectedMonth] = useState('');

  const months = useMemo(() => {
    const monthSet = new Set();
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthSet.add(monthYear);
    });
    return Array.from(monthSet).sort().reverse();
  }, [transactions]);

  useMemo(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0]);
    }
  }, [months, selectedMonth]);

  const monthlyData = useMemo(() => {
    if (!selectedMonth) return { income: 0, expense: 0, balance: 0, chartData: [] };

    const filtered = transactions.filter((t) => {
      const date = new Date(t.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthYear === selectedMonth;
    });

    const income = filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;

    const categoryData = {};
    filtered.forEach((t) => {
      const cat = t.category || 'Sem categoria';
      if (!categoryData[cat]) {
        categoryData[cat] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        categoryData[cat].income += t.amount;
      } else {
        categoryData[cat].expense += t.amount;
      }
    });

    const chartData = Object.entries(categoryData).map(([category, data]) => ({
      category,
      Entradas: data.income,
      Saídas: data.expense,
    }));

    return { income, expense, balance, chartData };
  }, [transactions, selectedMonth]);

  const formatMonthYear = (monthYear) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
        {months.length > 0 ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecione o mês</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {formatMonthYear(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium text-green-800 dark:text-green-200">Entradas</span>
                <span className="text-lg font-bold text-green-900 dark:text-green-100">
                  R$ {monthlyData.income.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="text-sm font-medium text-red-800 dark:text-red-200">Saídas</span>
                <span className="text-lg font-bold text-red-900 dark:text-red-100">
                  R$ {monthlyData.expense.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Saldo</span>
                <span
                  className={`text-lg font-bold ${
                    monthlyData.balance >= 0
                      ? 'text-blue-900 dark:text-blue-100'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  R$ {monthlyData.balance.toFixed(2)}
                </span>
              </div>
            </div>

            {monthlyData.chartData.length > 0 && (
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-3">Por Categoria</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Entradas" fill="#10b981" />
                    <Bar dataKey="Saídas" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhum dado disponível. Adicione transações para ver os relatórios.
          </p>
        )}
    </div>
  );
}

