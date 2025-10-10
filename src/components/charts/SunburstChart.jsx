import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useState } from 'react';

const COLORS = [
  'oklch(0.6 0.25 280)', // Roxo principal
  'oklch(0.65 0.2 140)', // Verde
  'oklch(0.65 0.25 25)',  // Vermelho/Laranja
  'oklch(0.7 0.15 200)',  // Azul
  'oklch(0.75 0.2 320)',  // Rosa/Magenta
  'oklch(0.55 0.18 240)', // Azul escuro
  'oklch(0.7 0.2 60)',    // Amarelo
  'oklch(0.6 0.15 160)',  // Verde escuro
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: payload[0].color }}
          />
          <span className="font-medium text-foreground">{data.name}</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">Valor:</span>
            <span className="text-sm font-semibold text-foreground">
              R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">Percentual:</span>
            <span className="text-sm font-semibold text-primary">
              {data.percentage}%
            </span>
          </div>
          {data.transactions && (
            <div className="flex justify-between gap-4">
              <span className="text-sm text-muted-foreground">Transações:</span>
              <span className="text-sm font-semibold text-foreground">
                {data.transactions}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null; // Não mostrar labels para fatias muito pequenas
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="600"
      className="drop-shadow-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function SunburstChart({ data, title = "Distribuição por Categoria" }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  // Calcular percentuais
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1)
  }));

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={120}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationBegin={0}
            animationDuration={1200}
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke={activeIndex === index ? "white" : "transparent"}
                strokeWidth={activeIndex === index ? 2 : 0}
                style={{
                  filter: activeIndex === index ? 'brightness(1.1)' : 'brightness(1)',
                  transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: 'center',
                  transition: 'all 0.2s ease-in-out'
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color, fontSize: '14px' }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Centro do gráfico com informação total */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-muted-foreground">
            Total
          </div>
        </div>
      </div>
    </div>
  );
}
