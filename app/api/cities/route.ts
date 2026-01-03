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
