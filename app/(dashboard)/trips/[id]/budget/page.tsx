import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PieChart } from '@/components/charts/PieChart';
import { BarChart } from '@/components/charts/BarChart';
import { formatCurrency } from '@/lib/utils';

interface PageProps {
    params: {
        id: string;
    };
}

export default async function TripBudgetPage({ params }: PageProps) {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const trip = await prisma.trip.findUnique({
        where: { id: params.id },
        include: {
            expenses: {
                orderBy: {
                    date: 'desc',
                },
            },
            stops: {
                include: {
                    activities: true,
                },
            },
        },
    });

    if (!trip || trip.userId !== session.user.id) {
        notFound();
    }

    // Calculate totals by category
    const expensesByCategory = trip.expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
    const tripDurationDays = Math.ceil(
        (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const avgPerDay = totalExpenses / tripDurationDays || 0;

    // Prepare chart data
    const categoryColors: Record<string, string> = {
        transport: '#0F4C81',
        accommodation: '#0D9488',
        activities: '#FF6B6B',
        meals: '#F59E0B',
        other: '#64748b',
    };

    const pieData = Object.entries(expensesByCategory).map(([category, value]) => ({
        label: category.charAt(0).toUpperCase() + category.slice(1),
        value,
        color: categoryColors[category] || '#64748b',
    }));

    const barData = Object.entries(expensesByCategory).map(([category, value]) => ({
        label: category.charAt(0).toUpperCase() + category.slice(1),
        value,
    }));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <Link
                    href={`/trips/${trip.id}`}
                    className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to trip
                </Link>

                <h1 className="text-4xl font-bold text-slate-900">Budget & Expenses</h1>
                <p className="text-slate-600 mt-2">{trip.name}</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-600 mb-1">Total Budget</div>
                        <div className="text-3xl font-bold text-primary-500">
                            {formatCurrency(totalExpenses)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-600 mb-1">Avg Per Day</div>
                        <div className="text-3xl font-bold text-teal-500">
                            {formatCurrency(avgPerDay)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-600 mb-1">Expenses</div>
                        <div className="text-3xl font-bold text-slate-900">
                            {trip.expenses.length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-600 mb-1">Trip Duration</div>
                        <div className="text-3xl font-bold text-slate-900">
                            {tripDurationDays} days
                        </div>
                    </CardContent>
                </Card>
            </div>

            {trip.expenses.length === 0 ? (
                <Card className="text-center py-16">
                    <div className="text-6xl mb-4">💰</div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                        No expenses yet
                    </h3>
                    <p className="text-slate-600 mb-8">
                        Start tracking your trip budget by adding expenses
                    </p>
                </Card>
            ) : (
                <>
                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Expense Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PieChart data={pieData} size={200} />
                            </CardContent>
                        </Card>

                        {/* Bar Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Category Comparison</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <BarChart data={barData} height={200} color="#0F4C81" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Expense List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {trip.expenses.map((expense) => (
                                    <div
                                        key={expense.id}
                                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-900">
                                                {expense.description || 'Expense'}
                                            </div>
                                            <div className="text-sm text-slate-600 mt-1">
                                                {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)} •{' '}
                                                {new Date(expense.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="text-lg font-semibold text-slate-900">
                                            {formatCurrency(expense.amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
