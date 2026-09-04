# 📚 KDPage (ismamstudio) — Amazon KDP Book Creator & Puzzle Studio

![KDPage Platform](https://www.kdpage.com/logo_transparent.png)

<p align="center">
  <a href="https://www.saashub.com/kdpage?utm_source=badge&utm_campaign=badge&utm_content=kdpage&badge_variant=color&badge_kind=approved" target="_blank">
    <img src="https://cdn-b.saashub.com/img/badges/approved-color.png?v=1" alt="KDPage badge" style="max-width: 150px;" />
  </a>
</p>

> **The ultimate all-in-one web-based publishing toolkit for Amazon KDP self-publishers.**  
> Create 300 DPI print-ready puzzle interiors, non-living coloring books, color-by-number templates, and full wraparound covers in seconds — 100% compliant with KDP and IngramSpark print standards.

---

## 🚀 Key Feature Modules

### 🧩 1. 300 DPI Vector Puzzle Generators
* **8+ Interior Generators**: Word Search, Sudoku, Maze, Math Puzzles, Kakuro, Word Scramble, Cryptograms, and Crosswords.
* **Vector & High-Res PNG Exports**: Resolution-independent 300+ DPI vector PDF interiors + single-page **300 DPI PNG Image Downloads** (`2550×3300 px` for 8.5"×11", `1800×2700 px` for 6"×9").
* **Shaped Word Search Engine**: Circular, heart, diamond, and star word searches with smooth outer boundary strokes and clean cell fills.

### 🎨 2. Coloring Book & Color-by-Number Studio (`/tools/coloring-book-generator`)
* **100% Non-Living Creature Guarantee (Halal & Universal)**: Zero humans, animals, or living beings.
* **7 Design Categories & 25+ Presets**: Citrus Fruit Slices, Concentric Mandalas, Cathedral Stained Glass, Gothic Arches, Mountain Sunbursts, Celestial Constellations, Coffee & Teapots, and Cozy Still Life.
* **Color-by-Number Mode**: Automatic region number overlays (1–10) with an interactive **Color Key Header Legend**.

### 📐 3. KDP Cover Studio & Spine Gutter Calculator
* **Dynamic Binding Gutter Margins**: Automatically scales spine gutters (`0.375"` to `0.875"`) based on total page count.
* **Trim Size & Bleed Alignment**: Supports standard KDP trim sizes (8.5"×11", 6"×9", 5"×8"), 0.125" print bleed, barcode placeholders, and Cover Share review tokens.

### 💳 4. AppSumo Lifetime Deal & Code Stacking Engine
* **1-Click OAuth Activation (`/api/appsumo/oauth`)**: Pre-populates license codes for instant buyer redemption.
* **Webhook Automation (`/api/appsumo/webhook`)**: Handles `activate`, `enhance_tier` (upgrades), `reduce_tier` (downgrades), and `deactivate` (refunds) for Tiers 1 through 5 in real-time.

### ✉️ 5. Lead Capture & Server Actions
* **Server Action (`saveLeadEmail`)**: Ingestion of newsletter subscribers and leads with email regex validation, timing-safe authorization, and database persistence.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Styling & UI** | [TailwindCSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/), Glassmorphism Dark Mode |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/), [Prisma ORM 6](https://www.prisma.io/) |
| **Authentication** | [Clerk Auth](https://clerk.com/) |
| **Rendering & PDF** | [jsPDF](https://github.com/parallax/jsPDF), HTML5 Canvas 2D Vector Rendering |
| **AI Integration** | [Groq SDK](https://groq.com/) (Llama-3.3 70B Versatile) |
| **Payments & Webhooks** | AppSumo Partner Webhooks, Paddle Payments |

---

## 📦 Getting Started

### Prerequisites
* **Node.js**: v18.17.0 or higher
* **npm**: v9.0.0 or higher
* **PostgreSQL Database** (Supabase, Neon, or local instance)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/iamismamabid/ai-book-generator.git
cd ai-book-generator/ismamstudio
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in `ismamstudio/`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ismamstudio?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/ismamstudio?schema=public"

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# AI Engine
GROQ_API_KEY="gsk_..."

# AppSumo Webhooks
APPSUMO_WEBHOOK_SECRET="your_appsumo_webhook_secret"

# Demo Video (Optional YouTube Override)
NEXT_PUBLIC_DEMO_YOUTUBE_ID="OCrO925cK1c"
```

### 3. Initialize Prisma Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification Build & Deployment Workflow

Adhere strictly to the project Git workflow sequence:

1. **Checkout Feature Branch**:
   ```bash
   git checkout develop
   ```

2. **Make & Test Changes Locally**:
   Run the Next.js production build verification:
   ```bash
   cd ismamstudio
   npm run build
   ```

3. **Stage, Commit & Push**:
   ```bash
   git add .
   git commit -m "feat: describe changes"
   git push origin develop
   ```

4. **Merge to Main & Release**:
   ```bash
   git checkout main
   git merge develop
   git push origin main
   git checkout develop
   ```

---

## 📄 License & Attribution

© 2026 **KDPage** by **Ismam Abid**. All rights reserved.  
Interiors, covers, and books generated by KDPage carry a perpetual, worldwide, commercial distribution license for Amazon KDP, Etsy, and self-publishing storefronts.