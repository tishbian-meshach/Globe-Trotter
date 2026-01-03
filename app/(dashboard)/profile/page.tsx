'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { AvatarUpload } from '@/components/ui/AvatarUpload';
import { FaUser, FaEnvelope, FaGlobe, FaTrash, FaBookmark, FaTimes, FaSave } from 'react-icons/fa';

interface UserProfile {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    savedDestinations: string[];
    savedCities: { id: string; name: string; country: string; imageUrl: string | null }[];
    userPreferences: {
        language: string;
        currency: string;
        privacy: string;
    } | null;
}

const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ko', label: 'Korean' },
    { value: 'hi', label: 'Hindi' },
];

export default function ProfilePage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [image, setImage] = useState('');
    const [language, setLanguage] = useState('en');

    // Delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/user/profile');
            if (!response.ok) throw new Error('Failed to fetch profile');

            const data = await response.json();
            setProfile(data);
            setName(data.name || '');
            setEmail(data.email || '');
            setImage(data.image || '');
            setLanguage(data.userPreferences?.language || 'en');
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            showToast({ title: 'Error', description: 'Failed to load profile', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            // Update profile
            const profileRes = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, image })
            });

            if (!profileRes.ok) {
                const error = await profileRes.json();
                throw new Error(error.error || 'Failed to update profile');
            }

            // Update preferences
            await fetch('/api/user/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language })
            });

            showToast({ title: 'Success', description: 'Profile updated successfully', type: 'success' });
            await fetchProfile();
        } catch (error: any) {
            showToast({ title: 'Error', description: error.message || 'Failed to save profile', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveSavedCity = async (cityId: string) => {
        try {
            const response = await fetch('/api/user/saved-destinations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cityId })
            });

            if (!response.ok) throw new Error('Failed to remove');

            showToast({ title: 'Removed', description: 'City removed from saved destinations', type: 'success' });
            await fetchProfile();
        } catch (error) {
            showToast({ title: 'Error', description: 'Failed to remove city', type: 'error' });
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch('/api/user/profile', {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete account');

            showToast({ title: 'Account Deleted', description: 'Your account has been deleted', type: 'success' });
            router.push('/login');
        } catch (error) {
            showToast({ title: 'Error', description: 'Failed to delete account', type: 'error' });
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    if (isLoading) {
        return <Loading text="Loading profile..." />;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-slate-900">Profile</h1>
                <p className="text-slate-600 mt-2">
                    Manage your account settings and preferences
                </p>
            </div>

            {/* Profile Card */}
            <Card>

                <CardContent>
                    <div className="space-y-6 pt-6">
                        {/* Profile Photo */}
                        <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                            <AvatarUpload
                                value={image}
                                onChange={setImage}
                                name={name || email}
                                size="lg"
                            />
                            <div>
                                <h3 className="font-medium text-slate-900">Profile Photo</h3>
                                <p className="text-sm text-slate-500">Click on the avatar to upload a new photo</p>
                            </div>
                        </div>

                        {/* Name */}
                        <Input
                            label="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            icon={<FaUser className="w-4 h-4" />}
                        />

                        {/* Email */}
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            icon={<FaEnvelope className="w-4 h-4" />}
                        />

                        {/* Language Preference */}
                        <Dropdown
                            label="Language Preference"
                            options={languageOptions}
                            value={language}
                            onChange={setLanguage}
                            placeholder="Select language"
                        />

                        {/* Save Button */}
                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <Button onClick={handleSaveProfile} isLoading={isSaving}>
                                <FaSave className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Saved Destinations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FaBookmark className="w-5 h-5 text-primary-500" />
                        Saved Destinations ({profile?.savedCities?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {profile?.savedCities && profile.savedCities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {profile.savedCities.map((city) => (
                                <div
                                    key={city.id}
                                    className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-primary-300 transition-colors"
                                >
                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                                        {city.imageUrl ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-teal-400 to-primary-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-slate-900 truncate">{city.name}</h4>
                                        <p className="text-sm text-slate-500">{city.country}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveSavedCity(city.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        title="Remove from saved"
                                    >
                                        <FaTimes className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FaGlobe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No saved destinations yet</p>
                            <p className="text-sm text-slate-400 mt-1">
                                Browse cities and click the bookmark icon to save them
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <FaTrash className="w-5 h-5" />
                        Danger Zone
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-slate-900">Delete Account</h4>
                            <p className="text-sm text-slate-500">
                                Permanently delete your account and all associated data
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Account"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-slate-600">
                        Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteAccount}
                            isLoading={isDeleting}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                            Delete Account
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
