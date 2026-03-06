import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Agent } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ChevronLeft, Save, Phone, Clock, TrendingUp } from 'lucide-react';

export default function EditAgent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchAgent(id);
      fetchStats(id);
    }
  }, [id]);

  const fetchAgent = async (agentId: string) => {
    try {
      const data = await api.getAgent(agentId);
      setAgent(data);
    } catch (error) {
      toast.error('Failed to load agent');
      navigate('/agents');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async (agentId: string) => {
    try {
      const data = await api.getAgentStats(agentId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleSave = async () => {
    if (!agent) return;
    
    setIsSaving(true);
    try {
      await api.updateAgent(agent.id, agent);
      toast.success('Agent updated successfully');
    } catch (error) {
      toast.error('Failed to update agent');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!agent) {
    return <div>Agent not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/agents')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Badge>{agent.agent_type}</Badge>
              <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                {agent.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="prompt">Prompt</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Agent Name</Label>
                <Input
                  value={agent.name}
                  onChange={(e) => setAgent({ ...agent, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Input value={agent.language} disabled />
              </div>
              <div className="space-y-2">
                <Label>Voice ID</Label>
                <Input value={agent.voice_id || ''} disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Prompt</CardTitle>
              <CardDescription>Define your agent's personality and behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={agent.system_prompt}
                onChange={(e) => setAgent({ ...agent, system_prompt: e.target.value })}
                rows={20}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Call Behavior</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Silence Timeout (seconds)</Label>
                <Input
                  type="number"
                  value={agent.silence_timeout_seconds}
                  onChange={(e) => setAgent({ ...agent, silence_timeout_seconds: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Call Duration (seconds)</Label>
                <Input
                  type="number"
                  value={agent.max_call_duration_seconds}
                  onChange={(e) => setAgent({ ...agent, max_call_duration_seconds: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Call Transfer Number</Label>
                <Input
                  value={agent.call_transfer_number || ''}
                  onChange={(e) => setAgent({ ...agent, call_transfer_number: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  {stats?.total_calls || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Minutes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  {stats?.total_minutes || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                  {Math.round(stats?.avg_duration_seconds / 60 || 0)}m
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Interruption Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(stats?.interruption_rate || 0)}%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
