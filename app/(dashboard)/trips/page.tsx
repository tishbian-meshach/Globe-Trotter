import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateRange, getTripDuration } from '@/lib/utils';

export default async function TripsPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const trips = await prisma.trip.findMany({
        where: { userId: session.user.id },
        include: {
            stops: {
                include: {
                    city: true,
                },
            },
            expenses: true,
        },
        orderBy: {
            startDate: 'desc',
        },
    });

    const categorizedTrips = {
        upcoming: trips.filter((t) => new Date(t.startDate) > new Date()),
        ongoing: trips.filter(
            (t) => new Date(t.startDate) <= new Date() && new Date(t.endDate) >= new Date()
        ),
        past: trips.filter((t) => new Date(t.endDate) < new Date()),
    };

    const TripCard = ({ trip }: { trip: typeof trips[0] }) => {
        const duration = getTripDuration(new Date(trip.startDate), new Date(trip.endDate));
        const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);

        return (
            <Link href={`/trips/${trip.id}`}>
                <Card hover className="h-full">
                    <div className="h-48 bg-slate-200 rounded-t-2xl overflow-hidden">
                        {trip.coverImage ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={trip.coverImage}
                                alt={trip.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-teal-400" />
                        )}
                    </div>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <CardTitle className="line-clamp-1">{trip.name}</CardTitle>
                                <CardDescription className="mt-1">
                                    {formatDateRange(new Date(trip.startDate), new Date(trip.endDate))}
                                </CardDescription>
                            </div>
                            <Badge
                                variant={
                                    trip.status === 'upcoming' ? 'info' :
                                        trip.status === 'ongoing' ? 'success' : 'default'
                                }
                            >
                                {duration} days
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {trip.description && (
                                <p className="text-sm text-slate-600 line-clamp-2">{trip.description}</p>
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
                                <div className="text-sm">
                                    <span className="text-slate-600">Budget: </span>
                                    <span className="font-medium text-slate-900">
                                        ${totalExpenses.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </Link>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold text-slate-900">My Trips</h1>
                <Link
                    href="/trips/create"
                    className="bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors"
                >
                    + Create Trip
                </Link>
            </div>

            {trips.length === 0 ? (
                <Card className="text-center py-16">
                    <div className="text-6xl mb-4">✈️</div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                        No trips yet
                    </h3>
                    <p className="text-slate-600 mb-8">
                        Start planning your first adventure!
                    </p>
                    <Link
                        href="/trips/create"
                        className="inline-block bg-primary-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors"
                    >
                        Create Your First Trip
                    </Link>
                </Card>
            ) : (
                <div className="space-y-10">
                    {/* Upcoming Trips */}
                    {categorizedTrips.upcoming.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                                Upcoming ({categorizedTrips.upcoming.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categorizedTrips.upcoming.map((trip) => (
                                    <TripCard key={trip.id} trip={trip} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ongoing Trips */}
                    {categorizedTrips.ongoing.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                                In Progress ({categorizedTrips.ongoing.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categorizedTrips.ongoing.map((trip) => (
                                    <TripCard key={trip.id} trip={trip} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Past Trips */}
                    {categorizedTrips.past.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                                Past Trips ({categorizedTrips.past.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categorizedTrips.past.map((trip) => (
                                    <TripCard key={trip.id} trip={trip} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
