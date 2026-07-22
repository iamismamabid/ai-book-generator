import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aibookgenerator.app',
  appName: 'KDPage - AI Book Generator & KDP Studio',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    url: 'https://www.kdpage.com',
    cleartext: true
  }
};

export default config;
