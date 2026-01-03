'use client';

import { cn } from '@/lib/utils';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div
            className={cn(
                'border-slate-200 border-t-primary-500 rounded-full animate-spin',
                sizes[size],
                className
            )}
        />
    );
}

interface LoadingProps {
    text?: string;
    className?: string;
}

export function Loading({ text = 'Loading...', className }: LoadingProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center gap-4 py-12', className)}>
            <Spinner size="lg" />
            <p className="text-slate-600">{text}</p>
        </div>
    );
}
