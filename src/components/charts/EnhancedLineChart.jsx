import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 shadow-lg backdrop-blur-sm">
        <p className="text-foreground font-medium mb-2">{`Período: ${label}`}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">
              {entry.name}: 
            </span>
            <span className="text-sm font-semibold text-foreground">
              R$ {entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
        {payload.length === 2 && (
          <div className="border-t border-border pt-2 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Saldo:</span>
              <span className={`text-sm font-bold ${
                (payload[0].value - payload[1].value) >= 0 ? 'text-chart-2' : 'text-chart-3'
              }`}>
                R$ {(payload[0].value - payload[1].value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const CustomDot = ({ cx, cy, fill, payload, dataKey }) => {
  if (payload && payload[dataKey] > 0) {
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={4} 
        fill={fill} 
        stroke="white" 
        strokeWidth={2}
        className="drop-shadow-sm"
      />
    );
  }
  return null;
};

export default function EnhancedLineChart({ data, formatMonthYear }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.65 0.2 140)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="oklch(0.65 0.2 140)" stopOpacity={0.05}/>
          </linearGradient>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.65 0.25 25)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="oklch(0.65 0.25 25)" stopOpacity={0.05}/>
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="oklch(0.2 0 0)" 
          strokeOpacity={0.3}
        />
        <XAxis 
          dataKey="month" 
          tickFormatter={formatMonthYear} 
          fontSize={12}
          stroke="oklch(0.7 0 0)"
          tick={{ fill: 'oklch(0.7 0 0)' }}
        />
        <YAxis 
          fontSize={12}
          stroke="oklch(0.7 0 0)"
          tick={{ fill: 'oklch(0.7 0 0)' }}
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
        <Area
          type="monotone"
          dataKey="income"
          stackId="1"
          stroke="oklch(0.65 0.2 140)"
          fill="url(#incomeGradient)"
          strokeWidth={3}
          name="Entradas"
          dot={<CustomDot />}
          activeDot={{ 
            r: 6, 
            fill: "oklch(0.65 0.2 140)",
            stroke: "white",
            strokeWidth: 2,
            className: "drop-shadow-md"
          }}
          animationDuration={1500}
          animationBegin={0}
        />
        <Area
          type="monotone"
          dataKey="expense"
          stackId="2"
          stroke="oklch(0.65 0.25 25)"
          fill="url(#expenseGradient)"
          strokeWidth={3}
          name="Saídas"
          dot={<CustomDot />}
          activeDot={{ 
            r: 6, 
            fill: "oklch(0.65 0.25 25)",
            stroke: "white",
            strokeWidth: 2,
            className: "drop-shadow-md"
          }}
          animationDuration={1500}
          animationBegin={300}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
