'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CopyTripButtonProps {
    shareId: string;
}

export function CopyTripButton({ shareId }: CopyTripButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleCopy = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/share/${shareId}/copy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to copy trip');
            }

            const data = await response.json();
            
            // Redirect to the newly copied trip
            router.push(`/trips/${data.tripId}`);
        } catch (error) {
            console.error('Failed to copy trip:', error);
            alert(error instanceof Error ? error.message : 'Failed to copy trip. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleCopy}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Copying...
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Trip
                </>
            )}
        </button>
    );
}
