import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function GoalForm({ onSuccess, initialData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    current_amount: '',
    target_amount: '',
    deadline: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        current_amount: initialData.current_amount || '',
        target_amount: initialData.target_amount || '',
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
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

      const goalData = {
        user_id: user.id,
        name: formData.name,
        category: formData.category,
        current_amount: parseFloat(formData.current_amount),
        target_amount: parseFloat(formData.target_amount),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      };

      let result;
      if (initialData?.id) {
        result = await supabase.from('goals').update(goalData).eq('id', initialData.id);
      } else {
        result = await supabase.from('goals').insert([goalData]);
      }

      if (result.error) throw result.error;

      setFormData({
        name: '',
        category: '',
        current_amount: '',
        target_amount: '',
        deadline: '',
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
        <CardTitle>{initialData ? 'Editar Meta' : 'Nova Meta Financeira'}</CardTitle>
        <CardDescription>{initialData ? 'Ajuste os detalhes da sua meta.' : 'Crie uma nova meta para acompanhar seu progresso.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Meta</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ex: Reserva de Emergência, Viagem..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              type="text"
              placeholder="Ex: Segurança Financeira, Lazer..."
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_amount">Valor Atual (R$)</Label>
              <Input
                id="current_amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.current_amount}
                onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_amount">Valor Alvo (R$)</Label>
              <Input
                id="target_amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Prazo (Opcional)</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Criar Meta')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

