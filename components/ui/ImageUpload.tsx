'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import imageCompression from 'browser-image-compression';

interface ImageUploadProps {
    value?: string | null;
    onChange: (url: string) => void;
    label?: string;
}

export function ImageUpload({ value, onChange, label = 'Image' }: ImageUploadProps) {
    const { showToast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            showToast({ title: 'Error', description: 'Please upload an image file', type: 'error' });
            return;
        }

        setIsUploading(true);

        try {
            // Compress image
            const options = {
                maxSizeMB: 1,
                // maxWidthOrHeight acts as a bounding box (max dimension).
                // It automatically PRESERVES aspect ratio (e.g. 1:1 stays 1:1).
                // It will NEVER stretch the image.
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                initialQuality: 0.8,
            };

            const compressedFile = await imageCompression(file, options);

            // Check if compression actually reduced size, otherwise use original (unlikely but safe)
            const fileToUpload = compressedFile.size < file.size ? compressedFile : file;

            if (fileToUpload.size > 5 * 1024 * 1024) { // 5MB limit safety check
                showToast({ title: 'Error', description: 'Image is too large even after compression', type: 'error' });
                setIsUploading(false);
                return;
            }

            const formData = new FormData();
            formData.append('file', fileToUpload);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Upload failed');

            onChange(data.url);
            showToast({ title: 'Success', description: 'Image uploaded successfully', type: 'success' });
        } catch (error: any) {
            console.error('Upload Error:', error);
            showToast({
                title: 'Error',
                description: error.message || 'Failed to upload image',
                type: 'error'
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">{label}</label>

            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-200 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={value}
                            alt="Uploaded preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => onChange('')}
                                className="text-white bg-red-500/80 p-1.5 rounded-full hover:bg-red-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-primary-500 hover:text-primary-500 transition-colors bg-slate-50 hover:bg-white"
                    >
                        {isUploading ? (
                            <Loading text="" className="py-0" />
                        ) : (
                            <>
                                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs font-medium">Upload Image</span>
                            </>
                        )}
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={isUploading}
                />

                {value && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        Change Image
                    </Button>
                )}
            </div>
            {value && <p className="text-xs text-slate-500 break-all">{value}</p>}
        </div>
    );
}
