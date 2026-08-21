const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

const dynamicRoutes = [
  'src/app/api',
  'src/app/book',
  'src/app/review',
  'src/app/sign-in',
  'src/app/sign-up'
];

const movedRoutes = [];

try {
  console.log('🚀 Starting Capacitor Build Workflow...');

  // 1. Move dynamic routes out of app directory to avoid export errors
  for (const route of dynamicRoutes) {
    const fullPath = path.join(projectRoot, route);
    const tempPath = path.join(projectRoot, route.replace('src/app/', 'src/app/_'));

    if (fs.existsSync(fullPath)) {
      console.log(`📦 Temporarily moving ${route} to skip export...`);
      fs.renameSync(fullPath, tempPath);
      movedRoutes.push({ original: fullPath, temp: tempPath });
    }
  }

  // 2. Run Prisma Generate & Next Build with CAPACITOR_BUILD=true
  console.log('🏗️ Building static export...');
  execSync('npx prisma generate && npx next build', {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, CAPACITOR_BUILD: 'true' }
  });

  console.log('✅ Build successful!');

} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
} finally {
  // 3. Move routes back
  for (const { original, temp } of movedRoutes.reverse()) {
    if (fs.existsSync(temp)) {
      console.log(`🔙 Restoring ${path.basename(original)}...`);
      fs.renameSync(temp, original);
    }
  }
}
