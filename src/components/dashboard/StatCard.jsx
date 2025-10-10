import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  gradientClass,
  borderClass 
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-chart-2';
    if (trend === 'down') return 'text-chart-3';
    return 'text-muted-foreground';
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className={`${gradientClass} ${borderClass} card-hover relative overflow-hidden`}>
      {/* Efeito de brilho sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-white/90">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-white/80" />
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold text-white mb-2">
          {value}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/70">
            {subtitle}
          </p>
          
          {trendValue && (
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
              <TrendIcon className="h-3 w-3 text-white" />
              <span className="text-xs font-medium text-white">
                {trendValue}
              </span>
            </div>
          )}
        </div>
        
        {/* Sparkline placeholder - pode ser expandido futuramente */}
        <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white/40 rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: trend === 'up' ? '75%' : trend === 'down' ? '25%' : '50%',
              animationDelay: '500ms'
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
