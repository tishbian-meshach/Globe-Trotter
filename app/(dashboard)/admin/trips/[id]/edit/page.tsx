'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { Dropdown } from '@/components/ui/Dropdown';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Loading } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { v4 as uuidv4 } from 'uuid';

interface Attraction {
    id: string;
    name: string;
    cost: number;
    type: string;
}

interface City {
    id: string;
    name: string;
    country: string;
    costIndex: number;
    attractions: Attraction[];
}

interface Activity {
    _key: string;
    id?: string;
    attractionId: string;
    name: string;
    cost: number;
    type: string;
    duration?: number | null;
    notes?: string;
}

interface Stop {
    _key: string;
    id?: string;
    cityId: string;
    cityName?: string;
    cityCountry?: string;
    startDate: Date;
    endDate: Date;
    order: number;
    notes: string;
    activities: Activity[];
}

interface PageProps {
    params: {
        id: string;
    };
}

export default function AdminTripEditorPage({ params }: PageProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [trip, setTrip] = useState<any>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [stops, setStops] = useState<Stop[]>([]);
    
    // Trip metadata
    const [tripName, setTripName] = useState('');
    const [tripDescription, setTripDescription] = useState('');
    const [tripImageUrl, setTripImageUrl] = useState('');
    const [tripStartDate, setTripStartDate] = useState<Date>(new Date());
    const [tripEndDate, setTripEndDate] = useState<Date>(new Date());
    const [tripStatus, setTripStatus] = useState('upcoming');
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        try {
            const [tripRes, citiesRes] = await Promise.all([
                fetch(`/api/admin/trips/${params.id}`),
                fetch('/api/cities'),
            ]);

            if (!tripRes.ok) {
                throw new Error('Failed to load trip');
            }

            const tripData = await tripRes.json();
            const citiesData = await citiesRes.json();

            setTrip(tripData);
            setCities(citiesData);

            // Set trip metadata
            setTripName(tripData.name);
            setTripDescription(tripData.description || '');
            setTripImageUrl(tripData.coverImage || '');
            setTripStartDate(new Date(tripData.startDate));
            setTripEndDate(new Date(tripData.endDate));
            setTripStatus(tripData.status);
            setAdminNotes(tripData.adminNotes || '');

            // Convert existing stops to editable format
            const existingStops = tripData.stops.map((stop: any) => ({
                _key: uuidv4(),
                id: stop.id,
                cityId: stop.cityId,
                cityName: stop.city.name,
                cityCountry: stop.city.country,
                startDate: new Date(stop.startDate),
                endDate: new Date(stop.endDate),
                order: stop.order,
                notes: stop.notes || '',
                activities: stop.activities?.map((a: any) => ({
                    _key: uuidv4(),
                    id: a.id,
                    attractionId: a.attractionId || 'custom',
                    name: a.name || a.attraction?.name || '',
                    cost: a.cost || a.attraction?.cost || 0,
                    type: a.type || a.attraction?.type || 'other',
                    duration: a.duration,
                    notes: a.notes || ''
                })) || []
            }));

            setStops(existingStops);
        } catch (error) {
            showToast({
                title: 'Error',
                description: 'Failed to load trip data',
                type: 'error',
            });
            console.error('Load error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addStop = () => {
        const newStop: Stop = {
            _key: uuidv4(),
            cityId: '',
            startDate: tripStartDate,
            endDate: tripStartDate,
            order: stops.length + 1,
            notes: '',
            activities: []
        };
        setStops(prev => [...prev, newStop]);
    };

    const addActivity = (stopIndex: number, attractionId: string) => {
        const stop = stops[stopIndex];
        const city = cities.find(c => c.id === stop.cityId);
        if (!city) return;

        const attraction = city.attractions.find(a => a.id === attractionId);
        if (!attraction) return;

        const newActivity: Activity = {
            _key: uuidv4(),
            attractionId: attraction.id,
            name: attraction.name,
            cost: attraction.cost,
            type: attraction.type
        };

        setStops(prev => {
            const newStops = [...prev];
            newStops[stopIndex] = {
                ...newStops[stopIndex],
                activities: [...newStops[stopIndex].activities, newActivity]
            };
            return newStops;
        });
    };

    const removeActivity = (stopIndex: number, activityIndex: number) => {
        setStops(prev => {
            const newStops = [...prev];
            newStops[stopIndex] = {
                ...newStops[stopIndex],
                activities: newStops[stopIndex].activities.filter((_, i) => i !== activityIndex)
            };
            return newStops;
        });
    };

    const updateStop = useCallback((index: number, field: keyof Stop, value: any) => {
        setStops(prevStops => {
            const newStops = [...prevStops];
            newStops[index] = { ...newStops[index], [field]: value };
            return newStops;
        });
    }, []);

    const removeStop = (index: number) => {
        setStops(prevStops => {
            const newStops = prevStops.filter((_, i) => i !== index);
            // Reorder
            return newStops.map((stop, i) => ({ ...stop, order: i + 1 }));
        });
    };

    const moveStop = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= stops.length) return;

        setStops(prevStops => {
            const newStops = [...prevStops];
            [newStops[index], newStops[newIndex]] = [newStops[newIndex], newStops[index]];
            // Update orders
            return newStops.map((stop, i) => ({ ...stop, order: i + 1 }));
        });
    };

    const saveTrip = async () => {
        // Validation
        if (!tripName.trim()) {
            showToast({
                title: 'Validation Error',
                description: 'Trip name is required',
                type: 'error',
            });
            return;
        }

        if (tripEndDate <= tripStartDate) {
            showToast({
                title: 'Validation Error',
                description: 'End date must be after start date',
                type: 'error',
            });
            return;
        }

        for (const stop of stops) {
            if (!stop.cityId) {
                showToast({
                    title: 'Validation Error',
                    description: 'Please select a city for all stops',
                    type: 'error',
                });
                return;
            }
        }

        setIsSaving(true);

        try {
            // First update trip metadata
            const metadataRes = await fetch(`/api/admin/trips/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'edit',
                    name: tripName,
                    description: tripDescription,
                    imageUrl: tripImageUrl,
                    startDate: tripStartDate.toISOString(),
                    endDate: tripEndDate.toISOString(),
                    status: tripStatus,
                    adminNotes: adminNotes
                }),
            });

            if (!metadataRes.ok) throw new Error('Failed to update trip metadata');

            // Then update stops and itinerary
            const cleanStops = stops.map(({ _key, ...stop }) => ({
                ...stop,
                activities: stop.activities.map(({ _key, ...activity }) => activity)
            }));

            const stopsRes = await fetch(`/api/admin/trips/${params.id}/stops`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stops: cleanStops }),
            });

            if (!stopsRes.ok) throw new Error('Failed to save itinerary');

            showToast({
                title: 'Saved!',
                description: 'Trip updated successfully',
                type: 'success',
            });

            router.push('/admin');
        } catch (error) {
            showToast({
                title: 'Error',
                description: 'Failed to save trip',
                type: 'error',
            });
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <Loading text="Loading trip editor..." />;
    }

    if (!trip) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Trip not found</h2>
                    <Button onClick={() => router.push('/admin')}>Back to Admin</Button>
                </div>
            </div>
        );
    }

    // Helper to get disabled cities (selected in other stops)
    const getCityOptions = (currentCityId: string) => {
        const usedCityIds = stops.map(s => s.cityId).filter(id => id && id !== currentCityId);

        return cities.map((city) => ({
            value: city.id,
            label: `${city.name}, ${city.country}`,
            disabled: usedCityIds.includes(city.id)
        }));
    };

    const statusOptions = [
        { value: 'planning', label: 'Planning' },
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'ongoing', label: 'Ongoing' },
        { value: 'past', label: 'Past' },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-bold text-slate-900">Admin Trip Editor</h1>
                        <Badge variant="warning">Admin Mode</Badge>
                        {trip.isLocked && <Badge variant="danger">Locked</Badge>}
                    </div>
                    <p className="text-slate-600">Full editing control for: <span className="font-medium">{trip.user.name || trip.user.email}</span></p>
                </div>
            </div>

            {/* Trip Metadata Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Trip Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        label="Trip Name"
                        value={tripName}
                        onChange={(e) => setTripName(e.target.value)}
                        placeholder="My Amazing Trip"
                    />
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            value={tripDescription}
                            onChange={(e) => setTripDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all font-sans"
                            placeholder="Trip description..."
                        />
                    </div>

                    <ImageUpload
                        label="Trip Cover Image"
                        value={tripImageUrl}
                        onChange={setTripImageUrl}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <DatePicker
                            label="Start Date"
                            value={tripStartDate}
                            onChange={setTripStartDate}
                        />

                        <DatePicker
                            label="End Date"
                            value={tripEndDate}
                            onChange={setTripEndDate}
                            minDate={tripStartDate}
                        />
                    </div>

                    <Dropdown
                        label="Status"
                        options={statusOptions}
                        value={tripStatus}
                        onChange={setTripStatus}
                    />

                    <div className="border-t border-slate-200 pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <label className="block text-sm font-medium text-slate-700">Admin Notes</label>
                            <Badge variant="info" className="text-xs">Admin Only</Badge>
                        </div>
                        <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all font-sans"
                            placeholder="Internal notes visible only to admins..."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Itinerary Section */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Itinerary</h2>
                
                <div className="space-y-6">
                    <AnimatePresence mode='popLayout'>
                        {stops.map((stop, index) => (
                            <motion.div
                                key={stop._key}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Stop {index + 1}</CardTitle>
                                            <div className="flex items-center gap-2">
                                                {index > 0 && (
                                                    <button
                                                        onClick={() => moveStop(index, 'up')}
                                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="Move up"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {index < stops.length - 1 && (
                                                    <button
                                                        onClick={() => moveStop(index, 'down')}
                                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="Move down"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => removeStop(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove stop"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Dropdown
                                                label="City"
                                                options={getCityOptions(stop.cityId)}
                                                value={stop.cityId}
                                                onChange={(value) => updateStop(index, 'cityId', value)}
                                                placeholder="Select a city"
                                            />
                                            {stop.cityId && (() => {
                                                const city = cities.find(c => c.id === stop.cityId);
                                                return city ? (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-slate-600">Cost Index:</span>
                                                        <span className="font-medium text-slate-900">{city.costIndex}</span>
                                                        <span className="font-medium text-primary-600">$</span>
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <DatePicker
                                                label="Start Date"
                                                value={stop.startDate}
                                                onChange={(date) => updateStop(index, 'startDate', date)}
                                                minDate={tripStartDate}
                                                maxDate={tripEndDate}
                                            />

                                            <DatePicker
                                                label="End Date"
                                                value={stop.endDate}
                                                onChange={(date) => updateStop(index, 'endDate', date)}
                                                minDate={stop.startDate}
                                                maxDate={tripEndDate}
                                            />
                                        </div>

                                        {/* Activities Section */}
                                        <div className="border-t border-slate-100 pt-4">
                                            <label className="text-sm font-medium text-slate-700 mb-3 block">Activities</label>

                                            <div className="space-y-3 mb-3">
                                                {stop.activities.map((activity, actIndex) => (
                                                    <div key={activity._key} className="flex gap-2 items-center bg-slate-50 p-3 rounded-lg group">
                                                        {/* Read-Only Display */}
                                                        <div className="flex-1 flex flex-col">
                                                            <span className="text-sm font-medium text-slate-800">{activity.name}</span>
                                                            <span className="text-xs text-slate-500 capitalize">{activity.type}</span>
                                                        </div>
                                                        <div className="w-24 text-right">
                                                            <span className="text-sm font-medium text-slate-700">
                                                                ${activity.cost}
                                                            </span>
                                                        </div>

                                                        <button
                                                            onClick={() => removeActivity(index, actIndex)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                            title="Remove"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                                {stop.activities.length === 0 && (
                                                    <div className="text-sm text-slate-400 italic py-2 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                                        No activities added yet
                                                    </div>
                                                )}
                                            </div>

                                            {/* Add Activity Controls */}
                                            <Dropdown
                                                label=""
                                                placeholder={stop.cityId ? "+ Add from Catalog" : "Select City First"}
                                                value=""
                                                options={[
                                                    ...(cities.find(c => c.id === stop.cityId)?.attractions?.map(a => ({
                                                        value: a.id,
                                                        label: `${a.name} ($${a.cost})`,
                                                        disabled: stop.activities.some(act => act.attractionId === a.id)
                                                    })) || [])
                                                ]}
                                                onChange={(value) => addActivity(index, value)}
                                                disabled={!stop.cityId}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Notes (Optional)
                                            </label>
                                            <textarea
                                                value={stop.notes}
                                                onChange={(e) => updateStop(index, 'notes', e.target.value)}
                                                rows={2}
                                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all font-sans"
                                                placeholder="Any special notes for this stop..."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Add Stop Button */}
                    <button
                        onClick={addStop}
                        className="w-full p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:border-primary-500 hover:bg-primary-50 transition-all text-slate-600 hover:text-primary-600 font-medium"
                    >
                        + Add Destination
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 sticky bottom-0 bg-white/95 backdrop-blur-sm py-4 border-t border-slate-200">
                <Button
                    variant="outline"
                    onClick={() => router.push('/admin')}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    onClick={saveTrip}
                    isLoading={isSaving}
                    className="flex-1"
                >
                    Save All Changes
                </Button>
            </div>
        </div>
    );
}
