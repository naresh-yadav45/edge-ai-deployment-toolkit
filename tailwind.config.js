/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {
    fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
    colors: { ink: "#0F172A", body: "#475569", muted: "#64748B", surface: "#F8FAFC", line: "#E2E8F0",
              primary: "#2563EB", success: "#10B981", warn: "#F59E0B", danger: "#EF4444" },
    boxShadow: { card: "0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.10)" },
  } },
  plugins: [],
};
