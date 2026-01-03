import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: { shareId: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find the shared trip
        const originalTrip = await prisma.trip.findUnique({
            where: { shareId: params.shareId },
            include: {
                stops: {
                    include: {
                        activities: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
                expenses: true,
            },
        });

        if (!originalTrip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // Don't allow copying own trip
        if (originalTrip.userId === session.user.id) {
            return NextResponse.json({ error: 'Cannot copy your own trip' }, { status: 400 });
        }

        // Create a copy of the trip
        const copiedTrip = await prisma.trip.create({
            data: {
                name: `${originalTrip.name} (Copy)`,
                description: originalTrip.description,
                coverImage: originalTrip.coverImage,
                startDate: originalTrip.startDate,
                endDate: originalTrip.endDate,
                status: originalTrip.status,
                userId: session.user.id,
                // Don't copy shareId, adminNotes, or isLocked
                stops: {
                    create: originalTrip.stops.map(stop => ({
                        cityId: stop.cityId,
                        startDate: stop.startDate,
                        endDate: stop.endDate,
                        order: stop.order,
                        notes: stop.notes,
                        activities: {
                            create: stop.activities.map(activity => ({
                                attractionId: activity.attractionId,
                                name: activity.name,
                                description: activity.description,
                                type: activity.type,
                                cost: activity.cost,
                                duration: activity.duration,
                                date: activity.date,
                                time: activity.time,
                                notes: activity.notes,
                                isCustom: activity.isCustom,
                            })),
                        },
                    })),
                },
                expenses: {
                    create: originalTrip.expenses.map(expense => ({
                        category: expense.category,
                        amount: expense.amount,
                        currency: expense.currency,
                        description: expense.description,
                        date: expense.date,
                    })),
                },
            },
        });

        return NextResponse.json({ 
            success: true, 
            tripId: copiedTrip.id,
            message: 'Trip copied successfully'
        });
    } catch (error) {
        console.error('Copy trip error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
