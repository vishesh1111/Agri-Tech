import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/60',
    danger: 'bg-rose-50 text-rose-800 border-rose-200/60',
    info: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    outline: 'bg-transparent text-zinc-700 border-zinc-200',
    neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200'
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-[11px] px-2.5 py-0.5'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
