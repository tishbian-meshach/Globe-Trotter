import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Fetch user profile
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                savedDestinations: true,
                userPreferences: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch saved cities details
        const savedCities = await prisma.city.findMany({
            where: { id: { in: user.savedDestinations } },
            select: { id: true, name: true, country: true, imageUrl: true }
        });

        return NextResponse.json({ ...user, savedCities });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, email, image } = await request.json();

        // Check if email is already taken by another user
        if (email && email !== session.user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });
            if (existingUser && existingUser.id !== session.user.id) {
                return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                ...(name !== undefined && { name }),
                ...(email !== undefined && { email }),
                ...(image !== undefined && { image }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete user account
export async function DELETE() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.user.delete({
            where: { id: session.user.id }
        });

        return NextResponse.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
