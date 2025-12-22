// tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                inter: ["var(--font-inter)", "sans-serif"],
                cairo: ["var(--font-cairo)", "sans-serif"],
            },
        },
    },
    plugins: [
        // RTL support plugin
        function ({ addUtilities }: { addUtilities: Function }) {
            addUtilities({
                ".start-0": {
                    "inset-inline-start": "0",
                },
                ".end-0": {
                    "inset-inline-end": "0",
                },
                ".ms-auto": {
                    "margin-inline-start": "auto",
                },
                ".me-auto": {
                    "margin-inline-end": "auto",
                },
                ".ps-4": {
                    "padding-inline-start": "1rem",
                },
                ".pe-4": {
                    "padding-inline-end": "1rem",
                },
                ".text-start": {
                    "text-align": "start",
                },
                ".text-end": {
                    "text-align": "end",
                },
            });
        },
    ],
};

export default config;