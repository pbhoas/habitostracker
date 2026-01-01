import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Calendar, CheckCircle, PieChart, CalendarDays, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
          ? "bg-primary text-white shadow-md shadow-primary/20"
          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium text-sm">{label}</span>
    </NavLink>
  );
};

const MobileNavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center p-2 rounded-xl transition-all ${isActive
          ? "text-primary"
          : "text-slate-400"
        }`
      }
    >
      <Icon className={`w-6 h-6 ${label === 'Revisión' ? 'mb-0' : 'mb-0'}`} strokeWidth={2} />
      {/* Optional Label for mobile if space permits, currently hidden for cleaner look */}
      <span className="text-[10px] font-medium mt-1">{label}</span>
    </NavLink>
  );
};

const Layout: React.FC = () => {
  const { user, signOut } = useAuth();
  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden">

      {/* Desktop Sidebar - Hidden on mobile, fixed on left for md+ */}
      <aside className="hidden md:flex flex-col w-64 h-full bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex-shrink-0 z-30">
        <div className="p-6 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Focus & Flow</h1>
              <p className="text-xs text-slate-500 font-medium">Planificador Pro</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <SidebarItem to="/" icon={Calendar} label="Planificador Semanal" />
            <SidebarItem to="/tracker" icon={CheckCircle} label="Rastreador de Hábitos" />
            <SidebarItem to="/weekly-review" icon={PieChart} label="Revisión Semanal" />
            <SidebarItem to="/monthly-review" icon={CalendarDays} label="Revisión Mensual" />
          </nav>

          {/* Bottom Actions */}
          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative scroll-smooth">
        <Outlet />
        {/* Spacer for mobile bottom nav */}
        <div className="h-24 md:h-0" />
      </main>

      {/* Mobile Bottom Navigation - Hidden on md+, fixed on bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 z-50 safe-area-bottom">
        <div className="flex justify-around items-center p-3 pb-safe">
          <MobileNavItem to="/" icon={Calendar} label="Planificar" />
          <MobileNavItem to="/tracker" icon={CheckCircle} label="Hábitos" />
          <MobileNavItem to="/weekly-review" icon={PieChart} label="Revisión" />
          <MobileNavItem to="/monthly-review" icon={CalendarDays} label="Mensual" />
        </div>
      </div>

    </div>
  );
};

export default Layout;