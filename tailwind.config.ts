import type { Config } from "tailwindcss";

/**
 * Design tokens transcribed from design.md (Uber-inspired black-and-white duet).
 * The brand has NO second accent colour — ink black is the only conversion colour.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    // Replace the default palette entirely — the system is grayscale + one link blue.
    colors: {
      transparent: "transparent",
      current: "currentColor",
      primary: "#000000",
      "on-primary": "#ffffff",
      ink: "#000000",
      body: "#5e5e5e",
      mute: "#afafaf",
      "hairline-mid": "#4b4b4b",
      canvas: "#ffffff",
      "canvas-soft": "#efefef",
      "canvas-softer": "#f3f3f3",
      "surface-pressed": "#e2e2e2",
      "black-elevated": "#282828",
      link: "#0000ee",
      "on-dark": "#ffffff",
    },
    borderRadius: {
      none: "0px",
      md: "8px",
      lg: "12px",
      xl: "16px",
      pill: "999px",
      "pill-tab": "36px",
      full: "9999px",
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "Helvetica Neue", "Arial", "sans-serif"],
        text: ["var(--font-text)", "system-ui", "Helvetica Neue", "Arial", "sans-serif"],
      },
      fontSize: {
        // [size, { lineHeight, fontWeight }]
        "display-xxl": ["52px", { lineHeight: "64px", fontWeight: "700" }],
        "display-xl": ["36px", { lineHeight: "44px", fontWeight: "700" }],
        "display-lg": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "display-md": ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "display-sm": ["20px", { lineHeight: "28px", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "24px", fontWeight: "500" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md-strong": ["16px", { lineHeight: "20px", fontWeight: "500" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm-strong": ["14px", { lineHeight: "16px", fontWeight: "500" }],
        caption: ["12px", { lineHeight: "20px", fontWeight: "400" }],
      },
      spacing: {
        xxs: "4px",
        xs: "6px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
      },
      maxWidth: {
        container: "1200px",
      },
      boxShadow: {
        // Elevation scale from design.md
        "level-1": "rgba(0, 0, 0, 0.12) 0px 4px 16px 0px",
        "level-2": "rgba(0, 0, 0, 0.16) 0px 4px 16px 0px",
        "level-3": "rgba(0, 0, 0, 0.16) 0px 2px 8px 0px",
      },
    },
  },
  plugins: [],
};

export default config;
