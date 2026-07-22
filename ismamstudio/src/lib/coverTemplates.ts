import type { KdpLayoutResult } from "@/app/utils/kdpLayout";

// A template element's position/size is defined as a FRACTION (0-1) of the
// front-cover live area, not an absolute pixel — the canvas's actual pixel
// size varies by trim size and page count (see calculateKdpLayout), so a
// fixed-pixel template would look correct on one trim size and misaligned
// on another. fontSizeFrac is relative to the front-cover live width, which
// stays roughly proportional across trim sizes and gives consistent-looking
// type scale.
export interface TemplateElement {
  type: "textbox" | "rect" | "circle" | "triangle" | "heart";
  xFrac: number;
  yFrac: number;
  widthFrac: number;
  heightFrac?: number;
  fontSizeFrac?: number;
  fontFamily?: string;
  fontStyle?: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  align?: "left" | "center" | "right";
  text?: string;
  opacity?: number;
}

export interface CoverBackgroundConfig {
  frontCoverColor: string;
  frontCoverType: "solid" | "gradient";
  frontCoverGradientStart: string;
  frontCoverGradientEnd: string;
  backCoverColor: string;
  backCoverType: "solid" | "gradient";
  backCoverGradientStart: string;
  backCoverGradientEnd: string;
}

export interface CoverTemplate {
  id: string;
  name: string;
  category: string;
  swatch: string; // fallback color for the picker card if the photo fails to load
  photoQuery: string; // Unsplash search term used to fetch this template's real photo
  background: CoverBackgroundConfig;
  elements: TemplateElement[];
}

export const COVER_TEMPLATES: CoverTemplate[] = [
  {
    id: "puzzle-activity",
    name: "Puzzle & Activity Book",
    category: "Puzzle Books",
    swatch: "#F59E0B",
    photoQuery: "sudoku puzzle brain teaser",
    background: {
      frontCoverColor: "#F59E0B", frontCoverType: "solid", frontCoverGradientStart: "#F59E0B", frontCoverGradientEnd: "#D97706",
      backCoverColor: "#1E293B", backCoverType: "solid", backCoverGradientStart: "#1E293B", backCoverGradientEnd: "#0F172A",
    },
    elements: [
      { type: "textbox", xFrac: 0.08, yFrac: 0.20, widthFrac: 0.84, fontSizeFrac: 0.145, fontFamily: "Montserrat", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "YOUR TITLE HERE" },
      { type: "textbox", xFrac: 0.1, yFrac: 0.40, widthFrac: 0.8, fontSizeFrac: 0.048, fontFamily: "Oswald", fill: "#FFFFFF", align: "center", text: "Subtitle Goes Here" },
      { type: "rect", xFrac: 0.2, yFrac: 0.85, widthFrac: 0.6, heightFrac: 0.09, fill: "#FFFFFF", cornerRadius: 30 },
      { type: "textbox", xFrac: 0.2, yFrac: 0.873, widthFrac: 0.6, fontSizeFrac: 0.033, fontFamily: "Montserrat", fontStyle: "bold", fill: "#1E293B", align: "center", text: "100 PUZZLES INSIDE" },
    ],
  },
  {
    id: "journal-lowcontent",
    name: "Journal & Planner",
    category: "Low-Content",
    swatch: "#D9C9B5",
    photoQuery: "cozy journal writing desk",
    background: {
      frontCoverColor: "#FAF3E8", frontCoverType: "solid", frontCoverGradientStart: "#FAF3E8", frontCoverGradientEnd: "#F0E4D3",
      backCoverColor: "#D9C9B5", backCoverType: "solid", backCoverGradientStart: "#D9C9B5", backCoverGradientEnd: "#C4B199",
    },
    elements: [
      { type: "rect", xFrac: 0.35, yFrac: 0.30, widthFrac: 0.3, heightFrac: 0.004, fill: "#FFFFFF" },
      { type: "textbox", xFrac: 0.08, yFrac: 0.34, widthFrac: 0.84, fontSizeFrac: 0.105, fontFamily: "Playfair Display", fill: "#FFFFFF", align: "center", text: "Your Journal Title" },
      { type: "textbox", xFrac: 0.12, yFrac: 0.50, widthFrac: 0.76, fontSizeFrac: 0.04, fontFamily: "Lora", fontStyle: "italic", fill: "#F0E4D3", align: "center", text: "A Guided Journal for Daily Reflection" },
      { type: "rect", xFrac: 0.35, yFrac: 0.58, widthFrac: 0.3, heightFrac: 0.004, fill: "#FFFFFF" },
    ],
  },
  {
    id: "childrens-book",
    name: "Children's Book",
    category: "Children's",
    swatch: "#60C6F0",
    photoQuery: "children playing colorful outdoor",
    background: {
      frontCoverColor: "#60C6F0", frontCoverType: "gradient", frontCoverGradientStart: "#60C6F0", frontCoverGradientEnd: "#FFD866",
      backCoverColor: "#60C6F0", backCoverType: "gradient", backCoverGradientStart: "#4FB8E8", backCoverGradientEnd: "#F5CB5C",
    },
    elements: [
      { type: "textbox", xFrac: 0.08, yFrac: 0.14, widthFrac: 0.84, fontSizeFrac: 0.15, fontFamily: "Bebas Neue", fill: "#FFFFFF", align: "center", text: "A Fun Adventure" },
      { type: "textbox", xFrac: 0.1, yFrac: 0.80, widthFrac: 0.8, fontSizeFrac: 0.05, fontFamily: "Montserrat", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "Ages 4-8" },
    ],
  },
  {
    id: "selfhelp-nonfiction",
    name: "Self-Help & Non-Fiction",
    category: "Non-Fiction",
    swatch: "#0F172A",
    photoQuery: "mountain sunrise motivation",
    background: {
      frontCoverColor: "#0F172A", frontCoverType: "gradient", frontCoverGradientStart: "#1E293B", frontCoverGradientEnd: "#0F172A",
      backCoverColor: "#0F172A", backCoverType: "solid", backCoverGradientStart: "#0F172A", backCoverGradientEnd: "#020617",
    },
    elements: [
      { type: "textbox", xFrac: 0.08, yFrac: 0.26, widthFrac: 0.84, fontSizeFrac: 0.125, fontFamily: "Montserrat", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "The Path to Change" },
      { type: "rect", xFrac: 0.375, yFrac: 0.42, widthFrac: 0.25, heightFrac: 0.006, fill: "#F59E0B" },
      { type: "textbox", xFrac: 0.12, yFrac: 0.46, widthFrac: 0.76, fontSizeFrac: 0.04, fontFamily: "Outfit", fill: "#FFFFFF", align: "center", text: "Practical Steps to a Better Life" },
      { type: "textbox", xFrac: 0.2, yFrac: 0.88, widthFrac: 0.6, fontSizeFrac: 0.035, fontFamily: "Lora", fontStyle: "italic", fill: "#FFFFFF", align: "center", text: "Author Name" },
    ],
  },
  {
    id: "thriller-mystery",
    name: "Thriller & Mystery",
    category: "Fiction",
    swatch: "#0A0A0A",
    photoQuery: "dark foggy forest night",
    background: {
      frontCoverColor: "#0A0A0A", frontCoverType: "gradient", frontCoverGradientStart: "#1A1A1A", frontCoverGradientEnd: "#000000",
      backCoverColor: "#0A0A0A", backCoverType: "solid", backCoverGradientStart: "#0A0A0A", backCoverGradientEnd: "#000000",
    },
    elements: [
      { type: "rect", xFrac: 0.25, yFrac: 0.20, widthFrac: 0.5, heightFrac: 0.005, fill: "#B91C1C" },
      { type: "textbox", xFrac: 0.06, yFrac: 0.24, widthFrac: 0.88, fontSizeFrac: 0.15, fontFamily: "Oswald", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "THE LAST SECRET" },
      { type: "textbox", xFrac: 0.12, yFrac: 0.43, widthFrac: 0.76, fontSizeFrac: 0.04, fontFamily: "Georgia", fontStyle: "italic", fill: "#B91C1C", align: "center", text: "A Novel" },
      { type: "rect", xFrac: 0.25, yFrac: 0.49, widthFrac: 0.5, heightFrac: 0.005, fill: "#B91C1C" },
    ],
  },
  {
    id: "romance",
    name: "Romance",
    category: "Fiction",
    swatch: "#C2185B",
    photoQuery: "romantic sunset silhouette",
    background: {
      frontCoverColor: "#F7C6D9", frontCoverType: "gradient", frontCoverGradientStart: "#F7C6D9", frontCoverGradientEnd: "#C2185B",
      backCoverColor: "#C2185B", backCoverType: "gradient", backCoverGradientStart: "#C2185B", backCoverGradientEnd: "#8E1450",
    },
    elements: [
      { type: "textbox", xFrac: 0.06, yFrac: 0.28, widthFrac: 0.88, fontSizeFrac: 0.16, fontFamily: "Sacramento", fill: "#FFFFFF", align: "center", text: "Forever Yours" },
      { type: "textbox", xFrac: 0.15, yFrac: 0.50, widthFrac: 0.7, fontSizeFrac: 0.04, fontFamily: "Lora", fontStyle: "italic", fill: "#FFFFFF", align: "center", text: "A Love Story" },
      { type: "heart", xFrac: 0.42, yFrac: 0.72, widthFrac: 0.16, heightFrac: 0.16, fill: "#FFFFFF", opacity: 0.9 },
    ],
  },

  // ── More Puzzle Books ──────────────────────────────────────────
  {
    id: "crossword-classic",
    name: "Crossword Book",
    category: "Puzzle Books",
    swatch: "#1E293B",
    photoQuery: "newspaper crossword puzzle",
    background: {
      frontCoverColor: "#F5F0E6", frontCoverType: "solid", frontCoverGradientStart: "#F5F0E6", frontCoverGradientEnd: "#EAE1CC",
      backCoverColor: "#1E293B", backCoverType: "solid", backCoverGradientStart: "#1E293B", backCoverGradientEnd: "#0F172A",
    },
    elements: [
      { type: "rect", xFrac: 0.30, yFrac: 0.08, widthFrac: 0.4, heightFrac: 0.006, fill: "#FFFFFF" },
      { type: "textbox", xFrac: 0.06, yFrac: 0.20, widthFrac: 0.88, fontSizeFrac: 0.13, fontFamily: "Merriweather", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "Crossword Puzzles" },
      { type: "textbox", xFrac: 0.1, yFrac: 0.40, widthFrac: 0.8, fontSizeFrac: 0.042, fontFamily: "Lora", fill: "#FFFFFF", align: "center", text: "100 Challenging Grids" },
      { type: "rect", xFrac: 0.30, yFrac: 0.48, widthFrac: 0.4, heightFrac: 0.006, fill: "#FFFFFF" },
    ],
  },
  {
    id: "word-search",
    name: "Word Search Book",
    category: "Puzzle Books",
    swatch: "#0EA5B7",
    photoQuery: "letters alphabet blocks",
    background: {
      frontCoverColor: "#0EA5B7", frontCoverType: "gradient", frontCoverGradientStart: "#0EA5B7", frontCoverGradientEnd: "#0C7C8C",
      backCoverColor: "#0C7C8C", backCoverType: "solid", backCoverGradientStart: "#0C7C8C", backCoverGradientEnd: "#075E6A",
    },
    elements: [
      { type: "textbox", xFrac: 0.06, yFrac: 0.18, widthFrac: 0.88, fontSizeFrac: 0.135, fontFamily: "Montserrat", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "Word Search" },
      { type: "textbox", xFrac: 0.1, yFrac: 0.37, widthFrac: 0.8, fontSizeFrac: 0.045, fontFamily: "Outfit", fill: "#FFFFFF", align: "center", text: "Find the Hidden Words" },
      { type: "rect", xFrac: 0.22, yFrac: 0.84, widthFrac: 0.56, heightFrac: 0.09, fill: "#FFFFFF", cornerRadius: 30 },
      { type: "textbox", xFrac: 0.22, yFrac: 0.863, widthFrac: 0.56, fontSizeFrac: 0.03, fontFamily: "Montserrat", fontStyle: "bold", fill: "#0C7C8C", align: "center", text: "300 WORDS TO FIND" },
    ],
  },
  {
    id: "maze-kids",
    name: "Maze Book (Kids)",
    category: "Puzzle Books",
    swatch: "#7BC96F",
    photoQuery: "hedge maze aerial",
    background: {
      frontCoverColor: "#7BC96F", frontCoverType: "gradient", frontCoverGradientStart: "#8FDD82", frontCoverGradientEnd: "#5CAE4F",
      backCoverColor: "#5CAE4F", backCoverType: "solid", backCoverGradientStart: "#5CAE4F", backCoverGradientEnd: "#457A3E",
    },
    elements: [
      { type: "textbox", xFrac: 0.06, yFrac: 0.20, widthFrac: 0.88, fontSizeFrac: 0.14, fontFamily: "Bebas Neue", fill: "#FFFFFF", align: "center", text: "Maze Adventures" },
      { type: "textbox", xFrac: 0.1, yFrac: 0.42, widthFrac: 0.8, fontSizeFrac: 0.045, fontFamily: "Montserrat", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "Find Your Way Through!" },
    ],
  },
  {
    id: "large-print-seniors",
    name: "Large Print for Seniors",
    category: "Puzzle Books",
    swatch: "#4F46E5",
    photoQuery: "senior reading glasses book",
    background: {
      frontCoverColor: "#FFFFFF", frontCoverType: "solid", frontCoverGradientStart: "#FFFFFF", frontCoverGradientEnd: "#F1F5F9",
      backCoverColor: "#4F46E5", backCoverType: "solid", backCoverGradientStart: "#4F46E5", backCoverGradientEnd: "#3730A3",
    },
    elements: [
      { type: "rect", xFrac: 0, yFrac: 0.06, widthFrac: 1, heightFrac: 0.1, fill: "#4F46E5" },
      { type: "textbox", xFrac: 0.06, yFrac: 0.075, widthFrac: 0.88, fontSizeFrac: 0.038, fontFamily: "Montserrat", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "LARGE PRINT EDITION" },
      { type: "textbox", xFrac: 0.06, yFrac: 0.30, widthFrac: 0.88, fontSizeFrac: 0.115, fontFamily: "Montserrat", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "Easy-Read Puzzles" },
      { type: "textbox", xFrac: 0.1, yFrac: 0.50, widthFrac: 0.8, fontSizeFrac: 0.04, fontFamily: "Outfit", fill: "#FFFFFF", align: "center", text: "Gentle on the Eyes" },
    ],
  },

  // ── More Low-Content / Journals ─────────────────────────────────
  {
    id: "gratitude-journal",
    name: "Gratitude Journal",
    category: "Low-Content",
    swatch: "#87A96B",
    photoQuery: "autumn leaves peaceful",
    background: {
      frontCoverColor: "#EEF3E7", frontCoverType: "solid", frontCoverGradientStart: "#EEF3E7", frontCoverGradientEnd: "#E1EAD3",
      backCoverColor: "#87A96B", backCoverType: "solid", backCoverGradientStart: "#87A96B", backCoverGradientEnd: "#6B8A53",
    },
    elements: [
      { type: "textbox", xFrac: 0.08, yFrac: 0.32, widthFrac: 0.84, fontSizeFrac: 0.1, fontFamily: "Playfair Display", fill: "#FFFFFF", align: "center", text: "Gratitude Journal" },
      { type: "textbox", xFrac: 0.14, yFrac: 0.48, widthFrac: 0.72, fontSizeFrac: 0.038, fontFamily: "Lora", fontStyle: "italic", fill: "#FFFFFF", align: "center", text: "365 Days of Thankfulness" },
    ],
  },
  {
    id: "recipe-cookbook",
    name: "Recipe & Cookbook",
    category: "Low-Content",
    swatch: "#C1440E",
    photoQuery: "rustic kitchen ingredients",
    background: {
      frontCoverColor: "#FDF3E7", frontCoverType: "solid", frontCoverGradientStart: "#FDF3E7", frontCoverGradientEnd: "#F5E3CC",
      backCoverColor: "#C1440E", backCoverType: "solid", backCoverGradientStart: "#C1440E", backCoverGradientEnd: "#9A360B",
    },
    elements: [
      { type: "rect", xFrac: 0.1, yFrac: 0.14, widthFrac: 0.8, heightFrac: 0.008, fill: "#FFFFFF" },
      { type: "textbox", xFrac: 0.06, yFrac: 0.24, widthFrac: 0.88, fontSizeFrac: 0.115, fontFamily: "Playfair Display", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "Family Recipes" },
      { type: "textbox", xFrac: 0.12, yFrac: 0.42, widthFrac: 0.76, fontSizeFrac: 0.04, fontFamily: "Lora", fontStyle: "italic", fill: "#FFFFFF", align: "center", text: "A Collection of Favorite Dishes" },
      { type: "rect", xFrac: 0.1, yFrac: 0.50, widthFrac: 0.8, heightFrac: 0.008, fill: "#FFFFFF" },
    ],
  },
  {
    id: "budget-planner",
    name: "Budget Planner",
    category: "Low-Content",
    swatch: "#0D9488",
    photoQuery: "coins savings finance",
    background: {
      frontCoverColor: "#F0FDFA", frontCoverType: "solid", frontCoverGradientStart: "#F0FDFA", frontCoverGradientEnd: "#CCFBF1",
      backCoverColor: "#0D9488", backCoverType: "solid", backCoverGradientStart: "#0D9488", backCoverGradientEnd: "#0F766E",
    },
    elements: [
      { type: "rect", xFrac: 0.08, yFrac: 0.10, widthFrac: 0.5, heightFrac: 0.06, fill: "#0D9488", cornerRadius: 10 },
      { type: "textbox", xFrac: 0.08, yFrac: 0.117, widthFrac: 0.5, fontSizeFrac: 0.03, fontFamily: "Montserrat", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "2026 EDITION" },
      { type: "textbox", xFrac: 0.06, yFrac: 0.32, widthFrac: 0.88, fontSizeFrac: 0.105, fontFamily: "Montserrat", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "Budget Planner" },
      { type: "textbox", xFrac: 0.12, yFrac: 0.48, widthFrac: 0.76, fontSizeFrac: 0.04, fontFamily: "Outfit", fill: "#FFFFFF", align: "center", text: "Track Every Dollar" },
    ],
  },
  {
    id: "fitness-log",
    name: "Fitness & Workout Log",
    category: "Low-Content",
    swatch: "#DC2626",
    photoQuery: "gym weights workout",
    background: {
      frontCoverColor: "#171717", frontCoverType: "gradient", frontCoverGradientStart: "#262626", frontCoverGradientEnd: "#000000",
      backCoverColor: "#171717", backCoverType: "solid", backCoverGradientStart: "#171717", backCoverGradientEnd: "#000000",
    },
    elements: [
      { type: "rect", xFrac: 0.25, yFrac: 0.18, widthFrac: 0.5, heightFrac: 0.008, fill: "#DC2626" },
      { type: "textbox", xFrac: 0.06, yFrac: 0.24, widthFrac: 0.88, fontSizeFrac: 0.14, fontFamily: "Bebas Neue", fill: "#FFFFFF", align: "center", text: "Workout Log" },
      { type: "textbox", xFrac: 0.1, yFrac: 0.44, widthFrac: 0.8, fontSizeFrac: 0.042, fontFamily: "Montserrat", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "TRACK YOUR PROGRESS" },
    ],
  },
  {
    id: "coloring-book-adult",
    name: "Adult Coloring Book",
    category: "Low-Content",
    swatch: "#A78BFA",
    photoQuery: "colorful watercolor paint",
    background: {
      frontCoverColor: "#F5F3FF", frontCoverType: "gradient", frontCoverGradientStart: "#FCE7F3", frontCoverGradientEnd: "#DBEAFE",
      backCoverColor: "#A78BFA", backCoverType: "solid", backCoverGradientStart: "#A78BFA", backCoverGradientEnd: "#8B5CF6",
    },
    elements: [
      { type: "textbox", xFrac: 0.06, yFrac: 0.30, widthFrac: 0.88, fontSizeFrac: 0.115, fontFamily: "Sacramento", fill: "#FFFFFF", align: "center", text: "Coloring Book" },
      { type: "textbox", xFrac: 0.1, yFrac: 0.50, widthFrac: 0.8, fontSizeFrac: 0.04, fontFamily: "Montserrat", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "50 Relaxing Designs" },
    ],
  },

  // ── More Children's ──────────────────────────────────────────
  {
    id: "bedtime-story",
    name: "Bedtime Story",
    category: "Children's",
    swatch: "#4C1D95",
    photoQuery: "night sky stars moon",
    background: {
      frontCoverColor: "#4C1D95", frontCoverType: "gradient", frontCoverGradientStart: "#312E81", frontCoverGradientEnd: "#1E1B4B",
      backCoverColor: "#1E1B4B", backCoverType: "solid", backCoverGradientStart: "#1E1B4B", backCoverGradientEnd: "#0F0E2E",
    },
    elements: [
      { type: "textbox", xFrac: 0.06, yFrac: 0.30, widthFrac: 0.88, fontSizeFrac: 0.13, fontFamily: "Pacifico", fill: "#FFFFFF", align: "center", text: "Goodnight Moon" },
      { type: "textbox", xFrac: 0.1, yFrac: 0.50, widthFrac: 0.8, fontSizeFrac: 0.042, fontFamily: "Lora", fontStyle: "italic", fill: "#FFFFFF", align: "center", text: "A Bedtime Story" },
    ],
  },
  {
    id: "kids-activity",
    name: "Kids Activity Book",
    category: "Children's",
    swatch: "#F97316",
    photoQuery: "kids crafts colorful",
    background: {
      frontCoverColor: "#F97316", frontCoverType: "gradient", frontCoverGradientStart: "#FB923C", frontCoverGradientEnd: "#EA580C",
      backCoverColor: "#EA580C", backCoverType: "solid", backCoverGradientStart: "#EA580C", backCoverGradientEnd: "#C2410C",
    },
    elements: [
      { type: "textbox", xFrac: 0.06, yFrac: 0.22, widthFrac: 0.88, fontSizeFrac: 0.135, fontFamily: "Bebas Neue", fill: "#FFFFFF", align: "center", text: "Fun Activities" },
      { type: "textbox", xFrac: 0.1, yFrac: 0.44, widthFrac: 0.8, fontSizeFrac: 0.045, fontFamily: "Montserrat", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "Color, Draw & Play" },
    ],
  },

  // ── More Fiction ──────────────────────────────────────────────
  {
    id: "fantasy-epic",
    name: "Fantasy",
    category: "Fiction",
    swatch: "#5B21B6",
    photoQuery: "mystical castle fog",
    background: {
      frontCoverColor: "#2E1065", frontCoverType: "gradient", frontCoverGradientStart: "#4C1D95", frontCoverGradientEnd: "#1E1B4B",
      backCoverColor: "#2E1065", backCoverType: "solid", backCoverGradientStart: "#2E1065", backCoverGradientEnd: "#1E1B4B",
    },
    elements: [
      { type: "rect", xFrac: 0.3, yFrac: 0.18, widthFrac: 0.4, heightFrac: 0.006, fill: "#FBBF24" },
      { type: "textbox", xFrac: 0.05, yFrac: 0.24, widthFrac: 0.9, fontSizeFrac: 0.135, fontFamily: "Cinzel", fontStyle: "bold", fill: "#FBBF24", align: "center", text: "Realm of Shadows" },
      { type: "textbox", xFrac: 0.12, yFrac: 0.43, widthFrac: 0.76, fontSizeFrac: 0.04, fontFamily: "Lora", fontStyle: "italic", fill: "#FFFFFF", align: "center", text: "Book One of the Saga" },
      { type: "rect", xFrac: 0.3, yFrac: 0.50, widthFrac: 0.4, heightFrac: 0.006, fill: "#FBBF24" },
    ],
  },
  {
    id: "sci-fi",
    name: "Sci-Fi",
    category: "Fiction",
    swatch: "#0891B2",
    photoQuery: "galaxy stars space",
    background: {
      frontCoverColor: "#082F35", frontCoverType: "gradient", frontCoverGradientStart: "#0E7490", frontCoverGradientEnd: "#082F35",
      backCoverColor: "#082F35", backCoverType: "solid", backCoverGradientStart: "#082F35", backCoverGradientEnd: "#041D21",
    },
    elements: [
      { type: "textbox", xFrac: 0.05, yFrac: 0.26, widthFrac: 0.9, fontSizeFrac: 0.135, fontFamily: "Oswald", fontStyle: "bold", fill: "#67E8F9", align: "center", text: "STELLAR DRIFT" },
      { type: "textbox", xFrac: 0.12, yFrac: 0.45, widthFrac: 0.76, fontSizeFrac: 0.04, fontFamily: "Outfit", fill: "#FFFFFF", align: "center", text: "A Space Odyssey" },
    ],
  },
  {
    id: "horror",
    name: "Horror",
    category: "Fiction",
    swatch: "#7F1D1D",
    photoQuery: "dark abandoned house",
    background: {
      frontCoverColor: "#0A0A0A", frontCoverType: "gradient", frontCoverGradientStart: "#1A0000", frontCoverGradientEnd: "#000000",
      backCoverColor: "#0A0A0A", backCoverType: "solid", backCoverGradientStart: "#0A0A0A", backCoverGradientEnd: "#000000",
    },
    elements: [
      { type: "textbox", xFrac: 0.04, yFrac: 0.28, widthFrac: 0.92, fontSizeFrac: 0.155, fontFamily: "Oswald", fontStyle: "bold", fill: "#B91C1C", align: "center", text: "WHAT LURKS" },
      { type: "textbox", xFrac: 0.15, yFrac: 0.48, widthFrac: 0.7, fontSizeFrac: 0.038, fontFamily: "Georgia", fontStyle: "italic", fill: "#FFFFFF", align: "center", text: "A Tale of Terror" },
      { type: "rect", xFrac: 0.35, yFrac: 0.56, widthFrac: 0.3, heightFrac: 0.004, fill: "#7F1D1D" },
    ],
  },
  {
    id: "young-adult",
    name: "Young Adult",
    category: "Fiction",
    swatch: "#FB7185",
    photoQuery: "teenager silhouette sunset",
    background: {
      frontCoverColor: "#FB7185", frontCoverType: "gradient", frontCoverGradientStart: "#FB7185", frontCoverGradientEnd: "#38BDF8",
      backCoverColor: "#38BDF8", backCoverType: "solid", backCoverGradientStart: "#38BDF8", backCoverGradientEnd: "#0EA5E9",
    },
    elements: [
      { type: "textbox", xFrac: 0.05, yFrac: 0.22, widthFrac: 0.9, fontSizeFrac: 0.14, fontFamily: "Montserrat", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "Chasing Stars" },
      { type: "textbox", xFrac: 0.12, yFrac: 0.42, widthFrac: 0.76, fontSizeFrac: 0.042, fontFamily: "Outfit", fill: "#FFFFFF", align: "center", text: "A Young Adult Novel" },
    ],
  },
  {
    id: "historical-fiction",
    name: "Historical Fiction",
    category: "Fiction",
    swatch: "#92400E",
    photoQuery: "vintage old book library",
    background: {
      frontCoverColor: "#F5E9D3", frontCoverType: "solid", frontCoverGradientStart: "#F5E9D3", frontCoverGradientEnd: "#E8D4AC",
      backCoverColor: "#92400E", backCoverType: "solid", backCoverGradientStart: "#92400E", backCoverGradientEnd: "#78350F",
    },
    elements: [
      { type: "rect", xFrac: 0.25, yFrac: 0.16, widthFrac: 0.5, heightFrac: 0.006, fill: "#FFFFFF" },
      { type: "textbox", xFrac: 0.06, yFrac: 0.22, widthFrac: 0.88, fontSizeFrac: 0.12, fontFamily: "Playfair Display", fill: "#FFFFFF", align: "center", text: "The Forgotten Years" },
      { type: "textbox", xFrac: 0.12, yFrac: 0.42, widthFrac: 0.76, fontSizeFrac: 0.038, fontFamily: "Merriweather", fontStyle: "italic", fill: "#FFFFFF", align: "center", text: "A Novel of War and Hope" },
      { type: "rect", xFrac: 0.25, yFrac: 0.49, widthFrac: 0.5, heightFrac: 0.006, fill: "#FFFFFF" },
    ],
  },

  // ── More Non-Fiction ──────────────────────────────────────────
  {
    id: "business-finance",
    name: "Business & Finance",
    category: "Non-Fiction",
    swatch: "#1E3A8A",
    photoQuery: "city skyline skyscraper",
    background: {
      frontCoverColor: "#1E3A8A", frontCoverType: "gradient", frontCoverGradientStart: "#1E40AF", frontCoverGradientEnd: "#0F172A",
      backCoverColor: "#0F172A", backCoverType: "solid", backCoverGradientStart: "#0F172A", backCoverGradientEnd: "#020617",
    },
    elements: [
      { type: "textbox", xFrac: 0.06, yFrac: 0.24, widthFrac: 0.88, fontSizeFrac: 0.12, fontFamily: "Montserrat", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "Build Your Empire" },
      { type: "rect", xFrac: 0.4, yFrac: 0.40, widthFrac: 0.2, heightFrac: 0.006, fill: "#FBBF24" },
      { type: "textbox", xFrac: 0.12, yFrac: 0.44, widthFrac: 0.76, fontSizeFrac: 0.038, fontFamily: "Outfit", fill: "#FFFFFF", align: "center", text: "Smart Money Strategies That Work" },
    ],
  },
  {
    id: "health-wellness",
    name: "Health & Wellness",
    category: "Non-Fiction",
    swatch: "#059669",
    photoQuery: "yoga meditation nature",
    background: {
      frontCoverColor: "#ECFDF5", frontCoverType: "solid", frontCoverGradientStart: "#ECFDF5", frontCoverGradientEnd: "#D1FAE5",
      backCoverColor: "#059669", backCoverType: "solid", backCoverGradientStart: "#059669", backCoverGradientEnd: "#047857",
    },
    elements: [
      { type: "textbox", xFrac: 0.06, yFrac: 0.34, widthFrac: 0.88, fontSizeFrac: 0.11, fontFamily: "Montserrat", fontStyle: "bold", fill: "#FFFFFF", align: "center", text: "Healthy Habits" },
      { type: "textbox", xFrac: 0.12, yFrac: 0.52, widthFrac: 0.76, fontSizeFrac: 0.038, fontFamily: "Outfit", fill: "#FFFFFF", align: "center", text: "A Simple Guide to Wellness" },
    ],
  },
  {
    id: "memoir-biography",
    name: "Memoir & Biography",
    category: "Non-Fiction",
    swatch: "#78350F",
    photoQuery: "old photograph vintage",
    background: {
      frontCoverColor: "#F3E9DC", frontCoverType: "solid", frontCoverGradientStart: "#F3E9DC", frontCoverGradientEnd: "#E5D5BE",
      backCoverColor: "#78350F", backCoverType: "solid", backCoverGradientStart: "#78350F", backCoverGradientEnd: "#5C2A0B",
    },
    elements: [
      { type: "textbox", xFrac: 0.06, yFrac: 0.28, widthFrac: 0.88, fontSizeFrac: 0.115, fontFamily: "Playfair Display", fontStyle: "italic", fill: "#FFFFFF", align: "center", text: "My Story" },
      { type: "rect", xFrac: 0.38, yFrac: 0.44, widthFrac: 0.24, heightFrac: 0.005, fill: "#FFFFFF" },
      { type: "textbox", xFrac: 0.15, yFrac: 0.48, widthFrac: 0.7, fontSizeFrac: 0.036, fontFamily: "Lora", fill: "#FFFFFF", align: "center", text: "A Memoir" },
    ],
  },
];

// Converts a template's fractional element definitions into absolute pixel
// coordinates for the current layout (front-cover live area), producing the
// same shape of object that FabricCoverStudio's importLegacyElements expects.
// When `withPhotoOverlay` is true, a semi-transparent dark rect is prepended
// so the (now white/light) title text stays legible over any real photo —
// it's added first so it renders behind the text but above the photo, which
// is painted by the separate background canvas layer beneath all Fabric objects.
export function resolveTemplateElements(template: CoverTemplate, layout: KdpLayoutResult, withPhotoOverlay: boolean = false): any[] {
  const frontWidth = layout.frontLiveRightPx - layout.frontLiveLeftPx;
  const frontHeight = layout.frontLiveBottomPx - layout.frontLiveTopPx;

  const resolved: any[] = template.elements.map((el, i) => {
    const base = {
      id: `tpl-${template.id}-${i}-${Date.now()}`,
      x: layout.frontLiveLeftPx + el.xFrac * frontWidth,
      y: layout.frontLiveTopPx + el.yFrac * frontHeight,
      width: el.widthFrac * frontWidth,
      height: (el.heightFrac ?? 0.1) * frontHeight,
      fill: el.fill,
      stroke: el.stroke,
      strokeWidth: el.strokeWidth || 0,
      opacity: el.opacity ?? 1,
      cornerRadius: el.cornerRadius,
    };

    if (el.type === "textbox") {
      return {
        ...base,
        type: "textbox",
        isTextbox: true,
        text: el.text || "",
        fontFamily: el.fontFamily || "Arial",
        fontStyle: el.fontStyle || "normal",
        fontSize: Math.round((el.fontSizeFrac ?? 0.05) * frontWidth),
        align: el.align || "center",
      };
    }

    if (el.type === "circle") {
      // importLegacyElements' circle branch reads `radius`, not width/height.
      return { ...base, type: "circle", radius: base.width / 2 };
    }

    return { ...base, type: el.type };
  });

  if (withPhotoOverlay) {
    resolved.unshift({
      id: `tpl-${template.id}-overlay-${Date.now()}`,
      type: "rect",
      x: layout.frontLiveLeftPx,
      y: layout.frontLiveTopPx,
      width: frontWidth,
      height: frontHeight,
      fill: "#000000",
      opacity: 0.4,
      strokeWidth: 0,
    });
  }

  return resolved;
}
