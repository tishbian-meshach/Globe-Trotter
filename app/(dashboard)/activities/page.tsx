'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { ActivityEditModal } from '@/components/modals/ActivityEditModal';

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

// Removed mock activities

export default function ActivitiesPage() {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [costFilter, setCostFilter] = useState('all');
    const [durationFilter, setDurationFilter] = useState('all');

    // Check if user is admin
    const isAdmin = session?.user?.isAdmin || false;

    const [activities, setActivities] = useState<any[]>([]);
    const [filteredActivities, setFilteredActivities] = useState<any[]>([]);

    const [selectedActivity, setSelectedActivity] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Create State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [cities, setCities] = useState<any[]>([]);
    const [editActivity, setEditActivity] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterActivities();
    }, [searchQuery, typeFilter, costFilter, durationFilter, activities]);

    const fetchData = async () => {
        try {
            const [actRes, cityRes] = await Promise.all([
                fetch('/api/attractions'),
                fetch('/api/cities')
            ]);

            const actData = await actRes.json();
            const cityData = await cityRes.json();

            // Transform data to match UI expectancies
            const transformedActivities = actData.map((a: any) => ({
                ...a,
                location: a.city ? `${a.city.name}, ${a.city.country}` : 'Unknown'
            }));

            setActivities(transformedActivities);
            setCities(cityData);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveActivity = async (activityData: any) => {
        try {
            const url = editActivity?.id ? `/api/attractions/${editActivity.id}` : '/api/attractions';
            const method = editActivity?.id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activityData)
            });

            if (!res.ok) throw new Error('Failed to save');

            await fetchData();
            setIsEditModalOpen(false);
            showToast({
                title: 'Success',
                description: `Activity ${editActivity?.id ? 'updated' : 'added'} successfully`,
                type: 'success'
            });
        } catch (error) {
            showToast({ title: 'Error', description: 'Failed to save activity', type: 'error' });
            throw error;
        }
    };

    const openEditModal = (activity: any) => {
        setEditActivity({
            ...activity,
            cityId: activity.cityId || (activity.city ? activity.city.id : '')
        });
        setIsEditModalOpen(true);
    };

    const openCreateModal = () => {
        setEditActivity({
            name: '',
            description: '',
            type: 'sightseeing',
            cost: 0,
            duration: 60,
            cityId: '',
            imageUrl: ''
        });
        setIsEditModalOpen(true);
    };

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

    if (isLoading) {
        return <Loading text="Loading activities..." className="min-h-[50vh]" />;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">Discover Activities</h1>
                    <p className="text-slate-600 mt-2">
                        Find and plan amazing experiences for your trip
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={openCreateModal}>
                        + Add Activity
                    </Button>
                )}
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
                                    setShowDetailModal(true);
                                }}>
                                    {/* Image */}
                                    <div className="h-48 bg-slate-100 rounded-t-2xl overflow-hidden relative group">
                                        {activity.imageUrl ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={activity.imageUrl}
                                                alt={activity.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center text-6xl">
                                                {getTypeIcon(activity.type)}
                                            </div>
                                        )}

                                        {isAdmin && (
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        openEditModal(activity);
                                                    }}
                                                    className="bg-white/90 p-2 rounded-full text-slate-700 hover:text-primary-600 shadow-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
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
                                            <div className="font-semibold text-primary-600">
                                                {activity.cost === 0 ? 'Free' : `$${activity.cost}`}
                                            </div>

                                            {activity.duration && (
                                                <div className="text-slate-600">
                                                    {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
                                                </div>
                                            )}
                                        </div>
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
                    isOpen={showDetailModal}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedActivity(null);
                    }}
                    title={selectedActivity.name}
                >
                    <div className="space-y-6">
                        {/* Image */}
                        <div className="h-64 bg-slate-100 rounded-xl overflow-hidden relative">
                            {selectedActivity.imageUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={selectedActivity.imageUrl}
                                    alt={selectedActivity.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center text-8xl">
                                    {getTypeIcon(selectedActivity.type)}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Badge variant={getTypeColor(selectedActivity.type) as any}>
                                    {selectedActivity.type}
                                </Badge>
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
                    </div>
                </Modal>
            )}

            {/* Activity Edit Modal */}
            <ActivityEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                activity={editActivity}
                cities={cities}
                onSave={handleSaveActivity}
            />

        </div>
    );
}
