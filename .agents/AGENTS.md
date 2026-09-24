# Project-Scoped Rules & Guidelines

These rules govern the development workflow and build processes for the `ai-book-generator` repository.

## Developer Git & Build Workflow

Always adhere to the following sequence when implementing new features or making bug fixes:

1. **Switch or Create Feature Branch:**
   ```bash
   git checkout develop
   # or create feature branch:
   # git checkout -b feat/new-tool
   ```

2. **Make and Test Changes Locally:**
   - Execute edits in the codebase.
   - Navigate into the next app directory and run a local verification build check:
     ```bash
     cd ismamstudio
     npm run build
     ```

3. **Stage, Commit, and Push Changes:**
   ```bash
   git add .
   git commit -m "feat: describe what you did"
   git push origin develop
   ```

4. **Verify CI Build Health:**
   - Ensure the GitHub Actions pipeline check ("Build check") passes successfully on the `develop` branch.

5. **Merge to Main and Release:**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

## Studio Workspace Architecture Guidelines

When modifying `StudioClient.tsx`, `BookBuilder.tsx`, or `FabricCoverStudio.tsx`:

1. **Never use conditional unmounting (`{activeTab === 'x' ? <CompA/> : <CompB/>}`) or `display: none` (`hidden`) for heavy canvas editors.**
   - `display: none` collapses container dimensions to `0px`, breaking `ResizeObserver` and causing initial-click layout drops.
   - Conditional unmounting destroys the Fabric canvas and triggers expensive re-imports and font reloads.
2. **Always maintain the Parallel Absolute Stacking Pattern:**
   ```tsx
   <div className="absolute inset-0 w-full h-full flex flex-col overflow-hidden transition-opacity duration-150"
        style={{
          visibility: activeTab === 'cover' ? 'visible' : 'hidden',
          pointerEvents: activeTab === 'cover' ? 'auto' : 'none',
          zIndex: activeTab === 'cover' ? 10 : 0,
          opacity: activeTab === 'cover' ? 1 : 0,
        }}>
   ```
3. **Always use the Exact Bounding Box Layout wrapper for scaled Fabric canvases:**
   - Outer wrapper: `width: Math.round(canvasWidth * scaleRatio * zoom)`, `height: Math.round(canvasHeight * scaleRatio * zoom)`.
   - Inner scaled container: `transformOrigin: 'top left'`, `transform: scale(scaleRatio * zoom)`.
   - This ensures flexbox centering calculates against the scaled visual bounds without generating phantom scrollbars or layout shifts.
4. **Guard global shortcuts with `isActiveRef`:**
   - Background canvas editors must not capture keyboard shortcuts (e.g. Undo/Redo/Delete) when their tab is not active.

## Permanent Puzzle Code Freeze & Lockdown (STRICT ENFORCEMENT)

All puzzle engines, generation algorithms, math solvers, and puzzle-specific studio editors are under **PERMANENT CODE FREEZE**.

### 1. FROZEN INVENTORY (READ-ONLY / NO EDITS ALLOWED):
Under NO circumstances should any AI agent, assistant, or automated tool edit, refactor, clean up, format, or re-architect the following files or directories unless explicitly commanded by the user with the exact phrase "UNLOCK PUZZLE [name]":

- **Sudoku:**
  - `src/lib/sudoku.ts`, `src/lib/sudokuGenerator.ts`, `src/lib/sudoku-pdf.ts`
  - `src/app/sudoku/` (all files including `SudokuClient.tsx`, `page.tsx`)
  - `src/components/SudokuEditor.tsx`, `src/components/SudokuGenerator.tsx`
- **Crossword:**
  - `src/lib/crosswordDictionary.ts`, `src/app/utils/crosswordGenerator.ts`
  - `src/app/studio/crossword/`
  - `src/components/CrosswordEditor.tsx`, `src/components/tools/CrosswordGenerator.tsx`
- **Word Search:**
  - `src/lib/wordSearchThemes.ts`, `src/lib/wordSearch-pdf.ts`
  - `src/app/tools/word-search/`
  - `src/components/WordSearchEditor.tsx`
- **Maze:**
  - `src/lib/maze.ts`, `src/lib/maze-pdf.ts`, `src/app/utils/mazeGenerator.js`
  - `src/app/maze/` (all files including `MazeClient.tsx`, `page.tsx`)
  - `src/components/MazeEditor.tsx`
- **Kakuro:**
  - `src/lib/kakuro.ts`, `src/lib/kakuro-pdf.ts`
  - `src/app/studio/kakuro/`
  - `src/components/KakuroEditor.tsx`, `src/components/tools/KakuroGenerator.tsx`
- **Cryptogram:**
  - `src/lib/cryptogramQuotes.ts`
  - `src/app/studio/cryptogram/`
  - `src/components/CryptogramEditor.tsx`, `src/components/tools/CryptogramGenerator.tsx`
- **Math Puzzle:**
  - `src/app/studio/math-puzzle/`
  - `src/components/MathPuzzleEditor.tsx`, `src/components/tools/MathPuzzleGenerator.tsx`
- **Core Puzzle Engines & Exporters:**
  - `src/app/utils/puzzleEngine.ts`
  - `src/lib/puzzleDedup.ts`
  - `src/lib/puzzleDpiExporter.ts`
  - `src/app/api/puzzle/batch/`
  - `src/app/tools/kdp-puzzle-generator/`

### 2. STRICT NON-INTERFERENCE RULES:
1. **Zero Cross-Contamination:** When working on cover studios, payments, auth, books, or any other tools, puzzle files MUST NEVER be included in edits.
2. **Shared Components Guarantee:** When modifying shared components (`ExportInteriorModal.tsx`, `FabricCoverStudio.tsx`, `BookBuilder.tsx`), any new prop MUST be strictly optional with non-breaking fallbacks so puzzle components never experience runtime exceptions or layout breaks.
3. **Mandatory Build & Typecheck Gate:** Any changes made to any part of the repository must be validated with `npx tsc --noEmit` and `npm run build` in `ismamstudio` to guarantee 100% regression-free builds for all puzzle pages.


