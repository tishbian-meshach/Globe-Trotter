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

// GET - List all attractions with city info
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const type = searchParams.get('type');

        const where: any = {};
        
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { city: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }
        
        if (type) {
            where.type = type;
        }

        const attractions = await prisma.attraction.findMany({
            where,
            include: {
                city: {
                    select: {
                        id: true,
                        name: true,
                        country: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(attractions);
    } catch (error) {
        console.error('Get attractions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new attraction
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { cityId, name, description, type, cost, duration, rating, reviews, imageUrl, location } = body;

        // Validate city exists
        const city = await prisma.city.findUnique({ where: { id: cityId } });
        if (!city) {
            return NextResponse.json({ error: 'City not found' }, { status: 404 });
        }

        const attraction = await prisma.attraction.create({
            data: {
                cityId,
                name,
                description,
                type,
                cost: parseFloat(cost) || 0,
                duration: duration ? parseInt(duration) : null,
                rating: parseFloat(rating) || 0,
                reviews: parseInt(reviews) || 0,
                imageUrl,
                location
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
        if (session?.user?.id) {
            await prisma.auditLog.create({
                data: {
                    action: 'attraction_created',
                    entityType: 'attraction',
                    entityId: attraction.id,
                    adminId: session.user.id,
                    details: `Created attraction: ${attraction.name}`
                }
            });
        }

        return NextResponse.json(attraction);
    } catch (error) {
        console.error('Create attraction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
