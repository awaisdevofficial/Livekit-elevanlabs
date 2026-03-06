import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardStats, CallVolumeData, AgentPerformance } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Phone, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  Mic,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: number;
  icon: React.ElementType;
  isLoading?: boolean;
}

function StatCard({ title, value, description, trend, icon: Icon, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {(description || trend !== undefined) && (
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {trend !== undefined && (
                  <span className={`flex items-center mr-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                    {Math.abs(trend)}%
                  </span>
                )}
                {description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [callVolume, setCallVolume] = useState<CallVolumeData[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, volumeData, performanceData] = await Promise.all([
          api.getDashboardStats(),
          api.getCallVolume(30),
          api.getAgentPerformance(),
        ]);
        
        setStats(statsData);
        setCallVolume(volumeData.data);
        setAgentPerformance(performanceData.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your voice agent platform
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Calls"
          value={stats?.active_calls_now || 0}
          description="Currently in progress"
          icon={Activity}
          isLoading={isLoading}
        />
        <StatCard
          title="Calls Today"
          value={stats?.calls_today || 0}
          trend={stats?.calls_today_change}
          description="vs yesterday"
          icon={Phone}
          isLoading={isLoading}
        />
        <StatCard
          title="Avg Duration"
          value={stats ? formatDuration(stats.avg_call_duration) : '0m 0s'}
          description="This week"
          icon={Clock}
          isLoading={isLoading}
        />
        <StatCard
          title="Answer Rate"
          value={`${stats?.answer_rate || 0}%`}
          description="Outbound calls"
          icon={CheckCircle}
          isLoading={isLoading}
        />
      </div>

      {/* Charts and tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Call volume chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Call Volume</CardTitle>
            <CardDescription>Inbound and outbound calls over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={callVolume}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="inbound" 
                      name="Inbound" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="outbound" 
                      name="Outbound" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agent performance */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
            <CardDescription>Performance metrics by agent</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : agentPerformance.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mic className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No agents yet. Create your first agent to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {agentPerformance.map((agent) => (
                  <div key={agent.agent_id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${agent.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div>
                        <p className="font-medium">{agent.agent_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {agent.total_calls} calls · {formatDuration(agent.avg_duration)} avg
                        </p>
                      </div>
                    </div>
                    <Badge variant={agent.answer_rate > 70 ? 'default' : 'secondary'}>
                      {agent.answer_rate}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>Monthly usage statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Minutes</p>
                    <p className="text-2xl font-bold">{stats?.total_minutes_this_month || 0}</p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Calls This Week</p>
                    <p className="text-2xl font-bold">{stats?.calls_this_week || 0}</p>
                  </div>
                  <Phone className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
