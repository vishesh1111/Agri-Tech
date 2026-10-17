import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function Card({ children, className = '', hoverEffect, ...props }: CardProps) {
  const isClickable = Boolean(props.onClick) || hoverEffect;
  const hoverStyles = isClickable
    ? 'hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-emerald-300/80 active:scale-[0.99] cursor-pointer'
    : 'hover:border-zinc-300/90 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]';

  return (
    <div
      className={`rounded-xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-250 ease-out ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const variantStyles = {
    primary: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/70',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/70',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/70',
    danger: 'bg-rose-50 text-rose-800 border-rose-200/80 hover:bg-rose-100/70',
    info: 'bg-blue-50 text-blue-800 border-blue-200/80 hover:bg-blue-100/70',
    neutral: 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-all duration-200 hover:scale-105 select-none ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
