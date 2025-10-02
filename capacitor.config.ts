import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1577ec841442458a81631b7534166793',
  appName: 'hive-mind-orchestrator',
  webDir: 'dist',
  server: {
    url: 'https://1577ec84-1442-458a-8163-1b7534166793.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
