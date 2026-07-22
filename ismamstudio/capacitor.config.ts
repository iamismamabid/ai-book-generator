import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aibookgenerator.app',
  appName: 'AI Book Generator',
  webDir: 'public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
