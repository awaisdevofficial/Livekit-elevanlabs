import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Call } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Phone, PhoneIncoming, PhoneOutgoing, Eye, RefreshCw } from 'lucide-react';

export default function Calls() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const data = await api.getCalls({ limit: 50 });
      setCalls(data);
    } catch (error) {
      toast.error('Failed to load calls');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      in_progress: 'secondary',
      failed: 'destructive',
      no_answer: 'outline',
      busy: 'outline',
      voicemail: 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calls</h1>
          <p className="text-muted-foreground">
            View and manage all calls
          </p>
        </div>
        <Button variant="outline" onClick={fetchCalls}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : calls.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Phone className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No calls yet</h3>
            <p className="text-muted-foreground">
              Calls will appear here once your agents start handling them
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Direction</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Number</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => (
                  <tr key={call.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3">
                      {call.direction === 'inbound' ? (
                        <PhoneIncoming className="h-4 w-4 text-blue-500" />
                      ) : (
                        <PhoneOutgoing className="h-4 w-4 text-green-500" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {call.from_number || call.to_number || 'Unknown'}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(call.status)}</td>
                    <td className="px-4 py-3 text-sm">{formatDuration(call.duration_seconds)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(call.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/calls/${call.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
