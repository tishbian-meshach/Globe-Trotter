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

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
        }

        const { id: tripId } = await params;
        const body = await request.json();
        const { stops } = body;

        // Verify trip exists
        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            select: { id: true, name: true }
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // Delete existing stops and activities
        await prisma.tripStop.deleteMany({
            where: { tripId }
        });

        // Create new stops with activities
        for (const stop of stops) {
            const { activities, ...stopData } = stop;

            const createdStop = await prisma.tripStop.create({
                data: {
                    tripId,
                    cityId: stopData.cityId,
                    startDate: new Date(stopData.startDate),
                    endDate: new Date(stopData.endDate),
                    order: stopData.order,
                    notes: stopData.notes || null,
                }
            });

            // Create activities for this stop
            if (activities && activities.length > 0) {
                for (const activity of activities) {
                    await prisma.tripActivity.create({
                        data: {
                            stopId: createdStop.id,
                            attractionId: activity.attractionId === 'custom' ? null : activity.attractionId,
                            name: activity.name,
                            cost: activity.cost,
                            type: activity.type,
                            duration: activity.duration || null,
                            notes: activity.notes || null
                        }
                    });
                }
            }
        }

        // Create audit log
        if (session?.user?.id) {
            await prisma.auditLog.create({
                data: {
                    action: 'trip_itinerary_updated',
                    entityType: 'trip',
                    entityId: tripId,
                    adminId: session.user.id,
                    details: `Admin updated itinerary for trip: ${trip.name}`
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin update trip stops error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
