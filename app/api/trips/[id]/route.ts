import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const trip = await prisma.trip.findUnique({
            where: { id: params.id },
            include: {
                stops: {
                    include: {
                        city: true,
                        activities: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
                expenses: true,
            },
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        if (trip.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(trip);
    } catch (error) {
        console.error('Get trip error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
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

        const body = await request.json();
        const { name, description, startDate, endDate, status, coverImage } = body;

        const updatedTrip = await prisma.trip.update({
            where: { id: params.id },
            data: {
                name,
                description,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                status,
                coverImage,
            },
        });

        return NextResponse.json(updatedTrip);
    } catch (error) {
        console.error('Update trip error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const trip = await prisma.trip.findUnique({
            where: { id: params.id },
        });

        if (!trip || trip.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.trip.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete trip error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

