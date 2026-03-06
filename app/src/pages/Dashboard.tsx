import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Clock, Bot, DollarSign, ArrowRight, Plus } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import PageHeader from '@/components/shared/PageHeader';
import MetricCard from '@/components/shared/MetricCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockCalls, mockChartData, mockAgents } from '@/data/mock';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [showCallModal, setShowCallModal] = useState(false);

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

  const recentCalls = useMemo(() => {
    return [...mockCalls]
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, 5);
  }, []);

  const chartData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return mockChartData.slice(-days).map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [timeRange]);

  const handleMakeCall = () => {
    setShowCallModal(true);
  };

  const startCall = () => {
    toast.success('Call initiated!');
    setShowCallModal(false);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your voice AI activity"
        actions={
          <>
            <Link to="/agents/new" className="btn-primary">
              <Plus size={16} />
              New Agent
            </Link>
            <button onClick={handleMakeCall} className="btn-secondary">
              <Phone size={16} />
              Make a Call
            </button>
          </>
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

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white">Call Volume</h3>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5">
              {(['7d', '30d', '90d'] as const).map((range) => (
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
          </div>
          
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4DFFCE" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4DFFCE" stopOpacity={0}/>
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
                <Area
                  type="monotone"
                  dataKey="calls"
                  stroke="#4DFFCE"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCalls)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Calls */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white">Recent Calls</h3>
            <Link to="/calls" className="text-sm text-[#4DFFCE] hover:underline flex items-center gap-1">
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {recentCalls.map((call) => (
              <div 
                key={call.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    call.direction === 'inbound' ? 'bg-blue-500/15' : 'bg-purple-500/15'
                  }`}>
                    <Phone size={14} className={call.direction === 'inbound' ? 'text-blue-400' : 'text-purple-400'} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{call.agentName}</p>
                    <p className="text-xs text-white/40">{call.to}</p>
                  </div>
                </div>
                <StatusBadge status={call.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Make Call Modal */}
      <Dialog open={showCallModal} onOpenChange={setShowCallModal}>
        <DialogContent className="glass-card border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Make a Call</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="form-label">Agent</label>
              <select className="form-input">
                {mockAgents.filter(a => a.status === 'active').map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="form-input"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setShowCallModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={startCall}
                className="btn-primary flex-1"
              >
                <Phone size={16} />
                Start Call
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
