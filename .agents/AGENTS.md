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
