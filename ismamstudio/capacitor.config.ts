import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aibookgenerator.app',
  appName: 'AI Book Generator',
  webDir: 'out',
  server: {
    // Allows loading live server / API endpoints seamlessly on mobile
    androidScheme: 'https'
  }
};

export default config;
