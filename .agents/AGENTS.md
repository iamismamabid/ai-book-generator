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
