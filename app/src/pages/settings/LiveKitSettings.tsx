import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChevronLeft, Save, Eye, EyeOff } from 'lucide-react';

export default function LiveKitSettings() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [formData, setFormData] = useState({
    wsUrl: '',
    apiKey: '',
    apiSecret: '',
    sipUri: '',
  });

  const handleSave = async () => {
    if (!formData.wsUrl || !formData.apiKey || !formData.apiSecret) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      await api.updateLiveKitConfig(
        formData.wsUrl,
        formData.apiKey,
        formData.apiSecret,
        formData.sipUri
      );
      toast.success('LiveKit configuration saved successfully');
      navigate('/settings');
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/settings')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">LiveKit Settings</h1>
          <p className="text-muted-foreground">Configure your LiveKit server</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>LiveKit Server Configuration</CardTitle>
          <CardDescription>
            Enter your LiveKit server details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ws-url">WebSocket URL *</Label>
            <Input
              id="ws-url"
              placeholder="wss://livekit.yourdomain.com"
              value={formData.wsUrl}
              onChange={(e) => setFormData({ ...formData, wsUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key *</Label>
            <Input
              id="api-key"
              placeholder="Your LiveKit API Key"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-secret">API Secret *</Label>
            <div className="relative">
              <Input
                id="api-secret"
                type={showApiSecret ? 'text' : 'password'}
                placeholder="Your LiveKit API Secret"
                value={formData.apiSecret}
                onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiSecret(!showApiSecret)}
              >
                {showApiSecret ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sip-uri">SIP URI</Label>
            <Input
              id="sip-uri"
              placeholder="sip:your-server-ip:5060"
              value={formData.sipUri}
              onChange={(e) => setFormData({ ...formData, sipUri: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              The public SIP URI for your LiveKit server
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Learn more about{' '}
              <a 
                href="https://docs.livekit.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                self-hosting LiveKit
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
}
