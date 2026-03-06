import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, ChevronDown } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { voices, languages } from '@/data/mock';
import { toast } from 'sonner';

export default function NewAgent() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    firstMessage: '',
    speaksFirst: true,
    voice: voices[0],
    language: 'en-US',
    silenceTimeout: 10,
    maxDuration: 600,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.systemPrompt || !formData.firstMessage) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Agent created successfully!');
    navigate('/agents');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Create Agent"
        subtitle="Configure your voice AI agent's personality and behaviour"
        actions={
          <Link to="/agents" className="btn-ghost">
            <ArrowLeft size={16} />
            Back
          </Link>
        }
      />

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
                  placeholder="e.g., Maya"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Customer support agent"
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
                  placeholder="You are a helpful customer support agent..."
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
                  placeholder="Hi! How can I help you today?"
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
                    min={5}
                    max={60}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Max call duration (seconds)</label>
                  <input
                    type="number"
                    value={formData.maxDuration}
                    onChange={(e) => setFormData({ ...formData, maxDuration: parseInt(e.target.value) })}
                    min={60}
                    max={3600}
                    className="form-input"
                  />
                </div>
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
                {isSubmitting ? 'Creating...' : 'Create agent'}
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
                <p className="text-white font-medium">{formData.name || '—'}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Voice</p>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#4DFFCE]/20 text-[#4DFFCE]">
                  {formData.voice}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">First Message</p>
                <p className="text-white/80 text-sm">{formData.firstMessage || '—'}</p>
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
    </div>
  );
}
