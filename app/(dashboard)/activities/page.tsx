'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Spinner';

const activityTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'sightseeing', label: 'Sightseeing' },
    { value: 'dining', label: 'Dining' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'relaxation', label: 'Relaxation' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'other', label: 'Other' },
];

const costRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'free', label: 'Free' },
    { value: 'low', label: 'Under $50' },
    { value: 'medium', label: '$50 - $150' },
    { value: 'high', label: 'Over $150' },
];

const durationOptions = [
    { value: 'all', label: 'Any Duration' },
    { value: 'short', label: 'Under 2 hours' },
    { value: 'medium', label: '2-4 hours' },
    { value: 'long', label: '4+ hours' },
];

// Mock activities data (in real app, this would come from API)
const mockActivities = [
    {
        id: '1',
        name: 'Eiffel Tower Visit',
        description: 'Visit the iconic Eiffel Tower and enjoy panoramic views of Paris',
        type: 'sightseeing',
        cost: 25,
        duration: 120,
        imageUrl: '',
        location: 'Paris, France',
        rating: 4.8,
        reviews: 2341,
    },
    {
        id: '2',
        name: 'Seine River Cruise',
        description: 'Romantic dinner cruise along the Seine with live music',
        type: 'dining',
        cost: 85,
        duration: 180,
        imageUrl: '',
        location: 'Paris, France',
        rating: 4.6,
        reviews: 1543,
    },
    {
        id: '3',
        name: 'Louvre Museum Tour',
        description: 'Guided tour of the world-famous Louvre Museum',
        type: 'sightseeing',
        cost: 45,
        duration: 240,
        imageUrl: '',
        location: 'Paris, France',
        rating: 4.9,
        reviews: 3892,
    },
    {
        id: '4',
        name: 'Hot Air Balloon Ride',
        description: 'Breathtaking hot air balloon experience over the countryside',
        type: 'adventure',
        cost: 220,
        duration: 180,
        imageUrl: '',
        location: 'Paris, France',
        rating: 4.7,
        reviews: 876,
    },
    {
        id: '5',
        name: 'Spa Day at Luxury Resort',
        description: 'Full day spa treatment with massage and wellness',
        type: 'relaxation',
        cost: 180,
        duration: 360,
        imageUrl: '',
        location: 'Paris, France',
        rating: 4.5,
        reviews: 621,
    },
];

export default function ActivitiesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [costFilter, setCostFilter] = useState('all');
    const [durationFilter, setDurationFilter] = useState('all');
    const [activities, setActivities] = useState(mockActivities);
    const [filteredActivities, setFilteredActivities] = useState(mockActivities);
    const [selectedActivity, setSelectedActivity] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        filterActivities();
    }, [searchQuery, typeFilter, costFilter, durationFilter]);

    const filterActivities = () => {
        let filtered = [...activities];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (activity) =>
                    activity.name.toLowerCase().includes(query) ||
                    activity.description.toLowerCase().includes(query) ||
                    activity.location.toLowerCase().includes(query)
            );
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter((activity) => activity.type === typeFilter);
        }

        // Cost filter
        if (costFilter !== 'all') {
            filtered = filtered.filter((activity) => {
                if (costFilter === 'free') return activity.cost === 0;
                if (costFilter === 'low') return activity.cost > 0 && activity.cost < 50;
                if (costFilter === 'medium') return activity.cost >= 50 && activity.cost <= 150;
                if (costFilter === 'high') return activity.cost > 150;
                return true;
            });
        }

        // Duration filter
        if (durationFilter !== 'all') {
            filtered = filtered.filter((activity) => {
                if (durationFilter === 'short') return activity.duration < 120;
                if (durationFilter === 'medium') return activity.duration >= 120 && activity.duration <= 240;
                if (durationFilter === 'long') return activity.duration > 240;
                return true;
            });
        }

        setFilteredActivities(filtered);
    };

    const getTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            sightseeing: '🏛️',
            dining: '🍽️',
            adventure: '🏔️',
            relaxation: '🧘',
            shopping: '🛍️',
            other: '🎯',
        };
        return icons[type] || '🎯';
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            sightseeing: 'info',
            dining: 'warning',
            adventure: 'danger',
            relaxation: 'success',
            shopping: 'default',
            other: 'default',
        };
        return colors[type] || 'default';
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-slate-900">Discover Activities</h1>
                <p className="text-slate-600 mt-2">
                    Find and plan amazing experiences for your trip
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Input
                            label="Search"
                            placeholder="Search activities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            }
                        />

                        <Dropdown
                            label="Type"
                            options={activityTypes}
                            value={typeFilter}
                            onChange={setTypeFilter}
                        />

                        <Dropdown
                            label="Price Range"
                            options={costRanges}
                            value={costFilter}
                            onChange={setCostFilter}
                        />

                        <Dropdown
                            label="Duration"
                            options={durationOptions}
                            value={durationFilter}
                            onChange={setDurationFilter}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <div>
                <div className="text-sm text-slate-600 mb-4">
                    {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'} found
                </div>

                {filteredActivities.length === 0 ? (
                    <Card className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            No activities found
                        </h3>
                        <p className="text-slate-600">
                            Try adjusting your filters or search query
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredActivities.map((activity) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card hover className="h-full cursor-pointer" onClick={() => {
                                    setSelectedActivity(activity);
                                    setShowModal(true);
                                }}>
                                    {/* Image Placeholder */}
                                    <div className="h-48 bg-gradient-to-br from-primary-400 to-teal-400 rounded-t-2xl flex items-center justify-center text-6xl">
                                        {getTypeIcon(activity.type)}
                                    </div>

                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="line-clamp-1">{activity.name}</CardTitle>
                                                <div className="text-sm text-slate-600 mt-1">{activity.location}</div>
                                            </div>
                                            <Badge variant={getTypeColor(activity.type) as any}>
                                                {activity.type}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        <p className="text-sm text-slate-600 line-clamp-2">
                                            {activity.description}
                                        </p>

                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-1 text-amber-500">
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span className="font-medium">{activity.rating}</span>
                                                <span className="text-slate-500">({activity.reviews})</span>
                                            </div>

                                            <div className="font-semibold text-primary-600">
                                                {activity.cost === 0 ? 'Free' : `$${activity.cost}`}
                                            </div>
                                        </div>

                                        {activity.duration && (
                                            <div className="text-sm text-slate-600">
                                                ⏱️ {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Activity Detail Modal */}
            {selectedActivity && (
                <Modal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedActivity(null);
                    }}
                    title={selectedActivity.name}
                >
                    <div className="space-y-6">
                        {/* Image */}
                        <div className="h-64 bg-gradient-to-br from-primary-400 to-teal-400 rounded-xl flex items-center justify-center text-8xl">
                            {getTypeIcon(selectedActivity.type)}
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Badge variant={getTypeColor(selectedActivity.type) as any}>
                                    {selectedActivity.type}
                                </Badge>
                                <div className="flex items-center gap-1 text-amber-500">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="font-semibold">{selectedActivity.rating}</span>
                                    <span className="text-sm text-slate-600">({selectedActivity.reviews} reviews)</span>
                                </div>
                            </div>

                            <div className="text-slate-700 leading-relaxed">
                                {selectedActivity.description}
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-200">
                                <div>
                                    <div className="text-sm text-slate-600 mb-1">Location</div>
                                    <div className="font-medium text-slate-900">{selectedActivity.location}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-600 mb-1">Duration</div>
                                    <div className="font-medium text-slate-900">
                                        {Math.floor(selectedActivity.duration / 60)}h {selectedActivity.duration % 60}m
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-600 mb-1">Price</div>
                                    <div className="font-medium text-primary-600 text-lg">
                                        {selectedActivity.cost === 0 ? 'Free' : `$${selectedActivity.cost}`}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-600 mb-1">Type</div>
                                    <div className="font-medium text-slate-900 capitalize">{selectedActivity.type}</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                                Close
                            </Button>
                            <Button className="flex-1">
                                Add to Trip
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
