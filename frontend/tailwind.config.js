/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: '#2563EB',     // Blue
                secondary: '#06B6D4',   // Cyan
                dark: '#0f172a',
                light: '#f8fafc',
            }
        },
    },
    plugins: [],
}
