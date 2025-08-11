import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { NotificationService } from './src/services/notifications';
// import { AdMobService } from './src/services/admobService';

function AppContent() {
  useEffect(() => {
    // Inicializar servicios al arrancar la app
    const initializeServices = async () => {
      try {
        // Inicializar notificaciones
        await NotificationService.initialize();
        console.log('✅ Notificaciones inicializadas');
        
        // Inicializar AdMob
        // await AdMobService.initialize();
        console.log('✅ AdMob inicializado (deshabilitado temporalmente)');
      } catch (error) {
        console.error('❌ Error al inicializar servicios:', error);
      }
    };

    initializeServices();

    // Cleanup cuando se desmonte el componente
    return () => {
      // AdMobService.cleanup();
    };
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
