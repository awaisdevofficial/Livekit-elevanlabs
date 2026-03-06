import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChevronLeft, Save, Eye, EyeOff } from 'lucide-react';

export default function TwilioSettings() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showAuthToken, setShowAuthToken] = useState(false);
  const [formData, setFormData] = useState({
    accountSid: '',
    authToken: '',
  });

  const handleSave = async () => {
    if (!formData.accountSid || !formData.authToken) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSaving(true);
    try {
      await api.updateTwilioCredentials(formData.accountSid, formData.authToken);
      toast.success('Twilio credentials saved successfully');
      navigate('/settings');
    } catch (error) {
      toast.error('Failed to save credentials');
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
          <h1 className="text-3xl font-bold tracking-tight">Twilio Settings</h1>
          <p className="text-muted-foreground">Configure your Twilio integration</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Twilio Credentials</CardTitle>
          <CardDescription>
            Enter your Twilio Account SID and Auth Token
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="account-sid">Account SID</Label>
            <Input
              id="account-sid"
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={formData.accountSid}
              onChange={(e) => setFormData({ ...formData, accountSid: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-token">Auth Token</Label>
            <div className="relative">
              <Input
                id="auth-token"
                type={showAuthToken ? 'text' : 'password'}
                placeholder="Your Twilio Auth Token"
                value={formData.authToken}
                onChange={(e) => setFormData({ ...formData, authToken: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowAuthToken(!showAuthToken)}
              >
                {showAuthToken ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              You can find your Account SID and Auth Token in your{' '}
              <a 
                href="https://console.twilio.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Twilio Console
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Credentials'}
        </Button>
      </div>
    </div>
  );
}
