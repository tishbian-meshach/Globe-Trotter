import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';

export default async function AdminDashboardPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    // Check if user is admin (for demo, we'll check if email matches)
    const isAdmin = session.user.email === 'demo@globetrotter.com';

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md text-center">
                    <CardContent className="py-12">
                        <div className="text-6xl mb-4">🔒</div>
                        <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                            Admin Access Required
                        </h3>
                        <p className="text-slate-600">
                            You don't have permission to view this page
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Fetch analytics data
    const [totalUsers, totalTrips, activeCities] = await Promise.all([
        prisma.user.count(),
        prisma.trip.count(),
        prisma.city.findMany({
            include: {
                stops: true,
            },
        }),
    ]);

    // Calculate popular cities
    const citiesWithStops = activeCities
        .map((city) => ({
            ...city,
            stopCount: city.stops.length,
        }))
        .filter((c) => c.stopCount > 0)
        .sort((a, b) => b.stopCount - a.stopCount)
        .slice(0, 10);

    const cityChartData = citiesWithStops.map((city) => ({
        label: city.name,
        value: city.stopCount,
    }));

    // Get recent trips count by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentTrips = await prisma.trip.findMany({
        where: {
            createdAt: {
                gte: sixMonthsAgo,
            },
        },
        select: {
            createdAt: true,
        },
    });

    // Group by month
    const tripsByMonth: Record<string, number> = {};
    recentTrips.forEach((trip) => {
        const month = trip.createdAt.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        tripsByMonth[month] = (tripsByMonth[month] || 0) + 1;
    });

    const tripsChartData = Object.entries(tripsByMonth).map(([label, value]) => ({
        label,
        value,
    }));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-600 mt-2">
                    Platform analytics and insights
                </p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-600 mb-1">Total Users</div>
                        <div className="text-4xl font-bold text-primary-500">{totalUsers}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-600 mb-1">Total Trips</div>
                        <div className="text-4xl font-bold text-teal-500">{totalTrips}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-600 mb-1">Active Cities</div>
                        <div className="text-4xl font-bold text-coral-500">{citiesWithStops.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-600 mb-1">Avg Trips/User</div>
                        <div className="text-4xl font-bold text-orange-500">
                            {(totalTrips / totalUsers || 0).toFixed(1)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popular Cities */}
                <Card>
                    <CardHeader>
                        <CardTitle>Popular Destinations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {cityChartData.length > 0 ? (
                            <BarChart data={cityChartData} height={300} color="#0D9488" />
                        ) : (
                            <div className="text-center text-slate-500 py-12">
                                No data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Trip Growth */}
                <Card>
                    <CardHeader>
                        <CardTitle>Trips Created (Last 6 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tripsChartData.length > 0 ? (
                            <BarChart data={tripsChartData} height={300} color="#0F4C81" />
                        ) : (
                            <div className="text-center text-slate-500 py-12">
                                No data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Top Cities Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Top 10 Destinations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                                        Rank
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                                        City
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                                        Country
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                                        Visits
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                                        Popularity
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {citiesWithStops.map((city, index) => (
                                    <tr key={city.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4 text-sm font-medium text-slate-900">
                                            #{index + 1}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-medium text-slate-900">
                                            {city.name}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-600">
                                            {city.country}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-900">
                                            {city.stopCount}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <svg
                                                        key={i}
                                                        className={`w-4 h-4 ${i < Math.floor(city.popularity / 20)
                                                                ? 'fill-amber-400'
                                                                : 'fill-slate-200'
                                                            }`}
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
