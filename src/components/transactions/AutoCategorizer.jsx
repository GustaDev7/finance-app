import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Check, 
  X, 
  Zap, 
  TrendingUp,
  Tag,
  RefreshCw
} from 'lucide-react';

// Sistema de categorização baseado em palavras-chave
const CATEGORY_RULES = {
  'Alimentação': [
    'restaurante', 'lanchonete', 'padaria', 'supermercado', 'mercado', 'açougue',
    'pizzaria', 'hamburgueria', 'ifood', 'uber eats', 'delivery', 'comida',
    'café', 'bar', 'pub', 'sorveteria', 'doceria', 'confeitaria'
  ],
  'Transporte': [
    'uber', 'taxi', '99', 'combustível', 'gasolina', 'etanol', 'diesel',
    'estacionamento', 'pedágio', 'ônibus', 'metrô', 'trem', 'passagem',
    'oficina', 'mecânico', 'pneu', 'óleo', 'revisão', 'ipva', 'seguro auto'
  ],
  'Moradia': [
    'aluguel', 'condomínio', 'iptu', 'luz', 'energia', 'água', 'gás',
    'internet', 'telefone', 'limpeza', 'manutenção', 'reforma', 'móveis',
    'decoração', 'eletrodomésticos', 'construção', 'material construção'
  ],
  'Saúde': [
    'farmácia', 'remédio', 'medicamento', 'médico', 'consulta', 'exame',
    'dentista', 'laboratório', 'hospital', 'clínica', 'plano saúde',
    'seguro saúde', 'fisioterapia', 'psicólogo', 'nutricionista'
  ],
  'Lazer': [
    'cinema', 'teatro', 'show', 'evento', 'festa', 'viagem', 'hotel',
    'pousada', 'turismo', 'parque', 'clube', 'academia', 'esporte',
    'jogo', 'streaming', 'netflix', 'spotify', 'entretenimento'
  ],
  'Educação': [
    'escola', 'faculdade', 'universidade', 'curso', 'livro', 'material escolar',
    'mensalidade', 'matrícula', 'professor', 'aula', 'treinamento',
    'certificação', 'workshop', 'seminário'
  ],
  'Compras': [
    'loja', 'shopping', 'roupa', 'calçado', 'acessório', 'perfume',
    'cosmético', 'eletrônico', 'celular', 'computador', 'presente',
    'gift', 'amazon', 'mercado livre', 'magazine', 'casas bahia'
  ],
  'Serviços': [
    'banco', 'cartão', 'financiamento', 'empréstimo', 'seguro',
    'advogado', 'contador', 'consultoria', 'manutenção', 'reparo',
    'limpeza', 'jardinagem', 'pet shop', 'veterinário'
  ]
};

const AutoCategorizer = ({ transactions, onCategorize, onUpdateTransaction }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    categorized: 0,
    uncategorized: 0,
    accuracy: 0
  });

  useEffect(() => {
    analyzePendingTransactions();
    calculateStats();
  }, [transactions]);

  const analyzePendingTransactions = () => {
    const uncategorized = transactions.filter(t => !t.category || t.category === 'Outros');
    const newSuggestions = uncategorized.map(transaction => ({
      transaction,
      suggestedCategory: categorizeTransaction(transaction),
      confidence: calculateConfidence(transaction)
    })).filter(s => s.suggestedCategory && s.confidence > 0.3);

    setSuggestions(newSuggestions);
  };

  const categorizeTransaction = (transaction) => {
    const description = transaction.description?.toLowerCase() || '';
    const merchant = transaction.merchant?.toLowerCase() || '';
    const text = `${description} ${merchant}`;

    let bestMatch = null;
    let bestScore = 0;

    Object.entries(CATEGORY_RULES).forEach(([category, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        if (text.includes(keyword.toLowerCase())) {
          return acc + 1;
        }
        return acc;
      }, 0);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = category;
      }
    });

    return bestMatch;
  };

  const calculateConfidence = (transaction) => {
    const description = transaction.description?.toLowerCase() || '';
    const merchant = transaction.merchant?.toLowerCase() || '';
    const text = `${description} ${merchant}`;

    if (text.length < 3) return 0;

    let maxMatches = 0;
    Object.values(CATEGORY_RULES).forEach(keywords => {
      const matches = keywords.filter(keyword => 
        text.includes(keyword.toLowerCase())
      ).length;
      maxMatches = Math.max(maxMatches, matches);
    });

    return Math.min(maxMatches / 3, 1); // Normalizar entre 0 e 1
  };

  const calculateStats = () => {
    const total = transactions.length;
    const categorized = transactions.filter(t => t.category && t.category !== 'Outros').length;
    const uncategorized = total - categorized;
    const accuracy = total > 0 ? (categorized / total) * 100 : 0;

    setStats({ total, categorized, uncategorized, accuracy });
  };

  const handleAcceptSuggestion = async (suggestion) => {
    try {
      await onUpdateTransaction(suggestion.transaction.id, {
        category: suggestion.suggestedCategory
      });
      
      setSuggestions(prev => prev.filter(s => s.transaction.id !== suggestion.transaction.id));
    } catch (error) {
      console.error('Erro ao aceitar sugestão:', error);
    }
  };

  const handleRejectSuggestion = (suggestion) => {
    setSuggestions(prev => prev.filter(s => s.transaction.id !== suggestion.transaction.id));
  };

  const handleCategorizeManually = async (suggestion, newCategory) => {
    try {
      await onUpdateTransaction(suggestion.transaction.id, {
        category: newCategory
      });
      
      setSuggestions(prev => prev.filter(s => s.transaction.id !== suggestion.transaction.id));
    } catch (error) {
      console.error('Erro ao categorizar manualmente:', error);
    }
  };

  const handleBulkCategorize = async () => {
    setProcessing(true);
    try {
      const highConfidenceSuggestions = suggestions.filter(s => s.confidence > 0.7);
      
      for (const suggestion of highConfidenceSuggestions) {
        await onUpdateTransaction(suggestion.transaction.id, {
          category: suggestion.suggestedCategory
        });
      }
      
      setSuggestions(prev => prev.filter(s => s.confidence <= 0.7));
    } catch (error) {
      console.error('Erro na categorização em lote:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-chart-2 text-white';
    if (confidence >= 0.6) return 'bg-yellow-500 text-white';
    return 'bg-chart-3 text-white';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Média';
    return 'Baixa';
  };

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Categorização Inteligente</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={analyzePendingTransactions}
                disabled={processing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
                Reanalizar
              </Button>
              {suggestions.filter(s => s.confidence > 0.7).length > 0 && (
                <Button 
                  size="sm" 
                  onClick={handleBulkCategorize}
                  disabled={processing}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Categorizar Automaticamente
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total de Transações</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-chart-2">{stats.categorized}</p>
              <p className="text-sm text-muted-foreground">Categorizadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-chart-3">{stats.uncategorized}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.accuracy.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Precisão</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sugestões de Categorização */}
      {suggestions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Sugestões de Categorização ({suggestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div key={suggestion.transaction.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {suggestion.transaction.description || 'Sem descrição'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        R$ {suggestion.transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        {' • '}
                        {new Date(suggestion.transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge className={getConfidenceColor(suggestion.confidence)}>
                      {getConfidenceText(suggestion.confidence)} ({(suggestion.confidence * 100).toFixed(0)}%)
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Sugestão:</span>
                      <Badge variant="outline">{suggestion.suggestedCategory}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select onValueChange={(value) => handleCategorizeManually(suggestion, value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Outra categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(CATEGORY_RULES).map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRejectSuggestion(suggestion)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        size="sm"
                        onClick={() => handleAcceptSuggestion(suggestion)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Todas as transações categorizadas!</h3>
            <p className="text-muted-foreground text-center">
              Não há sugestões de categorização no momento. 
              Adicione novas transações para ver sugestões automáticas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutoCategorizer;
