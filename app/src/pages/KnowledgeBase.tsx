import { useState, useMemo } from 'react';
import { Plus, BookOpen, Search, Trash2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { mockKnowledgeEntries, mockAgents } from '@/data/mock';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ name: '', content: '', agentId: '' });

  const filteredEntries = useMemo(() => {
    if (!searchQuery) return mockKnowledgeEntries;
    const query = searchQuery.toLowerCase();
    return mockKnowledgeEntries.filter(entry => 
      entry.name.toLowerCase().includes(query) ||
      entry.content.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleAddEntry = () => {
    if (!newEntry.name || !newEntry.content) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success('Knowledge entry added!');
    setShowAddModal(false);
    setNewEntry({ name: '', content: '', agentId: '' });
  };

  const handleDelete = (_id: string) => {
    toast.success('Entry deleted');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Knowledge Base"
        subtitle="Add and manage knowledge your agents can use during calls"
        actions={
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus size={16} />
            Add entry
          </button>
        }
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
        <input
          type="text"
          placeholder="Search knowledge entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input pl-11 w-full max-w-md"
        />
      </div>

      {/* Content */}
      {filteredEntries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No knowledge base entries"
          description="Add your first knowledge entry to help your agents answer questions."
          action={
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <Plus size={16} />
              Add entry
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => (
            <div 
              key={entry.id}
              className="glass-card p-5 group hover:border-[#4DFFCE]/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4DFFCE]/10 flex items-center justify-center">
                    <BookOpen size={18} className="text-[#4DFFCE]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{entry.name}</h3>
                    <p className="text-xs text-white/40">
                      {entry.agentName ? `Assigned to ${entry.agentName}` : 'Not assigned'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-sm text-white/60 line-clamp-3">{entry.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Entry Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="glass-card border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Add Knowledge</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="form-label">Name</label>
              <input
                type="text"
                value={newEntry.name}
                onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                placeholder="e.g., Pricing Information"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Content</label>
              <textarea
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                placeholder="Enter the knowledge content..."
                rows={5}
                className="form-input resize-none"
              />
            </div>

            <div>
              <label className="form-label">Assign to agent (optional)</label>
              <select
                value={newEntry.agentId}
                onChange={(e) => setNewEntry({ ...newEntry, agentId: e.target.value })}
                className="form-input"
              >
                <option value="">All agents</option>
                {mockAgents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setShowAddModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddEntry}
                className="btn-primary flex-1"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
