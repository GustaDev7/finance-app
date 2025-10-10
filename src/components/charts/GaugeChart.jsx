import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const GaugeChart = ({ 
  value, 
  maxValue, 
  title, 
  subtitle,
  color = 'oklch(0.6 0.25 280)',
  warningThreshold = 0.8,
  dangerThreshold = 0.95
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const angle = (percentage / 100) * 180; // Semicírculo
  
  // Determinar cor baseada nos thresholds
  const getColor = () => {
    const ratio = value / maxValue;
    if (ratio >= dangerThreshold) return 'oklch(0.65 0.25 25)'; // Vermelho
    if (ratio >= warningThreshold) return 'oklch(0.7 0.2 60)'; // Amarelo
    return color; // Cor padrão
  };

  const currentColor = getColor();

  // Dados para o gráfico de pizza (semicírculo)
  const data = [
    { name: 'Used', value: percentage, color: currentColor },
    { name: 'Remaining', value: 100 - percentage, color: 'oklch(0.2 0 0)' }
  ];

  // Dados para o fundo do gauge
  const backgroundData = [
    { name: 'Background', value: 100, color: 'oklch(0.15 0 0)' }
  ];

  const CustomLabel = () => {
    return (
      <g>
        {/* Valor atual */}
        <text 
          x="50%" 
          y="45%" 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="fill-foreground text-2xl font-bold"
        >
          {percentage.toFixed(1)}%
        </text>
        
        {/* Título */}
        <text 
          x="50%" 
          y="55%" 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="fill-muted-foreground text-sm"
        >
          {title}
        </text>
        
        {/* Valores */}
        <text 
          x="50%" 
          y="65%" 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="fill-muted-foreground text-xs"
        >
          R$ {value.toLocaleString('pt-BR')} / R$ {maxValue.toLocaleString('pt-BR')}
        </text>
      </g>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          {/* Fundo do gauge */}
          <Pie
            data={backgroundData}
            cx="50%"
            cy="85%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            stroke="none"
          >
            <Cell fill="oklch(0.15 0 0)" />
          </Pie>
          
          {/* Gauge principal */}
          <Pie
            data={data}
            cx="50%"
            cy="85%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            stroke="none"
            animationBegin={0}
            animationDuration={1500}
          >
            <Cell fill={currentColor} />
            <Cell fill="transparent" />
          </Pie>
          
          <CustomLabel />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Indicadores de threshold */}
      <div className="flex justify-between w-full px-4 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-chart-2"></div>
          <span className="text-xs text-muted-foreground">Seguro</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <span className="text-xs text-muted-foreground">Atenção</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-chart-3"></div>
          <span className="text-xs text-muted-foreground">Limite</span>
        </div>
      </div>
      
      {/* Status */}
      <div className="mt-3 text-center">
        <div className={`text-sm font-medium ${
          value / maxValue >= dangerThreshold ? 'text-chart-3' :
          value / maxValue >= warningThreshold ? 'text-yellow-500' :
          'text-chart-2'
        }`}>
          {value / maxValue >= dangerThreshold ? 'Orçamento Excedido!' :
           value / maxValue >= warningThreshold ? 'Próximo do Limite' :
           'Dentro do Orçamento'}
        </div>
        {subtitle && (
          <div className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default GaugeChart;
