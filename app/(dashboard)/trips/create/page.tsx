'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { addDays } from 'date-fns';

export default function CreateTripPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: addDays(new Date(), 1),
        endDate: addDays(new Date(), 8),
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            const response = await fetch('/api/trips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create trip');
            }

            const trip = await response.json();

            showToast({
                title: 'Trip created!',
                description: 'Now let\'s add some destinations',
                type: 'success',
            });

            router.push(`/trips/${trip.id}`);
        } catch (error: any) {
            showToast({
                title: 'Error',
                description: error.message || 'Failed to create trip',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">Create New Trip</h1>
                    <p className="text-slate-600 mt-2">
                        Start planning your next adventure
                    </p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        <Input
                            label="Trip Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            error={errors.name}
                            placeholder="e.g., European Summer Adventure"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                </svg>
                            }
                        />

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Description (Optional)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all"
                                placeholder="What's this trip about?"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DatePicker
                                label="Start Date"
                                value={formData.startDate}
                                onChange={(date) => setFormData({ ...formData, startDate: date })}
                                minDate={new Date()}
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
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="flex-1"
                            >
                                Create Trip
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Tips */}
                <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-6">
                    <div className="flex gap-3">
                        <div className="text-2xl">💡</div>
                        <div>
                            <h3 className="font-semibold text-teal-900 mb-1">Quick Tip</h3>
                            <p className="text-sm text-teal-700">
                                After creating your trip, you'll be able to add destinations, activities, and manage your budget all in one place!
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
