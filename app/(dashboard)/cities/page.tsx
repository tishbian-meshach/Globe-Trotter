'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { CityEditModal } from '@/components/modals/CityEditModal';
import { CityDetailsModal } from '@/components/modals/CityDetailsModal';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';

interface City {
    id: string;
    name: string;
    country: string;
    region?: string | null;
    description: string | null;
    costIndex: number;
    popularity: number;
    imageUrl?: string | null;
    attractions?: any[];
}

export default function CitiesPage() {
    const { data: session } = useSession();
    const [cities, setCities] = useState<City[]>([]);
    const [filteredCities, setFilteredCities] = useState<City[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [regionFilter, setRegionFilter] = useState('all');

    // Check if user is admin
    const isAdmin = session?.user?.isAdmin || false;

    // Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editCity, setEditCity] = useState<Partial<City> | null>(null);

    // Detail Modal State
    const [viewingCity, setViewingCity] = useState<City | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Saved Destinations State
    const [savedDestinations, setSavedDestinations] = useState<string[]>([]);

    useEffect(() => {
        fetchCities();
        fetchSavedDestinations();
    }, []);

    useEffect(() => {
        filterCities();
    }, [searchQuery, regionFilter, cities]);

    const fetchCities = async () => {
        try {
            const response = await fetch('/api/cities');
            const data = await response.json();
            setCities(data);
        } catch (error) {
            console.error('Failed to fetch cities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSavedDestinations = async () => {
        try {
            const response = await fetch('/api/user/saved-destinations');
            const data = await response.json();
            setSavedDestinations(data.savedDestinations || []);
        } catch (error) {
            console.error('Failed to fetch saved destinations:', error);
        }
    };

    const toggleSaveDestination = async (cityId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        try {
            const response = await fetch('/api/user/saved-destinations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cityId })
            });

            if (!response.ok) throw new Error('Failed to save');

            const data = await response.json();
            setSavedDestinations(data.savedDestinations);

            showToast({
                title: data.isSaved ? 'Saved' : 'Removed',
                description: data.isSaved ? 'City added to your saved destinations' : 'City removed from saved destinations',
                type: 'success'
            });
        } catch (error) {
            showToast({ title: 'Error', description: 'Failed to update saved destinations', type: 'error' });
        }
    };

    const filterCities = () => {
        let filtered = [...cities];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (city) =>
                    city.name.toLowerCase().includes(query) ||
                    city.country.toLowerCase().includes(query)
            );
        }

        if (regionFilter !== 'all') {
            filtered = filtered.filter((city) => city.region === regionFilter);
        }

        setFilteredCities(filtered);
    };

    const regions = ['all', ...Array.from(new Set(cities.map((c) => c.region).filter((r): r is string => r != null)))];
    const regionOptions = regions.map((r) => ({
        value: r,
        label: r === 'all' ? 'All Regions' : r,
    }));

    const getCostLevel = (costIndex: number) => {
        if (costIndex < 30) return { label: 'Budget', variant: 'success' as const };
        if (costIndex < 60) return { label: 'Moderate', variant: 'warning' as const };
        return { label: 'Expensive', variant: 'danger' as const };
    };

    const handleSaveCity = async (cityData: Partial<City>) => {
        try {
            const url = editCity?.id ? `/api/cities/${editCity.id}` : '/api/cities';
            const method = editCity?.id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cityData)
            });

            if (!res.ok) throw new Error('Failed to save');

            await fetchCities();
            setIsModalOpen(false);
            showToast({
                title: 'Success',
                description: `City ${editCity?.id ? 'updated' : 'added'} successfully`,
                type: 'success'
            });
        } catch (error) {
            showToast({ title: 'Error', description: 'Failed to save city', type: 'error' });
            throw error;
        }
    };

    const openEditModal = (city: City) => {
        setEditCity(city);
        setIsModalOpen(true);
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

    if (isLoading) {
        return <Loading text="Loading cities..." />;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">Explore Cities</h1>
                    <p className="text-slate-600 mt-2">
                        Discover amazing destinations for your next trip
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={openCreateModal}>
                        + Add City
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Search"
                    placeholder="Search cities or countries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    }
                />

                <Dropdown
                    options={regionOptions}
                    value={regionFilter}
                    onChange={setRegionFilter}
                    placeholder="Filter by region"
                    label="Region"
                />
            </div>

            {/* Results */}
            <div>
                <div className="text-sm text-slate-600 mb-4">
                    Showing {filteredCities.length} {filteredCities.length === 1 ? 'city' : 'cities'}
                </div>

                {filteredCities.length === 0 ? (
                    <Card className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            No cities found
                        </h3>
                        <p className="text-slate-600">
                            Try adjusting your search or filters
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCities.map((city) => {
                            const costLevel = getCostLevel(city.costIndex);

                            return (
                                <motion.div
                                    key={city.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={() => {
                                        setViewingCity(city);
                                        setIsDetailsModalOpen(true);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Card hover className="h-full">
                                        <div className="h-48 bg-slate-100 rounded-t-2xl overflow-hidden relative group">
                                            {city.imageUrl ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={city.imageUrl}
                                                    alt={city.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-teal-400 to-primary-500" />
                                            )}

                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => toggleSaveDestination(city.id, e)}
                                                    className="bg-white/90 p-2 rounded-full text-slate-700 hover:text-primary-600 shadow-sm"
                                                    title={savedDestinations.includes(city.id) ? 'Remove from saved' : 'Save destination'}
                                                >
                                                    {savedDestinations.includes(city.id) ? (
                                                        <FaBookmark className="w-4 h-4 text-primary-500" />
                                                    ) : (
                                                        <FaRegBookmark className="w-4 h-4" />
                                                    )}
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            openEditModal(city);
                                                        }}
                                                        className="bg-white/90 p-2 rounded-full text-slate-700 hover:text-primary-600 shadow-sm"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="line-clamp-1">{city.name}</CardTitle>
                                                    <CardDescription>{city.country}</CardDescription>
                                                </div>
                                                <Badge variant={costLevel.variant}>{costLevel.label}</Badge>
                                            </div>

                                            {city.description && (
                                                <p className="text-sm text-slate-600 line-clamp-2 mt-3">
                                                    {city.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-1 text-amber-500">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <svg
                                                            key={i}
                                                            className={`w-4 h-4 ${i < Math.floor(city.popularity / 20) ? 'fill-current' : 'fill-slate-200'}`}
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-slate-500">{city.region}</span>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* City Edit Modal */}
            <CityEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                city={editCity}
                onSave={handleSaveCity}
            />

            {/* City Details Modal */}
            <CityDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                city={viewingCity}
            />
        </div>
    );
}
