'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface City {
    id?: string;
    name: string;
    country: string;
    region?: string | null;
    description?: string | null;
    costIndex: number;
    popularity: number;
    imageUrl?: string | null;
}

interface CityEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    city: Partial<City> | null;
    onSave: (cityData: Partial<City>) => Promise<void>;
}

export function CityEditModal({ isOpen, onClose, city, onSave }: CityEditModalProps) {
    const [formData, setFormData] = useState<Partial<City>>({
        name: '',
        country: '',
        region: '',
        description: '',
        costIndex: 50,
        popularity: 50,
        imageUrl: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    // Update form data when city prop changes
    useEffect(() => {
        if (city) {
            setFormData({
                ...city,
                name: city.name || '',
                country: city.country || '',
                region: city.region || '',
                description: city.description || '',
                costIndex: city.costIndex ?? 50,
                popularity: city.popularity ?? 50,
                imageUrl: city.imageUrl || ''
            });
        } else {
            setFormData({
                name: '',
                country: '',
                region: '',
                description: '',
                costIndex: 50,
                popularity: 50,
                imageUrl: ''
            });
        }
    }, [city]);

    const handleSave = async () => {
        if (!formData.name || !formData.country) {
            alert('Name and Country are required');
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
            title={city?.id ? "Edit City" : "Add New City"}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="City Name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Paris"
                    />
                    <Input
                        label="Country"
                        value={formData.country || ''}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="e.g. France"
                    />
                </div>
                <Input
                    label="Region"
                    value={formData.region || ''}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="e.g. Europe"
                />
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={3}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description of the city..."
                    />
                </div>

                <ImageUpload
                    label="City Image"
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Cost Index (0-100)"
                        type="number"
                        value={formData.costIndex}
                        onChange={(e) => setFormData({ ...formData, costIndex: parseInt(e.target.value) || 0 })}
                    />
                    <Input
                        label="Popularity (0-100)"
                        type="number"
                        value={formData.popularity}
                        onChange={(e) => setFormData({ ...formData, popularity: parseInt(e.target.value) || 0 })}
                    />
                </div>
                <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} isLoading={isSaving} className="flex-1">
                        {city?.id ? 'Save Changes' : 'Create City'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
