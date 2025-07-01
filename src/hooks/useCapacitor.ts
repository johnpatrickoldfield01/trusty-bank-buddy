
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const useCapacitor = () => {
  const [isNative, setIsNative] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [networkStatus, setNetworkStatus] = useState<any>(null);

  useEffect(() => {
    const initializeCapacitor = async () => {
      const native = Capacitor.isNativePlatform();
      setIsNative(native);

      if (native) {
        // Hide splash screen after app loads
        await SplashScreen.hide();

        // Set status bar style
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#1e40af' });

        // Get device info
        const info = await Device.getInfo();
        setDeviceInfo(info);

        // Monitor network status
        const status = await Network.getStatus();
        setNetworkStatus(status);

        Network.addListener('networkStatusChange', (status) => {
          setNetworkStatus(status);
        });

        // Handle app state changes
        App.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active?', isActive);
        });

        // Handle back button (Android)
        App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            App.exitApp();
          } else {
            window.history.back();
          }
        });
      }
    };

    initializeCapacitor();
  }, []);

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (isNative) {
      await Haptics.impact({ style });
    }
  };

  const triggerNotificationHaptic = async () => {
    if (isNative) {
      await Haptics.notification({ type: NotificationType.Success });
    }
  };

  return {
    isNative,
    deviceInfo,
    networkStatus,
    triggerHaptic,
    triggerNotificationHaptic,
  };
};
