import { useState, useEffect, useCallback } from 'react';
import { userService, UserProfile, UserSession } from '../services/userService';

export function useUser() {
  const [session, setSession] = useState<UserSession>({
    isLoggedIn: false,
    currentUser: null,
    isLoading: true,
    error: null,
  });

  // Inicializar el servicio de usuarios
  useEffect(() => {
    const initializeUser = async () => {
      try {
        setSession(prev => ({ ...prev, isLoading: true, error: null }));
        await userService.initialize();
      } catch (error) {
        console.error('Error inicializando usuario:', error);
        setSession(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Error desconocido' 
        }));
      }
    };

    initializeUser();
  }, []);

  // Suscribirse a cambios de sesión
  useEffect(() => {
    const unsubscribe = userService.subscribe((newSession) => {
      setSession(newSession);
    });

    return unsubscribe;
  }, []);

  // Actualizar perfil
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      await userService.updateProfile(updates);
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  }, []);

  // Actualizar preferencias
  const updatePreferences = useCallback(async (preferences: Partial<UserProfile['preferences']>) => {
    try {
      await userService.updatePreferences(preferences);
    } catch (error) {
      console.error('Error actualizando preferencias:', error);
      throw error;
    }
  }, []);


  // Registrar uso de funcionalidad
  const trackFeatureUsage = useCallback(async (featureName: string) => {
    try {
      await userService.trackFeatureUsage(featureName);
    } catch (error) {
      console.error('Error registrando uso de funcionalidad:', error);
    }
  }, []);


  // Obtener analytics
  const getAnalytics = useCallback(() => {
    return userService.getAnalytics();
  }, []);

  // Exportar datos
  const exportUserData = useCallback(async () => {
    try {
      return await userService.exportUserData();
    } catch (error) {
      console.error('Error exportando datos:', error);
      throw error;
    }
  }, []);

  // Importar datos
  const importUserData = useCallback(async (data: string) => {
    try {
      await userService.importUserData(data);
    } catch (error) {
      console.error('Error importando datos:', error);
      throw error;
    }
  }, []);

  // Limpiar datos
  const clearUserData = useCallback(async () => {
    try {
      await userService.clearUserData();
    } catch (error) {
      console.error('Error limpiando datos:', error);
      throw error;
    }
  }, []);

  return {
    // Estado
    user: session.currentUser,
    isLoggedIn: session.isLoggedIn,
    isLoading: session.isLoading,
    error: session.error,
    
    // Acciones
    updateProfile,
    updatePreferences,
    trackFeatureUsage,
    getAnalytics,
    exportUserData,
    importUserData,
    clearUserData,
    
    // Utilidades
    isAnonymous: true, // Siempre anónimo con RevenueCat
  };
}
