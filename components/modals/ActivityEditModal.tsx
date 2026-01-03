'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { ImageUpload } from '@/components/ui/ImageUpload';

const activityTypes = [
    { value: 'sightseeing', label: 'Sightseeing' },
    { value: 'dining', label: 'Dining' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'relaxation', label: 'Relaxation' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'nightlife', label: 'Nightlife' },
    { value: 'other', label: 'Other' },
];

interface Activity {
    id?: string;
    name: string;
    description: string;
    type: string;
    cost: number;
    duration: number;
    cityId: string;
    imageUrl: string;
}

interface City {
    id: string;
    name: string;
    country: string;
}

interface ActivityEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    activity: Partial<Activity> | null;
    cities: City[];
    onSave: (activityData: Partial<Activity>) => Promise<void>;
}

export function ActivityEditModal({ isOpen, onClose, activity, cities, onSave }: ActivityEditModalProps) {
    const [formData, setFormData] = useState<Partial<Activity>>({
        name: '',
        description: '',
        type: 'sightseeing',
        cost: 0,
        duration: 60,
        cityId: '',
        imageUrl: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    // Update form data when activity prop changes
    useEffect(() => {
        if (activity) {
            setFormData({
                ...activity,
                name: activity.name || '',
                description: activity.description || '',
                type: activity.type || 'sightseeing',
                cost: activity.cost ?? 0,
                duration: activity.duration ?? 60,
                cityId: activity.cityId || '',
                imageUrl: activity.imageUrl || ''
            });
        } else {
            setFormData({
                name: '',
                description: '',
                type: 'sightseeing',
                cost: 0,
                duration: 60,
                cityId: '',
                imageUrl: ''
            });
        }
    }, [activity]);

    const handleSave = async () => {
        if (!formData.name || !formData.cityId) {
            alert('Name and City are required');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={activity?.id ? "Edit Activity" : "Add New Activity"}
        >
            <div className="space-y-4">
                <Dropdown
                    label="City"
                    options={cities.map(c => ({ value: c.id, label: `${c.name}, ${c.country}` }))}
                    value={formData.cityId || ''}
                    onChange={(value) => setFormData({ ...formData, cityId: value })}
                    placeholder="Select a city"
                />
                <Input
                    label="Activity Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Louvre Museum"
                />
                <Dropdown
                    label="Type"
                    options={activityTypes}
                    value={formData.type || 'sightseeing'}
                    onChange={(value) => setFormData({ ...formData, type: value })}
                />
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={3}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description of the activity..."
                    />
                </div>

                <ImageUpload
                    label="Activity Image"
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Cost ($)"
                        type="number"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    />
                    <Input
                        label="Duration (minutes)"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    />
                </div>
                <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} isLoading={isSaving} className="flex-1">
                        {activity?.id ? 'Save Changes' : 'Create Activity'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
