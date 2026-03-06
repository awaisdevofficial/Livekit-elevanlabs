import { useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface TopBarProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your voice AI activity' },
  '/agents': { title: 'Agents', subtitle: 'Configure and manage your voice AI agents' },
  '/agents/new': { title: 'Create Agent', subtitle: 'Configure your voice AI agent' },
  '/calls': { title: 'Calls', subtitle: 'Review recent calls and transcripts' },
  '/knowledge-base': { title: 'Knowledge Base', subtitle: 'Manage knowledge for your agents' },
  '/webhooks': { title: 'Webhooks', subtitle: 'Receive call and agent events' },
  '/analytics': { title: 'Analytics', subtitle: 'Detailed insights into your call activity' },
  '/settings': { title: 'Settings', subtitle: 'Manage your account and integrations' },
};

export default function TopBar({ onMenuClick }: TopBarProps) {
  const location = useLocation();
  const { user } = useAuth();
  
  const pageInfo = pageTitles[location.pathname] || { title: 'Resona' };
  
  // Check if we're on an agent edit page
  const isAgentEdit = location.pathname.match(/^\/agents\/[^/]+$/);
  if (isAgentEdit) {
    pageInfo.title = 'Edit Agent';
    pageInfo.subtitle = 'Configure your agent';
  }

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/[0.06] bg-[#07080A]/80 backdrop-blur-md sticky top-0 z-30">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div>
          <h1 className="text-lg font-semibold text-white">{pageInfo.title}</h1>
          {pageInfo.subtitle && (
            <p className="hidden sm:block text-xs text-white/50">{pageInfo.subtitle}</p>
          )}
        </div>
      </div>
      
      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4DFFCE]" />
        </button>
        
        <div className="flex items-center gap-2 pl-3 border-l border-white/[0.06]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4DFFCE]/30 to-[#2DD4A0]/20 flex items-center justify-center border border-[#4DFFCE]/30">
            <span className="text-xs font-medium text-[#4DFFCE]">
              {user?.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
