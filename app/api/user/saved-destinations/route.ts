import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Fetch user's saved destinations
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { savedDestinations: true }
        });

        return NextResponse.json({ savedDestinations: user?.savedDestinations || [] });
    } catch (error) {
        console.error('Get saved destinations error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Toggle save/unsave a destination
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { cityId } = await request.json();

        if (!cityId) {
            return NextResponse.json({ error: 'City ID is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { savedDestinations: true }
        });

        const currentSaved = user?.savedDestinations || [];
        const isSaved = currentSaved.includes(cityId);

        let updatedSaved: string[];
        if (isSaved) {
            // Remove from saved
            updatedSaved = currentSaved.filter(id => id !== cityId);
        } else {
            // Add to saved
            updatedSaved = [...currentSaved, cityId];
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { savedDestinations: updatedSaved }
        });

        return NextResponse.json({
            savedDestinations: updatedSaved,
            isSaved: !isSaved
        });
    } catch (error) {
        console.error('Toggle saved destination error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
