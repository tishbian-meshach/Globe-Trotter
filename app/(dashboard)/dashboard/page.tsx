import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateRange, formatCurrency, getTripDuration } from '@/lib/utils';

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            trips: {
                include: {
                    stops: {
                        include: {
                            city: true,
                        },
                    },
                    expenses: true,
                },
                orderBy: {
                    startDate: 'asc',
                },
            },
        },
    });

    if (!user) redirect('/login');

    const upcomingTrips = user.trips.filter(
        (trip) => new Date(trip.startDate) > new Date() || trip.status === 'upcoming'
    );

    // Get recommended cities (just mock data for now)
    const recommendedCities = await prisma.city.findMany({
        take: 4,
        orderBy: {
            popularity: 'desc',
        },
    });

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div>
                <h1 className="text-4xl font-bold text-slate-900">
                    Welcome back, {user.name || 'Traveler'}! 👋
                </h1>
                <p className="text-slate-600 mt-2">
                    Ready to plan your next adventure?
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-primary-500">{user.trips.length}</div>
                        <div className="text-sm text-slate-600 mt-1">Total Trips</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-coral-500">{upcomingTrips.length}</div>
                        <div className="text-sm text-slate-600 mt-1">Upcoming Trips</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-teal-500">{user.savedDestinations.length}</div>
                        <div className="text-sm text-slate-600 mt-1">Saved Destinations</div>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Trips */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-slate-900">Upcoming Trips</h2>
                    <Link
                        href="/trips/create"
                        className="text-primary-500 hover:text-primary-600 font-medium text-sm"
                    >
                        + Plan New Trip
                    </Link>
                </div>

                {upcomingTrips.length === 0 ? (
                    <Card className="text-center py-12">
                        <div className="text-6xl mb-4">🗺️</div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            No upcoming trips yet
                        </h3>
                        <p className="text-slate-600 mb-6">
                            Start planning your next adventure!
                        </p>
                        <Link
                            href="/trips/create"
                            className="inline-block bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors"
                        >
                            Plan Your First Trip
                        </Link>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingTrips.map((trip) => {
                            const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
                            const duration = getTripDuration(new Date(trip.startDate), new Date(trip.endDate));

                            return (
                                <Link key={trip.id} href={`/trips/${trip.id}`}>
                                    <Card hover className="h-full">
                                        {trip.coverImage ? (
                                            <div className="h-48 bg-slate-200 rounded-t-2xl overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={trip.coverImage}
                                                    alt={trip.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-48 bg-slate-200 rounded-t-2xl overflow-hidden">
                                                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-teal-400" />
                                            </div>
                                        )}
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="line-clamp-1">{trip.name}</CardTitle>
                                                    <CardDescription className="mt-1">
                                                        {formatDateRange(new Date(trip.startDate), new Date(trip.endDate))}
                                                    </CardDescription>
                                                </div>
                                                <Badge variant="info">{duration} days</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {trip.description && (
                                                    <p className="text-sm text-slate-600 line-clamp-2">
                                                        {trip.description}
                                                    </p>
                                                )}

                                                {trip.stops.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {trip.stops.slice(0, 3).map((stop) => (
                                                            <span
                                                                key={stop.id}
                                                                className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full"
                                                            >
                                                                {stop.city.name}
                                                            </span>
                                                        ))}
                                                        {trip.stops.length > 3 && (
                                                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                                                                +{trip.stops.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {totalExpenses > 0 && (
                                                    <div className="text-sm font-medium text-slate-900">
                                                        Budget: {formatCurrency(totalExpenses)}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Recommended Cities */}
            <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-6">Explore Destinations</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendedCities.map((city) => (
                        <Link key={city.id} href={`/cities?search=${city.name}`}>
                            <Card hover className="h-full">
                                <div className="h-32 bg-slate-200 rounded-t-2xl overflow-hidden">
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
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-lg">{city.name}</CardTitle>
                                    <CardDescription>{city.country}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Cost Index</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-900">
                                                {city.costIndex}
                                            </span>
                                            <span className="font-medium text-primary-600">
                                                $
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
