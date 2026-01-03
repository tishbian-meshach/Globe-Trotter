'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { HiPencil, HiTrash, HiPlus, HiSearch } from 'react-icons/hi';
import { CityEditModal } from '@/components/modals/CityEditModal';

interface City {
    id: string;
    name: string;
    country: string;
    region?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    costIndex: number;
    popularity: number;
    latitude?: number | null;
    longitude?: number | null;
    _count?: {
        stops: number;
    };
}

export function CitiesTab() {
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editCity, setEditCity] = useState<Partial<City> | null>(null);

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            const res = await fetch('/api/cities');
            if (res.ok) {
                const data = await res.json();
                setCities(data);
            }
        } catch (error) {
            console.error('Failed to fetch cities:', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditCity({
            name: '',
            country: '',
            region: '',
            description: '',
            costIndex: 50,
            popularity: 50,
            imageUrl: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (city: City) => {
        setEditCity(city);
        setIsModalOpen(true);
    };

    const handleSaveCity = async (cityData: Partial<City>) => {
        try {
            const url = editCity?.id
                ? `/api/cities/${editCity.id}`
                : '/api/cities';
            const method = editCity?.id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cityData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save');
            }

            await fetchCities();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed:', error);
            throw error;
        }
    };

    const handleDelete = async (cityId: string) => {
        if (!confirm('Are you sure you want to delete this city?')) return;
        try {
            const res = await fetch(`/api/admin/cities/${cityId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                await fetchCities();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete city');
            }
        } catch (error) {
            console.error('Failed to delete city:', error);
        }
    };

    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(search.toLowerCase()) ||
        city.country.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative flex-1 w-full sm:max-w-xs">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search cities..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
                <Button onClick={openCreateModal} className="flex items-center gap-2">
                    <HiPlus className="w-4 h-4" />
                    Add City
                </Button>
            </div>

            {/* Cities Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">City</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Country</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Trips</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Cost Index</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Popularity</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCities.map((city) => (
                                    <tr key={city.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                {city.imageUrl && (
                                                    <img
                                                        src={city.imageUrl}
                                                        alt={city.name}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium text-slate-900">{city.name}</div>
                                                    {city.region && (
                                                        <div className="text-sm text-slate-500">{city.region}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">{city.country}</td>
                                        <td className="py-3 px-4 text-slate-600">{city._count?.stops || 0}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full"
                                                        style={{ width: `${city.costIndex}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-slate-600">{city.costIndex}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary-500 rounded-full"
                                                        style={{ width: `${city.popularity}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-slate-600">{city.popularity}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(city)}
                                                    className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                >
                                                    <HiPencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(city.id)}
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
                        {filteredCities.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                No cities found
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* City Edit Modal */}
            <CityEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                city={editCity}
                onSave={handleSaveCity}
            />
        </div>
    );
}
