'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

export function Tooltip({
    content,
    children,
    position = 'top',
    className,
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            'absolute z-50 px-3 py-2 text-sm text-white bg-slate-900 rounded-lg shadow-lg whitespace-nowrap pointer-events-none',
                            positions[position],
                            className
                        )}
                    >
                        {content}

                        {/* Arrow */}
                        <div
                            className={cn(
                                'absolute w-2 h-2 bg-slate-900 rotate-45',
                                position === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
                                position === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
                                position === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
                                position === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2'
                            )}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
