'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';

const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'zh', label: '中文' },
    { value: 'ja', label: '日本語' },
];

const currencyOptions = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'JPY', label: 'Japanese Yen (JPY)' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)' },
    { value: 'AUD', label: 'Australian Dollar (AUD)' },
    { value: 'INR', label: 'Indian Rupee (INR)' },
];

const privacyOptions = [
    { value: 'private', label: 'Private (Only you)' },
    { value: 'friends', label: 'Friends' },
    { value: 'public', label: 'Public (Everyone)' },
];

export default function SettingsPage() {
    const sessionData = useSession();
    const session = sessionData?.data;
    const router = useRouter();
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState(session?.user?.name || '');
    const [language, setLanguage] = useState('en');
    const [currency, setCurrency] = useState('USD');
    const [privacy, setPrivacy] = useState('private');

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            showToast({
                title: 'Saved!',
                description: 'Your profile has been updated',
                type: 'success',
            });
        } catch (error) {
            showToast({
                title: 'Error',
                description: 'Failed to save profile',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePreferences = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/user/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language, currency, privacy }),
            });

            if (!response.ok) throw new Error('Failed to save');

            showToast({
                title: 'Preferences saved!',
                type: 'success',
            });
        } catch (error) {
            showToast({
                title: 'Error',
                description: 'Failed to save preferences',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-600 mt-2">
                    Manage your account and preferences
                </p>
            </div>

            {/* Profile Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                            {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
                        </div>
                        <div>
                            <Button variant="outline" size="sm">
                                Change Photo
                            </Button>
                            <p className="text-xs text-slate-500 mt-2">
                                JPG, PNG or GIF (max. 2MB)
                            </p>
                        </div>
                    </div>

                    {/* Name */}
                    <Input
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                    />

                    {/* Email (read-only) */}
                    <Input
                        label="Email"
                        value={session?.user?.email || ''}
                        disabled
                        placeholder="Email address"
                    />

                    <div className="flex gap-3">
                        <Button onClick={handleSaveProfile} isLoading={isLoading}>
                            Save Profile
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Dropdown
                        label="Language"
                        options={languageOptions}
                        value={language}
                        onChange={setLanguage}
                    />

                    <Dropdown
                        label="Currency"
                        options={currencyOptions}
                        value={currency}
                        onChange={setCurrency}
                    />

                    <Dropdown
                        label="Default Privacy"
                        options={privacyOptions}
                        value={privacy}
                        onChange={setPrivacy}
                    />

                    <div className="flex gap-3">
                        <Button onClick={handleSavePreferences} isLoading={isLoading}>
                            Save Preferences
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Saved Destinations */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Saved Destinations</CardTitle>
                        <Badge variant="default">0 saved</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-slate-500">
                        <div className="text-5xl mb-3">📍</div>
                        <p>No saved destinations yet</p>
                        <p className="text-sm mt-1">Explore cities and save your favorites</p>
                    </div>
                </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-2">Change Password</h4>
                        <p className="text-sm text-slate-600 mb-4">
                            Update your password to keep your account secure
                        </p>
                        <Button variant="outline" size="sm">
                            Change Password
                        </Button>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg border-2 border-red-100">
                        <h4 className="font-semibold text-red-900 mb-2">Delete Account</h4>
                        <p className="text-sm text-red-700 mb-4">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <Button variant="danger" size="sm">
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
