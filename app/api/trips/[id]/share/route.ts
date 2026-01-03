import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sharedTrip = await prisma.sharedTrip.findUnique({
            where: { tripId: params.id },
        });

        if (!sharedTrip) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json(sharedTrip);
    } catch (error) {
        console.error('Get shared trip error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
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

        // Verify trip ownership
        const trip = await prisma.trip.findUnique({
            where: { id: params.id },
        });

        if (!trip || trip.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { isPublic, canCopy } = await request.json();

        // Generate unique share ID
        const shareId = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);

        const sharedTrip = await prisma.sharedTrip.create({
            data: {
                tripId: params.id,
                shareId,
                isPublic,
                canCopy,
            },
        });

        return NextResponse.json(sharedTrip);
    } catch (error) {
        console.error('Create shared trip error:', error);
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

        const { isPublic } = await request.json();

        const sharedTrip = await prisma.sharedTrip.update({
            where: { tripId: params.id },
            data: { isPublic },
        });

        return NextResponse.json(sharedTrip);
    } catch (error) {
        console.error('Update shared trip error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
