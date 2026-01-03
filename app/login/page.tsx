'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        // Basic validation
        const newErrors: { email?: string; password?: string } = {};
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                showToast({
                    title: 'Login failed',
                    description: 'Invalid email or password',
                    type: 'error',
                });
            } else {
                showToast({
                    title: 'Welcome back!',
                    description: 'Successfully logged in',
                    type: 'success',
                });
                router.push('/dashboard');
            }
        } catch (error) {
            showToast({
                title: 'Error',
                description: 'Something went wrong. Please try again.',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-teal-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary-500 mb-2">✈️ GlobeTrotter</h1>
                    <p className="text-slate-600">Plan your next adventure</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-card p-8">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-6">Welcome Back</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            type="email"
                            label="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            error={errors.email}
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            }
                        />

                        <Input
                            type="password"
                            label="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            error={errors.password}
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            }
                        />

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                                <span className="text-slate-600">Remember me</span>
                            </label>
                            <Link href="/forgot-password" className="text-primary-500 hover:text-primary-600">
                                Forgot password?
                            </Link>
                        </div>

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-primary-500 hover:text-primary-600 font-medium">
                            Sign up
                        </Link>
                    </div>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-600 font-medium mb-2">Demo Credentials:</p>
                        <p className="text-xs text-slate-500">Email: demo@globetrotter.com</p>
                        <p className="text-xs text-slate-500">Password: demo123</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
