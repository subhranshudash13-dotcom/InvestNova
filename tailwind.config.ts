import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        DEFAULT: "#3B82F6", // Blue
        50: "#EFF6FF",
        100: "#DBEAFE",
        200: "#BFDBFE",
        300: "#93C5FD",
        400: "#60A5FA",
        500: "#3B82F6",
        600: "#2563EB",
        700: "#1D4ED8",
        800: "#1E40AF",
        900: "#1E3A8A",
      },
      secondary: {
        DEFAULT: "#8B5CF6", // Purple
        50: "#FAF5FF",
        100: "#F3E8FF",
        200: "#E9D5FF",
        300: "#D8B4FE",
        400: "#C084FC",
        500: "#A855F7",
        600: "#9333EA",
        700: "#7E22CE",
        800: "#6B21A8",
        900: "#581C87",
      },
      // Risk Level Colors
      risk: {
        low: "#10B981", // Green
        medium: "#F59E0B", // Yellow/Orange
        high: "#EF4444", // Red
      },
      // Chart Colors
      chart: {
        profit: "#10B981",
        loss: "#EF4444",
        neutral: "#6B7280",
      },
    },
    backgroundImage: {
      "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      "gradient-primary": "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
      "gradient-dark": "linear-gradient(135deg, #1E3A8A 0%, #581C87 100%)",
    },
    animation: {
      "fade-in": "fadeIn 0.5s ease-in-out",
      "fade-in-up": "fadeInUp 0.6s ease-out",
      "slide-in-right": "slideInRight 0.5s ease-out",
      "slide-in-left": "slideInLeft 0.5s ease-out",
      "bounce-slow": "bounce 3s infinite",
      "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      "spin-slow": "spin 8s linear infinite",
      "float": "float 6s ease-in-out infinite",
      "glow": "glow 2s ease-in-out infinite",
    },
    keyframes: {
      fadeIn: {
        "0%": { opacity: "0" },
        "100%": { opacity: "1" },
      },
      fadeInUp: {
        "0%": {
          opacity: "0",
          transform: "translateY(20px)",
        },
        "100%": {
          opacity: "1",
          transform: "translateY(0)",
        },
      },
      slideInRight: {
        "0%": {
          opacity: "0",
          transform: "translateX(50px)",
        },
        "100%": {
          opacity: "1",
          transform: "translateX(0)",
        },
      },
      slideInLeft: {
        "0%": {
          opacity: "0",
          transform: "translateX(-50px)",
        },
        "100%": {
          opacity: "1",
          transform: "translateX(0)",
        },
      },
      float: {
        "0%, 100%": {
          transform: "translateY(0)",
        },
        "50%": {
          transform: "translateY(-20px)",
        },
      },
      glow: {
        "0%, 100%": {
          boxShadow: "0 0 5px rgba(59, 130, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)",
        },
        "50%": {
          boxShadow: "0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(139, 92, 246, 0.6)",
        },
      },
    },
    backdropBlur: {
      xs: "2px",
    },
  },
},
  plugins: [],
  };

export default config;
