
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

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const attraction = await prisma.attraction.update({
            where: { id: params.id },
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
        console.error('Update attraction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        await prisma.attraction.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete attraction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
