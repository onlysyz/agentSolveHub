import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  variant?: 'verified' | 'pending' | 'available' | 'solved' | 'default';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    verified: 'bg-green-500/20 text-green-600 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
    available: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
    solved: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
    default: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    verified: { label: '已验证', variant: 'verified' },
    community_verified: { label: '社区验证', variant: 'available' },
    multi_verified: { label: '多次验证', variant: 'verified' },
    possibly_invalid: { label: '疑似失效', variant: 'pending' },
    unverified: { label: '未验证', variant: 'pending' },
    pending: { label: '待补充', variant: 'pending' },
    available: { label: '已有解法', variant: 'available' },
    solved: { label: '已解决', variant: 'solved' },
  };

  const config = statusMap[status] || { label: status, variant: 'default' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
