import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
    return (
        <div
            className={`bg-gray-900 border border-gray-800 rounded-xl p-5 transition-all duration-300 ${
                hover ? 'hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10' : 'shadow-md'
            } ${className}`}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    className?: string;
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
    return (
        <div className={`flex justify-between items-start mb-4 ${className}`}>
            <div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}
