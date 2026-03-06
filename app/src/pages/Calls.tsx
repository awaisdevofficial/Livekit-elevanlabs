import { useState, useMemo } from 'react';
import { Phone, Plus, Filter, ArrowDownLeft, ArrowUpRight, X, Clock, Calendar } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockCalls, mockAgents } from '@/data/mock';
import type { Call } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

function formatDuration(seconds: number): string {
  if (seconds === 0) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function Calls() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [filterDirection, setFilterDirection] = useState<'all' | 'inbound' | 'outbound'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'failed'>('all');
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [showNewCallModal, setShowNewCallModal] = useState(false);

  const filteredCalls = useMemo(() => {
    return mockCalls.filter(call => {
      if (filterDirection !== 'all' && call.direction !== filterDirection) return false;
      if (filterStatus !== 'all' && call.status !== filterStatus) return false;
      return true;
    }).sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }, [filterDirection, filterStatus]);

  const stats = useMemo(() => {
    const completed = filteredCalls.filter(c => c.status === 'completed');
    const totalDuration = completed.reduce((acc, c) => acc + c.duration, 0);
    return {
      total: filteredCalls.length,
      completed: completed.length,
      failed: filteredCalls.filter(c => c.status === 'failed').length,
      avgDuration: completed.length > 0 ? Math.floor(totalDuration / completed.length) : 0,
    };
  }, [filteredCalls]);

  const hasActiveFilters = filterDirection !== 'all' || filterStatus !== 'all';

  const clearFilters = () => {
    setFilterDirection('all');
    setFilterStatus('all');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Calls"
        subtitle="Review recent calls. Filter by direction and status, then open the transcript for any call."
        actions={
          <>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    timeRange === range
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowNewCallModal(true)}
              className="btn-primary"
            >
              <Plus size={16} />
              New Call
            </button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="metric-card">
          <p className="metric-label">Total calls</p>
          <p className="metric-value">{stats.total}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Completion rate</p>
          <div className="flex items-end gap-2">
            <p className="metric-value">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </p>
            <p className="text-xs text-white/40 mb-1.5">
              {stats.completed}/{stats.total}
            </p>
          </div>
        </div>
        <div className="metric-card">
          <p className="metric-label">Avg. duration</p>
          <p className="metric-value">{formatDuration(stats.avgDuration)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-white/40" />
          <span className="text-sm text-white/60">Filters:</span>
        </div>
        
        <div className="flex items-center gap-2">
          {(['all', 'inbound', 'outbound'] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => setFilterDirection(dir)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterDirection === dir
                  ? 'bg-white/15 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {dir.charAt(0).toUpperCase() + dir.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'completed', 'failed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterStatus === status
                  ? 'bg-white/15 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Date/Time</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Agent</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Direction</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Duration</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalls.map((call) => (
                <tr 
                  key={call.id}
                  onClick={() => setSelectedCall(call)}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-white/30" />
                      <span className="text-sm text-white">{formatDate(call.startedAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-white">{call.agentName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {call.direction === 'inbound' ? (
                        <ArrowDownLeft size={14} className="text-blue-400" />
                      ) : (
                        <ArrowUpRight size={14} className="text-purple-400" />
                      )}
                      <StatusBadge status={call.direction} size="sm" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-white/30" />
                      <span className="text-sm text-white">{formatDuration(call.duration)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={call.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCall(call);
                      }}
                      className="text-sm text-[#4DFFCE] hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCalls.length === 0 && (
          <div className="text-center py-12">
            <Phone size={32} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No calls found</p>
            <p className="text-white/40 text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Call Detail Drawer */}
      <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
        <DialogContent className="glass-card border-white/10 max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white flex items-center gap-3">
              Call Details
              {selectedCall && <StatusBadge status={selectedCall.status} />}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCall && (
            <div className="mt-4 space-y-6">
              {/* Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-white/40 uppercase">Agent</p>
                  <p className="text-sm text-white mt-1">{selectedCall.agentName}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-white/40 uppercase">Direction</p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedCall.direction === 'inbound' ? (
                      <ArrowDownLeft size={14} className="text-blue-400" />
                    ) : (
                      <ArrowUpRight size={14} className="text-purple-400" />
                    )}
                    <span className="text-sm text-white capitalize">{selectedCall.direction}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-white/40 uppercase">From</p>
                  <p className="text-sm text-white mt-1">{selectedCall.from}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-white/40 uppercase">To</p>
                  <p className="text-sm text-white mt-1">{selectedCall.to}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-white/40 uppercase">Duration</p>
                  <p className="text-sm text-white mt-1">{formatDuration(selectedCall.duration)}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-white/40 uppercase">Date</p>
                  <p className="text-sm text-white mt-1">{formatDate(selectedCall.startedAt)}</p>
                </div>
              </div>

              {/* Summary */}
              {selectedCall.summary && (
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-xs text-white/40 uppercase mb-2">Summary</p>
                  <p className="text-sm text-white/80">{selectedCall.summary}</p>
                </div>
              )}

              {/* Tags */}
              {selectedCall.tags && selectedCall.tags.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 uppercase mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCall.tags.map((tag, i) => (
                      <span 
                        key={i}
                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Transcript */}
              {selectedCall.transcript && selectedCall.transcript.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 uppercase mb-3">Transcript</p>
                  <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
                    {selectedCall.transcript.map((msg, i) => (
                      <div 
                        key={i}
                        className={`flex ${msg.speaker === 'agent' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div 
                          className={`max-w-[80%] p-3 rounded-xl ${
                            msg.speaker === 'agent' 
                              ? 'bg-white/10 text-white' 
                              : 'bg-[#4DFFCE]/20 text-[#4DFFCE]'
                          }`}
                        >
                          <p className="text-xs opacity-60 mb-1 capitalize">{msg.speaker}</p>
                          <p className="text-sm">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Call Modal */}
      <Dialog open={showNewCallModal} onOpenChange={setShowNewCallModal}>
        <DialogContent className="glass-card border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">New Call</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="form-label">Agent</label>
              <select className="form-input">
                {mockAgents.filter(a => a.status === 'active').map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="form-input"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setShowNewCallModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  toast.success('Call initiated!');
                  setShowNewCallModal(false);
                }}
                className="btn-primary flex-1"
              >
                <Phone size={16} />
                Start Call
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
