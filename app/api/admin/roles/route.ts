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

// GET - List all roles
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const roles = await prisma.role.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { users: true }
                }
            }
        });

        return NextResponse.json(roles);
    } catch (error) {
        console.error('Get roles error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new role
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { name, description, permissions } = body;

        // Check if role already exists
        const existing = await prisma.role.findUnique({ where: { name } });
        if (existing) {
            return NextResponse.json({ error: 'Role already exists' }, { status: 400 });
        }

        const role = await prisma.role.create({
            data: {
                name,
                description,
                permissions: permissions || []
            }
        });

        return NextResponse.json(role);
    } catch (error) {
        console.error('Create role error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
