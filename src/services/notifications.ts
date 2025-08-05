import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ConfiguracionApp } from '../types';

// Configuración de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Tipos para el servicio de notificaciones
export interface NotificationData {
  type: 'cuota_vencimiento' | 'prestamo_vencido' | 'recordatorio_pago' | 'resumen_diario';
  cuotaId?: string;
  prestamoId?: string;
  clienteId?: string;
  monto?: number;
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

export class NotificationService {
  /**
   * Inicializa el servicio de notificaciones
   */
  static async initialize(): Promise<void> {
    try {
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

      // Configurar canal de notificación en Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
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
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
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
    // Programar notificación 1 día antes
    const reminderDate = new Date(paymentDate);
    reminderDate.setDate(reminderDate.getDate() - 1);
    reminderDate.setHours(9, 0, 0, 0); // 9:00 AM

    const title = 'Recordatorio de Pago';
    const body = `Mañana vence el pago de ${creditName} por $${amount.toLocaleString()}`;

    return await this.scheduleNotification(title, body, {
      channelId: 'default',
      date: reminderDate,
    } as any);
  }

  /**
   * Cancela una notificación programada
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    try {
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
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error al cancelar todas las notificaciones:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las notificaciones programadas
   */
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
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
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: titulo,
          body: mensaje,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
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