import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { ChevronLeft, Save, Megaphone } from 'lucide-react';

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    agent_id: '',
    phone_number_id: '',
    max_concurrent_calls: 5,
    retry_attempts: 2,
    retry_delay_minutes: 60,
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.agent_id || !formData.phone_number_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createCampaign(formData);
      toast.success('Campaign created successfully!');
      navigate('/campaigns');
    } catch (error) {
      toast.error('Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/campaigns')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
          <p className="text-muted-foreground">Set up a new outbound calling campaign</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>Configure your campaign settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Q1 Sales Outreach"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description of this campaign"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent">Agent *</Label>
            <Input
              id="agent"
              placeholder="Agent ID"
              value={formData.agent_id}
              onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="Phone Number ID"
              value={formData.phone_number_id}
              onChange={(e) => setFormData({ ...formData, phone_number_id: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>Max Concurrent Calls: {formData.max_concurrent_calls}</Label>
              <Slider
                value={[formData.max_concurrent_calls]}
                onValueChange={([value]) => setFormData({ ...formData, max_concurrent_calls: value })}
                min={1}
                max={50}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Retry Attempts: {formData.retry_attempts}</Label>
              <Slider
                value={[formData.retry_attempts]}
                onValueChange={([value]) => setFormData({ ...formData, retry_attempts: value })}
                min={0}
                max={5}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Creating...' : 'Create Campaign'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
