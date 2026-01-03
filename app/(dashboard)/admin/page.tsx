'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { AdminTabs, AdminTab } from '@/components/admin/AdminTabs';
import { OverviewTab } from '@/components/admin/OverviewTab';
import { UsersTab } from '@/components/admin/UsersTab';
import { RolesTab } from '@/components/admin/RolesTab';
import { CitiesTab } from '@/components/admin/CitiesTab';
import { ActivitiesTab } from '@/components/admin/ActivitiesTab';
import { TripsTab } from '@/components/admin/TripsTab';
import { AuditTab } from '@/components/admin/AuditTab';

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                // Check admin access by trying to fetch stats
                const res = await fetch('/api/admin/stats');
                setIsAdmin(res.ok);
            } catch {
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md text-center">
                    <CardContent className="py-12">
                        <div className="text-6xl mb-4">🔒</div>
                        <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                            Admin Access Required
                        </h3>
                        <p className="text-slate-600">
                            You don't have permission to view this page
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-600 mt-2">
                    Manage users, roles, cities, activities, trips, and view platform analytics
                </p>
            </div>

            {/* Tabs */}
            <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'roles' && <RolesTab />}
            {activeTab === 'cities' && <CitiesTab />}
            {activeTab === 'activities' && <ActivitiesTab />}
            {activeTab === 'trips' && <TripsTab />}
            {activeTab === 'audit' && <AuditTab />}
        </div>
    );
}
