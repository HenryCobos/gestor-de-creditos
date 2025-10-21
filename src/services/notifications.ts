import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { ConfiguracionApp } from '../types';

// Verificar si estamos en Expo Go donde el soporte es limitado
const isExpoGo = (Constants as any)?.appOwnership === 'expo';

// Configurar el manejador de notificaciones
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

function isNotificationsAvailable(): boolean {
  return !isExpoGo;
}

// Tipos para el servicio de notificaciones
export interface NotificationData {
  type: 'cuota_vencimiento' | 'prestamo_vencido' | 'recordatorio_pago' | 'resumen_diario' | 'limit_warning';
  cuotaId?: string;
  prestamoId?: string;
  clienteId?: string;
  monto?: number;
  feature?: string;
  [key: string]: unknown; // Index signature para compatibilidad con Expo Notifications
}

export interface NotificationConfig {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  diasAnticipacion: number;
  horaRecordatorio: string;
  frecuenciaResumen: 'diario' | 'semanal' | 'mensual' | 'nunca';
}

// ===== SERVICIO DE NOTIFICACIONES =====

export class NotificationService {
  /**
   * Inicializa el servicio de notificaciones
   */
  static async initialize(): Promise<void> {
    try {
      if (!isNotificationsAvailable()) {
        console.log('ℹ️ Omitiendo notificaciones en Expo Go');
        return;
      }
      
      // Solicitar permisos
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Permisos de notificación no concedidos');
        return;
      }

      // Configurar canal de notificación para iOS
      if (Platform.OS === 'ios') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: (Notifications as any).AndroidImportance?.MAX ?? 5,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      console.log('Servicio de notificaciones inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar notificaciones:', error);
      throw error;
    }
  }

  /**
   * Programa una notificación local
   */
  static async scheduleNotification(
    title: string,
    body: string,
    trigger?: any
  ): Promise<string> {
    try {
      if (!isNotificationsAvailable()) {
        throw new Error('Notificaciones no disponibles en Expo Go');
      }
      
      // Validar que title y body no sean nulos o undefined
      const safeTitle = title || 'Notificación';
      const safeBody = body || 'Mensaje de notificación';
      
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: safeTitle,
          body: safeBody,
          sound: 'default',
        },
        trigger: trigger || null,
      });

      return id;
    } catch (error) {
      console.error('Error al programar notificación:', error);
      throw error;
    }
  }

  /**
   * Programa recordatorio de pago
   */
  static async schedulePaymentReminder(
    creditName: string,
    paymentDate: Date,
    amount: number
  ): Promise<string> {
    try {
      // Validar parámetros
      if (!creditName || !paymentDate || !amount) {
        console.warn('Parámetros inválidos para notificación:', { creditName, paymentDate, amount });
        return '';
      }

      if (!isNotificationsAvailable()) {
        throw new Error('Notificaciones no disponibles en Expo Go');
      }
      
      const reminderDate = new Date(paymentDate);
      reminderDate.setDate(reminderDate.getDate() - 1);
      reminderDate.setHours(9, 0, 0, 0); // 9:00 AM

      const title = 'Recordatorio de Pago';
      const body = `Mañana vence el pago de ${creditName} por $${amount.toLocaleString()}`;

      return await this.scheduleNotification(title, body, {
        channelId: 'default',
        date: reminderDate,
      } as any);
    } catch (error) {
      console.error('Error al programar recordatorio de pago:', error);
      return '';
    }
  }

  /**
   * Cancela una notificación programada
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      if (!isNotificationsAvailable()) return;
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error al cancelar notificación:', error);
      throw error;
    }
  }

  /**
   * Cancela todas las notificaciones programadas
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      if (!isNotificationsAvailable()) return;
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error al cancelar todas las notificaciones:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las notificaciones programadas
   */
  static async getScheduledNotifications(): Promise<any[]> {
    try {
      if (!isNotificationsAvailable()) return [] as any;
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error al obtener notificaciones programadas:', error);
      throw error;
    }
  }

  /**
   * Programa notificación de resumen diario
   */
  static async programarResumenDiario(configuracion: ConfiguracionApp): Promise<string | null> {
    if (!configuracion.recordatoriosPago) return null;

    try {
      if (!isNotificationsAvailable()) return null;
      
      // Programar para la hora configurada cada día
      const [hora, minutos] = configuracion.horaRecordatorio.split(':').map(Number);
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 Resumen Diario - Gestor de Créditos',
          body: 'Revisa el estado de tus préstamos y cuotas pendientes',
          data: { type: 'resumen_diario' } as NotificationData,
        },
        trigger: {
          hour: hora,
          minute: minutos,
          repeats: true,
        } as any, // Casting para evitar errores de tipos
      });

      return notificationId;
    } catch (error) {
      console.error('Error al programar resumen diario:', error);
      return null;
    }
  }

  /**
   * Programa notificación urgente para cuotas vencidas
   */
  static async programarNotificacionUrgente(
    titulo: string,
    mensaje: string,
    data: NotificationData
  ): Promise<string | null> {
    try {
      if (!isNotificationsAvailable()) return null;
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: titulo,
          body: mensaje,
          data,
          sound: true,
          priority: (Notifications as any).AndroidNotificationPriority?.HIGH ?? 'high',
        },
        trigger: null, // Inmediata
      });

      return notificationId;
    } catch (error) {
      console.error('Error al programar notificación urgente:', error);
      return null;
    }
  }


  /**
   * Cancela notificación específica
   */
  static async cancelarNotificacion(notificationId: string): Promise<void> {
    try {
      if (!isNotificationsAvailable()) return;
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error al cancelar notificación:', error);
    }
  }

  /**
   * Verifica el estado de los permisos
   */
  static async verificarPermisos(): Promise<{
    granted: boolean;
    canAskAgain: boolean;
    status: string;
  }> {
    try {
      if (!isNotificationsAvailable()) {
        return { granted: false, canAskAgain: false, status: 'unsupported' };
      }
      
      const { status, canAskAgain } = await Notifications.getPermissionsAsync();
      return {
        granted: status === 'granted',
        canAskAgain,
        status,
      };
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return { granted: false, canAskAgain: false, status: 'unknown' };
    }
  }
}