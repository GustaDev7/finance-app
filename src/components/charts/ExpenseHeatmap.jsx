import { useState } from 'react';

const ExpenseHeatmap = ({ data = [], title = "Mapa de Calor - Gastos Diários" }) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  
  // Gerar dados para os últimos 12 meses
  const generateHeatmapData = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const monthData = {
        year,
        month,
        monthName: date.toLocaleDateString('pt-BR', { month: 'short' }),
        days: []
      };
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const dayData = data.find(d => 
          new Date(d.date).toDateString() === dayDate.toDateString()
        );
        
        monthData.days.push({
          day,
          date: dayDate,
          amount: dayData?.amount || 0,
          transactions: dayData?.transactions || 0
        });
      }
      
      months.push(monthData);
    }
    
    return months;
  };

  const heatmapData = generateHeatmapData();
  
  // Calcular valores máximo e mínimo para normalização
  const allAmounts = heatmapData.flatMap(month => 
    month.days.map(day => day.amount)
  ).filter(amount => amount > 0);
  
  const maxAmount = Math.max(...allAmounts, 1);
  const minAmount = Math.min(...allAmounts, 0);

  // Função para obter a intensidade da cor baseada no valor
  const getIntensity = (amount) => {
    if (amount === 0) return 0;
    return (amount - minAmount) / (maxAmount - minAmount);
  };

  // Função para obter a cor baseada na intensidade
  const getColor = (intensity) => {
    if (intensity === 0) return 'oklch(0.15 0 0)'; // Cinza escuro para dias sem gastos
    
    // Gradiente do roxo claro ao roxo escuro
    const lightness = 0.8 - (intensity * 0.4); // De 0.8 a 0.4
    const chroma = 0.15 + (intensity * 0.15); // De 0.15 a 0.3
    return `oklch(${lightness} ${chroma} 280)`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Cada quadrado representa um dia. Cores mais escuras indicam maiores gastos.
        </p>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] space-y-2">
          {heatmapData.map((month, monthIndex) => (
            <div key={`${month.year}-${month.month}`} className="flex items-center gap-2">
              {/* Label do mês */}
              <div className="w-12 text-xs text-muted-foreground font-medium">
                {month.monthName}
              </div>
              
              {/* Dias do mês */}
              <div className="flex gap-1 flex-wrap">
                {month.days.map((day, dayIndex) => {
                  const intensity = getIntensity(day.amount);
                  const color = getColor(intensity);
                  
                  return (
                    <div
                      key={`${month.year}-${month.month}-${day.day}`}
                      className="w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:scale-125 hover:z-10 relative"
                      style={{ backgroundColor: color }}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      title={`${formatDate(day.date)}: R$ ${day.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Menos</span>
          <div className="flex gap-1">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
              <div
                key={index}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: getColor(intensity) }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">Mais</span>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Máximo: R$ {maxAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div className="fixed z-50 bg-card border border-border rounded-lg p-3 shadow-lg pointer-events-none"
             style={{ 
               left: '50%', 
               top: '50%', 
               transform: 'translate(-50%, -100%)',
               marginTop: '-10px'
             }}>
          <div className="text-sm font-medium text-foreground">
            {formatDate(hoveredDay.date)}
          </div>
          <div className="text-sm text-muted-foreground">
            Gastos: R$ {hoveredDay.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          {hoveredDay.transactions > 0 && (
            <div className="text-xs text-muted-foreground">
              {hoveredDay.transactions} transação{hoveredDay.transactions !== 1 ? 'ões' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseHeatmap;
