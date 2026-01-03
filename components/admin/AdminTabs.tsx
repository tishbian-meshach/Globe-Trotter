'use client';

import { cn } from '@/lib/utils';
import { HiChartBar, HiUsers, HiUserGroup, HiGlobeAlt, HiLocationMarker, HiMap, HiClipboardList } from 'react-icons/hi';

export type AdminTab = 'overview' | 'users' | 'roles' | 'cities' | 'activities' | 'trips' | 'audit';

interface AdminTabsProps {
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
}

const tabs = [
    { id: 'overview' as AdminTab, name: 'Overview', icon: HiChartBar },
    { id: 'users' as AdminTab, name: 'Users', icon: HiUsers },
    { id: 'roles' as AdminTab, name: 'Roles', icon: HiUserGroup },
    { id: 'cities' as AdminTab, name: 'Cities', icon: HiGlobeAlt },
    { id: 'activities' as AdminTab, name: 'Activities', icon: HiLocationMarker },
    { id: 'trips' as AdminTab, name: 'Trips', icon: HiMap },
    { id: 'audit' as AdminTab, name: 'Audit Log', icon: HiClipboardList },
];

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
    return (
        <div className="border-b border-slate-200 mb-6">
            <nav className="flex gap-1" aria-label="Admin tabs">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                                isActive
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.name}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
