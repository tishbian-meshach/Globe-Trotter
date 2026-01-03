import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-slate-900">Profile</h1>
                <p className="text-slate-600 mt-2">
                    Manage your account settings
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-8">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-500">
                        {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">{session.user.name || 'User'}</h2>
                        <p className="text-slate-600">{session.user.email}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between py-3 border-b border-slate-100">
                                <span className="text-slate-600">Name</span>
                                <span className="font-medium text-slate-900">{session.user.name || 'Not set'}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-slate-100">
                                <span className="text-slate-600">Email</span>
                                <span className="font-medium text-slate-900">{session.user.email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <p className="text-sm text-slate-600">
                            More profile settings coming soon...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
