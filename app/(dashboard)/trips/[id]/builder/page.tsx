'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Dropdown } from '@/components/ui/Dropdown';
import { useToast } from '@/components/ui/Toast';
import { Loading } from '@/components/ui/Spinner';
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
    name: string;
    cost: number;
    type: string;
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

export default function ItineraryBuilderPage({ params }: PageProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [trip, setTrip] = useState<any>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [stops, setStops] = useState<Stop[]>([]);

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        try {
            const [tripRes, citiesRes] = await Promise.all([
                fetch(`/api/trips/${params.id}`),
                fetch('/api/cities'),
            ]);

            const tripData = await tripRes.json();
            const citiesData = await citiesRes.json();

            setTrip(tripData);
            setCities(citiesData);

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
                    name: a.name,
                    cost: a.cost,
                    type: a.type || 'other'
                })) || []
            }));

            setStops(existingStops);
        } catch (error) {
            showToast({
                title: 'Error',
                description: 'Failed to load trip data',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const addStop = () => {
        const newStop: Stop = {
            _key: uuidv4(),
            cityId: '',
            startDate: new Date(trip.startDate),
            endDate: new Date(trip.startDate),
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

        let newActivity: Activity;

        if (attractionId === 'custom') {
            newActivity = {
                _key: uuidv4(),
                name: '',
                cost: 0,
                type: 'sightseeing'
            };
        } else {
            const attraction = city.attractions.find(a => a.id === attractionId);
            if (!attraction) return;

            newActivity = {
                _key: uuidv4(),
                name: attraction.name,
                cost: attraction.cost,
                type: attraction.type
            };
        }

        setStops(prev => {
            const newStops = [...prev];
            newStops[stopIndex] = {
                ...newStops[stopIndex],
                activities: [...newStops[stopIndex].activities, newActivity]
            };
            return newStops;
        });
    };

    const updateActivity = (stopIndex: number, activityIndex: number, field: keyof Activity, value: any) => {
        setStops(prev => {
            const newStops = [...prev];
            const activities = [...newStops[stopIndex].activities];
            activities[activityIndex] = { ...activities[activityIndex], [field]: value };
            newStops[stopIndex] = { ...newStops[stopIndex], activities };
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

    const saveItinerary = async () => {
        // Validation
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
            // Remove internal _key before sending to API
            const cleanStops = stops.map(({ _key, ...stop }) => stop);

            const response = await fetch(`/api/trips/${params.id}/stops`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stops: cleanStops }),
            });

            if (!response.ok) throw new Error('Failed to save');

            showToast({
                title: 'Saved!',
                description: 'Itinerary updated successfully',
                type: 'success',
            });

            router.push(`/trips/${params.id}`);
        } catch (error) {
            showToast({
                title: 'Error',
                description: 'Failed to save itinerary',
                type: 'error',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <Loading text="Loading itinerary builder..." />;
    }

    const cityOptions = cities.map((city) => ({
        value: city.id,
        label: `${city.name}, ${city.country}`,
    }));

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-slate-900">Itinerary Builder</h1>
                <p className="text-slate-600 mt-2">{trip.name}</p>
            </div>

            {/* Stops */}
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
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => removeStop(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                                            options={cityOptions}
                                            value={stop.cityId}
                                            onChange={(value) => {
                                                console.log('Parent received city update:', value);
                                                updateStop(index, 'cityId', value);
                                            }}
                                            placeholder="Select a city"
                                        />
                                        {stop.cityId && (() => {
                                            const city = cities.find(c => c.id === stop.cityId);
                                            return city ? (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-slate-600">Cost Index:</span>
                                                    <span className="font-medium text-slate-900">{city.costIndex}</span>
                                                    <span className="font-medium text-primary-600">
                                                        $
                                                    </span>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <DatePicker
                                            label="Start Date"
                                            value={stop.startDate}
                                            onChange={(date) => updateStop(index, 'startDate', date)}
                                            minDate={new Date(trip.startDate)}
                                            maxDate={new Date(trip.endDate)}
                                        />

                                        <DatePicker
                                            label="End Date"
                                            value={stop.endDate}
                                            onChange={(date) => updateStop(index, 'endDate', date)}
                                            minDate={stop.startDate}
                                            maxDate={new Date(trip.endDate)}
                                        />
                                    </div>

                                    {/* Activities Section */}
                                    <div className="border-t border-slate-100 pt-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-medium text-slate-700">Activities</label>
                                            <Dropdown
                                                label=""
                                                placeholder="+ Add Activity"
                                                value=""
                                                options={[
                                                    { value: 'custom', label: '+ Create Custom Activity' },
                                                    ...(cities.find(c => c.id === stop.cityId)?.attractions?.map(a => ({
                                                        value: a.id,
                                                        label: `${a.name} ($${a.cost})`
                                                    })) || [])
                                                ]}
                                                onChange={(value) => addActivity(index, value)}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            {stop.activities.map((activity, actIndex) => (
                                                <div key={activity._key} className="flex gap-2 items-start">
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Activity Name"
                                                            value={activity.name}
                                                            onChange={(e) => updateActivity(index, actIndex, 'name', e.target.value)}
                                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                        />
                                                    </div>
                                                    <div className="w-24">
                                                        <input
                                                            type="number"
                                                            placeholder="Cost"
                                                            value={activity.cost}
                                                            onChange={(e) => updateActivity(index, actIndex, 'cost', parseFloat(e.target.value) || 0)}
                                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => removeActivity(index, actIndex)}
                                                        className="p-2 text-slate-400 hover:text-red-500"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                            {stop.activities.length === 0 && (
                                                <div className="text-sm text-slate-400 italic">No activities added yet</div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            value={stop.notes}
                                            onChange={(e) => updateStop(index, 'notes', e.target.value)}
                                            rows={3}
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

            {/* Actions */}
            <div className="flex gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    onClick={saveItinerary}
                    isLoading={isSaving}
                    className="flex-1"
                >
                    Save Itinerary
                </Button>
            </div>
        </div>
    );
}
