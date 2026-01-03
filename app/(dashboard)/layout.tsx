'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { HiHome, HiMap, HiGlobeAlt, HiLightningBolt, HiUser, HiChartBar } from 'react-icons/hi';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HiHome },
    { name: 'My Trips', href: '/trips', icon: HiMap },
    { name: 'Cities', href: '/cities', icon: HiGlobeAlt },
    { name: 'Activities', href: '/activities', icon: HiLightningBolt },
    { name: 'Profile', href: '/profile', icon: HiUser },
    { name: 'Admin', href: '/admin', icon: HiChartBar, adminOnly: true },
];

interface DashboardLayoutProps {
    children: React.ReactNode;
}

function DashboardContent({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = session?.user?.isAdmin || false;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-teal-500 rounded-lg flex items-center justify-center">
                                    <HiGlobeAlt className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-slate-900">GlobeTrotter</span>
                            </Link>

                            <div className="hidden md:flex gap-1">
                                {navigation
                                    .filter(item => !item.adminOnly || isAdmin)
                                    .map((item) => {
                                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors relative flex items-center gap-2',
                                                    isActive
                                                        ? 'text-primary-600 bg-primary-50'
                                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span>{item.name}</span>
                                            </Link>
                                        );
                                    })}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/trips/create"
                                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
                            >
                                + New Trip
                            </Link>

                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <SessionProvider>
            <DashboardContent>{children}</DashboardContent>
        </SessionProvider>
    );
}
