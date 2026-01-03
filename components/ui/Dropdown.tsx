'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Option {
    value: string;
    label: string;
    disabled?: boolean;
}

interface DropdownProps {
    options: Option[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    className?: string;
    disabled?: boolean;
}

export function Dropdown({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    label,
    error,
    className,
    disabled = false,
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (optionValue: string) => {
        console.log('Selected:', optionValue);
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className={cn('relative w-full', className)}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => !disabled && setIsOpen(prev => !prev)}
                disabled={disabled}
                className={cn(
                    'w-full h-11 px-4 text-sm text-left bg-white border rounded-lg',
                    'flex items-center justify-between gap-2 transition-colors',
                    disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : '',
                    !disabled && isOpen
                        ? 'border-primary-500 ring-2 ring-primary-100'
                        : 'border-slate-300 hover:border-slate-400',
                    error && 'border-red-500'
                )}
            >
                <span className={selectedOption ? 'text-slate-900' : 'text-slate-400'}>
                    {selectedOption?.label || placeholder}
                </span>
                <svg
                    className={cn('w-4 h-4 text-slate-400 transition-transform', isOpen && 'rotate-180')}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <ul className="absolute z-50 w-full mt-1 py-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {options.length === 0 ? (
                        <li className="px-4 py-2 text-sm text-slate-500">No options</li>
                    ) : (
                        options.map((option) => (
                            <li
                                key={option.value}
                                onClick={() => !option.disabled && handleSelect(option.value)}
                                className={cn(
                                    'px-4 py-2.5 text-sm transition-colors',
                                    option.disabled
                                        ? 'text-slate-400 cursor-not-allowed bg-slate-50'
                                        : 'cursor-pointer hover:bg-primary-50 hover:text-primary-700 text-slate-700',
                                    option.value === value && !option.disabled && 'bg-primary-100 text-primary-700 font-medium'
                                )}
                            >
                                {option.label}
                            </li>
                        ))
                    )}
                </ul>
            )}

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
