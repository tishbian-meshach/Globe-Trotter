import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify trip ownership
        const trip = await prisma.trip.findUnique({
            where: { id: params.id },
        });

        if (!trip || trip.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
