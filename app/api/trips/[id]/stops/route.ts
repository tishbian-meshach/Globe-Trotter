import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Check if user has admin role
async function isAdmin(session: any) {
    if (!session?.user?.id) return false;
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true }
    });
    return user?.role?.name === 'admin' || user?.isAdmin;
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const userIsAdmin = await isAdmin(session);

        // Verify trip ownership or admin access
        const trip = await prisma.trip.findUnique({
            where: { id: params.id },
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // Allow access if user is owner or admin
        if (trip.userId !== session.user.id && !userIsAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check if trip is locked (only matters for non-admin users)
        if (trip.isLocked && !userIsAdmin) {
            return NextResponse.json({ error: 'Trip is locked and cannot be edited' }, { status: 403 });
        }

        const { stops } = await request.json();

        // Delete existing stops for this trip
        await prisma.tripStop.deleteMany({
            where: { tripId: params.id },
        });

        // Create new stops
        const createdStops = await Promise.all(
            stops.map((stop: any) =>
                prisma.tripStop.create({
                    data: {
                        tripId: params.id,
                        cityId: stop.cityId,
                        startDate: new Date(stop.startDate),
                        endDate: new Date(stop.endDate),
                        order: stop.order,
                        notes: stop.notes || null,
                        activities: {
                            create: stop.activities?.map((activity: any) => ({
                                attractionId: activity.attractionId !== 'custom' ? activity.attractionId : null,
                                name: activity.name,
                                cost: parseFloat(activity.cost) || 0,
                                type: activity.type || 'other',
                                duration: parseInt(activity.duration) || null,
                                isCustom: activity.attractionId === 'custom',
                            })) || [],
                        },
                    },
                })
            )
        );

        return NextResponse.json({ stops: createdStops }, { status: 200 });
    } catch (error) {
        console.error('Save stops error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
