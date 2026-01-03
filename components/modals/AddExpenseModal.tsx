'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { useToast } from '@/components/ui/Toast';

interface AddExpenseModalProps {
    tripId: string;
}

export function AddExpenseModal({ tripId }: AddExpenseModalProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'other',
        date: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`/api/trips/${tripId}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                }),
            });

            if (!res.ok) throw new Error('Failed to add expense');

            showToast({
                title: 'Success',
                description: 'Expense added successfully',
                type: 'success',
            });

            setIsOpen(false);
            setFormData({
                description: '',
                amount: '',
                category: 'other',
                date: new Date().toISOString().split('T')[0],
            });
            router.refresh();
        } catch (error) {
            showToast({
                title: 'Error',
                description: 'Failed to save expense',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button onClick={() => setIsOpen(true)}>
                + Add Expense
            </Button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <input
                            required
                            type="text"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="e.g., flight, dinner"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                            <input
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                            <input
                                required
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <Dropdown
                            label="Category"
                            value={formData.category}
                            onChange={(value) => setFormData({ ...formData, category: value })}
                            options={[
                                { value: 'transport', label: 'Transport' },
                                { value: 'accommodation', label: 'Accommodation' },
                                { value: 'activities', label: 'Activities' },
                                { value: 'meals', label: 'Meals' },
                                { value: 'shopping', label: 'Shopping' },
                                { value: 'other', label: 'Other' },
                            ]}
                        />
                    </div>

                    <div className="flex gap-2 justify-end mt-6">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <Button type="submit" isLoading={isLoading}>
                            Save Expense
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
