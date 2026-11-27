import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Фирменный красный. Основной оттенок — 6 (#dc2626), hover — 7.
const brand: MantineColorsTuple = [
  "#fef2f2",
  "#fee2e2",
  "#fecaca",
  "#fca5a5",
  "#f87171",
  "#ef4444",
  "#dc2626",
  "#b91c1c",
  "#991b1b",
  "#7f1d1d",
];

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 5 },
  colors: { brand },
  fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
  fontFamilyMonospace: "var(--font-geist-mono), ui-monospace, monospace",
  headings: { fontFamily: "var(--font-geist-sans), sans-serif", fontWeight: "600" },
  defaultRadius: "md",
  cursorType: "pointer",
  autoContrast: true,
  components: {
    Button: { defaultProps: { radius: "md" } },
    TextInput: { defaultProps: { size: "md" } },
    PasswordInput: { defaultProps: { size: "md" } },
  },
});
