import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Check if user has admin role
async function isAdmin(session: any) {
    if (!session?.user?.id) return false;
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true }
    });
    return user?.role?.name === 'admin' || user?.isAdmin;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cities = await prisma.city.findMany({
            orderBy: {
                popularity: 'desc',
            },
            include: {
                attractions: true,
            },
        });

        return NextResponse.json(cities);
    } catch (error) {
        console.error('Get cities error:', error);
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
        const { name, country, region, description, costIndex, popularity, imageUrl } = body;

        const city = await prisma.city.create({
            data: {
                name,
                country,
                region,
                description,
                costIndex: parseInt(costIndex) || 50,
                popularity: parseInt(popularity) || 50,
                imageUrl,
            },
        });

        return NextResponse.json(city);
    } catch (error) {
        console.error('Create city error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
