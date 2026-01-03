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

// GET - Get single role
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

        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { users: true }
                }
            }
        });

        if (!role) {
            return NextResponse.json({ error: 'Role not found' }, { status: 404 });
        }

        return NextResponse.json(role);
    } catch (error) {
        console.error('Get role error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update role
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
        const { name, description, permissions } = body;

        const role = await prisma.role.update({
            where: { id },
            data: {
                name,
                description,
                permissions: permissions || []
            }
        });

        return NextResponse.json(role);
    } catch (error) {
        console.error('Update role error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete role
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

        // Check if role has users assigned
        const role = await prisma.role.findUnique({
            where: { id },
            include: { _count: { select: { users: true } } }
        });

        if (role?._count.users && role._count.users > 0) {
            return NextResponse.json(
                { error: 'Cannot delete role with assigned users' },
                { status: 400 }
            );
        }

        await prisma.role.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete role error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
