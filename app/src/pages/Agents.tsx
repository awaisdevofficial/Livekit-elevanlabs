import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreVertical, Phone, Edit, Copy, Trash2, TestTube } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { mockAgents } from '@/data/mock';
import type { Agent } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

function AgentCard({ agent, onTest, onDelete }: { agent: Agent; onTest: () => void; onDelete: () => void }) {
  return (
    <div className="glass-card p-5 group hover:border-[#4DFFCE]/30 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${agent.status === 'active' ? 'bg-[#4DFFCE]' : 'bg-gray-500'}`} />
          <h3 className="text-lg font-medium text-white">{agent.name}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-panel-sm border-white/10">
            <DropdownMenuItem asChild>
              <Link to={`/agents/${agent.id}`} className="flex items-center gap-2 text-white/80 hover:text-white cursor-pointer">
                <Edit size={14} />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => toast.success('Agent duplicated')}
              className="flex items-center gap-2 text-white/80 hover:text-white cursor-pointer"
            >
              <Copy size={14} />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onDelete}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 cursor-pointer"
            >
              <Trash2 size={14} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <p className="text-sm text-white/50 line-clamp-2 mb-4 min-h-[40px]">
        {agent.systemPrompt}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-white/40 mb-4">
        <span>Voice: {agent.voice}</span>
        <span>{agent.callCount.toLocaleString()} calls</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button 
          onClick={onTest}
          className="btn-primary flex-1 text-sm py-2.5"
        >
          <TestTube size={14} />
          Test
        </button>
        <Link 
          to={`/agents/${agent.id}`}
          className="btn-secondary flex-1 text-sm py-2.5"
        >
          <Edit size={14} />
          Edit
        </Link>
      </div>
    </div>
  );
}

export default function Agents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [testAgent, setTestAgent] = useState<Agent | null>(null);
  const [deleteAgent, setDeleteAgent] = useState<Agent | null>(null);

  const filteredAgents = useMemo(() => {
    if (!searchQuery) return mockAgents;
    const query = searchQuery.toLowerCase();
    return mockAgents.filter(agent => 
      agent.name.toLowerCase().includes(query) ||
      agent.description.toLowerCase().includes(query) ||
      agent.systemPrompt.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleDelete = () => {
    if (deleteAgent) {
      toast.success(`Agent "${deleteAgent.name}" deleted`);
      setDeleteAgent(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Agents"
        subtitle="Configure and manage your voice AI agents"
        actions={
          <Link to="/agents/new" className="btn-primary">
            <Plus size={16} />
            New Agent
          </Link>
        }
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
        <input
          type="text"
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input pl-11 w-full max-w-md"
        />
      </div>

      {/* Content */}
      {filteredAgents.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No agents yet"
          description="Create your first voice AI agent to start making calls."
          action={
            <Link to="/agents/new" className="btn-primary">
              <Plus size={16} />
              Create Agent
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onTest={() => setTestAgent(agent)}
              onDelete={() => setDeleteAgent(agent)}
            />
          ))}
        </div>
      )}

      {/* Test Agent Modal */}
      <Dialog open={!!testAgent} onOpenChange={() => setTestAgent(null)}>
        <DialogContent className="glass-card border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              Test {testAgent?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-xl bg-white/5 text-center">
              <div className="w-16 h-16 rounded-full bg-[#4DFFCE]/20 flex items-center justify-center mx-auto mb-4">
                <Phone size={24} className="text-[#4DFFCE]" />
              </div>
              <p className="text-white/60 text-sm">Ready to test your agent</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setTestAgent(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  toast.success('Test call started!');
                  setTestAgent(null);
                }}
                className="btn-primary flex-1"
              >
                <Phone size={16} />
                Start Test Call
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteAgent} onOpenChange={() => setDeleteAgent(null)}>
        <DialogContent className="glass-card border-white/10 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Delete Agent?</DialogTitle>
          </DialogHeader>
          
          <p className="text-white/60 text-sm mt-4">
            Are you sure you want to delete "{deleteAgent?.name}"? This action cannot be undone.
          </p>
          
          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => setDeleteAgent(null)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-red-500/20 px-6 py-3 text-sm font-medium text-red-400 hover:bg-red-500/30 transition-all"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
