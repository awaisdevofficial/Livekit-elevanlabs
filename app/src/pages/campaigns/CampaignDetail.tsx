import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Campaign } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ChevronLeft, Play, Pause, Stop, RefreshCw } from 'lucide-react';

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCampaign(id);
      fetchStats(id);
    }
  }, [id]);

  const fetchCampaign = async (campaignId: string) => {
    try {
      const data = await api.getCampaign(campaignId);
      setCampaign(data);
    } catch (error) {
      toast.error('Failed to load campaign');
      navigate('/campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async (campaignId: string) => {
    try {
      const data = await api.getCampaignStats(campaignId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleStart = async () => {
    if (!id) return;
    try {
      await api.startCampaign(id);
      toast.success('Campaign started');
      fetchCampaign(id);
    } catch (error) {
      toast.error('Failed to start campaign');
    }
  };

  const handlePause = async () => {
    if (!id) return;
    try {
      await api.pauseCampaign(id);
      toast.success('Campaign paused');
      fetchCampaign(id);
    } catch (error) {
      toast.error('Failed to pause campaign');
    }
  };

  const handleStop = async () => {
    if (!id) return;
    try {
      await api.stopCampaign(id);
      toast.success('Campaign stopped');
      fetchCampaign(id);
    } catch (error) {
      toast.error('Failed to stop campaign');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      scheduled: 'outline',
      running: 'default',
      paused: 'secondary',
      completed: 'default',
      failed: 'destructive',
      cancelled: 'outline',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/campaigns')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              {getStatusBadge(campaign.status)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {campaign.status === 'draft' && (
            <Button onClick={handleStart}>
              <Play className="mr-2 h-4 w-4" />
              Start
            </Button>
          )}
          {campaign.status === 'running' && (
            <>
              <Button variant="outline" onClick={handlePause}>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
              <Button variant="destructive" onClick={handleStop}>
                <Stop className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </>
          )}
          {campaign.status === 'paused' && (
            <>
              <Button onClick={handleStart}>
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
              <Button variant="destructive" onClick={handleStop}>
                <Stop className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => fetchCampaign(campaign.id)}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_contacts || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.completed || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Answered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.answered || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.failed || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={stats?.progress_percentage || 0} className="h-4" />
              <p className="text-sm text-muted-foreground mt-2">
                {Math.round(stats?.progress_percentage || 0)}% complete
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Contact list will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Concurrent Calls</span>
                <span>{campaign.max_concurrent_calls}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Retry Attempts</span>
                <span>{campaign.retry_attempts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Retry Delay</span>
                <span>{campaign.retry_delay_minutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timezone</span>
                <span>{campaign.timezone}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
