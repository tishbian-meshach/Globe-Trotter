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

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const attractions = await prisma.attraction.findMany({
            include: {
                city: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json(attractions);
    } catch (error) {
        console.error('Get attractions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { cityId, name, type, cost, duration, description, imageUrl } = body;

        if (!cityId || !name || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const attraction = await prisma.attraction.create({
            data: {
                cityId,
                name,
                type,
                cost: parseFloat(cost) || 0,
                duration: parseInt(duration) || null,
                description: description || null,
                imageUrl,
            },
        });

        return NextResponse.json(attraction);
    } catch (error) {
        console.error('Create attraction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
