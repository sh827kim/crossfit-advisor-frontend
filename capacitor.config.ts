import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.spark.afterwod',
  appName: '애프터와드',
  webDir: 'public',
  server: {
    url: 'https://afterwod.vercel.app',
    cleartext: true
  }
};

export default config;
