import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Download, 
  Calendar, 
  PieChart, 
  BarChart3,
  TrendingUp,
  Target,
  Settings,
  Loader2
} from 'lucide-react';

const ReportGenerator = ({ transactions = [] }) => {
  const [reportConfig, setReportConfig] = useState({
    type: 'monthly',
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date()
    },
    includeCharts: true,
    includeCategories: true,
    includeTrends: true,
    includeGoals: false,
    format: 'pdf'
  });
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { value: 'monthly', label: 'Relatório Mensal', description: 'Análise completa do mês' },
    { value: 'quarterly', label: 'Relatório Trimestral', description: 'Visão de 3 meses' },
    { value: 'yearly', label: 'Relatório Anual', description: 'Análise do ano completo' },
    { value: 'custom', label: 'Período Personalizado', description: 'Defina suas próprias datas' }
  ];

  const generateReportData = () => {
    const { from, to } = reportConfig.dateRange;
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= from && transactionDate <= to;
    });

    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    // Análise por categoria
    const categoryAnalysis = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.category || 'Outros';
        if (!categoryAnalysis[category]) {
          categoryAnalysis[category] = { total: 0, count: 0, transactions: [] };
        }
        categoryAnalysis[category].total += t.amount;
        categoryAnalysis[category].count += 1;
        categoryAnalysis[category].transactions.push(t);
      });

    // Análise temporal
    const monthlyData = {};
    filteredTransactions.forEach(t => {
      const monthKey = new Date(t.date).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        monthlyData[monthKey].income += t.amount;
      } else {
        monthlyData[monthKey].expenses += t.amount;
      }
    });

    return {
      period: {
        from: from.toLocaleDateString('pt-BR'),
        to: to.toLocaleDateString('pt-BR')
      },
      summary: {
        income,
        expenses,
        balance,
        transactionCount: filteredTransactions.length
      },
      categoryAnalysis: Object.entries(categoryAnalysis)
        .map(([category, data]) => ({
          category,
          ...data,
          percentage: (data.total / expenses) * 100
        }))
        .sort((a, b) => b.total - a.total),
      monthlyData: Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          ...data,
          balance: data.income - data.expenses
        }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      topExpenses: filteredTransactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10)
    };
  };

  const generateHTMLReport = (data) => {
    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório Financeiro - ${data.period.from} a ${data.period.to}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: #f8f9fa;
            }
            .header {
                background: linear-gradient(135deg, #8A2BE2, #9932CC);
                color: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                margin: 0;
                font-size: 2.5em;
            }
            .header p {
                margin: 10px 0 0 0;
                opacity: 0.9;
            }
            .summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .summary-card {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                text-align: center;
            }
            .summary-card h3 {
                margin: 0 0 10px 0;
                color: #666;
                font-size: 0.9em;
                text-transform: uppercase;
            }
            .summary-card .value {
                font-size: 2em;
                font-weight: bold;
                margin: 0;
            }
            .income { color: #28a745; }
            .expense { color: #dc3545; }
            .balance { color: #8A2BE2; }
            .section {
                background: white;
                padding: 25px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 25px;
            }
            .section h2 {
                color: #8A2BE2;
                border-bottom: 2px solid #8A2BE2;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }
            th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            th {
                background: #f8f9fa;
                font-weight: 600;
                color: #333;
            }
            .category-bar {
                height: 20px;
                background: #8A2BE2;
                border-radius: 10px;
                margin: 5px 0;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding: 20px;
                color: #666;
                font-size: 0.9em;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Relatório Financeiro</h1>
            <p>Período: ${data.period.from} a ${data.period.to}</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Receitas</h3>
                <p class="value income">R$ ${data.summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="summary-card">
                <h3>Despesas</h3>
                <p class="value expense">R$ ${data.summary.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="summary-card">
                <h3>Saldo</h3>
                <p class="value balance">R$ ${data.summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="summary-card">
                <h3>Transações</h3>
                <p class="value">${data.summary.transactionCount}</p>
            </div>
        </div>

        ${reportConfig.includeCategories ? `
        <div class="section">
            <h2>Análise por Categoria</h2>
            <table>
                <thead>
                    <tr>
                        <th>Categoria</th>
                        <th>Valor</th>
                        <th>%</th>
                        <th>Transações</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.categoryAnalysis.map(cat => `
                        <tr>
                            <td>${cat.category}</td>
                            <td>R$ ${cat.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td>${cat.percentage.toFixed(1)}%</td>
                            <td>${cat.count}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="section">
            <h2>Maiores Despesas</h2>
            <table>
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Data</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.topExpenses.map(expense => `
                        <tr>
                            <td>${expense.description || 'Sem descrição'}</td>
                            <td>${expense.category || 'Outros'}</td>
                            <td>${new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                            <td>R$ ${expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p>Relatório gerado em ${new Date().toLocaleDateString('pt-BR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
            <p>Sistema de Gestão Financeira</p>
        </div>
    </body>
    </html>
    `;
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const reportData = generateReportData();
      
      if (reportConfig.format === 'pdf') {
        // Gerar HTML e converter para PDF
        const htmlContent = generateHTMLReport(reportData);
        
        // Criar um blob com o HTML
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Abrir em nova janela para impressão/salvamento como PDF
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
            }, 500);
          };
        }
        
        // Cleanup
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        // Gerar JSON
        const jsonData = JSON.stringify(reportData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-financeiro-${reportData.period.from}-${reportData.period.to}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setGenerating(false);
    }
  };

  const updateDateRange = (type) => {
    const now = new Date();
    let from, to;

    switch (type) {
      case 'monthly':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        from = new Date(now.getFullYear(), quarter * 3, 1);
        to = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'yearly':
        from = new Date(now.getFullYear(), 0, 1);
        to = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        return; // Para 'custom', não alterar as datas
    }

    setReportConfig(prev => ({
      ...prev,
      type,
      dateRange: { from, to }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerador de Relatórios
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Tipo de Relatório */}
          <div className="space-y-2">
            <Label>Tipo de Relatório</Label>
            <Select 
              value={reportConfig.type} 
              onValueChange={updateDateRange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Período */}
          <div className="space-y-2">
            <Label>Período</Label>
            <DatePickerWithRange
              date={reportConfig.dateRange}
              onDateChange={(dateRange) => 
                setReportConfig(prev => ({ ...prev, dateRange }))
              }
            />
          </div>

          {/* Opções do Relatório */}
          <div className="space-y-4">
            <Label>Incluir no Relatório</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="charts"
                  checked={reportConfig.includeCharts}
                  onCheckedChange={(checked) =>
                    setReportConfig(prev => ({ ...prev, includeCharts: checked }))
                  }
                />
                <Label htmlFor="charts" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Gráficos e Visualizações
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="categories"
                  checked={reportConfig.includeCategories}
                  onCheckedChange={(checked) =>
                    setReportConfig(prev => ({ ...prev, includeCategories: checked }))
                  }
                />
                <Label htmlFor="categories" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Análise por Categorias
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="trends"
                  checked={reportConfig.includeTrends}
                  onCheckedChange={(checked) =>
                    setReportConfig(prev => ({ ...prev, includeTrends: checked }))
                  }
                />
                <Label htmlFor="trends" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Análise de Tendências
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="goals"
                  checked={reportConfig.includeGoals}
                  onCheckedChange={(checked) =>
                    setReportConfig(prev => ({ ...prev, includeGoals: checked }))
                  }
                />
                <Label htmlFor="goals" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Progresso das Metas
                </Label>
              </div>
            </div>
          </div>

          {/* Formato */}
          <div className="space-y-2">
            <Label>Formato de Exportação</Label>
            <Select 
              value={reportConfig.format} 
              onValueChange={(format) =>
                setReportConfig(prev => ({ ...prev, format }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF (Recomendado)</SelectItem>
                <SelectItem value="json">JSON (Dados Brutos)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botão de Geração */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={generateReport}
              disabled={generating}
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando Relatório...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pré-visualização */}
      <Card>
        <CardHeader>
          <CardTitle>Pré-visualização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Período</p>
                <p className="font-semibold">
                  {reportConfig.dateRange.from?.toLocaleDateString('pt-BR')} - {reportConfig.dateRange.to?.toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Transações</p>
                <p className="font-semibold">{transactions.length}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Seções</p>
                <p className="font-semibold">
                  {[
                    reportConfig.includeCharts && 'Gráficos',
                    reportConfig.includeCategories && 'Categorias',
                    reportConfig.includeTrends && 'Tendências',
                    reportConfig.includeGoals && 'Metas'
                  ].filter(Boolean).length + 2} {/* +2 para resumo e maiores despesas */}
                </p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Formato</p>
                <p className="font-semibold">{reportConfig.format.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportGenerator;
