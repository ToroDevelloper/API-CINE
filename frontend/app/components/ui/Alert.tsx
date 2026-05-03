import React, { ReactNode } from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    type: AlertType;
    title?: string;
    children: ReactNode;
    className?: string;
}

export function Alert({ type, title, children, className = '' }: AlertProps) {
    const config = {
        success: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: '✓' },
        error: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: '✕' },
        warning: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: '⚠' },
        info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'ℹ' },
    };

    const current = config[type];

    return (
        <div className={`p-4 rounded-lg border ${current.bg} ${current.border} ${className}`}>
            <div className="flex gap-3">
                <span className={`${current.text} font-bold`}>{current.icon}</span>
                <div>
                    {title && <h4 className={`${current.text} font-semibold mb-1`}>{title}</h4>}
                    <div className={`text-sm ${current.text} opacity-90`}>{children}</div>
                </div>
            </div>
        </div>
    );
}
