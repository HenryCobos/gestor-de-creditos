import AsyncStorage from '@react-native-async-storage/async-storage';

// Clave para almacenar el estado de desarrollo
const DEV_TOOLS_KEY = '@creditos_app:dev_tools';

interface DevToolsConfig {
  simulatePremium: boolean;
  overrideLimits: {
    maxClientes: number;
    maxPrestamosActivos: number;
  };
  showDevControls: boolean;
}

const DEFAULT_CONFIG: DevToolsConfig = {
  simulatePremium: false,
  overrideLimits: {
    maxClientes: 10,
    maxPrestamosActivos: 10,
  },
  showDevControls: __DEV__, // Solo en desarrollo
};

export class DevToolsService {
  private static config: DevToolsConfig = DEFAULT_CONFIG;
  private static listeners: Array<(config: DevToolsConfig) => void> = [];

  /**
   * Inicializa las herramientas de desarrollo
   */
  static async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(DEV_TOOLS_KEY);
      if (stored) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
      this.notifyListeners();
    } catch (error) {
      console.error('Error cargando configuración de desarrollo:', error);
    }
  }

  /**
   * Obtiene la configuración actual
   */
  static getConfig(): DevToolsConfig {
    return { ...this.config };
  }

  /**
   * Simula estado premium
   */
  static async setSimulatePremium(simulate: boolean): Promise<void> {
    this.config.simulatePremium = simulate;
    await this.saveConfig();
    this.notifyListeners();
    console.log(`🎭 Modo Premium simulado: ${simulate ? 'ACTIVADO' : 'DESACTIVADO'}`);
  }

  /**
   * Establece límites personalizados
   */
  static async setOverrideLimits(limits: Partial<DevToolsConfig['overrideLimits']>): Promise<void> {
    this.config.overrideLimits = { ...this.config.overrideLimits, ...limits };
    await this.saveConfig();
    this.notifyListeners();
    console.log('🔧 Límites personalizados actualizados:', this.config.overrideLimits);
  }

  /**
   * Alterna la visibilidad de los controles de desarrollo
   */
  static async toggleDevControls(): Promise<void> {
    this.config.showDevControls = !this.config.showDevControls;
    await this.saveConfig();
    this.notifyListeners();
    console.log(`🛠️ Controles de desarrollo: ${this.config.showDevControls ? 'VISIBLES' : 'OCULTOS'}`);
  }

  /**
   * Resetea la configuración a valores por defecto
   */
  static async reset(): Promise<void> {
    this.config = { ...DEFAULT_CONFIG };
    await this.saveConfig();
    this.notifyListeners();
    console.log('🔄 Configuración de desarrollo reseteada');
  }

  /**
   * Verifica si debe simular premium
   */
  static shouldSimulatePremium(): boolean {
    return this.config.simulatePremium;
  }

  /**
   * Obtiene límites personalizados
   */
  static getOverrideLimits(): DevToolsConfig['overrideLimits'] {
    return { ...this.config.overrideLimits };
  }

  /**
   * Verifica si los controles de desarrollo deben ser visibles
   */
  static shouldShowDevControls(): boolean {
    return this.config.showDevControls;
  }

  /**
   * Suscribe a cambios en la configuración
   */
  static subscribe(listener: (config: DevToolsConfig) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Guarda la configuración
   */
  private static async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem(DEV_TOOLS_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('Error guardando configuración de desarrollo:', error);
    }
  }

  /**
   * Notifica a los listeners
   */
  private static notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.config }));
  }
}
