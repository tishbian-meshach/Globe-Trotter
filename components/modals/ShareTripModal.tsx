'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

interface ShareTripModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    initialShareId?: string | null;
}

export function ShareTripModal({ isOpen, onClose, tripId, initialShareId }: ShareTripModalProps) {
    const [shareId, setShareId] = useState<string | null>(initialShareId || null);
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    const shareUrl = shareId ? `${window.location.origin}/share/${shareId}` : '';

    const handleGenerateLink = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/trips/${tripId}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create' }),
            });

            if (!response.ok) throw new Error('Failed to generate share link');

            const data = await response.json();
            setShareId(data.shareId);
            showToast({
                title: 'Share link created',
                description: 'Your trip is now shareable via link',
                type: 'success',
            });
        } catch (error) {
            showToast({
                title: 'Error',
                description: 'Failed to generate share link',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            showToast({
                title: 'Link copied',
                description: 'Share link copied to clipboard',
                type: 'success',
            });
        } catch (error) {
            showToast({
                title: 'Error',
                description: 'Failed to copy link',
                type: 'error',
            });
        }
    };

    const handleRemoveLink = async () => {
        if (!confirm('Are you sure you want to remove the share link? The current link will no longer work.')) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/trips/${tripId}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'remove' }),
            });

            if (!response.ok) throw new Error('Failed to remove share link');

            setShareId(null);
            showToast({
                title: 'Share link removed',
                description: 'Your trip is no longer shared',
                type: 'success',
            });
        } catch (error) {
            showToast({
                title: 'Error',
                description: 'Failed to remove share link',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Share Trip" size="md">
            <div className="space-y-6">
                <div>
                    <p className="text-slate-600 text-sm mb-4">
                        Share your trip with anyone via a public link. Anyone with the link can view your itinerary.
                    </p>

                    {!shareId ? (
                        <div className="text-center py-8">
                            <div className="text-5xl mb-4">🔗</div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                No share link yet
                            </h3>
                            <p className="text-slate-600 mb-6">
                                Generate a shareable link to allow others to view this trip
                            </p>
                            <Button onClick={handleGenerateLink} disabled={isLoading}>
                                {isLoading ? 'Generating...' : 'Generate Share Link'}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Share Link
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        value={shareUrl}
                                        readOnly
                                        onClick={(e) => e.currentTarget.select()}
                                        className="font-mono text-sm"
                                    />
                                    <Button onClick={handleCopyLink} variant="secondary">
                                        Copy
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-slate-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="flex-1 text-sm text-slate-600">
                                        <p className="font-medium text-slate-900 mb-1">About sharing</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Anyone with this link can view your trip</li>
                                            <li>They can see your itinerary, activities, and budget</li>
                                            <li>Logged-in users can copy your trip to their account</li>
                                            <li>Your trip remains read-only for viewers</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={handleRemoveLink}
                                    variant="outline"
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    Remove Link
                                </Button>
                                <Button onClick={onClose} className="flex-1">
                                    Done
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
