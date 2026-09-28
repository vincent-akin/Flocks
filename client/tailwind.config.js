/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans: [
          'var(--font-sans)',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Inter',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        background: 'var(--background)',
        'background-secondary': 'var(--background-secondary)',
        foreground: 'var(--foreground)',
        'foreground-secondary': 'var(--foreground-secondary)',
        muted: 'var(--muted)',
        disabled: 'var(--disabled)',
        surface: 'var(--surface)',
        'surface-secondary': 'var(--surface-secondary)',
        'surface-elevated': 'var(--surface-elevated)',
        border: 'var(--border)',
        'border-subtle': 'var(--border-subtle)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: 'var(--secondary)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        accent: {
          blue: 'var(--accent-blue)',
          purple: 'var(--accent-purple)',
          green: 'var(--accent-green)',
          amber: 'var(--accent-amber)',
          red: 'var(--accent-red)',
        },
      },
      borderRadius: {
        card: '20px',
        control: '10px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        elevated: '0 4px 24px rgba(15, 23, 42, 0.08)',
        glow: '0 0 0 1px rgba(99, 102, 241, 0.15), 0 8px 40px rgba(99, 102, 241, 0.12)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'slide-up': { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'scale-in': { '0%': { opacity: 0, transform: 'scale(0.97)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
      },
      animation: {
        'fade-in': 'fade-in 400ms ease-out both',
        'slide-up': 'slide-up 500ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 200ms ease-out both',
      },
    },
  },
  plugins: [],
};
