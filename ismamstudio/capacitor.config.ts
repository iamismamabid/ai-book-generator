import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kdpage.studio',
  appName: 'KDPage Studio',
  webDir: 'out',
  server: {
    url: 'https://www.kdpage.com',
    allowNavigation: [
      'www.kdpage.com',
      '*.clerk.accounts.dev',
      'clerk.kdpage.com'
    ]
  }
};

export default config;
