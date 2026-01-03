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

// GET - List all audit logs
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const entityType = searchParams.get('entityType');

        const where: any = {};

        if (action) {
            where.action = action;
        }

        if (entityType) {
            where.entityType = entityType;
        }

        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit to last 100 logs
        });

        // Fetch admin details for each log
        const adminIds = [...new Set(logs.map(log => log.adminId))];
        const admins = await prisma.user.findMany({
            where: { id: { in: adminIds } },
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        const adminMap = new Map(admins.map(a => [a.id, a]));

        const logsWithAdmins = logs.map(log => ({
            ...log,
            admin: adminMap.get(log.adminId)
        }));

        return NextResponse.json(logsWithAdmins);
    } catch (error) {
        console.error('Get audit logs error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
