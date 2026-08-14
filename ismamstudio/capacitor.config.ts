import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kdpage.studio',
  appName: 'KDPage Studio',
  webDir: 'out',
  server: {
    // Put your live production domain here
    url: 'https://kdpage.com',
    cleartext: true
  }
};

export default config;
