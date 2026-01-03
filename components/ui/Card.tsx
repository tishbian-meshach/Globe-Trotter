'use client';

import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'bg-white rounded-2xl border border-slate-200 shadow-sm',
                hover && 'transition-shadow hover:shadow-md cursor-pointer overflow-hidden',
                onClick && 'cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return <div className={cn('px-6 pt-6 pb-4', className)}>{children}</div>;
}

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
    return <h3 className={cn('text-lg font-semibold text-slate-900', className)}>{children}</h3>;
}

interface CardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
    return <p className={cn('text-sm text-slate-600 mt-1', className)}>{children}</p>;
}

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
    return <div className={cn('px-6 pb-6', className)}>{children}</div>;
}

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
    return <div className={cn('px-6 pb-6 pt-4 border-t border-slate-100', className)}>{children}</div>;
}
