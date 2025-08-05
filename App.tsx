import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { NotificationService } from './src/services/notifications';

function AppContent() {
  useEffect(() => {
    // Inicializar notificaciones al arrancar la app
    const initializeNotifications = async () => {
      try {
        await NotificationService.initialize();
      } catch (error) {
        console.error('Error al inicializar notificaciones:', error);
      }
    };

    initializeNotifications();
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
