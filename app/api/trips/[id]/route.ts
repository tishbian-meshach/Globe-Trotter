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
