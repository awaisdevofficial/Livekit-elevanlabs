import { useState } from 'react';
import { Plug, Key, User, CreditCard, Check, Copy, Eye, EyeOff, RefreshCw, Plus } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockPhoneNumbers, mockApiKeys, mockAgents } from '@/data/mock';
import { toast } from 'sonner';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('integrations');
  const [twilioConnected, setTwilioConnected] = useState(true);
  const [showTwilioForm, setShowTwilioForm] = useState(false);
  const [twilioForm, setTwilioForm] = useState({ accountSid: '', authToken: '', phoneNumber: '' });
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [showToken, setShowToken] = useState(false);

  const handleConnectTwilio = () => {
    if (!twilioForm.accountSid || !twilioForm.authToken || !twilioForm.phoneNumber) {
      toast.error('Please fill in all fields');
      return;
    }
    setTwilioConnected(true);
    setShowTwilioForm(false);
    toast.success('Twilio connected successfully!');
  };

  const handleDisconnectTwilio = () => {
    setTwilioConnected(false);
    toast.success('Twilio disconnected');
  };

  const handleCreateApiKey = () => {
    if (!newKeyName) {
      toast.error('Please enter a key name');
      return;
    }
    const newKey = `res_live_${Math.random().toString(36).substring(2, 15)}`;
    setShowNewKey(newKey);
    setNewKeyName('');
    toast.success('API key created!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and integrations"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass-panel-sm p-1 w-fit">
          <TabsTrigger 
            value="integrations" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 transition-all"
          >
            <Plug size={14} />
            Integrations
          </TabsTrigger>
          <TabsTrigger 
            value="api-keys"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 transition-all"
          >
            <Key size={14} />
            API Keys
          </TabsTrigger>
          <TabsTrigger 
            value="profile"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 transition-all"
          >
            <User size={14} />
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="billing"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 transition-all"
          >
            <CreditCard size={14} />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="mt-6 space-y-6">
          {/* Twilio Integration */}
          <div className="glass-card p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-1">Twilio & Phone</h3>
                <p className="text-sm text-white/50">Connect your Twilio account to make and receive calls</p>
              </div>
              <div className="flex items-center gap-2">
                {twilioConnected ? (
                  <>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#4DFFCE]/15 text-[#4DFFCE]">
                      <Check size={12} />
                      Connected
                    </span>
                  </>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/60">
                    Not connected
                  </span>
                )}
              </div>
            </div>

            {twilioConnected ? (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowTwilioForm(true)}
                    className="btn-secondary text-sm"
                  >
                    <RefreshCw size={14} />
                    Reconnect
                  </button>
                  <button 
                    onClick={handleDisconnectTwilio}
                    className="px-4 py-2 rounded-full text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    Disconnect
                  </button>
                </div>

                {/* Phone Numbers */}
                <div className="pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-white">Phone Numbers</h4>
                    <button 
                      onClick={() => toast.success('Importing numbers...')}
                      className="text-sm text-[#4DFFCE] hover:underline flex items-center gap-1"
                    >
                      <RefreshCw size={12} />
                      Import more
                    </button>
                  </div>

                  {mockPhoneNumbers.length === 0 ? (
                    <p className="text-sm text-white/50">No phone numbers imported yet</p>
                  ) : (
                    <div className="space-y-2">
                      {mockPhoneNumbers.map((number) => (
                        <div 
                          key={number.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-white">{number.number}</span>
                            {number.isPrimary && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#4DFFCE]/20 text-[#4DFFCE]">
                                Primary
                              </span>
                            )}
                          </div>
                          <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white">
                            <option value="">Unassigned</option>
                            {mockAgents.map(agent => (
                              <option key={agent.id} value={agent.id}>
                                {agent.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : showTwilioForm ? (
              <div className="space-y-4">
                <div>
                  <label className="form-label">Account SID</label>
                  <input
                    type="text"
                    value={twilioForm.accountSid}
                    onChange={(e) => setTwilioForm({ ...twilioForm, accountSid: e.target.value })}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Auth Token</label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={twilioForm.authToken}
                      onChange={(e) => setTwilioForm({ ...twilioForm, authToken: e.target.value })}
                      placeholder="your_auth_token"
                      className="form-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="form-label">Phone Number (E.164 format)</label>
                  <input
                    type="tel"
                    value={twilioForm.phoneNumber}
                    onChange={(e) => setTwilioForm({ ...twilioForm, phoneNumber: e.target.value })}
                    placeholder="+15551234567"
                    className="form-input"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowTwilioForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConnectTwilio}
                    className="btn-primary"
                  >
                    <Plug size={16} />
                    Connect
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowTwilioForm(true)}
                className="btn-primary"
              >
                <Plug size={16} />
                Connect Twilio
              </button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="mt-6 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-medium text-white mb-2">API Keys</h3>
            <p className="text-sm text-white/50 mb-6">
              Create API keys to access the Resona API programmatically
            </p>

            {/* Create new key */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key name (e.g., Production)"
                className="form-input flex-1"
              />
              <button 
                onClick={handleCreateApiKey}
                className="btn-primary"
              >
                <Plus size={16} />
                Create key
              </button>
            </div>

            {/* New key warning */}
            {showNewKey && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6">
                <p className="text-sm text-amber-400 mb-2">
                  Copy this key now. You won't be able to see it again!
                </p>
                <div className="flex gap-2">
                  <code className="flex-1 bg-black/30 px-3 py-2 rounded-lg text-sm text-white font-mono break-all">
                    {showNewKey}
                  </code>
                  <button 
                    onClick={() => copyToClipboard(showNewKey)}
                    className="btn-secondary"
                  >
                    <Copy size={16} />
                  </button>
                  <button 
                    onClick={() => setShowNewKey(null)}
                    className="btn-ghost"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Existing keys */}
            <div className="space-y-2">
              {mockApiKeys.map((key) => (
                <div 
                  key={key.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{key.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">{key.prefix}</p>
                  </div>
                  <button 
                    onClick={() => toast.success('API key revoked')}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <div className="glass-card p-8 text-center">
            <User size={48} className="text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Profile Settings</h3>
            <p className="text-sm text-white/50">
              Profile settings will be available in a future update
            </p>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <div className="glass-card p-8 text-center">
            <CreditCard size={48} className="text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Billing Settings</h3>
            <p className="text-sm text-white/50">
              Billing settings will be available in a future update
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}