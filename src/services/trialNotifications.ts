import { NotificationService, NotificationData } from './notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TRIAL_NOTIFICATIONS_KEY = '@creditos_app:trial_notifications';
const TRIAL_START_KEY = '@creditos_app:trial_start_time';

export interface TrialNotification {
  id: string;
  title: string;
  body: string;
  triggerTime: number; // minutos después del inicio del trial
  type: 'value_demo' | 'urgency' | 'last_chance';
  data?: any;
}

export class TrialNotificationService {
  private static notifications: TrialNotification[] = [
    {
      id: 'trial_day1_value',
      title: '🎉 ¡Bienvenido a Premium!',
      body: 'Ya tienes acceso completo por 3 días. Prueba crear reportes avanzados y ve el poder de los datos ilimitados.',
      triggerTime: 120, // 2 horas después
      type: 'value_demo',
    },
    {
      id: 'trial_day2_engagement',
      title: '📊 ¿Ya probaste los reportes?',
      body: 'Los reportes completos te ayudan a tomar mejores decisiones. Crea tu primer reporte y ve la diferencia.',
      triggerTime: 1440, // 24 horas después
      type: 'value_demo',
    },
    {
      id: 'trial_day2_features',
      title: '🔔 Personaliza tus notificaciones',
      body: 'Configura recordatorios personalizados para nunca perder un pago. Ve a Configuración > Notificaciones.',
      triggerTime: 1800, // 30 horas después
      type: 'value_demo',
    },
    {
      id: 'trial_day3_urgency',
      title: '⏰ Último día de trial',
      body: 'Tu trial gratuito expira en 24 horas. Activa Premium para mantener acceso a todos tus datos.',
      triggerTime: 2880, // 48 horas después
      type: 'urgency',
    },
    {
      id: 'trial_day3_last_chance',
      title: '🚨 ¡Trial expira pronto!',
      body: 'Solo quedan 6 horas. Sin Premium perderás acceso a todos tus clientes y préstamos registrados.',
      triggerTime: 4140, // 69 horas después (3 horas antes de expirar)
      type: 'last_chance',
    },
    {
      id: 'trial_expired',
      title: '❌ Trial expirado',
      body: 'Tu trial gratuito ha expirado. Activa Premium para recuperar acceso a todos tus datos.',
      triggerTime: 4320, // 72 horas después
      type: 'last_chance',
    },
  ];

  static async scheduleTrialNotifications(): Promise<void> {
    try {
      const trialStartTime = await AsyncStorage.getItem(TRIAL_START_KEY);
      if (!trialStartTime) {
        console.log('No hay trial activo para programar notificaciones');
        return;
      }

      const startTime = parseInt(trialStartTime, 10);
      const now = Date.now();
      
      // Cancelar notificaciones anteriores
      await this.cancelTrialNotifications();

      // Programar nuevas notificaciones
      for (const notification of this.notifications) {
        const triggerTime = startTime + (notification.triggerTime * 60 * 1000);
        
        // Solo programar si el tiempo de activación es en el futuro
        if (triggerTime > now) {
          const delaySeconds = Math.floor((triggerTime - now) / 1000);
          
          await NotificationService.scheduleNotification({
            title: notification.title,
            body: notification.body,
            data: {
              type: 'trial_notification',
              notificationId: notification.id,
              trialType: notification.type,
            } as NotificationData,
            trigger: { seconds: delaySeconds },
          });

          console.log(`Notificación programada: ${notification.id} en ${delaySeconds} segundos`);
        }
      }

      // Guardar que las notificaciones fueron programadas
      await AsyncStorage.setItem(TRIAL_NOTIFICATIONS_KEY, 'scheduled');
    } catch (error) {
      console.error('Error programando notificaciones de trial:', error);
    }
  }

  static async cancelTrialNotifications(): Promise<void> {
    try {
      // En una implementación real, cancelarías las notificaciones específicas
      // Por ahora solo marcamos como canceladas
      await AsyncStorage.removeItem(TRIAL_NOTIFICATIONS_KEY);
      console.log('Notificaciones de trial canceladas');
    } catch (error) {
      console.error('Error cancelando notificaciones de trial:', error);
    }
  }

  static async startTrial(): Promise<void> {
    try {
      const trialStartTime = Date.now().toString();
      await AsyncStorage.setItem(TRIAL_START_KEY, trialStartTime);
      await this.scheduleTrialNotifications();
      console.log('Trial iniciado y notificaciones programadas');
    } catch (error) {
      console.error('Error iniciando trial:', error);
    }
  }

  static async endTrial(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TRIAL_START_KEY);
      await this.cancelTrialNotifications();
      console.log('Trial finalizado y notificaciones canceladas');
    } catch (error) {
      console.error('Error finalizando trial:', error);
    }
  }

  static async getTrialTimeRemaining(): Promise<number> {
    try {
      const trialStartTime = await AsyncStorage.getItem(TRIAL_START_KEY);
      if (!trialStartTime) return 0;

      const startTime = parseInt(trialStartTime, 10);
      const now = Date.now();
      const elapsed = now - startTime;
      const totalTrialTime = 3 * 24 * 60 * 60 * 1000; // 3 días en milisegundos
      
      return Math.max(0, totalTrialTime - elapsed);
    } catch (error) {
      console.error('Error calculando tiempo restante del trial:', error);
      return 0;
    }
  }

  static async isTrialActive(): Promise<boolean> {
    try {
      const timeRemaining = await this.getTrialTimeRemaining();
      return timeRemaining > 0;
    } catch (error) {
      console.error('Error verificando estado del trial:', error);
      return false;
    }
  }

  static getNotificationForType(type: 'value_demo' | 'urgency' | 'last_chance'): TrialNotification[] {
    return this.notifications.filter(n => n.type === type);
  }

  static async scheduleCustomTrialNotification(
    title: string,
    body: string,
    delayMinutes: number,
    type: 'value_demo' | 'urgency' | 'last_chance' = 'value_demo'
  ): Promise<void> {
    try {
      const delaySeconds = delayMinutes * 60;
      
      await NotificationService.scheduleNotification({
        title,
        body,
        data: {
          type: 'trial_notification',
          notificationId: `custom_${Date.now()}`,
          trialType: type,
        } as NotificationData,
        trigger: { seconds: delaySeconds },
      });

      console.log(`Notificación personalizada programada: ${title} en ${delayMinutes} minutos`);
    } catch (error) {
      console.error('Error programando notificación personalizada:', error);
    }
  }
}
