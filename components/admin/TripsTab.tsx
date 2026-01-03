'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { HiTrash, HiSearch, HiEye, HiPencil, HiLockClosed, HiLockOpen } from 'react-icons/hi';

interface City {
    id: string;
    name: string;
    country: string;
}

interface TripStop {
    id: string;
    city: City;
    startDate: string;
    endDate: string;
    order: number;
}

interface User {
    id: string;
    name?: string;
    email: string;
}

interface Trip {
    id: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    status: string;
    isLocked?: boolean;
    adminNotes?: string;
    user: User;
    stops: TripStop[];
    sharedTrip?: {
        isPublic: boolean;
        shareId: string;
    };
    _count?: {
        expenses: number;
    };
}

export function TripsTab() {
    const router = useRouter();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        fetchTrips();
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
        }
    };

    const fetchTrips = async () => {
        try {
            const params = new URLSearchParams();
            if (cityFilter) params.append('cityId', cityFilter);
            if (statusFilter) params.append('status', statusFilter);

            const res = await fetch(`/api/admin/trips?${params}`);
            if (res.ok) {
                const data = await res.json();
                setTrips(data);
            }
        } catch (error) {
            console.error('Failed to fetch trips:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            fetchTrips();
        }, 300);
        return () => clearTimeout(timer);
    }, [cityFilter, statusFilter]);

    const handleDelete = async (tripId: string) => {
        if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) return;
        try {
            const res = await fetch(`/api/admin/trips/${tripId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                await fetchTrips();
            }
        } catch (error) {
            console.error('Failed to delete trip:', error);
        }
    };

    const openDetailsModal = (trip: Trip) => {
        setSelectedTrip(trip);
        setIsDetailModalOpen(true);
    };

    const openEditPage = (tripId: string) => {
        router.push(`/admin/trips/${tripId}/edit`);
    };

    const handleToggleLock = async (tripId: string, currentlyLocked: boolean) => {
        if (!confirm(`Are you sure you want to ${currentlyLocked ? 'unlock' : 'lock'} this trip?`)) return;
        try {
            const res = await fetch(`/api/admin/trips/${tripId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: currentlyLocked ? 'unlock' : 'lock'
                })
            });
            if (res.ok) {
                await fetchTrips();
            }
        } catch (error) {
            console.error('Failed to toggle lock:', error);
        }
    };

    const filteredTrips = trips.filter(trip =>
        trip.name.toLowerCase().includes(search.toLowerCase()) ||
        trip.user.name?.toLowerCase().includes(search.toLowerCase()) ||
        trip.user.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading && trips.length === 0) {
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
                        placeholder="Search trips..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
                <Dropdown
                    options={[
                        { value: '', label: 'All Cities' },
                        ...cities.map(city => ({ value: city.id, label: city.name }))
                    ]}
                    value={cityFilter}
                    onChange={setCityFilter}
                    placeholder="All Cities"
                    className="w-48"
                />
                <Dropdown
                    options={[
                        { value: '', label: 'All Status' },
                        { value: 'upcoming', label: 'Upcoming' },
                        { value: 'ongoing', label: 'Ongoing' },
                        { value: 'past', label: 'Past' }
                    ]}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    placeholder="All Status"
                    className="w-48"
                />
            </div>

            {/* Trips Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Trip Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Owner</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Cities</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Dates</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTrips.map((trip) => {
                                    return (
                                        <tr key={trip.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-slate-900">{trip.name}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div>
                                                    <div className="text-sm text-slate-900">{trip.user.name || 'No name'}</div>
                                                    <div className="text-xs text-slate-500">{trip.user.email}</div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                <div className="text-sm">
                                                    {trip.stops.slice(0, 2).map(stop => stop.city.name).join(', ')}
                                                    {trip.stops.length > 2 && ` +${trip.stops.length - 2} more`}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600">
                                                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    trip.status === 'upcoming' 
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : trip.status === 'ongoing'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-slate-100 text-slate-800'
                                                }`}>
                                                    {trip.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditPage(trip.id)}
                                                        className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                        title="Edit Trip"
                                                    >
                                                        <HiPencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDetailsModal(trip)}
                                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <HiEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleLock(trip.id, trip.isLocked || false)}
                                                        className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium ${
                                                            trip.isLocked
                                                                ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                                                                : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
                                                        }`}
                                                        title={trip.isLocked ? 'Click to Unlock' : 'Click to Lock'}
                                                    >
                                                        {trip.isLocked ? (
                                                            <>
                                                                <HiLockClosed className="w-4 h-4" />
                                                                <span>Locked</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <HiLockOpen className="w-4 h-4" />
                                                                <span>Unlocked</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(trip.id)}
                                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Trip"
                                                    >
                                                        <HiTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredTrips.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                No trips found
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Trip Details Modal */}
            {selectedTrip && (
                <Modal 
                    isOpen={isDetailModalOpen} 
                    onClose={() => setIsDetailModalOpen(false)} 
                    title="Trip Details"
                >
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">{selectedTrip.name}</h3>
                            {selectedTrip.description && (
                                <p className="text-sm text-slate-600 mt-1">{selectedTrip.description}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500">Owner</label>
                                <div className="text-sm text-slate-900">{selectedTrip.user.name || selectedTrip.user.email}</div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500">Status</label>
                                <div className="text-sm text-slate-900 capitalize">{selectedTrip.status}</div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500">Start Date</label>
                                <div className="text-sm text-slate-900">{new Date(selectedTrip.startDate).toLocaleDateString()}</div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500">End Date</label>
                                <div className="text-sm text-slate-900">{new Date(selectedTrip.endDate).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-2">Itinerary</label>
                            <div className="space-y-2">
                                {selectedTrip.stops.map((stop, index) => (
                                    <div key={stop.id} className="p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="flex items-center justify-center w-6 h-6 bg-primary-500 text-white rounded-full text-xs font-semibold">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1">
                                                <div className="font-medium text-slate-900">{stop.city.name}, {stop.city.country}</div>
                                                <div className="text-xs text-slate-500">
                                                    {new Date(stop.startDate).toLocaleDateString()} - {new Date(stop.endDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)} className="flex-1">
                                Close
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
