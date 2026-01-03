'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';

interface StatsData {
    totalUsers: number;
    totalTrips: number;
    activeCities: number;
    avgTripsPerUser: number;
    avgBudget: number;
    completionRate: number;
    tripsByStatus: Record<string, number>;
    cityChartData: { label: string; value: number }[];
    tripsChartData: { label: string; value: number }[];
    statusChartData: { label: string; value: number }[];
    topCities: {
        id: string;
        name: string;
        country: string;
        stopCount: number;
        popularity: number;
    }[];
}

export function OverviewTab() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30'); // 7, 30, 90 days

    useEffect(() => {
        fetchStats();
    }, [dateRange]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/stats?days=${dateRange}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12 text-slate-500">
                Failed to load statistics
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Date Range Filter */}
            <div className="flex justify-end">
                <div className="flex gap-2">
                    <button
                        onClick={() => setDateRange('7')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            dateRange === '7'
                                ? 'bg-primary-500 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        7 Days
                    </button>
                    <button
                        onClick={() => setDateRange('30')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            dateRange === '30'
                                ? 'bg-primary-500 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        30 Days
                    </button>
                    <button
                        onClick={() => setDateRange('90')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            dateRange === '90'
                                ? 'bg-primary-500 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        90 Days
                    </button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-600 mb-1">Total Users</div>
                        <div className="text-4xl font-bold text-primary-500">{stats.totalUsers}</div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-600 mb-1">Total Trips</div>
                        <div className="text-4xl font-bold text-teal-500">{stats.totalTrips}</div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-600 mb-1">Active Cities</div>
                        <div className="text-4xl font-bold text-coral-500">{stats.activeCities}</div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-600 mb-1">Avg Trips/User</div>
                        <div className="text-4xl font-bold text-orange-500">
                            {stats.avgTripsPerUser.toFixed(1)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-600 mb-1">Avg Budget</div>
                        <div className="text-3xl font-bold text-blue-500">
                            ${stats.avgBudget.toFixed(0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-600 mb-1">Completion Rate</div>
                        <div className="text-3xl font-bold text-purple-500">
                            {stats.completionRate.toFixed(1)}%
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-600 mb-1">Total Expenses</div>
                        <div className="text-3xl font-bold text-green-500">
                            ${(stats.avgBudget * stats.totalTrips).toFixed(0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popular Cities */}
                <Card>
                    <CardHeader>
                        <CardTitle>Popular Destinations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.cityChartData.length > 0 ? (
                            <BarChart data={stats.cityChartData} height={300} color="#0D9488" />
                        ) : (
                            <div className="text-center text-slate-500 py-12">
                                No data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Trip Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Trips by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.statusChartData.length > 0 ? (
                            <PieChart data={stats.statusChartData} height={300} />
                        ) : (
                            <div className="text-center text-slate-500 py-12">
                                No data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Trip Growth Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Trips Created (Last {dateRange} Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.tripsChartData.length > 0 ? (
                        <BarChart data={stats.tripsChartData} height={300} color="#0F4C81" />
                    ) : (
                        <div className="text-center text-slate-500 py-12">
                            No data available
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Top Cities Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Top 10 Destinations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Rank</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">City</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Country</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Visits</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Popularity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.topCities.map((city, index) => (
                                    <tr key={city.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4 text-sm font-medium text-slate-900">#{index + 1}</td>
                                        <td className="py-3 px-4 text-sm font-medium text-slate-900">{city.name}</td>
                                        <td className="py-3 px-4 text-sm text-slate-600">{city.country}</td>
                                        <td className="py-3 px-4 text-sm text-slate-900">{city.stopCount}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <svg
                                                        key={i}
                                                        className={`w-4 h-4 ${i < Math.floor(city.popularity / 20)
                                                                ? 'fill-amber-400'
                                                                : 'fill-slate-200'
                                                            }`}
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {stats.topCities.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                No destinations data available
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
