import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateRange, getTripDuration } from '@/lib/utils';

interface PageProps {
    params: {
        id: string;
    };
}

export default async function TripCalendarPage({ params }: PageProps) {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const trip = await prisma.trip.findUnique({
        where: { id: params.id },
        include: {
            stops: {
                include: {
                    city: true,
                    activities: {
                        orderBy: {
                            date: 'asc',
                        },
                    },
                },
                orderBy: {
                    order: 'asc',
                },
            },
        },
    });

    if (!trip || trip.userId !== session.user.id) {
        notFound();
    }

    // Create timeline of all activities grouped by date
    const timelineItems: any[] = [];

    trip.stops.forEach((stop) => {
        // Add stop start event
        timelineItems.push({
            type: 'arrival',
            date: stop.startDate,
            stop: stop,
        });

        // Add activities
        stop.activities.forEach((activity) => {
            if (activity.date) {
                timelineItems.push({
                    type: 'activity',
                    date: activity.date,
                    activity: activity,
                    stop: stop,
                });
            }
        });

        // Add stop end event
        timelineItems.push({
            type: 'departure',
            date: stop.endDate,
            stop: stop,
        });
    });

    // Sort by date
    timelineItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group by date
    const groupedByDate: Record<string, any[]> = {};
    timelineItems.forEach((item) => {
        const dateKey = new Date(item.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(item);
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-slate-900">Trip Timeline</h1>
                <p className="text-slate-600 mt-2">{trip.name}</p>
                <div className="text-sm text-slate-500 mt-1">
                    {formatDateRange(new Date(trip.startDate), new Date(trip.endDate))}
                </div>
            </div>

            {/* Timeline View */}
            <div className="max-w-4xl">
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200" />

                    <div className="space-y-8">
                        {Object.entries(groupedByDate).map(([date, items], dateIndex) => (
                            <div key={dateIndex} className="relative">
                                {/* Date Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative z-10 w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                        {new Date(items[0].date).getDate()}
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-slate-900">{date}</div>
                                    </div>
                                </div>

                                {/* Events for this date */}
                                <div className="ml-24 space-y-4">
                                    {items.map((item, itemIndex) => (
                                        <Card key={itemIndex} className="relative">
                                            <CardContent className="pt-6">
                                                {item.type === 'arrival' && (
                                                    <div className="flex items-start gap-4">
                                                        <div className="text-3xl">✈️</div>
                                                        <div>
                                                            <div className="font-semibold text-lg text-slate-900">
                                                                Arrive in {item.stop.city.name}
                                                            </div>
                                                            <div className="text-sm text-slate-600 mt-1">
                                                                {item.stop.city.country}
                                                            </div>
                                                            {item.stop.notes && (
                                                                <div className="text-sm text-slate-600 mt-2 p-3 bg-slate-50 rounded-lg">
                                                                    {item.stop.notes}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {item.type === 'departure' && (
                                                    <div className="flex items-start gap-4">
                                                        <div className="text-3xl">🚀</div>
                                                        <div>
                                                            <div className="font-semibold text-lg text-slate-900">
                                                                Depart from {item.stop.city.name}
                                                            </div>
                                                            <div className="text-sm text-slate-600 mt-1">
                                                                {getTripDuration(new Date(item.stop.startDate), new Date(item.stop.endDate))} days in {item.stop.city.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {item.type === 'activity' && (
                                                    <div className="flex items-start gap-4">
                                                        <div className="text-3xl">
                                                            {item.activity.type === 'sightseeing' ? '🏛️' :
                                                                item.activity.type === 'dining' ? '🍽️' :
                                                                    item.activity.type === 'adventure' ? '🏔️' :
                                                                        item.activity.type === 'relaxation' ? '🧘' :
                                                                            item.activity.type === 'shopping' ? '🛍️' : '🎯'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    <div className="font-semibold text-lg text-slate-900">
                                                                        {item.activity.name}
                                                                    </div>
                                                                    {item.activity.time && (
                                                                        <div className="text-sm text-primary-600 font-medium mt-1">
                                                                            ⏰ {item.activity.time}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Badge variant="default" className="capitalize">
                                                                    {item.activity.type}
                                                                </Badge>
                                                            </div>

                                                            {item.activity.description && (
                                                                <p className="text-sm text-slate-600 mt-2">
                                                                    {item.activity.description}
                                                                </p>
                                                            )}

                                                            <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                                                                {item.activity.duration && (
                                                                    <span>⏱️ {item.activity.duration} min</span>
                                                                )}
                                                                {item.activity.cost > 0 && (
                                                                    <span className="font-medium text-slate-900">
                                                                        ${item.activity.cost.toFixed(2)}
                                                                    </span>
                                                                )}
                                                                {item.activity.location && (
                                                                    <span>📍 {item.activity.location}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {trip.stops.length === 0 && (
                <Card className="text-center py-16">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                        No timeline yet
                    </h3>
                    <p className="text-slate-600">
                        Add stops and activities to see your trip timeline
                    </p>
                </Card>
            )}
        </div>
    );
}
