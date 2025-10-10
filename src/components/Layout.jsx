import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Wallet,
  Target,
  PiggyBank,
  Activity
} from 'lucide-react';

export default function Layout({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transações', href: '/transactions', icon: Receipt },
    { name: 'Metas', href: '/goals', icon: Target },
    { name: 'Orçamentos', href: '/budget', icon: PiggyBank },
    { name: 'Atividades', href: '/activities', icon: Activity },
    { name: 'Relatórios', href: '/reports', icon: BarChart3 },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-slate-800 px-6 pb-4 shadow-xl border-r border-slate-200 dark:border-slate-700">
          <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 dark:border-slate-700">
            <Wallet className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">FinanceApp</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`
                            group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-all
                            ${isActive(item.href)
                              ? 'bg-primary text-white shadow-md'
                              : 'text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700'
                            }
                          `}
                        >
                          <Icon className="h-6 w-6 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="rounded-lg bg-slate-100 dark:bg-slate-700 p-4 mb-4">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Logado como</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-1">
                    {user.email}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      <div className={`lg:hidden ${sidebarOpen ? 'relative z-50' : ''}`}>
        {sidebarOpen && (
          <div className="fixed inset-0 bg-slate-900/80" onClick={() => setSidebarOpen(false)} />
        )}
        <div
          className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Wallet className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">FinanceApp</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-slate-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col px-6 py-4">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-all
                            ${isActive(item.href)
                              ? 'bg-primary text-white shadow-md'
                              : 'text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700'
                            }
                          `}
                        >
                          <Icon className="h-6 w-6 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="rounded-lg bg-slate-100 dark:bg-slate-700 p-4 mb-4">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Logado como</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-1">
                    {user.email}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Header Mobile */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 shadow-sm lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-slate-700 dark:text-slate-300 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-slate-900 dark:text-white">FinanceApp</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

