import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id;
                // Fetch user data to get isAdmin and role only on sign in
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: user.id },
                        include: { role: true }
                    });
                    token.isAdmin = dbUser?.isAdmin || false;
                    token.role = dbUser?.role?.name || null;
                } catch (error) {
                    console.error('Failed to fetch user role:', error);
                    token.isAdmin = false;
                    token.role = null;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.isAdmin = token.isAdmin as boolean || false;
                session.user.role = token.role as string | null;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});
