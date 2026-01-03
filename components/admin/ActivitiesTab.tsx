'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { HiPencil, HiTrash, HiPlus, HiSearch, HiEyeOff, HiEye } from 'react-icons/hi';
import { ActivityEditModal } from '@/components/modals/ActivityEditModal';

interface City {
    id: string;
    name: string;
    country: string;
}

interface Attraction {
    id: string;
    name: string;
    description?: string;
    type: string;
    cost: number;
    duration?: number;
    rating: number;
    reviews: number;
    imageUrl?: string;
    location?: string;
    isHidden: boolean;
    city: City;
    createdAt: string;
}

const ATTRACTION_TYPES = [
    'sightseeing',
    'dining',
    'adventure',
    'relaxation',
    'shopping',
    'entertainment',
    'cultural',
    'nightlife'
];

export function ActivitiesTab() {
    const [attractions, setAttractions] = useState<Attraction[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [editAttraction, setEditAttraction] = useState<Partial<Attraction> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchAttractions();
        fetchCities();
    }, []);

    const fetchAttractions = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (typeFilter) params.append('type', typeFilter);

            const res = await fetch(`/api/admin/attractions?${params}`);
            if (res.ok) {
                const data = await res.json();
                setAttractions(data);
            }
        } catch (error) {
            console.error('Failed to fetch attractions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCities = async () => {
        try {
            const res = await fetch('/api/cities');
            if (res.ok) {
                const data = await res.json();
                setCities(data);
            }
        } catch (error) {
            console.error('Failed to fetch cities:', error);
        }
    };

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            fetchAttractions();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, typeFilter]);

    const openCreateModal = () => {
        setEditAttraction({
            name: '',
            description: '',
            type: 'sightseeing',
            cost: 0,
            duration: undefined,
            imageUrl: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (attraction: Attraction) => {
        setEditAttraction(attraction);
        setIsModalOpen(true);
    };

    const handleSaveActivity = async (activityData: Partial<Attraction>) => {
        try {
            const url = editAttraction?.id
                ? `/api/attractions/${editAttraction.id}`
                : '/api/attractions';
            const method = editAttraction?.id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activityData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save');
            }

            await fetchAttractions();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed:', error);
            throw error;
        }
    };

    const handleToggleHidden = async (attraction: Attraction) => {
        try {
            const res = await fetch(`/api/admin/attractions/${attraction.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...attraction, isHidden: !attraction.isHidden })
            });
            if (res.ok) {
                await fetchAttractions();
            }
        } catch (error) {
            console.error('Failed to toggle hidden:', error);
        }
    };

    const handleDelete = async (attractionId: string) => {
        if (!confirm('Are you sure you want to delete this attraction?')) return;
        try {
            const res = await fetch(`/api/admin/attractions/${attractionId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                await fetchAttractions();
            }
        } catch (error) {
            console.error('Failed to delete attraction:', error);
        }
    };

    if (loading && attractions.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name or city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
                <Dropdown
                    options={[
                        { value: '', label: 'All Types' },
                        ...ATTRACTION_TYPES.map(type => ({
                            value: type,
                            label: type.charAt(0).toUpperCase() + type.slice(1)
                        }))
                    ]}
                    value={typeFilter}
                    onChange={setTypeFilter}
                    placeholder="All Types"
                    className="w-48"
                />
                <Button onClick={openCreateModal}>
                    <HiPlus className="w-5 h-5 mr-2" />
                    Add Attraction
                </Button>
            </div>

            {/* Attractions Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">City</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Cost</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Rating</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attractions.map((attraction) => (
                                    <tr key={attraction.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-slate-900">{attraction.name}</div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            {attraction.city.name}, {attraction.city.country}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {attraction.type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            ${attraction.cost.toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            ⭐ {attraction.rating.toFixed(1)} ({attraction.reviews})
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                attraction.isHidden 
                                                    ? 'bg-red-100 text-red-800' 
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {attraction.isHidden ? 'Hidden' : 'Visible'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleHidden(attraction)}
                                                    className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                    title={attraction.isHidden ? 'Unhide' : 'Hide'}
                                                >
                                                    {attraction.isHidden ? <HiEye className="w-4 h-4" /> : <HiEyeOff className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(attraction)}
                                                    className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                >
                                                    <HiPencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(attraction.id)}
                                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <HiTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {attractions.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                No attractions found
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Activity Edit Modal */}
            <ActivityEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                activity={editAttraction}
                cities={cities}
                onSave={handleSaveActivity}
            />
        </div>
    );
}
