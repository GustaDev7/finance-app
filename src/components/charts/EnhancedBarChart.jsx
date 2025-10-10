import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const income = payload.find(p => p.dataKey === 'income')?.value || 0;
    const expense = payload.find(p => p.dataKey === 'expense')?.value || 0;
    const balance = income - expense;
    
    return (
      <div className="bg-card border border-border rounded-lg p-4 shadow-lg backdrop-blur-sm">
        <p className="text-foreground font-medium mb-3">{`Período: ${label}`}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">
                {entry.name}:
              </span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              R$ {entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
        <div className="border-t border-border pt-3 mt-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-muted-foreground">Saldo:</span>
            <span className={`text-sm font-bold ${
              balance >= 0 ? 'text-chart-2' : 'text-chart-3'
            }`}>
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 mt-1">
            <span className="text-xs text-muted-foreground">
              {balance >= 0 ? 'Superávit' : 'Déficit'}:
            </span>
            <span className={`text-xs font-medium ${
              balance >= 0 ? 'text-chart-2' : 'text-chart-3'
            }`}>
              {income > 0 ? `${((Math.abs(balance) / income) * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomBar = ({ fill, ...props }) => {
  return (
    <Bar 
      {...props} 
      fill={fill}
      radius={[4, 4, 0, 0]}
      className="drop-shadow-sm"
    />
  );
};

export default function EnhancedBarChart({ data, formatMonthYear }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart 
        data={data} 
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        barCategoryGap="20%"
      >
        <defs>
          <linearGradient id="incomeBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.7 0.25 140)" />
            <stop offset="100%" stopColor="oklch(0.6 0.2 140)" />
          </linearGradient>
          <linearGradient id="expenseBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.7 0.3 25)" />
            <stop offset="100%" stopColor="oklch(0.6 0.25 25)" />
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="oklch(0.2 0 0)" 
          strokeOpacity={0.3}
          vertical={false}
        />
        <XAxis 
          dataKey="month" 
          tickFormatter={formatMonthYear} 
          fontSize={12}
          stroke="oklch(0.7 0 0)"
          tick={{ fill: 'oklch(0.7 0 0)' }}
          axisLine={{ stroke: 'oklch(0.3 0 0)' }}
        />
        <YAxis 
          fontSize={12}
          stroke="oklch(0.7 0 0)"
          tick={{ fill: 'oklch(0.7 0 0)' }}
          axisLine={{ stroke: 'oklch(0.3 0 0)' }}
          tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ 
            paddingTop: '20px',
            fontSize: '14px',
            color: 'oklch(0.7 0 0)'
          }}
        />
        <Bar 
          dataKey="income" 
          fill="url(#incomeBarGradient)" 
          name="Entradas"
          radius={[4, 4, 0, 0]}
          animationDuration={1200}
          animationBegin={0}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`income-${index}`} 
              fill="url(#incomeBarGradient)"
            />
          ))}
        </Bar>
        <Bar 
          dataKey="expense" 
          fill="url(#expenseBarGradient)" 
          name="Saídas"
          radius={[4, 4, 0, 0]}
          animationDuration={1200}
          animationBegin={200}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`expense-${index}`} 
              fill="url(#expenseBarGradient)"
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
