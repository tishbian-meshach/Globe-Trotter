'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { HiPencil, HiTrash, HiPlus, HiSearch } from 'react-icons/hi';

interface Role {
    id: string;
    name: string;
    description?: string;
}

interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    isAdmin: boolean;
    roleId?: string;
    role?: Role;
    status: string;
    createdAt: string;
    _count?: {
        trips: number;
    };
}

export function UsersTab() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editUser, setEditUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTripsModalOpen, setIsTripsModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [userTrips, setUserTrips] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', roleId: '', isAdmin: false });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await fetch('/api/admin/roles');
            if (res.ok) {
                const data = await res.json();
                setRoles(data);
            }
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    };

    const openEditModal = (user: User) => {
        setEditUser(user);
        setFormData({
            name: user.name || '',
            email: user.email,
            roleId: user.roleId || '',
            isAdmin: user.isAdmin
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!editUser) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/users/${editUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                await fetchUsers();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Failed to update user:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                await fetchUsers();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const handleSuspend = async (userId: string, currentStatus: string) => {
        const action = currentStatus === 'active' ? 'suspend' : 'unsuspend';
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;
        
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            if (res.ok) {
                await fetchUsers();
            }
        } catch (error) {
            console.error('Failed to suspend user:', error);
        }
    };

    const openTripsModal = async (userId: string) => {
        setSelectedUserId(userId);
        try {
            const res = await fetch(`/api/admin/trips?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setUserTrips(data);
                setIsTripsModalOpen(true);
            }
        } catch (error) {
            console.error('Failed to fetch user trips:', error);
        }
    };

    const openResetPasswordModal = (userId: string) => {
        setSelectedUserId(userId);
        setNewPassword('');
        setIsResetPasswordModalOpen(true);
    };

    const handleQuickRoleChange = async (userId: string, newIsAdmin: boolean) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAdmin: newIsAdmin })
            });
            if (res.ok) {
                await fetchUsers();
            }
        } catch (error) {
            console.error('Failed to change admin status:', error);
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUserId || !newPassword) return;
        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/users/${selectedUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reset_password', newPassword })
            });
            if (res.ok) {
                setIsResetPasswordModalOpen(false);
                setNewPassword('');
                alert('Password reset successfully');
            } else {
                alert('Failed to reset password');
            }
        } catch (error) {
            console.error('Failed to reset password:', error);
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </div>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">User</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Role</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Trips</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Joined</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4">
                                            <div>
                                                <div className="font-medium text-slate-900">{user.name || 'No name'}</div>
                                                <div className="text-sm text-slate-500">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role?.name === 'admin' || user.isAdmin
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : user.role?.name === 'moderator'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-slate-100 text-slate-800'
                                                    }`}>
                                                    {user.role?.name || (user.isAdmin ? 'Admin' : 'User')}
                                                </span>
                                                <Dropdown
                                                    options={[
                                                        { value: 'user', label: 'User' },
                                                        { value: 'admin', label: 'Admin' }
                                                    ]}
                                                    value={user.isAdmin ? 'admin' : 'user'}
                                                    onChange={(value) => handleQuickRoleChange(user.id, value === 'admin')}
                                                    className="w-24"
                                                />
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {user.status === 'active' ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => openTripsModal(user.id)}
                                                className="text-primary-600 hover:underline"
                                            >
                                                {user._count?.trips || 0} trips
                                            </button>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleSuspend(user.id, user.status)}
                                                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                                                        user.status === 'active'
                                                            ? 'text-orange-600 hover:bg-orange-50'
                                                            : 'text-green-600 hover:bg-green-50'
                                                    }`}
                                                >
                                                    {user.status === 'active' ? 'Suspend' : 'Unsuspend'}
                                                </button>
                                                <button
                                                    onClick={() => openResetPasswordModal(user.id)}
                                                    className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    Reset Pwd
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                >
                                                    <HiPencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <HiTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                No users found
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Edit User Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit User">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="User name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="user@example.com"
                        />
                    </div>
                    <div>
                        <Dropdown
                            label="Role"
                            options={[
                                { value: '', label: 'No role assigned' },
                                ...roles.map((role) => ({
                                    value: role.id,
                                    label: role.name
                                }))
                            ]}
                            value={formData.roleId}
                            onChange={(value) => setFormData({ ...formData, roleId: value })}
                            placeholder="No role assigned"
                        />
                    </div>
                    <div>
                        <Dropdown
                            label="Admin Access"
                            options={[
                                { value: 'false', label: 'Regular User' },
                                { value: 'true', label: 'Admin' }
                            ]}
                            value={formData.isAdmin ? 'true' : 'false'}
                            onChange={(value) => setFormData({ ...formData, isAdmin: value === 'true' })}
                        />
                        <p className="text-xs text-slate-500 mt-1">Admins have full access to the admin dashboard</p>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button onClick={handleSave} disabled={saving} className="flex-1">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* User Trips Modal */}
            <Modal isOpen={isTripsModalOpen} onClose={() => setIsTripsModalOpen(false)} title="User Trips">
                <div className="space-y-3">
                    {userTrips.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">No trips found</p>
                    ) : (
                        userTrips.map((trip) => (
                            <div key={trip.id} className="p-4 border border-slate-200 rounded-lg">
                                <h4 className="font-medium text-slate-900">{trip.name}</h4>
                                <p className="text-sm text-slate-600 mt-1">
                                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                        trip.status === 'upcoming' 
                                            ? 'bg-blue-100 text-blue-800'
                                            : trip.status === 'ongoing'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-slate-100 text-slate-800'
                                    }`}>
                                        {trip.status}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                        {trip.stops?.length || 0} stops
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsTripsModalOpen(false)} className="flex-1">
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Reset Password Modal */}
            <Modal isOpen={isResetPasswordModalOpen} onClose={() => setIsResetPasswordModalOpen(false)} title="Reset Password">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password (min 6 characters)"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button onClick={handleResetPassword} disabled={saving || !newPassword} className="flex-1">
                            {saving ? 'Resetting...' : 'Reset Password'}
                        </Button>
                        <Button variant="outline" onClick={() => setIsResetPasswordModalOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
