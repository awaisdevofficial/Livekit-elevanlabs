interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'completed' | 'failed' | 'in-progress' | string;
  size?: 'sm' | 'md';
}

const statusStyles: Record<string, { bg: string; text: string; dot?: string }> = {
  active: { bg: 'bg-[#4DFFCE]/15', text: 'text-[#4DFFCE]', dot: '#4DFFCE' },
  inactive: { bg: 'bg-white/10', text: 'text-white/60', dot: '#9CA3AF' },
  completed: { bg: 'bg-[#4DFFCE]/15', text: 'text-[#4DFFCE]', dot: '#4DFFCE' },
  failed: { bg: 'bg-red-500/15', text: 'text-red-400', dot: '#EF4444' },
  'in-progress': { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: '#F59E0B' },
  inbound: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  outbound: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const style = statusStyles[status.toLowerCase()] || statusStyles.inactive;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${style.bg} ${style.text}`}>
      {style.dot && (
        <span 
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: style.dot }}
        />
      )}
      <span className="capitalize">{status.replace('-', ' ')}</span>
    </span>
  );
}
