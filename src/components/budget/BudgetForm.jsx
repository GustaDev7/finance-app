import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function BudgetForm({ onSuccess, initialData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    budget: '',
    spent: initialData?.spent || 0, // Assume spent is 0 for new budgets, or from initialData for editing
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category || '',
        budget: initialData.budget || '',
        spent: initialData.spent || 0,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      const budgetData = {
        user_id: user.id,
        category: formData.category,
        budget: parseFloat(formData.budget),
        spent: parseFloat(formData.spent),
      };

      let result;
      if (initialData?.id) {
        result = await supabase.from('budgets').update(budgetData).eq('id', initialData.id);
      } else {
        result = await supabase.from('budgets').insert([budgetData]);
      }

      if (result.error) throw result.error;

      setFormData({
        category: '',
        budget: '',
        spent: 0,
      });

      onSuccess();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Orçamento' : 'Novo Orçamento'}</CardTitle>
        <CardDescription>{initialData ? 'Ajuste os detalhes do seu orçamento.' : 'Crie um novo orçamento para controlar seus gastos.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              type="text"
              placeholder="Ex: Alimentação, Transporte..."
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Valor do Orçamento (R$)</Label>
            <Input
              id="budget"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          {initialData && (
            <div className="space-y-2">
              <Label htmlFor="spent">Valor Gasto (R$)</Label>
              <Input
                id="spent"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.spent}
                onChange={(e) => setFormData({ ...formData, spent: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Criar Orçamento')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

