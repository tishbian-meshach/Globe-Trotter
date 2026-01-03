'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Loading } from '@/components/ui/Spinner';

export default function TripSharePage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [trip, setTrip] = useState<any>(null);
    const [sharedTrip, setSharedTrip] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/trips/${params.id}`);
            const tripData = await response.json();
            setTrip(tripData);

            // Check if already shared
            const shareResponse = await fetch(`/api/trips/${params.id}/share`);
            if (shareResponse.ok) {
                const shareData = await shareResponse.json();
                setSharedTrip(shareData);
            }
        } catch (error) {
            showToast({
                title: 'Error',
                description: 'Failed to load trip data',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const generateShareLink = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch(`/api/trips/${params.id}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    canCopy: true,
                }),
            });

            if (!response.ok) throw new Error('Failed to generate link');

            const data = await response.json();
            setSharedTrip(data);

            showToast({
                title: 'Share link created!',
                description: 'You can now share your trip via link',
                type: 'success',
            });
        } catch (error) {
            showToast({
                title: 'Error',
                description: 'Failed to create share link',
                type: 'error',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast({
            title: 'Copied!',
            description: 'Link copied to clipboard',
            type: 'success',
        });
    };

    if (isLoading) {
        return <Loading text="Loading share settings..." />;
    }

    const shareUrl = sharedTrip
        ? `${window.location.origin}/share/${sharedTrip.shareId}`
        : '';

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-slate-900">Share Trip</h1>
                <p className="text-slate-600 mt-2">{trip.name}</p>
            </div>

            {!sharedTrip ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="text-6xl mb-4">🔗</div>
                        <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                            Share Your Trip
                        </h3>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto">
                            Generate a public link to share your itinerary with friends, family, or the world!
                        </p>
                        <Button onClick={generateShareLink} isLoading={isGenerating}>
                            Generate Share Link
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Share Link Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Share Link</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-mono"
                                />
                                <Button onClick={() => copyToClipboard(shareUrl)}>
                                    Copy
                                </Button>
                            </div>

                            <a
                                href={shareUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                                Preview shared page →
                            </a>
                        </CardContent>
                    </Card>

                    {/* Settings Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sharing Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <div className="font-medium text-slate-900">Allow copying</div>
                                    <div className="text-sm text-slate-600">
                                        Let others duplicate this trip to their account
                                    </div>
                                </div>
                                <div className="text-sm text-teal-600 font-medium">
                                    {sharedTrip.canCopy ? 'Enabled' : 'Disabled'}
                                </div>
                            </div>

                            {sharedTrip.expiresAt && (
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <div className="font-medium text-slate-900">Link expiration</div>
                                        <div className="text-sm text-slate-600">
                                            {new Date(sharedTrip.expiresAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Social Sharing */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Share On Social Media</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-3">
                                <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                                    Facebook
                                </button>
                                <button className="flex-1 px-4 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors">
                                    Twitter
                                </button>
                                <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
                                    WhatsApp
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Back Button */}
            <Button variant="outline" onClick={() => router.push(`/trips/${params.id}`)}>
                Back to Trip
            </Button>
        </div>
    );
}
