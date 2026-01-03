import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Retrieve share information for a trip
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
            select: {
                id: true,
                shareId: true,
                userId: true,
            },
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // Only owner can view share status
        if (trip.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ 
            shareId: trip.shareId,
            isShared: !!trip.shareId 
        });
    } catch (error) {
        console.error('Get shared trip error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create or remove share link for a trip
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

        const body = await request.json();
        const { action } = body; // 'create' or 'remove'

        if (action === 'remove') {
            // Remove share link
            const updatedTrip = await prisma.trip.update({
                where: { id: params.id },
                data: { shareId: null },
                select: { shareId: true },
            });

            return NextResponse.json({ 
                shareId: null,
                isShared: false,
                message: 'Share link removed'
            });
        }

        // Create share link (if doesn't exist)
        if (trip.shareId) {
            return NextResponse.json({ 
                shareId: trip.shareId,
                isShared: true 
            });
        }

        // Generate unique share ID
        const shareId = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);

        const updatedTrip = await prisma.trip.update({
            where: { id: params.id },
            data: { shareId },
            select: { shareId: true },
        });

        return NextResponse.json({ 
            shareId: updatedTrip.shareId,
            isShared: true 
        });
    } catch (error) {
        console.error('Create/remove shared trip error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Remove share link
export async function DELETE(
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

        await prisma.trip.update({
            where: { id: params.id },
            data: { shareId: null },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete shared trip error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
