import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createTripSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const trips = await prisma.trip.findMany({
            where: { userId: session.user.id },
            include: {
                stops: {
                    include: {
                        city: true,
                        activities: true,
                    },
                },
                expenses: true,
            },
            orderBy: {
                startDate: 'desc',
            },
        });

        return NextResponse.json(trips);
    } catch (error) {
        console.error('Get trips error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate input
        const validatedData = createTripSchema.parse({
            ...body,
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
        });

        // Create trip
        const trip = await prisma.trip.create({
            data: {
                name: validatedData.name,
                description: validatedData.description || null,
                coverImage: validatedData.coverImage || null,
                startDate: validatedData.startDate,
                endDate: validatedData.endDate,
                userId: session.user.id,
            },
        });

        return NextResponse.json(trip, { status: 201 });
    } catch (error: any) {
        console.error('Create trip error:', error);
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
