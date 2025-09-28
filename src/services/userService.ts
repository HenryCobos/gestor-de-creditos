import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Claves para AsyncStorage
const USER_ID_KEY = '@creditos_app:user_id';
const USER_PROFILE_KEY = '@creditos_app:user_profile';
const DEVICE_ID_KEY = '@creditos_app:device_id';
const INSTALLATION_DATE_KEY = '@creditos_app:installation_date';

export interface UserProfile {
  id: string;
  deviceId: string;
  installationDate: string;
  lastActiveDate: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    language: string;
  };
  analytics: {
    appOpens: number;
    featuresUsed: string[];
    lastFeatureUsed?: string;
  };
}

export interface UserSession {
  isLoggedIn: boolean;
  currentUser: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export class UserService {
  private static instance: UserService;
  private currentUser: UserProfile | null = null;
  private listeners: ((session: UserSession) => void)[] = [];

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Inicializar el servicio de usuarios
  async initialize(): Promise<UserProfile> {
    try {
      // Obtener o crear Device ID
      const deviceId = await this.getOrCreateDeviceId();
      
      // Cargar perfil existente o crear uno nuevo
      const existingProfile = await this.loadUserProfile();
      
      if (existingProfile) {
        this.currentUser = {
          ...existingProfile,
          lastActiveDate: new Date().toISOString(),
        };
      } else {
        this.currentUser = await this.createNewUser(deviceId);
      }

      // Guardar perfil actualizado
      await this.saveUserProfile(this.currentUser);
      
      // Notificar a los listeners
      this.notifyListeners();
      
      return this.currentUser;
    } catch (error) {
      console.error('Error inicializando UserService:', error);
      throw error;
    }
  }

  // Obtener o crear Device ID único
  private async getOrCreateDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      
      if (!deviceId) {
        // Generar ID único basado en características del dispositivo
        const deviceInfo = await this.getDeviceInfo();
        deviceId = `device_${deviceInfo.uniqueId}_${Date.now()}`;
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('Error obteniendo Device ID:', error);
      // Fallback a ID generado localmente
      return `device_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    }
  }

  // Obtener información del dispositivo (sin librerías externas)
  private async getDeviceInfo() {
    try {
      // Generar ID único basado en timestamp y random
      const uniqueId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        uniqueId,
        brand: Platform.OS === 'ios' ? 'Apple' : 'Android',
        model: Platform.OS === 'ios' ? 'iPhone' : 'Android Device',
        systemVersion: Platform.Version.toString(),
        platform: Platform.OS,
      };
    } catch (error) {
      console.error('Error obteniendo info del dispositivo:', error);
      return {
        uniqueId: `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        brand: Platform.OS === 'ios' ? 'Apple' : 'Android',
        model: Platform.OS === 'ios' ? 'iPhone' : 'Android Device',
        systemVersion: Platform.Version.toString(),
        platform: Platform.OS,
      };
    }
  }

  // Crear nuevo usuario
  private async createNewUser(deviceId: string): Promise<UserProfile> {
    const now = new Date().toISOString();
    
    const newUser: UserProfile = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deviceId,
      installationDate: now,
      lastActiveDate: now,
      preferences: {
        theme: 'auto',
        notifications: true,
        language: 'es',
      },
      analytics: {
        appOpens: 1,
        featuresUsed: [],
      },
    };

    return newUser;
  }

  // Cargar perfil de usuario
  private async loadUserProfile(): Promise<UserProfile | null> {
    try {
      const profileData = await AsyncStorage.getItem(USER_PROFILE_KEY);
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      console.error('Error cargando perfil de usuario:', error);
      return null;
    }
  }

  // Guardar perfil de usuario
  private async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error guardando perfil de usuario:', error);
    }
  }

  // Obtener usuario actual
  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  // Actualizar perfil de usuario
  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!this.currentUser) return;

    this.currentUser = {
      ...this.currentUser,
      ...updates,
      lastActiveDate: new Date().toISOString(),
    };

    await this.saveUserProfile(this.currentUser);
    this.notifyListeners();
  }

  // Actualizar preferencias
  async updatePreferences(preferences: Partial<UserProfile['preferences']>): Promise<void> {
    if (!this.currentUser) return;

    await this.updateProfile({
      preferences: {
        ...this.currentUser.preferences,
        ...preferences,
      },
    });
  }


  // Registrar uso de funcionalidad
  async trackFeatureUsage(featureName: string): Promise<void> {
    if (!this.currentUser) return;

    const featuresUsed = [...this.currentUser.analytics.featuresUsed];
    if (!featuresUsed.includes(featureName)) {
      featuresUsed.push(featureName);
    }

    await this.updateProfile({
      analytics: {
        ...this.currentUser.analytics,
        featuresUsed,
        lastFeatureUsed: featureName,
        appOpens: this.currentUser.analytics.appOpens + 1,
      },
    });
  }


  // Obtener estadísticas del usuario
  getAnalytics() {
    if (!this.currentUser) return null;

    return {
      daysSinceInstallation: Math.floor(
        (Date.now() - new Date(this.currentUser.installationDate).getTime()) / (1000 * 60 * 60 * 24)
      ),
      totalAppOpens: this.currentUser.analytics.appOpens,
      featuresUsed: this.currentUser.analytics.featuresUsed.length,
      lastActive: this.currentUser.lastActiveDate,
    };
  }

  // Suscribirse a cambios de sesión
  subscribe(listener: (session: UserSession) => void): () => void {
    this.listeners.push(listener);
    
    // Llamar inmediatamente con el estado actual
    listener(this.getSessionState());
    
    // Retornar función para desuscribirse
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notificar a todos los listeners
  private notifyListeners(): void {
    const session = this.getSessionState();
    this.listeners.forEach(listener => listener(session));
  }

  // Obtener estado de la sesión
  private getSessionState(): UserSession {
    return {
      isLoggedIn: !!this.currentUser,
      currentUser: this.currentUser,
      isLoading: false,
      error: null,
    };
  }

  // Limpiar datos del usuario (para logout/reset)
  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        USER_PROFILE_KEY,
        DEVICE_ID_KEY,
        INSTALLATION_DATE_KEY,
      ]);
      
      this.currentUser = null;
      this.notifyListeners();
    } catch (error) {
      console.error('Error limpiando datos de usuario:', error);
    }
  }

  // Exportar datos del usuario (para backup)
  async exportUserData(): Promise<string> {
    if (!this.currentUser) throw new Error('No hay usuario actual');

    const exportData = {
      user: this.currentUser,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Importar datos del usuario (para restore)
  async importUserData(data: string): Promise<void> {
    try {
      const importData = JSON.parse(data);
      
      if (importData.user && importData.version === '1.0') {
        this.currentUser = importData.user;
        if (this.currentUser) {
          await this.saveUserProfile(this.currentUser);
          this.notifyListeners();
        }
      } else {
        throw new Error('Formato de datos inválido');
      }
    } catch (error) {
      console.error('Error importando datos de usuario:', error);
      throw error;
    }
  }
}

// Instancia singleton
export const userService = UserService.getInstance();
