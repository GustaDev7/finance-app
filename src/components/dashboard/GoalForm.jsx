import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

  // Função auxiliar para formatar números (ex: 1234.56 -> 1.234,56)
  const formatCurrency = (value) => {
    if (!value) return '';
    // Remove caracteres não numéricos exceto a vírgula ou ponto
    const cleaned = value.replace(/[^\d.,]/g, '');

    // Se já estiver no formato correto, apenas retorna
    if (!cleaned.includes(',')) {
      return cleaned.replace(/\./g, ',');
    }
    return cleaned;
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        // Garante que os valores iniciais sejam formatados para vírgula
        current_amount: formatCurrency(String(initialData.current_amount || 0)),
        target_amount: formatCurrency(String(initialData.target_amount || 0)),
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        name: '',
        category: '',
        current_amount: '',
        target_amount: '',
        deadline: '',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado. Por favor, faça login novamente.');

      // Função para limpar e converter o formato R$ para um número válido (troca , por .)
      const cleanAndParseFloat = (value) => {
        if (!value) return 0;
        return parseFloat(value.replace(/\./g, '').replace(',', '.'));
      };

      const goalData = {
        user_id: user.id,
        name: formData.name,
        category: formData.category,
        // USANDO A FUNÇÃO DE CONVERSÃO PARA O BANCO DE DADOS
        current_amount: cleanAndParseFloat(formData.current_amount),
        target_amount: cleanAndParseFloat(formData.target_amount),
        deadline: formData.deadline ? new Date(formData.deadline + 'T00:00:00').toISOString() : null,
      };

      if (goalData.target_amount <= 0) {
        throw new Error('O valor alvo da meta deve ser maior que zero.');
      }

      let result;
      if (initialData?.id) {
        result = await supabase.from('goals').update(goalData).eq('id', initialData.id).select();
      } else {
        result = await supabase.from('goals').insert([goalData]).select();
      }

      if (result.error) throw result.error;

      onSuccess();
    } catch (e) {
      console.error("Erro ao salvar meta:", e);
      setError(e.message || 'Ocorreu um erro desconhecido ao salvar a meta.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Função para lidar com a formatação em tempo real no input (opcional, mas melhora a UX)
  const handleNumericChange = (e, field) => {
    const { value } = e.target;
    // Permite apenas números, ponto, e vírgula
    let cleanedValue = value.replace(/[^\d,.]/g, '');

    // Se houver mais de uma vírgula, usa apenas a última.
    const parts = cleanedValue.split(',');
    if (parts.length > 2) {
      cleanedValue = parts[0] + ',' + parts.slice(1).join('');
    }

    setFormData({ ...formData, [field]: cleanedValue });
  };


  return (
    <div className="p-0">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Meta</Label>
          <Input
            id="name"
            type="text"
            placeholder="Ex: Reserva de Emergência, Viagem..."
            value={formData.name}
            onChange={handleChange}
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
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="current_amount">Valor Atual (R$)</Label>
            <Input
              id="current_amount"
              type="text" // 🛑 CORRIGIDO: De 'number' para 'text'
              step="0.01"
              placeholder="0,00" // Usando vírgula no placeholder
              value={formData.current_amount}
              onChange={(e) => handleNumericChange(e, 'current_amount')} // Novo handler para formatação
              inputMode="decimal" // Melhor usabilidade em mobile
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_amount">Valor Alvo (R$)</Label>
            <Input
              id="target_amount"
              type="text" // 🛑 CORRIGIDO: De 'number' para 'text'
              step="0.01"
              placeholder="0,00"
              value={formData.target_amount}
              onChange={(e) => handleNumericChange(e, 'target_amount')} // Novo handler para formatação
              inputMode="decimal" // Melhor usabilidade em mobile
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
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erro ao Salvar</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Criar Meta')}
        </Button>
      </form>
    </div>
  );
}
