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

// GET - Get single user
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

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                isAdmin: true,
                roleId: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update user (including suspend/unsuspend and reset password)
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
        const { name, email, roleId, action, newPassword, isAdmin: newIsAdmin } = body;

        // Handle special actions
        if (action === 'suspend' || action === 'unsuspend') {
            const user = await prisma.user.update({
                where: { id },
                data: {
                    status: action === 'suspend' ? 'suspended' : 'active'
                },
                include: { role: true }
            });

            // Create audit log
            await prisma.auditLog.create({
                data: {
                    action: action === 'suspend' ? 'user_suspended' : 'user_unsuspended',
                    entityType: 'user',
                    entityId: id,
                    adminId: session?.user?.id || '',
                    details: `${action === 'suspend' ? 'Suspended' : 'Unsuspended'} user: ${user.email}`
                }
            });

            return NextResponse.json({ ...user, password: undefined });
        }

        if (action === 'reset_password' && newPassword) {
            const bcrypt = await import('bcryptjs');
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const user = await prisma.user.update({
                where: { id },
                data: {
                    password: hashedPassword
                },
                include: { role: true }
            });

            // Create audit log
            await prisma.auditLog.create({
                data: {
                    action: 'user_password_reset',
                    entityType: 'user',
                    entityId: id,
                    adminId: session?.user?.id || '',
                    details: `Reset password for user: ${user.email}`
                }
            });

            return NextResponse.json({ ...user, password: undefined });
        }

        // Standard update
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (roleId !== undefined) updateData.roleId = roleId;
        if (newIsAdmin !== undefined) updateData.isAdmin = newIsAdmin;

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            include: { role: true }
        });

        // Create audit log if admin status changed
        if (newIsAdmin !== undefined && session?.user?.id) {
            await prisma.auditLog.create({
                data: {
                    action: newIsAdmin ? 'user_promoted_to_admin' : 'user_demoted_from_admin',
                    entityType: 'user',
                    entityId: id,
                    adminId: session.user.id,
                    details: `Changed admin status for user: ${user.email}`
                }
            });
        }

        return NextResponse.json({ ...user, password: undefined });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete user
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

        // Prevent deleting self
        if (session?.user?.id === id) {
            return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
