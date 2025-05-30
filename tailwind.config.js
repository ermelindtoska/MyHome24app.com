module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fireworks: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0' },
          '50%': { transform: 'translateY(-200px)', opacity: '1' },
        },
      },
      animation: {
        fireworks: 'fireworks 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
