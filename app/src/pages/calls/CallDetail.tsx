import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Call, Transcript } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ChevronLeft, Phone, Clock, Download, Mic, User } from 'lucide-react';

export default function CallDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [call, setCall] = useState<(Call & { transcripts?: Transcript[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCall(id);
    }
  }, [id]);

  const fetchCall = async (callId: string) => {
    try {
      const data = await api.getCall(callId);
      setCall(data);
    } catch (error) {
      toast.error('Failed to load call');
      navigate('/calls');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!call) {
    return <div>Call not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/calls')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Call Details</h1>
          <p className="text-muted-foreground">
            {call.from_number || call.to_number} · {new Date(call.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="transcript">
            <TabsList>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="recording">Recording</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="transcript" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Conversation Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  {call.transcripts && call.transcripts.length > 0 ? (
                    <div className="space-y-4">
                      {call.transcripts.map((transcript, index) => (
                        <div
                          key={index}
                          className={`flex ${
                            transcript.role === 'agent' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-lg ${
                              transcript.role === 'agent'
                                ? 'bg-primary text-primary-foreground'
                                : transcript.role === 'system'
                                ? 'bg-muted text-center text-sm italic'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {transcript.role === 'agent' ? (
                                <Mic className="h-3 w-3" />
                              ) : (
                                <User className="h-3 w-3" />
                              )}
                              <span className="text-xs font-medium capitalize">
                                {transcript.role}
                              </span>
                            </div>
                            <p>{transcript.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No transcript available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recording" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Call Recording</CardTitle>
                </CardHeader>
                <CardContent>
                  {call.recording_url ? (
                    <div className="space-y-4">
                      <audio controls className="w-full">
                        <source src={call.recording_url} type="audio/wav" />
                      </audio>
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download Recording
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Recording not available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Call Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Turns</p>
                      <p className="text-2xl font-bold">{call.total_turns}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Interruptions</p>
                      <p className="text-2xl font-bold">{call.interruption_count}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Knowledge Queries</p>
                      <p className="text-2xl font-bold">{call.knowledge_queries_count}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Sentiment</p>
                      <p className="text-2xl font-bold capitalize">{call.sentiment || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Call Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge>{call.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Direction</span>
                <Badge variant="outline">{call.direction}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span>{formatDuration(call.duration_seconds)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">From</span>
                <span>{call.from_number || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To</span>
                <span>{call.to_number || '-'}</span>
              </div>
              {call.call_summary && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Summary</p>
                  <p className="text-sm">{call.call_summary}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
