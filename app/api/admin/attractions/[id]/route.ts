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

// GET - Get single attraction
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;

        const attraction = await prisma.attraction.findUnique({
            where: { id },
            include: {
                city: {
                    select: {
                        id: true,
                        name: true,
                        country: true
                    }
                }
            }
        });

        if (!attraction) {
            return NextResponse.json({ error: 'Attraction not found' }, { status: 404 });
        }

        return NextResponse.json(attraction);
    } catch (error) {
        console.error('Get attraction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update attraction (including hide/unhide)
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
        const { name, description, type, cost, duration, rating, reviews, imageUrl, location, isHidden } = body;

        const attraction = await prisma.attraction.update({
            where: { id },
            data: {
                name,
                description,
                type,
                cost: cost !== undefined ? parseFloat(cost) : undefined,
                duration: duration !== undefined ? (duration ? parseInt(duration) : null) : undefined,
                rating: rating !== undefined ? parseFloat(rating) : undefined,
                reviews: reviews !== undefined ? parseInt(reviews) : undefined,
                imageUrl,
                location,
                isHidden
            },
            include: {
                city: {
                    select: {
                        id: true,
                        name: true,
                        country: true
                    }
                }
            }
        });

        // Create audit log
        const action = isHidden !== undefined 
            ? (isHidden ? 'attraction_hidden' : 'attraction_unhidden')
            : 'attraction_updated';
        
        if (session?.user?.id) {
            await prisma.auditLog.create({
                data: {
                    action,
                    entityType: 'attraction',
                    entityId: attraction.id,
                    adminId: session.user.id,
                    details: `Updated attraction: ${attraction.name}`
                }
            });
        }

        return NextResponse.json(attraction);
    } catch (error) {
        console.error('Update attraction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete attraction
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

        const attraction = await prisma.attraction.findUnique({
            where: { id },
            select: { name: true }
        });

        if (!attraction) {
            return NextResponse.json({ error: 'Attraction not found' }, { status: 404 });
        }

        await prisma.attraction.delete({
            where: { id }
        });

        // Create audit log
        if (session?.user?.id) {
            await prisma.auditLog.create({
                data: {
                    action: 'attraction_deleted',
                    entityType: 'attraction',
                    entityId: id,
                    adminId: session.user.id,
                    details: `Deleted attraction: ${attraction.name}`
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete attraction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
