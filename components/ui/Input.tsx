'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, type = 'text', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={type}
                        className={cn(
                            'w-full h-11 px-4 text-sm bg-white border border-slate-300 rounded-lg',
                            'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
                            'placeholder:text-slate-400 transition-colors',
                            error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
                            icon && 'pl-10',
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1 text-xs text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
