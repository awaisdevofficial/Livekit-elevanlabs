import { useState, useMemo } from 'react';
import { Phone, Clock, Bot, DollarSign } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import MetricCard from '@/components/shared/MetricCard';
import { mockCalls, mockChartData, mockAgents } from '@/data/mock';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | '90d'>('7d');

  const metrics = useMemo(() => {
    const totalCalls = mockCalls.filter(c => c.status === 'completed').length;
    const totalMinutes = Math.floor(mockCalls.reduce((acc, c) => acc + c.duration, 0) / 60);
    const activeAgents = mockAgents.filter(a => a.status === 'active').length;
    const totalCost = (totalMinutes * 0.05).toFixed(2);

    return {
      totalCalls,
      totalMinutes,
      activeAgents,
      totalCost,
    };
  }, []);

  const chartData = useMemo(() => {
    const days = timeRange === 'today' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return mockChartData.slice(-days).map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [timeRange]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Analytics"
        subtitle="Detailed insights into your call activity"
        actions={
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5">
            {(['today', '7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  timeRange === range
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total Calls"
          value={metrics.totalCalls.toLocaleString()}
          change={12}
          icon={Phone}
          iconColor="#4DFFCE"
        />
        <MetricCard
          label="Minutes Used"
          value={metrics.totalMinutes.toLocaleString()}
          change={8}
          icon={Clock}
          iconColor="#60A5FA"
        />
        <MetricCard
          label="Active Agents"
          value={metrics.activeAgents}
          icon={Bot}
          iconColor="#34D399"
        />
        <MetricCard
          label="Total Cost"
          value={`$${metrics.totalCost}`}
          icon={DollarSign}
          iconColor="#FBBF24"
        />
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Call Volume Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium text-white mb-6">Call Volume</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4DFFCE" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4DFFCE" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(14,17,22,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar 
                  dataKey="calls" 
                  fill="url(#barGradient)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Duration Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium text-white mb-6">Average Call Duration</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(14,17,22,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="duration" 
                  stroke="#60A5FA" 
                  strokeWidth={2}
                  dot={{ fill: '#60A5FA', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#60A5FA' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
