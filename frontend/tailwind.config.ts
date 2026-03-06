import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        brand: {
          DEFAULT: "#4DFFCE",
          dark: "#2DD4A0",
          light: "rgba(77, 255, 206, 0.2)",
        },
        surface: "hsl(var(--card))",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
        "text-primary": "hsl(var(--foreground))",
        "text-secondary": "rgba(255,255,255,0.6)",
        "text-muted": "rgba(255,255,255,0.5)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "page-title": ["24px", { lineHeight: "1.25", fontWeight: "600" }],
        "section-title": ["16px", { lineHeight: "1.5", fontWeight: "600" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        label: ["12px", { lineHeight: "1.4", fontWeight: "500" }],
        "stat-number": ["28px", { lineHeight: "1.2", fontWeight: "700" }],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
        card: "12px",
        button: "9999px",
        input: "12px",
        badge: "6px",
      },
      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,0.35)",
        dropdown: "0 8px 24px rgba(0,0,0,0.12)",
        modal: "0 24px 64px rgba(0,0,0,0.18)",
      },
      maxWidth: {
        content: "1280px",
        "7xl": "80rem",
      },
      width: {
        sidebar: "260px",
        "sidebar-collapsed": "72px",
      },
      spacing: {
        "page-padding": "32px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
