import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Cliente, 
  Prestamo, 
  Cuota, 
  Pago, 
  ConfiguracionApp 
} from '../types';

// ===== CLAVES DE ALMACENAMIENTO =====
const KEYS = {
  CLIENTES: '@creditos_app:clientes',
  PRESTAMOS: '@creditos_app:prestamos',
  CUOTAS: '@creditos_app:cuotas',
  PAGOS: '@creditos_app:pagos',
  CONFIGURACION: '@creditos_app:configuracion',
  RESPALDO: '@creditos_app:respaldo',
} as const;

// ===== CONFIGURACIÓN POR DEFECTO =====
const DEFAULT_CONFIG: ConfiguracionApp = {
  moneda: 'COP',
  formatoFecha: 'DD/MM/YYYY',
  recordatoriosPago: true,
  diasAnticipacion: 1,
  horaRecordatorio: '09:00',
  respaldoAutomatico: true,
  tema: 'sistema',
};

// ===== CLASE PRINCIPAL DE ALMACENAMIENTO =====
export class StorageService {
  
  // ===== MÉTODOS GENÉRICOS =====
  
  /**
   * Guarda datos genéricos en AsyncStorage
   */
  private static async setData<T>(key: string, data: T[]): Promise<void> {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonData);
    } catch (error) {
      console.error(`Error guardando ${key}:`, error);
      throw new Error(`No se pudo guardar la información: ${key}`);
    }
  }

  /**
   * Obtiene datos genéricos de AsyncStorage
   */
  private static async getData<T>(key: string, defaultValue: T[] = []): Promise<T[]> {
    try {
      const jsonData = await AsyncStorage.getItem(key);
      if (jsonData === null) {
        return defaultValue;
      }
      return JSON.parse(jsonData) as T[];
    } catch (error) {
      console.error(`Error obteniendo ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Elimina todos los datos (reset completo)
   */
  static async clearAllData(): Promise<void> {
    try {
      const keys = Object.values(KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error limpiando datos:', error);
      throw new Error('No se pudieron limpiar los datos');
    }
  }

  // ===== MÉTODOS PARA CLIENTES =====

  static async getClientes(): Promise<Cliente[]> {
    return await this.getData<Cliente>(KEYS.CLIENTES);
  }

  static async saveClientes(clientes: Cliente[]): Promise<void> {
    await this.setData(KEYS.CLIENTES, clientes);
  }

  static async addCliente(cliente: Cliente): Promise<void> {
    const clientes = await this.getClientes();
    clientes.push(cliente);
    await this.saveClientes(clientes);
  }

  static async updateCliente(clienteActualizado: Cliente): Promise<void> {
    const clientes = await this.getClientes();
    const index = clientes.findIndex(c => c.id === clienteActualizado.id);
    if (index !== -1) {
      clientes[index] = clienteActualizado;
      await this.saveClientes(clientes);
    } else {
      throw new Error('Cliente no encontrado');
    }
  }

  static async deleteCliente(clienteId: string): Promise<void> {
    const clientes = await this.getClientes();
    const clientesFiltrados = clientes.filter(c => c.id !== clienteId);
    await this.saveClientes(clientesFiltrados);
    
    // También eliminar préstamos, cuotas y pagos relacionados
    await this.deletePrestamosByCliente(clienteId);
  }

  static async getClienteById(clienteId: string): Promise<Cliente | null> {
    const clientes = await this.getClientes();
    return clientes.find(c => c.id === clienteId) || null;
  }

  // ===== MÉTODOS PARA PRÉSTAMOS =====

  static async getPrestamos(): Promise<Prestamo[]> {
    return await this.getData<Prestamo>(KEYS.PRESTAMOS);
  }

  static async savePrestamos(prestamos: Prestamo[]): Promise<void> {
    await this.setData(KEYS.PRESTAMOS, prestamos);
  }

  static async addPrestamo(prestamo: Prestamo): Promise<void> {
    const prestamos = await this.getPrestamos();
    prestamos.push(prestamo);
    await this.savePrestamos(prestamos);
  }

  static async updatePrestamo(prestamoActualizado: Prestamo): Promise<void> {
    const prestamos = await this.getPrestamos();
    const index = prestamos.findIndex(p => p.id === prestamoActualizado.id);
    if (index !== -1) {
      prestamos[index] = prestamoActualizado;
      await this.savePrestamos(prestamos);
    } else {
      throw new Error('Préstamo no encontrado');
    }
  }

  static async deletePrestamo(prestamoId: string): Promise<void> {
    const prestamos = await this.getPrestamos();
    const prestamosFiltrados = prestamos.filter(p => p.id !== prestamoId);
    await this.savePrestamos(prestamosFiltrados);
    
    // También eliminar cuotas y pagos relacionados
    await this.deleteCuotasByPrestamo(prestamoId);
  }

  static async deletePrestamosByCliente(clienteId: string): Promise<void> {
    const prestamos = await this.getPrestamos();
    const prestamosCliente = prestamos.filter(p => p.clienteId === clienteId);
    
    // Eliminar cuotas y pagos de cada préstamo
    for (const prestamo of prestamosCliente) {
      await this.deleteCuotasByPrestamo(prestamo.id);
    }
    
    // Eliminar los préstamos
    const prestamosFiltrados = prestamos.filter(p => p.clienteId !== clienteId);
    await this.savePrestamos(prestamosFiltrados);
  }

  static async getPrestamoById(prestamoId: string): Promise<Prestamo | null> {
    const prestamos = await this.getPrestamos();
    return prestamos.find(p => p.id === prestamoId) || null;
  }

  static async getPrestamosByCliente(clienteId: string): Promise<Prestamo[]> {
    const prestamos = await this.getPrestamos();
    return prestamos.filter(p => p.clienteId === clienteId);
  }

  // ===== MÉTODOS PARA CUOTAS =====

  static async getCuotas(): Promise<Cuota[]> {
    return await this.getData<Cuota>(KEYS.CUOTAS);
  }

  static async saveCuotas(cuotas: Cuota[]): Promise<void> {
    await this.setData(KEYS.CUOTAS, cuotas);
  }

  static async addCuotas(cuotas: Cuota[]): Promise<void> {
    const cuotasActuales = await this.getCuotas();
    cuotasActuales.push(...cuotas);
    await this.saveCuotas(cuotasActuales);
  }

  static async updateCuota(cuotaActualizada: Cuota): Promise<void> {
    const cuotas = await this.getCuotas();
    const index = cuotas.findIndex(c => c.id === cuotaActualizada.id);
    if (index !== -1) {
      cuotas[index] = cuotaActualizada;
      await this.saveCuotas(cuotas);
    } else {
      throw new Error('Cuota no encontrada');
    }
  }

  static async deleteCuotasByPrestamo(prestamoId: string): Promise<void> {
    const cuotas = await this.getCuotas();
    const cuotasFiltradas = cuotas.filter(c => c.prestamoId !== prestamoId);
    await this.saveCuotas(cuotasFiltradas);
    
    // También eliminar pagos relacionados
    await this.deletePagosByPrestamo(prestamoId);
  }

  static async getCuotaById(cuotaId: string): Promise<Cuota | null> {
    const cuotas = await this.getCuotas();
    return cuotas.find(c => c.id === cuotaId) || null;
  }

  static async getCuotasByPrestamo(prestamoId: string): Promise<Cuota[]> {
    const cuotas = await this.getCuotas();
    return cuotas.filter(c => c.prestamoId === prestamoId)
      .sort((a, b) => a.numeroCuota - b.numeroCuota);
  }

  static async getCuotasByCliente(clienteId: string): Promise<Cuota[]> {
    const cuotas = await this.getCuotas();
    return cuotas.filter(c => c.clienteId === clienteId)
      .sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());
  }

  static async getCuotasVencidas(): Promise<Cuota[]> {
    const cuotas = await this.getCuotas();
    const hoy = new Date().toISOString().split('T')[0];
    
    return cuotas.filter(c => 
      c.estado === 'pendiente' && 
      c.fechaVencimiento < hoy
    ).sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());
  }

  static async getCuotasProximasVencer(dias: number = 7): Promise<Cuota[]> {
    const cuotas = await this.getCuotas();
    const hoy = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + dias);
    
    const hoyStr = hoy.toISOString().split('T')[0];
    const fechaLimiteStr = fechaLimite.toISOString().split('T')[0];
    
    return cuotas.filter(c => 
      c.estado === 'pendiente' && 
      c.fechaVencimiento >= hoyStr && 
      c.fechaVencimiento <= fechaLimiteStr
    ).sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());
  }

  // ===== MÉTODOS PARA PAGOS =====

  static async getPagos(): Promise<Pago[]> {
    return await this.getData<Pago>(KEYS.PAGOS);
  }

  static async savePagos(pagos: Pago[]): Promise<void> {
    await this.setData(KEYS.PAGOS, pagos);
  }

  static async addPago(pago: Pago): Promise<void> {
    const pagos = await this.getPagos();
    pagos.push(pago);
    await this.savePagos(pagos);
  }

  static async deletePago(pagoId: string): Promise<void> {
    const pagos = await this.getPagos();
    const pagosFiltrados = pagos.filter(p => p.id !== pagoId);
    await this.savePagos(pagosFiltrados);
  }

  static async deletePagosByPrestamo(prestamoId: string): Promise<void> {
    const pagos = await this.getPagos();
    const pagosFiltrados = pagos.filter(p => p.prestamoId !== prestamoId);
    await this.savePagos(pagosFiltrados);
  }

  static async getPagosByCuota(cuotaId: string): Promise<Pago[]> {
    const pagos = await this.getPagos();
    return pagos.filter(p => p.cuotaId === cuotaId)
      .sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime());
  }

  static async getPagosByPrestamo(prestamoId: string): Promise<Pago[]> {
    const pagos = await this.getPagos();
    return pagos.filter(p => p.prestamoId === prestamoId)
      .sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime());
  }

  static async getPagosByCliente(clienteId: string): Promise<Pago[]> {
    const pagos = await this.getPagos();
    return pagos.filter(p => p.clienteId === clienteId)
      .sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime());
  }

  // ===== MÉTODOS PARA CONFIGURACIÓN =====

  static async getConfiguracion(): Promise<ConfiguracionApp> {
    try {
      const configData = await AsyncStorage.getItem(KEYS.CONFIGURACION);
      if (configData === null) {
        // Si no existe configuración, guardar y devolver la por defecto
        await this.saveConfiguracion(DEFAULT_CONFIG);
        return DEFAULT_CONFIG;
      }
      const config = JSON.parse(configData) as ConfiguracionApp;
      
      // Combinar con valores por defecto para nuevas propiedades
      const configCompleta = { ...DEFAULT_CONFIG, ...config };
      return configCompleta;
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      return DEFAULT_CONFIG;
    }
  }

  static async saveConfiguracion(configuracion: ConfiguracionApp): Promise<void> {
    try {
      const jsonData = JSON.stringify(configuracion);
      await AsyncStorage.setItem(KEYS.CONFIGURACION, jsonData);
    } catch (error) {
      console.error('Error guardando configuración:', error);
      throw new Error('No se pudo guardar la configuración');
    }
  }

  // ===== MÉTODOS PARA RESPALDO Y RESTAURACIÓN =====

  /**
   * Crea un respaldo completo de todos los datos
   */
  static async createBackup(): Promise<string> {
    try {
      const [clientes, prestamos, cuotas, pagos, configuracion] = await Promise.all([
        this.getClientes(),
        this.getPrestamos(),
        this.getCuotas(),
        this.getPagos(),
        this.getConfiguracion(),
      ]);

      const backup = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        data: {
          clientes,
          prestamos,
          cuotas,
          pagos,
          configuracion,
        },
      };

      const backupString = JSON.stringify(backup);
      
      // Guardar el respaldo más reciente
      await AsyncStorage.setItem(KEYS.RESPALDO, backupString);
      
      return backupString;
    } catch (error) {
      console.error('Error creando respaldo:', error);
      throw new Error('No se pudo crear el respaldo');
    }
  }

  /**
   * Restaura datos desde un respaldo
   */
  static async restoreFromBackup(backupString: string): Promise<void> {
    try {
      const backup = JSON.parse(backupString);
      
      if (!backup.data) {
        throw new Error('Formato de respaldo inválido');
      }

      const { clientes, prestamos, cuotas, pagos, configuracion } = backup.data;

      // Restaurar todos los datos
      await Promise.all([
        clientes && this.saveClientes(clientes),
        prestamos && this.savePrestamos(prestamos),
        cuotas && this.saveCuotas(cuotas),
        pagos && this.savePagos(pagos),
        configuracion && this.saveConfiguracion(configuracion),
      ]);

    } catch (error) {
      console.error('Error restaurando respaldo:', error);
      throw new Error('No se pudo restaurar el respaldo');
    }
  }

  /**
   * Obtiene información sobre el espacio de almacenamiento utilizado
   */
  static async getStorageInfo(): Promise<{
    totalItems: number;
    clientes: number;
    prestamos: number;
    cuotas: number;
    pagos: number;
    estimatedSize: string;
  }> {
    try {
      const [clientes, prestamos, cuotas, pagos] = await Promise.all([
        this.getClientes(),
        this.getPrestamos(),
        this.getCuotas(),
        this.getPagos(),
      ]);

      const totalItems = clientes.length + prestamos.length + cuotas.length + pagos.length;
      
      // Estimar tamaño (aproximado)
      const dataSize = JSON.stringify({
        clientes,
        prestamos,
        cuotas,
        pagos,
      }).length;
      
      const estimatedSize = dataSize > 1024 * 1024 
        ? `${(dataSize / (1024 * 1024)).toFixed(2)} MB`
        : dataSize > 1024
        ? `${(dataSize / 1024).toFixed(2)} KB`
        : `${dataSize} bytes`;

      return {
        totalItems,
        clientes: clientes.length,
        prestamos: prestamos.length,
        cuotas: cuotas.length,
        pagos: pagos.length,
        estimatedSize,
      };
    } catch (error) {
      console.error('Error obteniendo información de almacenamiento:', error);
      return {
        totalItems: 0,
        clientes: 0,
        prestamos: 0,
        cuotas: 0,
        pagos: 0,
        estimatedSize: '0 bytes',
      };
    }
  }
}