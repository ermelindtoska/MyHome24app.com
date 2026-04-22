// tailwind.config.js
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        fireworks: {
          "0%, 100%": { transform: "translateY(0)", opacity: "0" },
          "50%": { transform: "translateY(-200px)", opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        fireworks: "fireworks 3s ease-in-out infinite",
      },

      // ✅ Tokens (CSS variables) — Zillow-ish neutral surfaces
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        cardFg: "rgb(var(--card-fg) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        primaryFg: "rgb(var(--primary-fg) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 1px 10px rgba(0,0,0,.08)",
        softDark: "0 1px 12px rgba(0,0,0,.35)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};