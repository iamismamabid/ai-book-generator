export type BorderThemeId = "none" | "back-to-school" | "botanical" | "neon-retro" | "geometric";

export interface BorderThemeDef {
  id: BorderThemeId;
  name: string;
  colors: string[];
  /** CSS gradient for the UI swatch/preview chip */
  swatch: string;
  /** Band background color behind the pattern (most themes: white; neon: dark) */
  bandBg: string;
}

export const BORDER_THEMES: BorderThemeDef[] = [
  { id: "none", name: "None", colors: [], swatch: "transparent", bandBg: "#FFFFFF" },
  {
    id: "back-to-school",
    name: "Back to School",
    colors: ["#FBBF24", "#60A5FA", "#FB7185", "#34D399"],
    swatch: "linear-gradient(135deg,#FBBF24,#60A5FA,#FB7185,#34D399)",
    bandBg: "#FFFFFF",
  },
  {
    id: "botanical",
    name: "Pastel Botanical",
    colors: ["#8FB996", "#F4C2C2", "#C9B6E4", "#F5E6C8"],
    swatch: "linear-gradient(135deg,#8FB996,#F4C2C2,#C9B6E4,#F5E6C8)",
    bandBg: "#FFFFFF",
  },
  {
    id: "neon-retro",
    name: "Neon Retro Gamer",
    colors: ["#FF2E9A", "#00E5FF", "#7B2FF7", "#CCFF00"],
    swatch: "linear-gradient(135deg,#0F0F1A,#FF2E9A,#00E5FF,#7B2FF7)",
    bandBg: "#12071F",
  },
  {
    id: "geometric",
    name: "Modern Geometric",
    colors: ["#1E293B", "#FB923C", "#2DD4BF", "#FBBF24"],
    swatch: "linear-gradient(135deg,#1E293B,#FB923C,#2DD4BF,#FBBF24)",
    bandBg: "#FFFFFF",
  },
];

export const getBorderTheme = (id?: string | null): BorderThemeDef =>
  BORDER_THEMES.find((t) => t.id === id) || BORDER_THEMES[0];
