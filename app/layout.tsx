import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'GlobeTrotter - Your Travel Planning Companion',
    description: 'Plan amazing trips, discover destinations, and manage your travel budget all in one place',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </body>
        </html>
    );
}
