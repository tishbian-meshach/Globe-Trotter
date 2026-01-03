'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/Toast';
import imageCompression from 'browser-image-compression';
import { FaCamera } from 'react-icons/fa';

interface AvatarUploadProps {
    value?: string | null;
    onChange: (url: string) => void;
    name?: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'w-16 h-16 text-xl',
    md: 'w-24 h-24 text-3xl',
    lg: 'w-32 h-32 text-4xl',
};

const iconSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
};

export function AvatarUpload({ value, onChange, name = '', size = 'md' }: AvatarUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const getInitial = () => {
        if (name && name.length > 0) return name[0].toUpperCase();
        return 'U';
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast({ title: 'Error', description: 'Please select an image file', type: 'error' });
            return;
        }

        setIsUploading(true);
        try {
            // Compress image
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 512,
                useWebWorker: true,
                initialQuality: 0.8,
            };
            const compressedFile = await imageCompression(file, options);
            const fileToUpload = compressedFile.size < file.size ? compressedFile : file;

            // Upload
            const formData = new FormData();
            formData.append('file', fileToUpload);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            onChange(data.url);
            showToast({ title: 'Success', description: 'Photo updated', type: 'success' });
        } catch (error) {
            console.error('Upload error:', error);
            showToast({ title: 'Error', description: 'Failed to upload photo', type: 'error' });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="relative inline-block">
            <button
                type="button"
                onClick={handleClick}
                disabled={isUploading}
                className={`
                    ${sizeClasses[size]} 
                    rounded-full overflow-hidden 
                    border-4 border-slate-100 
                    bg-primary-100 
                    flex items-center justify-center 
                    font-bold text-primary-500
                    relative group
                    transition-all duration-200
                    hover:border-primary-300
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                    ${isUploading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                `}
            >
                {/* Avatar Image or Initial */}
                {value ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={value}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span>{getInitial()}</span>
                )}

                {/* Hover Overlay */}
                <div className={`
                    absolute inset-0 
                    bg-black/50 
                    flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-200
                    rounded-full
                `}>
                    {isUploading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <FaCamera className={`${iconSizeClasses[size]} text-white`} />
                    )}
                </div>
            </button>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
