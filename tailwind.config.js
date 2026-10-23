/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#070c18",
        card: "rgba(18, 25, 43, 0.85)",
        "card-border": "rgba(34, 46, 74, 0.8)",
        "accent-green": "#10b981",
        "accent-blue": "#38bdf8",
        "accent-amber": "#f59e0b",
        "accent-red": "#ef4444",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
