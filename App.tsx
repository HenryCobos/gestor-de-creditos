import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { OnboardingFlow } from './src/components/onboarding/OnboardingFlow';
import { NotificationService } from './src/services/notifications';
import { PayPalService } from './src/services/payments';
import { AutoBackupService } from './src/services/autoBackup';
import { AnalyticsService } from './src/services/analytics';
import { userService } from './src/services/userService';
import { ReviewService } from './src/services/reviewService';
import Constants from 'expo-constants';

function AppContent() {
  useEffect(() => {
    // Inicializar servicios al arrancar la app
    const initializeServices = async () => {
      try {
        // Inicializar notificaciones solo fuera de Expo Go (no soportado en Expo Go desde SDK 53)
        const isExpoGo = (Constants as any)?.appOwnership === 'expo';
        if (!isExpoGo) {
          await NotificationService.initialize();
          console.log('✅ Notificaciones inicializadas');
        } else {
          console.log('ℹ️ Omitiendo notificaciones en Expo Go');
        }

        // Inicializar PayPal
        await PayPalService.initialize();
        console.log('✅ PayPal inicializado');

        // Inicializar analytics
        await AnalyticsService.initialize();
        await AnalyticsService.trackAppOpened();
        console.log('✅ Analytics inicializado');

        // Inicializar sistema de usuarios
        await userService.initialize();
        console.log('✅ Sistema de usuarios inicializado');

        // Inicializar backup automático
        await AutoBackupService.initialize();
        console.log('✅ Backup automático inicializado');

        // Trackear apertura de app para sistema de reseñas
        await ReviewService.trackAppOpen();
        console.log('✅ Apertura de app trackeada');
      } catch (error) {
        console.error('❌ Error al inicializar servicios:', error);
      }
    };

    initializeServices();

    // Cleanup cuando se desmonte el componente
    return () => {
      // No cleanup necesario actualmente
    };
  }, []);

  return (
    <OnboardingFlow>
      <AppNavigator />
      <StatusBar style="auto" />
    </OnboardingFlow>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
