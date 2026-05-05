import { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
    variant?: BadgeVariant;
    children: ReactNode;
    className?: string;
}

export function Badge({ variant = 'primary', children, className = '' }: BadgeProps) {
    const variants = {
        primary: 'bg-red-500/20 text-red-500',
        success: 'bg-green-500/20 text-green-400',
        warning: 'bg-orange-500/20 text-orange-400',
        danger: 'bg-red-500/20 text-red-400',
        info: 'bg-blue-500/20 text-blue-400',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    );
}
