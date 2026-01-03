
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { EditTripModal } from '@/components/modals/EditTripModal';

interface EditTripButtonProps {
    trip: any; // Using any for simplicity here to avoid re-defining Trip type fully, should match server Trip structure
}

export function EditTripButton({ trip }: EditTripButtonProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <>
            <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
                className="gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Trip
            </Button>

            <EditTripModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                trip={trip}
            />
        </>
    );
}
