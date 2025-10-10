import BudgetManager from '@/components/budget/BudgetManager';

export default function BudgetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orçamentos</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie seus orçamentos e controle seus gastos por categoria
        </p>
      </div>
      
      <BudgetManager />
    </div>
  );
}

