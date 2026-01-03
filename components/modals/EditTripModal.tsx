
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Dropdown } from '@/components/ui/Dropdown';

interface EditTripModalProps {
    isOpen: boolean;
    onClose: () => void;
    trip: {
        id: string;
        name: string;
        description: string;
        startDate: string | Date;
        endDate: string | Date;
        coverImage?: string;
        status?: string;
    };
}

export function EditTripModal({ isOpen, onClose, trip }: EditTripModalProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: trip.name,
        description: trip.description || '',
        startDate: new Date(trip.startDate),
        endDate: new Date(trip.endDate),
        coverImage: trip.coverImage || '',
        status: trip.status || 'planning',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async () => {
        setErrors({});

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Trip name is required';
        if (formData.endDate <= formData.startDate) {
            newErrors.endDate = 'End date must be after start date';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`/api/trips/${trip.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update trip');
            }

            showToast({
                title: 'Success',
                description: 'Trip updated successfully',
                type: 'success',
            });

            onClose();
            router.refresh();
        } catch (error: any) {
            showToast({
                title: 'Error',
                description: error.message || 'Failed to update trip',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Trip Details"
        >
            <div className="space-y-6">
                <Input
                    label="Trip Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    placeholder="e.g., European Summer Adventure"
                />

                <ImageUpload
                    label="Trip Cover Image"
                    value={formData.coverImage}
                    onChange={(url) => setFormData({ ...formData, coverImage: url })}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Dropdown
                        label="Status"
                        value={formData.status}
                        onChange={(value) => setFormData({ ...formData, status: value })}
                        options={[
                            { value: 'planning', label: 'Planning' },
                            { value: 'upcoming', label: 'Upcoming' },
                            { value: 'ongoing', label: 'Ongoing' },
                            { value: 'completed', label: 'Completed' },
                        ]}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="What's this trip about?"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <DatePicker
                        label="Start Date"
                        value={formData.startDate}
                        onChange={(date) => setFormData({ ...formData, startDate: date })}
                    />

                    <DatePicker
                        label="End Date"
                        value={formData.endDate}
                        onChange={(date) => setFormData({ ...formData, endDate: date })}
                        error={errors.endDate}
                        minDate={formData.startDate}
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        isLoading={isLoading}
                        className="flex-1"
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
