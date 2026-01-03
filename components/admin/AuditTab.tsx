'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Dropdown } from '@/components/ui/Dropdown';
import { HiFilter } from 'react-icons/hi';

interface Admin {
    id: string;
    name?: string;
    email: string;
}

interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    adminId: string;
    details?: string;
    createdAt: string;
    admin?: Admin;
}

const ACTION_TYPES = [
    'user_suspended',
    'user_unsuspended',
    'user_password_reset',
    'trip_deleted',
    'trip_flagged',
    'trip_unflagged',
    'attraction_created',
    'attraction_updated',
    'attraction_hidden',
    'attraction_unhidden',
    'attraction_deleted',
    'city_updated'
];

const ENTITY_TYPES = ['user', 'trip', 'city', 'attraction'];

export function AuditTab() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState('');
    const [entityFilter, setEntityFilter] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const params = new URLSearchParams();
            if (actionFilter) params.append('action', actionFilter);
            if (entityFilter) params.append('entityType', entityFilter);

            const res = await fetch(`/api/admin/audit?${params}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            fetchLogs();
        }, 300);
        return () => clearTimeout(timer);
    }, [actionFilter, entityFilter]);

    const getActionColor = (action: string) => {
        if (action.includes('deleted') || action.includes('suspended') || action.includes('hidden')) {
            return 'bg-red-100 text-red-800';
        } else if (action.includes('created') || action.includes('unsuspended') || action.includes('unhidden')) {
            return 'bg-green-100 text-green-800';
        } else if (action.includes('updated') || action.includes('password_reset')) {
            return 'bg-blue-100 text-blue-800';
        } else if (action.includes('flagged')) {
            return 'bg-orange-100 text-orange-800';
        }
        return 'bg-slate-100 text-slate-800';
    };

    const getEntityColor = (entityType: string) => {
        const colors: Record<string, string> = {
            user: 'bg-purple-100 text-purple-800',
            trip: 'bg-blue-100 text-blue-800',
            city: 'bg-green-100 text-green-800',
            attraction: 'bg-orange-100 text-orange-800'
        };
        return colors[entityType] || 'bg-slate-100 text-slate-800';
    };

    const formatAction = (action: string) => {
        return action.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    if (loading && logs.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex items-center gap-2">
                    <HiFilter className="text-slate-400 w-5 h-5" />
                    <Dropdown
                        options={[
                            { value: '', label: 'All Actions' },
                            ...ACTION_TYPES.map(action => ({
                                value: action,
                                label: formatAction(action)
                            }))
                        ]}
                        value={actionFilter}
                        onChange={setActionFilter}
                        placeholder="All Actions"
                        className="w-56"
                    />
                </div>
                <Dropdown
                    options={[
                        { value: '', label: 'All Entities' },
                        ...ENTITY_TYPES.map(entity => ({
                            value: entity,
                            label: entity.charAt(0).toUpperCase() + entity.slice(1)
                        }))
                    ]}
                    value={entityFilter}
                    onChange={setEntityFilter}
                    placeholder="All Entities"
                    className="w-48"
                />
            </div>

            {/* Audit Logs Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Timestamp</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Action</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Entity</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Admin</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4 text-sm text-slate-600">
                                            <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                                            <div className="text-xs text-slate-400">
                                                {new Date(log.createdAt).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                                {formatAction(log.action)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEntityColor(log.entityType)}`}>
                                                {log.entityType.charAt(0).toUpperCase() + log.entityType.slice(1)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div>
                                                <div className="text-sm text-slate-900">{log.admin?.name || 'Unknown'}</div>
                                                <div className="text-xs text-slate-500">{log.admin?.email}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-600">
                                            {log.details || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {logs.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                No audit logs found
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {logs.length > 0 && (
                <div className="text-sm text-slate-500 text-center">
                    Showing {logs.length} most recent logs
                </div>
            )}
        </div>
    );
}
