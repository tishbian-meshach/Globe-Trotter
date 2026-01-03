import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateRange, getTripDuration, formatCurrency } from '@/lib/utils';

interface PageProps {
    params: {
        id: string;
    };
}

export default async function TripDetailPage({ params }: PageProps) {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const trip = await prisma.trip.findUnique({
        where: { id: params.id },
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
            expenses: {
                orderBy: {
                    date: 'desc',
                },
            },
        },
    });

    if (!trip || trip.userId !== session.user.id) {
        notFound();
    }

    const duration = getTripDuration(new Date(trip.startDate), new Date(trip.endDate));

    // Calculate Costs
    const manualExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);

    const activityCosts = trip.stops.reduce((sum, stop) => {
        return sum + stop.activities.reduce((actSum, act) => actSum + (act.cost ?? 0), 0);
    }, 0);

    const cityCosts = trip.stops.reduce((sum, stop) => {
        const stopDuration = getTripDuration(new Date(stop.startDate), new Date(stop.endDate));
        return sum + (stopDuration * (stop.city.costIndex || 0));
    }, 0);

    const totalCost = manualExpenses + activityCosts + cityCosts;

    const expensesByCategory = trip.expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <Link
                        href="/trips"
                        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to trips
                    </Link>

                    <h1 className="text-4xl font-bold text-slate-900">{trip.name}</h1>

                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 text-slate-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDateRange(new Date(trip.startDate), new Date(trip.endDate))}
                        </div>
                        <Badge variant="info">{duration} days</Badge>
                        <Badge
                            variant={
                                trip.status === 'upcoming' ? 'info' :
                                    trip.status === 'ongoing' ? 'success' : 'default'
                            }
                        >
                            {trip.status}
                        </Badge>
                    </div>

                    {trip.description && (
                        <p className="text-slate-600 mt-4 max-w-3xl">{trip.description}</p>
                    )}
                </div>

                <div className="flex gap-2">
                    <Link
                        href={`/trips/${trip.id}/budget`}
                        className="px-4 py-2 border-2 border-slate-200 rounded-xl hover:border-primary-500 transition-colors"
                    >
                        Budget
                    </Link>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardDescription>Destinations</CardDescription>
                        <CardTitle className="text-3xl">{trip.stops.length}</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <CardDescription>Activities</CardDescription>
                        <CardTitle className="text-3xl">
                            {trip.stops.reduce((sum, stop) => sum + stop.activities.length, 0)}
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <CardDescription>Total Estimated Cost</CardDescription>
                        <CardTitle className="text-3xl text-primary-500">
                            {formatCurrency(totalCost)}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Itinerary */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-slate-900">Itinerary</h2>
                    <Link
                        href={`/trips/${trip.id}/builder`}
                        className="text-primary-500 hover:text-primary-600 font-medium"
                    >
                        Edit Itinerary →
                    </Link>
                </div>

                {trip.stops.length === 0 ? (
                    <Card className="text-center py-12">
                        <div className="text-5xl mb-4">🗺️</div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            No destinations added yet
                        </h3>
                        <p className="text-slate-600 mb-6">
                            Start building your itinerary by adding destinations
                        </p>
                        <Link
                            href={`/trips/${trip.id}/builder`}
                            className="inline-block bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors"
                        >
                            Add Destinations
                        </Link>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {trip.stops.map((stop, index) => (
                            <Card key={stop.id} className="relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />

                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="text-sm text-slate-500 mb-1">
                                                Stop {index + 1}
                                            </div>
                                            <CardTitle className="text-2xl">{stop.city.name}, {stop.city.country}</CardTitle>
                                            <CardDescription className="mt-1">
                                                {formatDateRange(new Date(stop.startDate), new Date(stop.endDate))}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="default">
                                            {getTripDuration(new Date(stop.startDate), new Date(stop.endDate))} days
                                        </Badge>
                                    </div>
                                </CardHeader>

                                {stop.notes && (
                                    <CardContent className="border-t border-slate-100 pt-4">
                                        <p className="text-sm text-slate-600">{stop.notes}</p>
                                    </CardContent>
                                )}

                                {stop.activities.length > 0 && (
                                    <CardContent className="border-t border-slate-100">
                                        <h4 className="font-semibold text-slate-900 mb-3">
                                            Activities ({stop.activities.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {stop.activities.slice(0, 3).map((activity) => (
                                                <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                                    <div className="text-xl">{activity.type === 'sightseeing' ? '🏛️' : activity.type === 'dining' ? '🍽️' : activity.type === 'adventure' ? '🏔️' : '🎯'}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-slate-900">{activity.name}</div>
                                                        {activity.description && (
                                                            <div className="text-sm text-slate-600 mt-0.5 line-clamp-1">
                                                                {activity.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {(activity.cost ?? 0) > 0 && (
                                                        <div className="text-sm font-medium text-slate-900">
                                                            {formatCurrency(activity.cost ?? 0)}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {stop.activities.length > 3 && (
                                                <div className="text-sm text-slate-600 text-center py-2">
                                                    +{stop.activities.length - 3} more activities
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Budget Summary */}
            {trip.expenses.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900 mb-6">Budget Overview</h2>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(expensesByCategory).map(([category, amount]) => (
                            <Card key={category}>
                                <CardContent className="pt-6 text-center">
                                    <div className="text-sm text-slate-600 capitalize mb-1">{category}</div>
                                    <div className="text-xl font-bold text-slate-900">{formatCurrency(amount)}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
