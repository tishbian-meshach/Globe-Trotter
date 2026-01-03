import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

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

        const body = await request.json();
        const { name, country, region, description, costIndex, popularity } = body;

        const city = await prisma.city.create({
            data: {
                name,
                country,
                region,
                description,
                costIndex: parseInt(costIndex) || 50,
                popularity: parseInt(popularity) || 50,
            },
        });

        return NextResponse.json(city);
    } catch (error) {
        console.error('Create city error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
