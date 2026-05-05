import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: ReactNode;
    children: ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    icon,
    className = '',
    children,
    ...props
}: ButtonProps) {
    const variants = {
        primary: 'bg-red-600 hover:bg-red-700 text-white shadow-md',
        secondary: 'bg-gray-800 border border-gray-700 text-white hover:border-red-500 hover:bg-gray-700',
        danger: 'bg-red-500 hover:bg-red-600 text-white shadow-md',
        ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-800',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {icon}
            {children}
        </button>
    );
}
