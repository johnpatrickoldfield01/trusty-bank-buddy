
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b23c6a1de3504cc9bfba3e402cc226bd',
  appName: 'Trusty Bank Buddy',
  webDir: 'dist',
  server: {
    url: 'https://b23c6a1d-e350-4cc9-bfba-3e402cc226bd.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e40af',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1e40af'
    },
    Haptics: {},
    App: {
      launchUrl: 'https://b23c6a1d-e350-4cc9-bfba-3e402cc226bd.lovableproject.com'
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
