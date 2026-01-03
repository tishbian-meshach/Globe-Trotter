import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Check if user has admin role
async function isAdmin(session: any) {
    if (!session?.user?.id) return false;
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true }
    });
    return user?.role?.name === 'admin' || user?.isAdmin;
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        // Calculate date range
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Fetch analytics data
        const [totalUsers, totalTrips, activeCities, allTrips, recentTrips, expenses] = await Promise.all([
            prisma.user.count(),
            prisma.trip.count(),
            prisma.city.findMany({
                include: {
                    stops: true,
                },
            }),
            prisma.trip.findMany({
                select: {
                    status: true,
                    createdAt: true
                }
            }),
            prisma.trip.findMany({
                where: {
                    createdAt: {
                        gte: startDate,
                    },
                },
                select: {
                    createdAt: true,
                },
            }),
            prisma.expense.findMany({
                select: {
                    amount: true,
                    currency: true
                }
            })
        ]);

        // Calculate status distribution
        const tripsByStatus = allTrips.reduce((acc, trip) => {
            acc[trip.status] = (acc[trip.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Calculate average budget (convert all to USD for simplicity)
        const totalBudget = expenses.reduce((sum, e) => sum + e.amount, 0);
        const avgBudget = totalBudget / totalTrips || 0;

        // Calculate completion rate (past trips / total trips)
        const completedTrips = tripsByStatus['past'] || 0;
        const completionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;

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

        // Group recent trips by month
        const tripsByMonth: Record<string, number> = {};
        recentTrips.forEach((trip) => {
            const month = trip.createdAt.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            tripsByMonth[month] = (tripsByMonth[month] || 0) + 1;
        });

        const tripsChartData = Object.entries(tripsByMonth).map(([label, value]) => ({
            label,
            value,
        }));

        // Status chart data
        const statusChartData = Object.entries(tripsByStatus).map(([label, value]) => ({
            label: label.charAt(0).toUpperCase() + label.slice(1),
            value
        }));

        // Top cities for table
        const topCities = citiesWithStops.map((city) => ({
            id: city.id,
            name: city.name,
            country: city.country,
            stopCount: city.stopCount,
            popularity: city.popularity,
        }));

        return NextResponse.json({
            totalUsers,
            totalTrips,
            activeCities: citiesWithStops.length,
            avgTripsPerUser: totalUsers > 0 ? totalTrips / totalUsers : 0,
            avgBudget,
            completionRate,
            tripsByStatus,
            cityChartData,
            tripsChartData,
            statusChartData,
            topCities,
        });
    } catch (error) {
        console.error('Get stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
