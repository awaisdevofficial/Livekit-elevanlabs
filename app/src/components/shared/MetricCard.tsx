import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
}

export default function MetricCard({ label, value, change, icon: Icon, iconColor = '#4DFFCE' }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between mb-4">
        <span className="metric-label">{label}</span>
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
      </div>
      <div className="flex items-end gap-3">
        <span className="metric-value">{value}</span>
        {change !== undefined && (
          <span className={`text-xs font-medium mb-1 ${change >= 0 ? 'text-[#4DFFCE]' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
    </div>
  );
}
