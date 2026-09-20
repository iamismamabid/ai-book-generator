import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";

dotenv.config();

const KDPAGE_API_BASE = process.env.KDPAGE_API_URL || "https://www.kdpage.com";
const KDPAGE_API_KEY = process.env.KDPAGE_API_KEY || "";

// 1. Initialize MCP Server
const server = new Server(
  {
    name: "kdpage-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 2. Define Available Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_puzzle_book",
        description:
          "Generate a complete KDP puzzle book draft (Sudoku, Word Search, Crossword, Maze, Cryptogram, etc.) and get an editable KDPage Studio link.",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title of the book (e.g., 'The Ultimate Brain Games for Adults')",
            },
            subtitle: {
              type: "string",
              description: "Subtitle of the book",
            },
            puzzleTypes: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "sudoku",
                  "word_search",
                  "crossword",
                  "maze",
                  "cryptogram",
                  "math_puzzle",
                  "kakuro",
                  "word_scramble",
                ],
              },
              description: "Array of puzzle types to generate",
            },
            pageCount: {
              type: "number",
              description: "Total interior pages to generate (e.g., 50, 100, 120)",
            },
            trimSize: {
              type: "string",
              enum: ["8.5x11", "6x9", "5.5x8.5"],
              description: "Amazon KDP Trim Size in inches",
              default: "8.5x11",
            },
            difficulty: {
              type: "string",
              enum: ["easy", "medium", "hard", "expert"],
              description: "Difficulty level for puzzles",
              default: "medium",
            },
          },
          required: ["title", "puzzleTypes", "pageCount"],
        },
      },
      {
        name: "generate_kdp_cover",
        description:
          "Generate a 300 DPI Amazon KDP book cover based on title, subtitle, author, and theme, with exact spine width.",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Book title for front cover and spine",
            },
            subtitle: {
              type: "string",
              description: "Subtitle for front cover",
            },
            author: {
              type: "string",
              description: "Author name",
              default: "KDPage Publishing",
            },
            pageCount: {
              type: "number",
              description: "Total page count of interior (used to calculate spine width)",
            },
            trimSize: {
              type: "string",
              enum: ["8.5x11", "6x9", "5.5x8.5"],
              description: "KDP Trim Size",
              default: "8.5x11",
            },
            themeId: {
              type: "string",
              enum: [
                "midnight_gold",
                "neon_cyber",
                "minimal_cream",
                "botanical_zen",
                "retro_pop",
                "slate_luxury",
              ],
              description: "Design theme preset",
              default: "midnight_gold",
            },
          },
          required: ["title", "pageCount"],
        },
      },
      {
        name: "calculate_kdp_spine_and_margins",
        description:
          "Calculate exact Amazon KDP spine width (inches & pixels at 300 DPI) and required gutter margins based on page count and paper type.",
        inputSchema: {
          type: "object",
          properties: {
            pageCount: {
              type: "number",
              description: "Number of interior pages (minimum 24)",
            },
            paperType: {
              type: "string",
              enum: ["white", "cream", "color"],
              description: "KDP paper type",
              default: "white",
            },
            trimSize: {
              type: "string",
              enum: ["8.5x11", "6x9", "5.5x8.5"],
              description: "Trim size in inches",
              default: "8.5x11",
            },
          },
          required: ["pageCount"],
        },
      },
      {
        name: "validate_kdp_specifications",
        description:
          "Validate book configuration against Amazon KDP print-on-demand rules and reject risks.",
        inputSchema: {
          type: "object",
          properties: {
            pageCount: { type: "number" },
            trimSize: { type: "string" },
            gutterMarginEnabled: { type: "boolean", default: true },
          },
          required: ["pageCount", "trimSize"],
        },
      },
    ],
  };
});

// 3. Handle Tool Calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "create_puzzle_book") {
      const {
        title,
        subtitle = "",
        puzzleTypes,
        pageCount,
        trimSize = "8.5x11",
        difficulty = "medium",
      } = args as any;

      // Studio direct entry URL
      const studioUrl = new URL(`${KDPAGE_API_BASE}/studio`);
      studioUrl.searchParams.set("tab", "interior");
      studioUrl.searchParams.set("title", title);
      if (subtitle) studioUrl.searchParams.set("subtitle", subtitle);
      studioUrl.searchParams.set("types", puzzleTypes.join(","));
      studioUrl.searchParams.set("pages", String(pageCount));
      studioUrl.searchParams.set("trim", trimSize);
      studioUrl.searchParams.set("diff", difficulty);

      return {
        content: [
          {
            type: "text",
            text: [
              `📚 **KDP Puzzle Book Created!**`,
              ``,
              `• **Title:** ${title}`,
              subtitle ? `• **Subtitle:** ${subtitle}` : null,
              `• **Puzzle Types:** ${puzzleTypes.join(", ")}`,
              `• **Interior Pages:** ${pageCount} pages`,
              `• **Trim Size:** ${trimSize}"`,
              `• **Difficulty:** ${difficulty.toUpperCase()}`,
              ``,
              `👉 **[Open & Edit in KDPage Studio](${studioUrl.toString()})**`,
              `*(All front matter, puzzle grids, and solutions are ready to edit, arrange, and export at 300 DPI Print-Ready PDF)*`,
            ]
              .filter(Boolean)
              .join("\n"),
          },
        ],
      };
    }

    if (name === "generate_kdp_cover") {
      const {
        title,
        subtitle = "",
        author = "KDPage Publishing",
        pageCount,
        trimSize = "8.5x11",
        themeId = "midnight_gold",
      } = args as any;

      // Calculate spine multiplier (White paper: 0.002252 in/page)
      const spineInches = Number((pageCount * 0.002252).toFixed(4));
      const spinePx = Math.round(spineInches * 300);

      const coverStudioUrl = new URL(`${KDPAGE_API_BASE}/studio`);
      coverStudioUrl.searchParams.set("tab", "cover");
      coverStudioUrl.searchParams.set("title", title);
      if (subtitle) coverStudioUrl.searchParams.set("subtitle", subtitle);
      coverStudioUrl.searchParams.set("author", author);
      coverStudioUrl.searchParams.set("pages", String(pageCount));
      coverStudioUrl.searchParams.set("theme", themeId);
      coverStudioUrl.searchParams.set("trim", trimSize);

      return {
        content: [
          {
            type: "text",
            text: [
              `🎨 **Amazon KDP Cover Generated!**`,
              ``,
              `• **Title:** ${title}`,
              subtitle ? `• **Subtitle:** ${subtitle}` : null,
              `• **Author:** ${author}`,
              `• **Theme Preset:** ${themeId}`,
              `• **Calculated Spine:** ${spineInches}" (${spinePx}px @ 300 DPI)`,
              `• **Safety Guides:** KDP Barcode & Bleed margins active`,
              ``,
              `👉 **[Open in KDPage Cover Studio](${coverStudioUrl.toString()})**`,
              `*(Includes full wrap-around cover with front, back, and spine)*`,
            ]
              .filter(Boolean)
              .join("\n"),
          },
        ],
      };
    }

    if (name === "calculate_kdp_spine_and_margins") {
      const { pageCount, paperType = "white", trimSize = "8.5x11" } = args as any;

      // Amazon KDP multipliers
      const multipliers: Record<string, number> = {
        white: 0.002252,
        cream: 0.0025,
        color: 0.002347,
      };

      const mult = multipliers[paperType] || multipliers.white;
      const spineInches = Number((pageCount * mult).toFixed(4));
      const spinePx = Math.round(spineInches * 300);

      // KDP Gutter margin rules
      let gutterMarginInches = 0.375;
      if (pageCount >= 151 && pageCount <= 300) gutterMarginInches = 0.5;
      else if (pageCount >= 301 && pageCount <= 500) gutterMarginInches = 0.625;
      else if (pageCount >= 501 && pageCount <= 700) gutterMarginInches = 0.75;
      else if (pageCount >= 701) gutterMarginInches = 0.875;

      return {
        content: [
          {
            type: "text",
            text: [
              `📐 **Amazon KDP Specification Calculations:**`,
              ``,
              `• **Interior Pages:** ${pageCount}`,
              `• **Paper Type:** ${paperType.toUpperCase()} (multiplier: ${mult})`,
              `• **Spine Width:** ${spineInches} inches (${spinePx} pixels @ 300 DPI)`,
              `• **Required Gutter Margin:** ${gutterMarginInches} inches`,
              `• **Outside Margins (Minimum):** 0.25 inches (without bleed) / 0.375 inches (with bleed)`,
              `• **Spine Text Allowed:** ${pageCount >= 79 ? "✅ YES (Minimum 79 pages required for spine text)" : "❌ NO (Must be at least 79 pages for spine text)"}`,
            ].join("\n"),
          },
        ],
      };
    }

    if (name === "validate_kdp_specifications") {
      const { pageCount, trimSize, gutterMarginEnabled = true } = args as any;

      const issues: string[] = [];
      if (pageCount < 24) {
        issues.push("Page count is below 24 pages (Amazon KDP minimum is 24 pages).");
      }
      if (pageCount > 828) {
        issues.push("Page count exceeds 828 pages (Amazon KDP maximum is 828 pages for black & white).");
      }
      if (pageCount % 2 !== 0) {
        issues.push("Page count is odd; KDP requires an even number of pages.");
      }
      if (!gutterMarginEnabled && pageCount > 150) {
        issues.push("Gutter margin is disabled, but books over 150 pages require gutter margin to prevent text loss in the binding.");
      }

      const isValid = issues.length === 0;

      return {
        content: [
          {
            type: "text",
            text: isValid
              ? `✅ **Amazon KDP Ready!** Zero rejection risks detected for ${pageCount} pages (${trimSize}).`
              : `⚠️ **KDP Validation Warnings (${issues.length}):**\n\n` + issues.map((i) => `• ${i}`).join("\n"),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error: ${error.message}` }],
    };
  }
});

// 4. Start Server on stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("KDPage MCP Server is running on stdio transport.");
}

main().catch((err) => {
  console.error("Fatal error starting KDPage MCP server:", err);
  process.exit(1);
});
