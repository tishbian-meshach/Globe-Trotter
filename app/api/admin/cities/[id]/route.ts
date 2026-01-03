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

// GET - Get single city
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const city = await prisma.city.findUnique({
            where: { id },
            include: {
                attractions: true,
                _count: {
                    select: { stops: true }
                }
            }
        });

        if (!city) {
            return NextResponse.json({ error: 'City not found' }, { status: 404 });
        }

        return NextResponse.json(city);
    } catch (error) {
        console.error('Get city error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update city
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, country, region, description, imageUrl, costIndex, popularity, latitude, longitude } = body;

        const city = await prisma.city.update({
            where: { id },
            data: {
                name,
                country,
                region,
                description,
                imageUrl,
                costIndex: parseInt(costIndex) || 50,
                popularity: parseInt(popularity) || 50,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null
            }
        });

        return NextResponse.json(city);
    } catch (error) {
        console.error('Update city error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete city
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;

        // Check if city has trip stops
        const city = await prisma.city.findUnique({
            where: { id },
            include: { _count: { select: { stops: true } } }
        });

        if (city?._count.stops && city._count.stops > 0) {
            return NextResponse.json(
                { error: 'Cannot delete city with existing trip stops' },
                { status: 400 }
            );
        }

        await prisma.city.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete city error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
