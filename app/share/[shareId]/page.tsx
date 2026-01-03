import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateRange, getTripDuration } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: {
        shareId: string;
    };
}

export default async function SharedTripPage({ params }: PageProps) {
    const sharedTrip = await prisma.sharedTrip.findUnique({
        where: { shareId: params.shareId },
        include: {
            trip: {
                include: {
                    stops: {
                        include: {
                            city: true,
                            activities: true,
                        },
                        orderBy: {
                            order: 'asc',
                        },
                    },
                },
            },
        },
    });

    if (!sharedTrip) {
        notFound();
    }

    const trip = sharedTrip.trip;
    const duration = getTripDuration(new Date(trip.startDate), new Date(trip.endDate));

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-5xl mx-auto px-4 space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="inline-block px-4 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-4">
                        ✈️ Shared Itinerary
                    </div>
                    <h1 className="text-5xl font-bold text-slate-900 mb-3">{trip.name}</h1>
                    <div className="flex items-center justify-center gap-4 text-slate-600">
                        <span>{formatDateRange(new Date(trip.startDate), new Date(trip.endDate))}</span>
                        <span>•</span>
                        <span>{duration} days</span>
                        <span>•</span>
                        <span>{trip.stops.length} destinations</span>
                    </div>
                    {trip.description && (
                        <p className="text-lg text-slate-600 mt-4 max-w-3xl mx-auto">
                            {trip.description}
                        </p>
                    )}
                </div>

                {/* Copy Trip CTA */}
                {sharedTrip.canCopy && (
                    <div className="bg-gradient-to-r from-primary-500 to-teal-500 rounded-2xl p-8 text-white text-center">
                        <h3 className="text-2xl font-bold mb-2">Love this itinerary?</h3>
                        <p className="mb-6 opacity-90">Create your own account and copy this trip to customize it!</p>
                        <a
                            href="/signup"
                            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
                        >
                            Sign Up to Copy This Trip
                        </a>
                    </div>
                )}

                {/* Itinerary */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-slate-900">Itinerary</h2>

                    {trip.stops.map((stop, index) => (
                        <Card key={stop.id} className="overflow-hidden">
                            <div className="bg-gradient-to-r from-primary-50 to-teal-50 px-6 py-4 border-b border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-primary-600 font-medium mb-1">
                                            Day {index + 1}
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900">
                                            {stop.city.name}, {stop.city.country}
                                        </h3>
                                    </div>
                                    <Badge variant="default">
                                        {getTripDuration(new Date(stop.startDate), new Date(stop.endDate))} days
                                    </Badge>
                                </div>
                                <div className="text-sm text-slate-600 mt-2">
                                    {formatDateRange(new Date(stop.startDate), new Date(stop.endDate))}
                                </div>
                            </div>

                            {stop.notes && (
                                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                                    <p className="text-slate-700">{stop.notes}</p>
                                </div>
                            )}

                            {stop.activities.length > 0 && (
                                <CardContent className="pt-6">
                                    <h4 className="font-semibold text-slate-900 mb-4">
                                        Activities ({stop.activities.length})
                                    </h4>
                                    <div className="space-y-3">
                                        {stop.activities.map((activity) => (
                                            <div key={activity.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                                                <div className="text-2xl">
                                                    {activity.type === 'sightseeing' ? '🏛️' :
                                                        activity.type === 'dining' ? '🍽️' :
                                                            activity.type === 'adventure' ? '🏔️' :
                                                                activity.type === 'relaxation' ? '🧘' :
                                                                    activity.type === 'shopping' ? '🛍️' : '🎯'}
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="font-semibold text-slate-900">{activity.name}</h5>
                                                    {activity.description && (
                                                        <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                                        {activity.duration && (
                                                            <span>{activity.duration} minutes</span>
                                                        )}
                                                        {activity.cost !== null && activity.cost > 0 && (
                                                            <span>${activity.cost.toFixed(2)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center py-8">
                    <div className="text-sm text-slate-500">
                        Powered by <span className="font-semibold text-primary-600">GlobeTrotter</span>
                    </div>
                    <a
                        href="/"
                        className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Create Your Own Travel Plan →
                    </a>
                </div>
            </div>
        </div>
    );
}
