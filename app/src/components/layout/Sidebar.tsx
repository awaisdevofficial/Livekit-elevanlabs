import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  Bot, 
  Phone, 
  BookOpen, 
  Webhook, 
  BarChart2, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { path: '/agents', label: 'Agents', icon: Bot },
  { path: '/calls', label: 'Calls', icon: Phone },
  { path: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { path: '/webhooks', label: 'Webhooks', icon: Webhook },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const sidebarClasses = `
    fixed left-0 top-0 h-full z-50 bg-[#0B0D10] border-r border-white/[0.06]
    transition-all duration-300 ease-in-out
    ${collapsed ? 'w-[72px]' : 'w-[260px]'}
    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `;

  return (
    <aside className={sidebarClasses}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4DFFCE] to-[#2DD4A0] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-[#07080A]">R</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-white text-lg tracking-tight">Resona</span>
          )}
        </div>
        
        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-6 h-6 items-center justify-center rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        
        {/* Close button (mobile only) */}
        <button
          onClick={onClose}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-white/50"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`
                flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-white/10 text-white shadow-[inset_2px_0_0_#4DFFCE]' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className={isActive ? 'text-[#4DFFCE]' : ''} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.06] space-y-1">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }: { isActive: boolean }) => `
            flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
            ${isActive 
              ? 'bg-white/10 text-white shadow-[inset_2px_0_0_#4DFFCE]' 
              : 'text-white/60 hover:bg-white/5 hover:text-white'
            }
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        
        <a
          href="https://docs.resona.ai"
          target="_blank"
          rel="noopener noreferrer"
          className={`
            flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 
            hover:bg-white/5 hover:text-white transition-all duration-200
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <BookOpen size={18} />
          {!collapsed && (
            <>
              <span>Documentation</span>
              <ExternalLink size={12} className="ml-auto opacity-50" />
            </>
          )}
        </a>
        
        {/* User block */}
        {!collapsed ? (
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4DFFCE]/30 to-[#2DD4A0]/20 flex items-center justify-center border border-[#4DFFCE]/30">
                <span className="text-xs font-medium text-[#4DFFCE]">
                  {user?.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#4DFFCE]/20 text-[#4DFFCE]">
                  {user?.plan}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full flex items-center justify-center rounded-xl p-2.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}
