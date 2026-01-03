import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const preferences = await prisma.userPreferences.findUnique({
            where: { userId: session.user.id },
        });

        if (!preferences) {
            // Create default preferences if they don't exist
            const newPreferences = await prisma.userPreferences.create({
                data: {
                    userId: session.user.id,
                },
            });
            return NextResponse.json(newPreferences);
        }

        return NextResponse.json(preferences);
    } catch (error) {
        console.error('Get preferences error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const preferences = await prisma.userPreferences.upsert({
            where: { userId: session.user.id },
            update: {
                language: body.language,
                currency: body.currency,
                privacy: body.privacy,
            },
            create: {
                userId: session.user.id,
                language: body.language || 'en',
                currency: body.currency || 'USD',
                privacy: body.privacy || 'private',
            },
        });

        return NextResponse.json(preferences);
    } catch (error) {
        console.error('Update preferences error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
