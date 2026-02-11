import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.spark.afterwod',
  appName: 'AfterWOD',
  webDir: 'public',
  server: {
    url: 'https://afterwod.vercel.app',
    cleartext: true
  }
};

export default config;
