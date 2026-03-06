import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Play, ChevronDown, Save, BookOpen, Settings } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { mockAgents, voices, languages, mockKnowledgeEntries } from '@/data/mock';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EditAgent() {
  const { id } = useParams<{ id: string }>();
  const agent = useMemo(() => mockAgents.find(a => a.id === id), [id]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('configuration');
  const [formData, setFormData] = useState({
    name: agent?.name || '',
    description: agent?.description || '',
    systemPrompt: agent?.systemPrompt || '',
    firstMessage: agent?.firstMessage || '',
    speaksFirst: true,
    voice: agent?.voice || voices[0],
    language: agent?.language || 'en-US',
    silenceTimeout: agent?.silenceTimeout || 10,
    maxDuration: agent?.maxDuration || 600,
    transferNumber: '',
  });

  const agentKnowledge = useMemo(() => {
    return mockKnowledgeEntries.filter(k => k.agentId === id);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast.success('Agent updated successfully!');
    setIsSubmitting(false);
  };

  if (!agent) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Agent not found" />
        <div className="glass-card p-8 text-center">
          <p className="text-white/60 mb-4">The agent you're looking for doesn't exist.</p>
          <Link to="/agents" className="btn-primary">Back to Agents</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={agent.name}
        subtitle="Edit your agent's configuration and test it live"
        actions={
          <>
            <Link to="/agents" className="btn-ghost">
              <ArrowLeft size={16} />
              Back
            </Link>
            <button 
              onClick={() => toast.success('Test call started!')}
              className="btn-secondary"
            >
              <Play size={16} />
              Test Agent
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary"
            >
              <Save size={16} />
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </button>
          </>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass-panel-sm p-1 w-fit">
          <TabsTrigger 
            value="configuration" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 transition-all"
          >
            <Settings size={14} />
            Configuration
          </TabsTrigger>
          <TabsTrigger 
            value="knowledge"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 transition-all"
          >
            <BookOpen size={14} />
            Knowledge Base
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Form */}
            <div className="lg:col-span-3 glass-card p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Identity */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider">Identity</h3>
                  
                  <div>
                    <label className="form-label">Agent name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Conversation */}
                <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                  <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider">Conversation</h3>
                  
                  <div>
                    <label className="form-label">System prompt *</label>
                    <textarea
                      value={formData.systemPrompt}
                      onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                      rows={4}
                      className="form-input resize-none"
                    />
                    <p className="text-xs text-white/40 mt-1.5">
                      {formData.systemPrompt.length} characters
                    </p>
                  </div>

                  <div>
                    <label className="form-label">First message *</label>
                    <input
                      type="text"
                      value={formData.firstMessage}
                      onChange={(e) => setFormData({ ...formData, firstMessage: e.target.value })}
                      className="form-input"
                    />
                    <p className="text-xs text-white/40 mt-1.5">
                      {formData.firstMessage.length} characters
                    </p>
                  </div>

                  <div>
                    <label className="form-label">Who speaks first?</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, speaksFirst: true })}
                        className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          formData.speaksFirst
                            ? 'bg-[#4DFFCE]/20 text-[#4DFFCE] border border-[#4DFFCE]/30'
                            : 'bg-white/5 text-white/60 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        Agent speaks first
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, speaksFirst: false })}
                        className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          !formData.speaksFirst
                            ? 'bg-[#4DFFCE]/20 text-[#4DFFCE] border border-[#4DFFCE]/30'
                            : 'bg-white/5 text-white/60 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        User speaks first
                      </button>
                    </div>
                  </div>
                </div>

                {/* Voice */}
                <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                  <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider">Voice</h3>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="form-label">Current voice</label>
                      <div className="relative">
                        <select
                          value={formData.voice}
                          onChange={(e) => setFormData({ ...formData, voice: e.target.value })}
                          className="form-input appearance-none"
                        >
                          {voices.map(voice => (
                            <option key={voice} value={voice}>{voice}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.success('Playing voice preview...')}
                      className="btn-secondary mt-6"
                    >
                      <Play size={14} />
                      Preview
                    </button>
                  </div>
                </div>

                {/* Call Behavior */}
                <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                  <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider">Call Behavior</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Language</label>
                      <div className="relative">
                        <select
                          value={formData.language}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                          className="form-input appearance-none"
                        >
                          {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Silence timeout (seconds)</label>
                      <input
                        type="number"
                        value={formData.silenceTimeout}
                        onChange={(e) => setFormData({ ...formData, silenceTimeout: parseInt(e.target.value) })}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Max call duration (seconds)</label>
                      <input
                        type="number"
                        value={formData.maxDuration}
                        onChange={(e) => setFormData({ ...formData, maxDuration: parseInt(e.target.value) })}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Call Transfer */}
                <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                  <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider">Call Transfer</h3>
                  
                  <div>
                    <label className="form-label">Transfer to number (optional)</label>
                    <input
                      type="tel"
                      value={formData.transferNumber}
                      onChange={(e) => setFormData({ ...formData, transferNumber: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="form-input"
                    />
                    <p className="text-xs text-white/40 mt-1.5">
                      Agents can transfer calls to this number when needed
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t border-white/[0.06]">
                  <Link to="/agents" className="btn-secondary flex-1">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex-1"
                  >
                    {isSubmitting ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Preview */}
            <div className="lg:col-span-2">
              <div className="glass-card p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-white">Agent Preview</h3>
                  <button 
                    onClick={() => toast.success('Test call started!')}
                    className="btn-primary text-sm py-2"
                  >
                    <Play size={14} />
                    Test Agent
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Name</p>
                    <p className="text-white font-medium">{formData.name}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Voice</p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#4DFFCE]/20 text-[#4DFFCE]">
                      {formData.voice}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">First Message</p>
                    <p className="text-white/80 text-sm">{formData.firstMessage}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Settings</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/50">Speaks first</span>
                        <span className="text-white">{formData.speaksFirst ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Silence timeout</span>
                        <span className="text-white">{formData.silenceTimeout}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Max duration</span>
                        <span className="text-white">{formData.maxDuration}s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Knowledge */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-medium text-white mb-6">Add Knowledge</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Pricing Information"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Content</label>
                  <textarea
                    placeholder="Enter knowledge content..."
                    rows={6}
                    className="form-input resize-none"
                  />
                </div>

                <button 
                  onClick={() => toast.success('Knowledge entry added!')}
                  className="btn-primary w-full"
                >
                  Add Entry
                </button>
              </div>
            </div>

            {/* Existing Entries */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-medium text-white mb-6">Existing Entries</h3>
              
              {agentKnowledge.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/50 text-sm">No knowledge entries yet</p>
                  <p className="text-white/30 text-xs mt-1">Add your first entry above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agentKnowledge.map((entry) => (
                    <div 
                      key={entry.id}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/[0.08] transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-white">{entry.name}</h4>
                        <button 
                          onClick={() => toast.success('Entry deleted')}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-white/50 mt-1 line-clamp-2">{entry.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
