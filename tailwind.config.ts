import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#e6f2f8',
                    100: '#cce5f1',
                    200: '#99cbe3',
                    300: '#66b1d5',
                    400: '#3397c7',
                    500: '#0F4C81', // Deep Blue
                    600: '#0c3d67',
                    700: '#092e4d',
                    800: '#061f34',
                    900: '#030f1a',
                },
                teal: {
                    50: '#e6f7f6',
                    100: '#ccefed',
                    200: '#99dfdb',
                    300: '#66cfc9',
                    400: '#33bfb7',
                    500: '#0D9488', // Primary Teal
                    600: '#0a766d',
                    700: '#085952',
                    800: '#053b37',
                    900: '#031e1c',
                },
                coral: {
                    50: '#ffe9e9',
                    100: '#ffd3d3',
                    200: '#ffa7a7',
                    300: '#ff7b7b',
                    400: '#ff4f4f',
                    500: '#FF6B6B', // Secondary Coral
                    600: '#cc5656',
                    700: '#994040',
                    800: '#662b2b',
                    900: '#331515',
                },
                orange: {
                    50: '#fef5e7',
                    100: '#fdebcf',
                    200: '#fbd79f',
                    300: '#f9c36f',
                    400: '#f7af3f',
                    500: '#F59E0B', // Warm Orange
                    600: '#c47e09',
                    700: '#935f07',
                    800: '#623f04',
                    900: '#312002',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            fontSize: {
                '4xl': '2.25rem',
                '3xl': '1.875rem',
                '2xl': '1.5rem',
                'xl': '1.25rem',
                'lg': '1.125rem',
                'base': '1rem',
                'sm': '0.875rem',
                'xs': '0.75rem',
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            boxShadow: {
                'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
                'card': '0 4px 16px rgba(0, 0, 0, 0.06)',
                'elevated': '0 8px 24px rgba(0, 0, 0, 0.08)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
};

export default config;
