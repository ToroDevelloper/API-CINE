import React from 'react';

interface AvatarProps {
    src?: string;
    alt?: string;
    fallback: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Avatar({ src, alt, fallback, size = 'md', className = '' }: AvatarProps) {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
    };

    return (
        <div
            className={`relative inline-flex items-center justify-center overflow-hidden bg-gray-800 rounded-full border border-gray-700 ${sizes[size]} ${className}`}
        >
            {src ? (
                <img src={src} alt={alt || fallback} className="w-full h-full object-cover" />
            ) : (
                <span className="font-medium text-gray-300">{fallback.substring(0, 2).toUpperCase()}</span>
            )}
        </div>
    );
}
