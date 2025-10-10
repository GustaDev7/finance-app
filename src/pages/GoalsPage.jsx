import FinancialGoals from '@/components/dashboard/FinancialGoals';

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Metas Financeiras</h1>
        <p className="text-muted-foreground mt-2">
          Defina e acompanhe suas metas financeiras para alcançar seus objetivos
        </p>
      </div>
      
      <FinancialGoals />
    </div>
  );
}

