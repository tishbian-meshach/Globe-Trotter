'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { HiPencil, HiTrash, HiPlus } from 'react-icons/hi';

interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
    _count?: {
        users: number;
    };
}

const AVAILABLE_PERMISSIONS = [
    'users:read',
    'users:write',
    'users:delete',
    'roles:read',
    'roles:write',
    'roles:delete',
    'cities:read',
    'cities:write',
    'cities:delete',
    'trips:read',
    'trips:write',
    'trips:delete',
];

export function RolesTab() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editRole, setEditRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', permissions: [] as string[] });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await fetch('/api/admin/roles');
            if (res.ok) {
                const data = await res.json();
                setRoles(data);
            }
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditRole(null);
        setFormData({ name: '', description: '', permissions: [] });
        setIsModalOpen(true);
    };

    const openEditModal = (role: Role) => {
        setEditRole(role);
        setFormData({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions || []
        });
        setIsModalOpen(true);
    };

    const togglePermission = (permission: string) => {
        setFormData((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter((p) => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = editRole
                ? `/api/admin/roles/${editRole.id}`
                : '/api/admin/roles';
            const method = editRole ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                await fetchRoles();
                setIsModalOpen(false);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save role');
            }
        } catch (error) {
            console.error('Failed to save role:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (roleId: string) => {
        if (!confirm('Are you sure you want to delete this role?')) return;
        try {
            const res = await fetch(`/api/admin/roles/${roleId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                await fetchRoles();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete role');
            }
        } catch (error) {
            console.error('Failed to delete role:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Add button */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">Manage Roles</h2>
                <Button onClick={openCreateModal} className="flex items-center gap-2">
                    <HiPlus className="w-4 h-4" />
                    Add Role
                </Button>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                    <Card key={role.id}>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-semibold text-slate-900 capitalize">{role.name}</h3>
                                    <p className="text-sm text-slate-500">{role._count?.users || 0} users</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openEditModal(role)}
                                        className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    >
                                        <HiPencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(role.id)}
                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <HiTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            {role.description && (
                                <p className="text-sm text-slate-600 mb-3">{role.description}</p>
                            )}
                            <div className="flex flex-wrap gap-1">
                                {role.permissions.slice(0, 3).map((perm) => (
                                    <span
                                        key={perm}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700"
                                    >
                                        {perm}
                                    </span>
                                ))}
                                {role.permissions.length > 3 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                                        +{role.permissions.length - 3} more
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {roles.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        No roles created yet. Click "Add Role" to create one.
                    </div>
                )}
            </div>

            {/* Role Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editRole ? 'Edit Role' : 'Create Role'}
                size="lg"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. moderator"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <Input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Role description"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Permissions</label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-lg">
                            {AVAILABLE_PERMISSIONS.map((permission) => (
                                <label key={permission} className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.includes(permission)}
                                        onChange={() => togglePermission(permission)}
                                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-slate-700">{permission}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button onClick={handleSave} disabled={saving || !formData.name} className="flex-1">
                            {saving ? 'Saving...' : editRole ? 'Save Changes' : 'Create Role'}
                        </Button>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
