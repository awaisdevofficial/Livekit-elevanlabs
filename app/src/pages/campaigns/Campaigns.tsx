import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Campaign } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Megaphone, Plus, Play, Pause, Stop, Eye } from 'lucide-react';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await api.getCampaigns();
      setCampaigns(data.items);
    } catch (error) {
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
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

  const handleStart = async (id: string) => {
    try {
      await api.startCampaign(id);
      toast.success('Campaign started');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to start campaign');
    }
  };

  const handlePause = async (id: string) => {
    try {
      await api.pauseCampaign(id);
      toast.success('Campaign paused');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to pause campaign');
    }
  };

  const handleStop = async (id: string) => {
    try {
      await api.stopCampaign(id);
      toast.success('Campaign stopped');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to stop campaign');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage outbound calling campaigns
          </p>
        </div>
        <Link to="/campaigns/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Megaphone className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a campaign to start making outbound calls
            </p>
            <Link to="/campaigns/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{campaign.name}</h3>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {campaign.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>{campaign.total_contacts} contacts</span>
                      <span>{campaign.completed_count} completed</span>
                      <span>Max {campaign.max_concurrent_calls} concurrent</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {campaign.status === 'draft' && (
                      <Button size="sm" onClick={() => handleStart(campaign.id)}>
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                    )}
                    {campaign.status === 'running' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handlePause(campaign.id)}>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleStop(campaign.id)}>
                          <Stop className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                      </>
                    )}
                    {campaign.status === 'paused' && (
                      <>
                        <Button size="sm" onClick={() => handleStart(campaign.id)}>
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleStop(campaign.id)}>
                          <Stop className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                      </>
                    )}
                    <Link to={`/campaigns/${campaign.id}`}>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
                {campaign.status === 'running' && (
                  <div className="mt-4">
                    <Progress 
                      value={(campaign.completed_count / campaign.total_contacts) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
