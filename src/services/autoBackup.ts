import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from './storage';
import { NotificationService } from './notifications';

interface BackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastBackup?: string;
  nextBackup?: string;
}

const BACKUP_CONFIG_KEY = '@creditos_app:backup_config';
const BACKUP_HISTORY_KEY = '@creditos_app:backup_history';

interface BackupHistoryItem {
  id: string;
  timestamp: string;
  size: number;
  type: 'manual' | 'automatic';
  success: boolean;
}

export class AutoBackupService {
  private static isRunning = false;

  /**
   * Inicializa el servicio de backup automático
   */
  static async initialize(): Promise<void> {
    try {
      const config = await this.getBackupConfig();
      if (config.enabled) {
        await this.scheduleNextBackup(config);
      }
    } catch (error) {
      console.error('Error inicializando backup automático:', error);
    }
  }

  /**
   * Obtiene la configuración de backup
   */
  static async getBackupConfig(): Promise<BackupConfig> {
    try {
      const config = await AsyncStorage.getItem(BACKUP_CONFIG_KEY);
      if (config) {
        return JSON.parse(config);
      }
      return {
        enabled: false,
        frequency: 'daily',
      };
    } catch (error) {
      console.error('Error obteniendo configuración de backup:', error);
      return {
        enabled: false,
        frequency: 'daily',
      };
    }
  }

  /**
   * Actualiza la configuración de backup
   */
  static async updateBackupConfig(config: Partial<BackupConfig>): Promise<void> {
    try {
      const currentConfig = await this.getBackupConfig();
      const newConfig = { ...currentConfig, ...config };
      await AsyncStorage.setItem(BACKUP_CONFIG_KEY, JSON.stringify(newConfig));
      
      if (newConfig.enabled) {
        await this.scheduleNextBackup(newConfig);
      }
    } catch (error) {
      console.error('Error actualizando configuración de backup:', error);
    }
  }

  /**
   * Ejecuta backup automático
   */
  static async performAutoBackup(): Promise<boolean> {
    if (this.isRunning) return false;
    
    this.isRunning = true;
    try {
      const config = await this.getBackupConfig();
      if (!config.enabled) return false;

      // Crear backup
      const backupData = await StorageService.createBackup();
      const backupSize = new Blob([backupData]).size;
      
      // Guardar en historial
      await this.addToHistory({
        id: `backup_${Date.now()}`,
        timestamp: new Date().toISOString(),
        size: backupSize,
        type: 'automatic',
        success: true,
      });

      // Actualizar configuración
      const nextBackup = this.calculateNextBackup(config.frequency);
      await this.updateBackupConfig({
        lastBackup: new Date().toISOString(),
        nextBackup: nextBackup.toISOString(),
      });

      // Programar siguiente backup
      await this.scheduleNextBackup({ ...config, lastBackup: new Date().toISOString() });

      // Notificar éxito
      await NotificationService.scheduleNotification({
        title: '✅ Backup automático completado',
        body: 'Tu información ha sido respaldada automáticamente.',
        data: { type: 'backup_success' },
        trigger: null,
      });

      return true;
    } catch (error) {
      console.error('Error en backup automático:', error);
      
      // Notificar error
      await NotificationService.scheduleNotification({
        title: '❌ Error en backup automático',
        body: 'No se pudo completar el respaldo automático. Revisa la configuración.',
        data: { type: 'backup_error' },
        trigger: null,
      });

      return false;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Programa el siguiente backup
   */
  private static async scheduleNextBackup(config: BackupConfig): Promise<void> {
    try {
      const nextBackup = this.calculateNextBackup(config.frequency);
      const now = new Date();
      const delay = nextBackup.getTime() - now.getTime();
      
      if (delay > 0) {
        // Programar notificación para el siguiente backup
        await NotificationService.scheduleNotification({
          title: '🔄 Backup automático programado',
          body: `El siguiente respaldo automático será en ${this.formatTimeUntil(nextBackup)}.`,
          data: { type: 'backup_scheduled' },
          trigger: { seconds: Math.floor(delay / 1000) },
        });
      }
    } catch (error) {
      console.error('Error programando siguiente backup:', error);
    }
  }

  /**
   * Calcula la fecha del siguiente backup
   */
  private static calculateNextBackup(frequency: string): Date {
    const now = new Date();
    const next = new Date(now);

    switch (frequency) {
      case 'daily':
        next.setDate(now.getDate() + 1);
        next.setHours(2, 0, 0, 0); // 2:00 AM
        break;
      case 'weekly':
        next.setDate(now.getDate() + 7);
        next.setHours(2, 0, 0, 0); // 2:00 AM
        break;
      case 'monthly':
        next.setMonth(now.getMonth() + 1);
        next.setDate(1);
        next.setHours(2, 0, 0, 0); // 2:00 AM
        break;
      default:
        next.setDate(now.getDate() + 1);
        next.setHours(2, 0, 0, 0);
    }

    return next;
  }

  /**
   * Formatea el tiempo hasta el siguiente backup
   */
  private static formatTimeUntil(date: Date): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} día${days > 1 ? 's' : ''} y ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      return 'pronto';
    }
  }

  /**
   * Agrega entrada al historial de backups
   */
  private static async addToHistory(item: BackupHistoryItem): Promise<void> {
    try {
      const history = await this.getBackupHistory();
      history.unshift(item);
      
      // Mantener solo los últimos 50 backups
      if (history.length > 50) {
        history.splice(50);
      }
      
      await AsyncStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error agregando al historial de backup:', error);
    }
  }

  /**
   * Obtiene el historial de backups
   */
  static async getBackupHistory(): Promise<BackupHistoryItem[]> {
    try {
      const history = await AsyncStorage.getItem(BACKUP_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error obteniendo historial de backup:', error);
      return [];
    }
  }

  /**
   * Limpia el historial de backups
   */
  static async clearBackupHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BACKUP_HISTORY_KEY);
    } catch (error) {
      console.error('Error limpiando historial de backup:', error);
    }
  }
}
