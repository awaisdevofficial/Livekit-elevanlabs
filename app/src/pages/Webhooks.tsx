import { useState } from 'react';
import { Plus, Webhook, Trash2, Check, X, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockWebhooks, webhookEvents } from '@/data/mock';
import { toast } from 'sonner';

export default function Webhooks() {
  const [showForm, setShowForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ url: '', events: [] as string[] });

  const handleEventToggle = (event: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  const handleCreate = () => {
    if (!newWebhook.url) {
      toast.error('Please enter a webhook URL');
      return;
    }
    if (newWebhook.events.length === 0) {
      toast.error('Please select at least one event');
      return;
    }
    toast.success('Webhook created!');
    setShowForm(false);
    setNewWebhook({ url: '', events: [] });
  };

  const handleDelete = (_id: string) => {
    toast.success('Webhook deleted');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Webhooks"
        subtitle="Receive call and agent events at your endpoint"
        actions={
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            <Plus size={16} />
            Add webhook
          </button>
        }
      />

      {/* Info Banner */}
      <div className="glass-panel-sm p-4 mb-6 border-l-2 border-l-[#4DFFCE]/50">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-[#4DFFCE] mt-0.5" />
          <div>
            <p className="text-sm text-white/80">
              Webhooks send POST requests to your endpoint when selected events occur. 
              Your endpoint should respond with a 2xx status code.
            </p>
          </div>
        </div>
      </div>

      {/* Add Webhook Form */}
      {showForm && (
        <div className="glass-card p-6 mb-6 animate-fade-in">
          <h3 className="text-lg font-medium text-white mb-4">New Webhook</h3>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Webhook URL</label>
              <input
                type="url"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                placeholder="https://api.yourapp.com/webhooks/resona"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Events</label>
              <div className="flex flex-wrap gap-2">
                {webhookEvents.map((event) => (
                  <button
                    key={event}
                    type="button"
                    onClick={() => handleEventToggle(event)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      newWebhook.events.includes(event)
                        ? 'bg-[#4DFFCE]/20 text-[#4DFFCE] border border-[#4DFFCE]/30'
                        : 'bg-white/5 text-white/60 border border-transparent hover:bg-white/10'
                    }`}
                  >
                    {newWebhook.events.includes(event) && <Check size={12} className="inline mr-1" />}
                    {event}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                <X size={16} />
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                className="btn-primary"
              >
                <Plus size={16} />
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhooks List */}
      {mockWebhooks.length === 0 ? (
        <EmptyState
          icon={Webhook}
          title="No webhooks yet"
          description="Add a webhook to receive real-time events from Resona."
          action={
            <button 
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <Plus size={16} />
              Add webhook
            </button>
          }
        />
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">URL</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Events</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Last Triggered</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockWebhooks.map((webhook) => (
                  <tr 
                    key={webhook.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <code className="text-sm text-white/80 bg-white/5 px-2 py-1 rounded">
                        {webhook.url.length > 40 ? webhook.url.slice(0, 40) + '...' : webhook.url}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event) => (
                          <span 
                            key={event}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white/60"
                          >
                            {event}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/60">
                        {webhook.lastTriggered 
                          ? webhook.lastTriggered.toLocaleDateString() 
                          : '—'}
                      </span>
                      {webhook.lastStatusCode && (
                        <span className={`ml-2 text-xs ${webhook.lastStatusCode === 200 ? 'text-[#4DFFCE]' : 'text-red-400'}`}>
                          ({webhook.lastStatusCode})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={webhook.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(webhook.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
