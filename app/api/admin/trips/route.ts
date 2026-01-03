import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Check if user has admin role
async function isAdmin(session: any) {
    if (!session?.user?.id) return false;
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true }
    });
    return user?.role?.name === 'admin' || user?.isAdmin;
}

// GET - List all trips with filters
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const cityId = searchParams.get('cityId');
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');

        const where: any = {};

        if (cityId) {
            where.stops = {
                some: { cityId }
            };
        }

        if (userId) {
            where.userId = userId;
        }

        if (status) {
            where.status = status;
        }

        const trips = await prisma.trip.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                stops: {
                    include: {
                        city: {
                            select: {
                                id: true,
                                name: true,
                                country: true
                            }
                        }
                    },
                    orderBy: { order: 'asc' }
                },
                sharedTrip: true,
                _count: {
                    select: { expenses: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(trips);
    } catch (error) {
        console.error('Get trips error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
