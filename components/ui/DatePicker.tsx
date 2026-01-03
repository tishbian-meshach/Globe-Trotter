'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DatePickerProps {
    value?: Date;
    onChange: (date: Date) => void;
    label?: string;
    error?: string;
    minDate?: Date;
    maxDate?: Date;
    className?: string;
}

export function DatePicker({
    value,
    onChange,
    label,
    error,
    minDate,
    maxDate,
    className,
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(value || new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get days from previous month to fill the first week
    const firstDayOfMonth = monthStart.getDay();
    const previousMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => {
        const date = new Date(monthStart);
        date.setDate(date.getDate() - (firstDayOfMonth - i));
        return date;
    });

    // Get days from next month to fill the last week
    const lastDayOfMonth = monthEnd.getDay();
    const nextMonthDays = Array.from({ length: 6 - lastDayOfMonth }, (_, i) => {
        const date = new Date(monthEnd);
        date.setDate(date.getDate() + i + 1);
        return date;
    });

    const allDays = [...previousMonthDays, ...days, ...nextMonthDays];

    const handleDateClick = (date: Date) => {
        if (minDate && date < minDate) return;
        if (maxDate && date > maxDate) return;
        onChange(date);
        setIsOpen(false);
    };

    const isDisabled = (date: Date) => {
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        return false;
    };

    return (
        <div className={cn('relative w-full', className)}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'w-full px-4 py-3 text-left bg-white border-2 border-slate-200 rounded-xl transition-all duration-200',
                    'focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100',
                    'flex items-center justify-between',
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-100'
                )}
            >
                <span className={cn(value ? 'text-slate-900' : 'text-slate-400')}>
                    {value ? format(value, 'MMM dd, yyyy') : 'Select date'}
                </span>
                <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-elevated p-4"
                    >
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <div className="text-lg font-semibold">
                                {format(currentMonth, 'MMMM yyyy')}
                            </div>

                            <button
                                type="button"
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Day Labels */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {allDays.map((day, index) => {
                                const isCurrentMonth = isSameMonth(day, currentMonth);
                                const isSelected = value && isSameDay(day, value);
                                const disabled = isDisabled(day);

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleDateClick(day)}
                                        disabled={disabled}
                                        className={cn(
                                            'aspect-square rounded-lg text-sm transition-colors',
                                            'hover:bg-primary-100',
                                            !isCurrentMonth && 'text-slate-300',
                                            isCurrentMonth && !disabled && 'text-slate-900',
                                            isSelected && 'bg-primary-500 text-white hover:bg-primary-600',
                                            disabled && 'text-slate-300 cursor-not-allowed hover:bg-transparent'
                                        )}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}
