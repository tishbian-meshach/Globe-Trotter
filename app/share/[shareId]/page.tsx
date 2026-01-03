import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateRange, getTripDuration, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { CopyTripButton } from '@/components/trips/CopyTripButton';

interface PageProps {
    params: {
        shareId: string;
    };
}

export default async function SharedTripPage({ params }: PageProps) {
    const session = await auth();

    const trip = await prisma.trip.findUnique({
        where: { shareId: params.shareId },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
            stops: {
                include: {
                    city: true,
                    activities: {
                        include: {
                            attraction: true,
                        },
                    },
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

    if (!trip) {
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

    const isOwner = session?.user?.id === trip.userId;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Shared Trip Badge */}
                <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 rounded-full text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Shared Trip
                    </div>
                    <span className="text-sm text-slate-500">
                        by {trip.user.name || 'Anonymous'}
                    </span>
                </div>
                {trip.coverImage && (
                    <div className="w-full h-64 md:h-80 relative rounded-2xl overflow-hidden shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={trip.coverImage}
                            alt={trip.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                )}

                {/* Trip Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h2 className="text-4xl font-bold text-slate-900">{trip.name}</h2>

                        <div className="flex items-center gap-4 mt-3 flex-wrap">
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

                    {session?.user && !isOwner && (
                        <CopyTripButton shareId={params.shareId} />
                    )}

                    {!session?.user && (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium whitespace-nowrap"
                        >
                            Login to Copy Trip
                        </Link>
                    )}

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
                    <h3 className="text-2xl font-semibold text-slate-900 mb-6">Itinerary</h3>

                    {trip.stops.length === 0 ? (
                        <Card className="text-center py-12">
                            <div className="text-5xl mb-4">🗺️</div>
                            <h4 className="text-xl font-semibold text-slate-900 mb-2">
                                No destinations added yet
                            </h4>
                            <p className="text-slate-600">
                                This trip doesn't have any destinations planned
                            </p>
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
                                            <h5 className="font-semibold text-slate-900 mb-3">
                                                Activities ({stop.activities.length})
                                            </h5>
                                            <div className="space-y-2">
                                                {stop.activities.map((activity) => (
                                                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                                        <div className="text-xl">
                                                            {activity.type === 'sightseeing' ? '🏛️' :
                                                                activity.type === 'dining' ? '🍽️' :
                                                                    activity.type === 'adventure' ? '🏔️' :
                                                                        activity.type === 'relaxation' ? '🧘' :
                                                                            activity.type === 'shopping' ? '🛍️' : '🎯'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-slate-900">{activity.name}</div>
                                                            {activity.description && (
                                                                <div className="text-sm text-slate-600 mt-0.5">
                                                                    {activity.description}
                                                                </div>
                                                            )}
                                                            {activity.date && (
                                                                <div className="text-xs text-slate-500 mt-1">
                                                                    {new Date(activity.date).toLocaleDateString()} {activity.time && `at ${activity.time}`}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                                                {activity.duration && (
                                                                    <span>{activity.duration} min</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {(activity.cost ?? 0) > 0 && (
                                                            <div className="text-sm font-medium text-slate-900">
                                                                {formatCurrency(activity.cost ?? 0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
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
                        <h3 className="text-2xl font-semibold text-slate-900 mb-6">Budget Overview</h3>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            {Object.entries(expensesByCategory).map(([category, amount]) => (
                                <Card key={category}>
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-sm text-slate-600 capitalize mb-1">{category}</div>
                                        <div className="text-xl font-bold text-slate-900">{formatCurrency(amount)}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Expense Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {trip.expenses.slice(0, 10).map((expense) => (
                                        <div key={expense.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                            <div className="flex-1">
                                                <div className="font-medium text-slate-900">{expense.description || 'Expense'}</div>
                                                <div className="text-sm text-slate-500">
                                                    {expense.category} • {new Date(expense.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="text-lg font-semibold text-slate-900">
                                                {formatCurrency(expense.amount)}
                                            </div>
                                        </div>
                                    ))}
                                    {trip.expenses.length > 10 && (
                                        <div className="text-sm text-slate-600 text-center py-2">
                                            +{trip.expenses.length - 10} more expenses
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Footer */}
                {!session?.user && (
                    <div className="text-center py-8 border-t border-slate-200">
                        <p className="text-slate-600 mb-4">
                            Want to plan your own trip?
                        </p>
                        <Link
                            href="/signup"
                            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
                        >
                            Sign up for GlobeTrotter
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
