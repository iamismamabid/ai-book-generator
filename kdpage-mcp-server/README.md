# KDPage MCP Server 🚀

Official [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for **[KDPage](https://www.kdpage.com)** — The All-in-One Amazon KDP Activity & Puzzle Book Creator.

This MCP server allows any AI assistant (Claude, Cursor, Antigravity, ChatGPT, Google Gemini) to generate KDP puzzle books, create 300 DPI covers, calculate spine widths, and validate print margins directly via natural language prompts.

---

## 🛠️ Available Tools

1. **`create_puzzle_book`**:
   - Generates complete puzzle book drafts (Sudoku, Word Search, Crossword, Maze, Cryptogram, Math Puzzles, Kakuro, Word Scramble).
   - Returns an editable direct link to KDPage Studio (`https://www.kdpage.com/studio`).

2. **`generate_kdp_cover`**:
   - Generates 300 DPI wrap-around Amazon KDP covers with dynamic spine calculation.
   - Supports curated themes (`midnight_gold`, `neon_cyber`, `minimal_cream`, `botanical_zen`, etc.).

3. **`calculate_kdp_spine_and_margins`**:
   - Calculates exact spine width (inches and pixels @ 300 DPI) for white, cream, or color paper.
   - Calculates mandatory gutter margins and checks spine text eligibility.

4. **`validate_kdp_specifications`**:
   - Verifies page count (24 to 828 pages), even page count rule, bleed, and binding safety.

---

## 📦 Installation & Setup

### 1. Build
```bash
npm install
npm run build
```

### 2. Add to Claude Desktop or Cursor / Antigravity

Add this to your `claude_desktop_config.json` or Antigravity MCP config:

```json
{
  "mcpServers": {
    "kdpage": {
      "command": "node",
      "args": ["C:/Projects/ai-book-generator/kdpage-mcp-server/dist/index.js"],
      "env": {
        "KDPAGE_API_URL": "https://www.kdpage.com"
      }
    }
  }
}
```

Or run directly with `tsx`:
```json
{
  "mcpServers": {
    "kdpage": {
      "command": "npx",
      "args": ["-y", "tsx", "C:/Projects/ai-book-generator/kdpage-mcp-server/src/index.ts"],
      "env": {
        "KDPAGE_API_URL": "https://www.kdpage.com"
      }
    }
  }
}
```

---

## 💬 Example AI Prompts

- *"Create a 100-page Sudoku and Crossword book titled 'Brain Challenge' in 8.5x11 size on KDPage."*
- *"Design a luxury dark gold KDP cover for a 120-page book titled 'Mastering Cryptograms'."*
- *"Calculate the spine width and gutter margin for a 200-page KDP book on cream paper."*
- *"Check if a 55-page book meets Amazon KDP print requirements."*
