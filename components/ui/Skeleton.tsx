'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
    const variants = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-xl',
    };

    return (
        <div
            className={cn(
                'animate-pulse bg-slate-200',
                variants[variant],
                className
            )}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-6 w-3/4" variant="text" />
            <Skeleton className="h-4 w-full" variant="text" />
            <Skeleton className="h-4 w-2/3" variant="text" />
        </div>
    );
}
