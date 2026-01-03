import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">
                    Globe Trotter
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Plan your perfect journey
                </p>
                <div className="flex gap-4 justify-center">
                    <Link
                        href="/login"
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Login
                    </Link>
                    <Link
                        href="/signup"
                        className="px-6 py-3 bg-white text-indigo-600 rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
}
