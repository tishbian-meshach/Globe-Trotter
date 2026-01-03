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

// GET - Get single trip
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;

        const trip = await prisma.trip.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                stops: {
                    include: {
                        city: {
                            select: {
                                id: true,
                                name: true,
                                country: true
                            }
                        },
                        activities: true
                    },
                    orderBy: { order: 'asc' }
                },
                expenses: true,
                sharedTrip: true
            }
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        return NextResponse.json(trip);
    } catch (error) {
        console.error('Get trip error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update trip (flag/unflag/edit/lock/unlock/duplicate)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { action } = body;

        // Edit trip details
        if (action === 'edit') {
            const { name, description, imageUrl, startDate, endDate, status, adminNotes } = body;

            const trip = await prisma.trip.findUnique({
                where: { id },
                select: { name: true }
            });

            if (!trip) {
                return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
            }

            const updatedTrip = await prisma.trip.update({
                where: { id },
                data: {
                    name,
                    description,
                    coverImage: imageUrl,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    status,
                    adminNotes
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    sharedTrip: true
                }
            });

            // Create audit log
            if (session?.user?.id) {
                await prisma.auditLog.create({
                    data: {
                        action: 'trip_edited',
                        entityType: 'trip',
                        entityId: id,
                        adminId: session.user.id,
                        details: `Edited trip: ${trip.name}`
                    }
                });
            }

            return NextResponse.json(updatedTrip);
        }

        // Lock/Unlock trip
        if (action === 'lock' || action === 'unlock') {
            const trip = await prisma.trip.findUnique({
                where: { id },
                select: { name: true }
            });

            if (!trip) {
                return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
            }

            const updatedTrip = await prisma.trip.update({
                where: { id },
                data: {
                    isLocked: action === 'lock'
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    sharedTrip: true
                }
            });

            // Create audit log
            if (session?.user?.id) {
                await prisma.auditLog.create({
                    data: {
                        action: action === 'lock' ? 'trip_locked' : 'trip_unlocked',
                        entityType: 'trip',
                        entityId: id,
                        adminId: session.user.id,
                        details: `${action === 'lock' ? 'Locked' : 'Unlocked'} trip: ${trip.name}`
                    }
                });
            }

            return NextResponse.json(updatedTrip);
        }

        // Duplicate trip as template
        if (action === 'duplicate') {
            const trip = await prisma.trip.findUnique({
                where: { id },
                include: {
                    stops: {
                        include: {
                            activities: true
                        }
                    },
                    expenses: true
                }
            });

            if (!trip) {
                return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
            }

            // Create duplicate with [Template] prefix
            const duplicateTrip = await prisma.trip.create({
                data: {
                    name: `[Template] ${trip.name}`,
                    description: trip.description,
                    coverImage: trip.coverImage,
                    startDate: trip.startDate,
                    endDate: trip.endDate,
                    status: 'upcoming',
                    userId: trip.userId,
                    adminNotes: `Duplicated from trip ${id}`
                }
            });

            // Copy stops and activities
            for (const stop of trip.stops) {
                const newStop = await prisma.tripStop.create({
                    data: {
                        tripId: duplicateTrip.id,
                        cityId: stop.cityId,
                        order: stop.order,
                        startDate: stop.startDate,
                        endDate: stop.endDate,
                        notes: stop.notes
                    }
                });

                // Copy activities
                for (const activity of stop.activities) {
                    await prisma.tripActivity.create({
                        data: {
                            stopId: newStop.id,
                            attractionId: activity.attractionId,
                            name: activity.name,
                            description: activity.description,
                            type: activity.type,
                            cost: activity.cost,
                            duration: activity.duration,
                            date: activity.date,
                            time: activity.time,
                            notes: activity.notes,
                            isCustom: activity.isCustom
                        }
                    });
                }
            }

            // Create audit log
            if (session?.user?.id) {
                await prisma.auditLog.create({
                    data: {
                        action: 'trip_duplicated',
                        entityType: 'trip',
                        entityId: duplicateTrip.id,
                        adminId: session.user.id,
                        details: `Duplicated trip ${trip.name} as template`
                    }
                });
            }

            return NextResponse.json(duplicateTrip);
        }

        // Flag/Unflag trip
        if (action === 'flag' || action === 'unflag') {
            const trip = await prisma.trip.findUnique({
                where: { id },
                select: { name: true, description: true }
            });

            if (!trip) {
                return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
            }

            const updatedTrip = await prisma.trip.update({
                where: { id },
                data: {
                    description: action === 'flag'
                        ? `[FLAGGED] ${trip.description || ''}`
                        : trip.description?.replace('[FLAGGED] ', '') || trip.description
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    sharedTrip: true
                }
            });

            // Create audit log
            if (session?.user?.id) {
                await prisma.auditLog.create({
                    data: {
                        action: action === 'flag' ? 'trip_flagged' : 'trip_unflagged',
                        entityType: 'trip',
                        entityId: id,
                        adminId: session.user.id,
                        details: `${action === 'flag' ? 'Flagged' : 'Unflagged'} trip: ${trip.name}`
                    }
                });
            }

            return NextResponse.json(updatedTrip);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Update trip error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete trip
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;

        const trip = await prisma.trip.findUnique({
            where: { id },
            select: { name: true }
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        await prisma.trip.delete({
            where: { id }
        });

        // Create audit log
        if (session?.user?.id) {
            await prisma.auditLog.create({
                data: {
                    action: 'trip_deleted',
                    entityType: 'trip',
                    entityId: id,
                    adminId: session.user.id,
                    details: `Deleted trip: ${trip.name}`
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete trip error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
