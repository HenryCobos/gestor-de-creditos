import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { 
  AppState, 
  AppAction, 
  Cliente, 
  Prestamo, 
  Cuota, 
  Pago, 
  ConfiguracionApp,
  ClienteFormData,
  PrestamoFormData,
  PagoFormData,
  FiltroClientes,
  FiltroPrestamos,
  FiltroCuotas,
} from '../types';
import { StorageService } from '../services/storage';
import { CalculationService } from '../services/calculations';
import { NotificationService } from '../services/notifications';

// ===== ESTADO INICIAL =====
const initialState: AppState = {
  // Datos
  clientes: [],
  prestamos: [],
  cuotas: [],
  pagos: [],
  
  // Estado de UI
  isLoading: false,
  error: null,
  
  // Configuración
  configuracion: {
    moneda: 'COP',
    formatoFecha: 'DD/MM/YYYY',
    recordatoriosPago: true,
    diasAnticipacion: 1,
    horaRecordatorio: '09:00',
    respaldoAutomatico: true,
    tema: 'sistema',
  },
  
  // Filtros activos
  filtroClientes: {},
  filtroPrestamos: {},
  filtroCuotas: {},
};

// ===== REDUCER =====
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Clientes
    case 'SET_CLIENTES':
      return { ...state, clientes: action.payload };
    case 'ADD_CLIENTE':
      return { ...state, clientes: [...state.clientes, action.payload] };
    case 'UPDATE_CLIENTE':
      return {
        ...state,
        clientes: state.clientes.map(cliente =>
          cliente.id === action.payload.id ? action.payload : cliente
        ),
      };
    case 'DELETE_CLIENTE':
      return {
        ...state,
        clientes: state.clientes.filter(cliente => cliente.id !== action.payload),
        prestamos: state.prestamos.filter(prestamo => prestamo.clienteId !== action.payload),
        cuotas: state.cuotas.filter(cuota => cuota.clienteId !== action.payload),
        pagos: state.pagos.filter(pago => pago.clienteId !== action.payload),
      };

    // Préstamos
    case 'SET_PRESTAMOS':
      return { ...state, prestamos: action.payload };
    case 'ADD_PRESTAMO':
      return {
        ...state,
        prestamos: [...state.prestamos, action.payload.prestamo],
        cuotas: [...state.cuotas, ...action.payload.cuotas],
      };
    case 'UPDATE_PRESTAMO':
      return {
        ...state,
        prestamos: state.prestamos.map(prestamo =>
          prestamo.id === action.payload.id ? action.payload : prestamo
        ),
      };
    case 'DELETE_PRESTAMO':
      return {
        ...state,
        prestamos: state.prestamos.filter(prestamo => prestamo.id !== action.payload),
        cuotas: state.cuotas.filter(cuota => cuota.prestamoId !== action.payload),
        pagos: state.pagos.filter(pago => pago.prestamoId !== action.payload),
      };

    // Cuotas
    case 'SET_CUOTAS':
      return { ...state, cuotas: action.payload };
    case 'UPDATE_CUOTA':
      return {
        ...state,
        cuotas: state.cuotas.map(cuota =>
          cuota.id === action.payload.id ? action.payload : cuota
        ),
      };
    case 'MARK_CUOTA_PAID':
      return {
        ...state,
        cuotas: state.cuotas.map(cuota =>
          cuota.id === action.payload.cuotaId 
            ? { ...cuota, estado: 'pagada' as const, fechaPago: action.payload.pago.fechaPago }
            : cuota
        ),
        pagos: [...state.pagos, action.payload.pago],
      };
    case 'UPDATE_CUOTA_WITH_PAYMENT':
      return {
        ...state,
        cuotas: state.cuotas.map(cuota =>
          cuota.id === action.payload.cuotaId 
            ? action.payload.cuotaActualizada
            : cuota
        ),
        pagos: [...state.pagos, action.payload.pago],
      };

    // Pagos
    case 'SET_PAGOS':
      return { ...state, pagos: action.payload };
    case 'ADD_PAGO':
      return { ...state, pagos: [...state.pagos, action.payload] };
    case 'DELETE_PAGO':
      return {
        ...state,
        pagos: state.pagos.filter(pago => pago.id !== action.payload),
      };

    // Estado de UI
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };

    // Configuración
    case 'SET_CONFIGURACION':
      return { ...state, configuracion: action.payload };

    // Filtros
    case 'SET_FILTRO_CLIENTES':
      return { ...state, filtroClientes: action.payload };
    case 'SET_FILTRO_PRESTAMOS':
      return { ...state, filtroPrestamos: action.payload };
    case 'SET_FILTRO_CUOTAS':
      return { ...state, filtroCuotas: action.payload };

    // Inicialización
    case 'INITIALIZE_APP':
      return { ...state, ...action.payload };

    // Reset completo
    case 'RESET_APP':
      return initialState;

    default:
      return state;
  }
}

// ===== CONTEXTO Y PROVIDER =====
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Acciones para clientes
  crearCliente: (formData: ClienteFormData) => Promise<Cliente>;
  actualizarCliente: (clienteId: string, formData: ClienteFormData) => Promise<void>;
  eliminarCliente: (clienteId: string) => Promise<void>;
  obtenerCliente: (clienteId: string) => Cliente | undefined;
  obtenerClientesFiltrados: () => Cliente[];
  
  // Acciones para préstamos
  crearPrestamo: (formData: PrestamoFormData) => Promise<Prestamo>;
  actualizarPrestamo: (prestamoId: string, formData: Partial<PrestamoFormData>) => Promise<void>;
  eliminarPrestamo: (prestamoId: string) => Promise<void>;
  obtenerPrestamo: (prestamoId: string) => Prestamo | undefined;
  obtenerPrestamosFiltrados: () => Prestamo[];
  obtenerPrestamosPorCliente: (clienteId: string) => Prestamo[];
  
  // Acciones para cuotas
  obtenerCuotasFiltradas: () => Cuota[];
  obtenerCuotasPorPrestamo: (prestamoId: string) => Cuota[];
  obtenerCuotasVencidas: () => Cuota[];
  obtenerCuotasProximasVencer: (dias?: number) => Cuota[];
  marcarCuotaPagada: (cuotaId: string, pagoData: PagoFormData) => Promise<void>;
  
  // Acciones para pagos
  obtenerPagosPorCuota: (cuotaId: string) => Pago[];
  obtenerPagosPorPrestamo: (prestamoId: string) => Pago[];
  
  // Acciones de configuración
  actualizarConfiguracion: (configuracion: Partial<ConfiguracionApp>) => Promise<void>;
  
  // Utilidades
  inicializarApp: () => Promise<void>;
  crearRespaldo: () => Promise<string>;
  restaurarRespaldo: (respaldoString: string) => Promise<void>;
  limpiarDatos: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ===== PROVIDER =====
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ===== INICIALIZACIÓN =====
  useEffect(() => {
    inicializarApp();
  }, []);

  const inicializarApp = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Cargar todos los datos del almacenamiento
      const [clientes, prestamos, cuotas, pagos, configuracion] = await Promise.all([
        StorageService.getClientes(),
        StorageService.getPrestamos(),
        StorageService.getCuotas(),
        StorageService.getPagos(),
        StorageService.getConfiguracion(),
      ]);

      // Actualizar estados de cuotas y préstamos
      const cuotasActualizadas = CalculationService.actualizarEstadoCuotas(cuotas);
      
      // Inicializar estado
      dispatch({
        type: 'INITIALIZE_APP',
        payload: {
          clientes,
          prestamos,
          cuotas: cuotasActualizadas,
          pagos,
          configuracion,
        },
      });

      // Programar notificaciones si están habilitadas
      if (configuracion.recordatoriosPago) {
        await programarNotificacionesPagos(cuotasActualizadas, configuracion);
      }

    } catch (error) {
      console.error('Error inicializando app:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar datos' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ===== FUNCIONES PARA CLIENTES =====
  const crearCliente = async (formData: ClienteFormData): Promise<Cliente> => {
    try {
      const cliente: Cliente = {
        id: `cliente_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...formData,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      };

      await StorageService.addCliente(cliente);
      dispatch({ type: 'ADD_CLIENTE', payload: cliente });
      
      return cliente;
    } catch (error) {
      console.error('Error creando cliente:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al crear cliente' });
      throw error;
    }
  };

  const actualizarCliente = async (clienteId: string, formData: ClienteFormData): Promise<void> => {
    try {
      const clienteExistente = state.clientes.find(c => c.id === clienteId);
      if (!clienteExistente) {
        throw new Error('Cliente no encontrado');
      }

      const clienteActualizado: Cliente = {
        ...clienteExistente,
        ...formData,
        fechaActualizacion: new Date().toISOString(),
      };

      await StorageService.updateCliente(clienteActualizado);
      dispatch({ type: 'UPDATE_CLIENTE', payload: clienteActualizado });
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al actualizar cliente' });
      throw error;
    }
  };

  const eliminarCliente = async (clienteId: string): Promise<void> => {
    try {
      await StorageService.deleteCliente(clienteId);
      dispatch({ type: 'DELETE_CLIENTE', payload: clienteId });
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al eliminar cliente' });
      throw error;
    }
  };

  const obtenerCliente = (clienteId: string): Cliente | undefined => {
    return state.clientes.find(c => c.id === clienteId);
  };

  const obtenerClientesFiltrados = (): Cliente[] => {
    let clientesFiltrados = [...state.clientes];
    const filtro = state.filtroClientes;

    // Aplicar búsqueda por nombre
    if (filtro.busqueda) {
      const busqueda = filtro.busqueda.toLowerCase();
      clientesFiltrados = clientesFiltrados.filter(cliente =>
        cliente.nombre.toLowerCase().includes(busqueda) ||
        cliente.telefono.includes(busqueda) ||
        cliente.email?.toLowerCase().includes(busqueda)
      );
    }

    // Aplicar ordenamiento
    if (filtro.orderBy) {
      clientesFiltrados.sort((a, b) => {
        let aValue, bValue;
        
        switch (filtro.orderBy) {
          case 'nombre':
            aValue = a.nombre.toLowerCase();
            bValue = b.nombre.toLowerCase();
            break;
          case 'fechaCreacion':
            aValue = new Date(a.fechaCreacion).getTime();
            bValue = new Date(b.fechaCreacion).getTime();
            break;
          default:
            return 0;
        }

        if (filtro.order === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      });
    }

    return clientesFiltrados;
  };

  // ===== FUNCIONES PARA PRÉSTAMOS =====
  const crearPrestamo = async (formData: PrestamoFormData): Promise<Prestamo> => {
    try {
      const prestamoId = `prestamo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const cronograma = CalculationService.crearPrestamo(prestamoId, formData.clienteId, formData);

      // Guardar préstamo y cuotas
      await Promise.all([
        StorageService.addPrestamo(cronograma.prestamo),
        StorageService.addCuotas(cronograma.cuotas),
      ]);

      // Programar notificaciones
      if (state.configuracion.recordatoriosPago) {
        await programarNotificacionesCuotas(cronograma.cuotas, state.configuracion);
      }

      dispatch({ type: 'ADD_PRESTAMO', payload: cronograma });
      
      return cronograma.prestamo;
    } catch (error) {
      console.error('Error creando préstamo:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al crear préstamo' });
      throw error;
    }
  };

  const actualizarPrestamo = async (prestamoId: string, formData: Partial<PrestamoFormData>): Promise<void> => {
    try {
      const prestamoExistente = state.prestamos.find(p => p.id === prestamoId);
      if (!prestamoExistente) {
        throw new Error('Préstamo no encontrado');
      }

      const prestamoActualizado: Prestamo = {
        ...prestamoExistente,
        ...formData,
        fechaActualizacion: new Date().toISOString(),
      };

      await StorageService.updatePrestamo(prestamoActualizado);
      dispatch({ type: 'UPDATE_PRESTAMO', payload: prestamoActualizado });
    } catch (error) {
      console.error('Error actualizando préstamo:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al actualizar préstamo' });
      throw error;
    }
  };

  const eliminarPrestamo = async (prestamoId: string): Promise<void> => {
    try {
      await StorageService.deletePrestamo(prestamoId);
      dispatch({ type: 'DELETE_PRESTAMO', payload: prestamoId });
    } catch (error) {
      console.error('Error eliminando préstamo:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al eliminar préstamo' });
      throw error;
    }
  };

  const obtenerPrestamo = (prestamoId: string): Prestamo | undefined => {
    return state.prestamos.find(p => p.id === prestamoId);
  };

  const obtenerPrestamosFiltrados = (): Prestamo[] => {
    let prestamosFiltrados = [...state.prestamos];
    const filtro = state.filtroPrestamos;

    // Aplicar búsqueda por texto
    if (filtro.busqueda) {
      const busquedaLower = filtro.busqueda.toLowerCase();
      prestamosFiltrados = prestamosFiltrados.filter(p => {
        const cliente = obtenerCliente(p.clienteId);
        const clienteNombre = cliente?.nombre?.toLowerCase() || '';
        const monto = p.monto.toString();
        
        return clienteNombre.includes(busquedaLower) || 
               monto.includes(busquedaLower);
      });
    }

    // Aplicar filtros
    if (filtro.clienteId) {
      prestamosFiltrados = prestamosFiltrados.filter(p => p.clienteId === filtro.clienteId);
    }

    if (filtro.estado) {
      prestamosFiltrados = prestamosFiltrados.filter(p => p.estado === filtro.estado);
    }

    if (filtro.fechaDesde) {
      prestamosFiltrados = prestamosFiltrados.filter(p => p.fechaPrestamo >= filtro.fechaDesde!);
    }

    if (filtro.fechaHasta) {
      prestamosFiltrados = prestamosFiltrados.filter(p => p.fechaPrestamo <= filtro.fechaHasta!);
    }

    // Aplicar ordenamiento
    if (filtro.orderBy) {
      prestamosFiltrados.sort((a, b) => {
        let aValue, bValue;
        
        switch (filtro.orderBy) {
          case 'fechaPrestamo':
            aValue = new Date(a.fechaPrestamo).getTime();
            bValue = new Date(b.fechaPrestamo).getTime();
            break;
          case 'monto':
            aValue = a.monto;
            bValue = b.monto;
            break;
          case 'fechaVencimiento':
            aValue = new Date(a.fechaVencimiento).getTime();
            bValue = new Date(b.fechaVencimiento).getTime();
            break;
          default:
            return 0;
        }

        if (filtro.order === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      });
    }

    return prestamosFiltrados;
  };

  const obtenerPrestamosPorCliente = (clienteId: string): Prestamo[] => {
    return state.prestamos.filter(p => p.clienteId === clienteId);
  };

  // ===== FUNCIONES PARA CUOTAS =====
  const obtenerCuotasFiltradas = (): Cuota[] => {
    let cuotasFiltradas = [...state.cuotas];
    const filtro = state.filtroCuotas;

    // Aplicar filtros
    if (filtro.clienteId) {
      cuotasFiltradas = cuotasFiltradas.filter(c => c.clienteId === filtro.clienteId);
    }

    if (filtro.prestamoId) {
      cuotasFiltradas = cuotasFiltradas.filter(c => c.prestamoId === filtro.prestamoId);
    }

    if (filtro.estado) {
      cuotasFiltradas = cuotasFiltradas.filter(c => c.estado === filtro.estado);
    }

    if (filtro.fechaDesde) {
      cuotasFiltradas = cuotasFiltradas.filter(c => c.fechaVencimiento >= filtro.fechaDesde!);
    }

    if (filtro.fechaHasta) {
      cuotasFiltradas = cuotasFiltradas.filter(c => c.fechaVencimiento <= filtro.fechaHasta!);
    }

    if (filtro.proximasVencer) {
      const hoy = new Date().toISOString().split('T')[0];
      const en7Dias = new Date();
      en7Dias.setDate(en7Dias.getDate() + 7);
      const en7DiasStr = en7Dias.toISOString().split('T')[0];
      
      cuotasFiltradas = cuotasFiltradas.filter(c => 
        c.estado === 'pendiente' && 
        c.fechaVencimiento >= hoy && 
        c.fechaVencimiento <= en7DiasStr
      );
    }

    // Aplicar ordenamiento
    if (filtro.orderBy) {
      cuotasFiltradas.sort((a, b) => {
        let aValue, bValue;
        
        switch (filtro.orderBy) {
          case 'fechaVencimiento':
            aValue = new Date(a.fechaVencimiento).getTime();
            bValue = new Date(b.fechaVencimiento).getTime();
            break;
          case 'monto':
            aValue = a.montoTotal;
            bValue = b.montoTotal;
            break;
          case 'numeroCuota':
            aValue = a.numeroCuota;
            bValue = b.numeroCuota;
            break;
          default:
            return 0;
        }

        if (filtro.order === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      });
    }

    return cuotasFiltradas;
  };

  const obtenerCuotasPorPrestamo = (prestamoId: string): Cuota[] => {
    return state.cuotas
      .filter(c => c.prestamoId === prestamoId)
      .sort((a, b) => a.numeroCuota - b.numeroCuota);
  };

  const obtenerCuotasVencidas = (): Cuota[] => {
    const hoy = new Date().toISOString().split('T')[0];
    return state.cuotas
      .filter(c => c.estado === 'pendiente' && c.fechaVencimiento < hoy)
      .sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());
  };

  const obtenerCuotasProximasVencer = (dias: number = 7): Cuota[] => {
    const hoy = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + dias);
    
    const hoyStr = hoy.toISOString().split('T')[0];
    const fechaLimiteStr = fechaLimite.toISOString().split('T')[0];
    
    return state.cuotas
      .filter(c => 
        c.estado === 'pendiente' && 
        c.fechaVencimiento >= hoyStr && 
        c.fechaVencimiento <= fechaLimiteStr
      )
      .sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());
  };

  const marcarCuotaPagada = async (cuotaId: string, pagoData: PagoFormData): Promise<void> => {
    try {
      const cuota = state.cuotas.find(c => c.id === cuotaId);
      if (!cuota) {
        throw new Error('Cuota no encontrada');
      }

      // Obtener pagos anteriores para esta cuota
      const pagosAnteriores = obtenerPagosPorCuota(cuotaId);
      const totalPagadoAnterior = pagosAnteriores.reduce((sum, p) => sum + p.monto, 0);
      const nuevoTotalPagado = totalPagadoAnterior + pagoData.monto;

      const pago: Pago = {
        id: `pago_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cuotaId: cuota.id,
        prestamoId: cuota.prestamoId,
        clienteId: cuota.clienteId,
        monto: pagoData.monto,
        fechaPago: pagoData.fechaPago,
        metodoPago: pagoData.metodoPago,
        notas: pagoData.notas,
        fechaCreacion: new Date().toISOString(),
      };

      await StorageService.addPago(pago);
      
      // Determinar el estado de la cuota basado en el total pagado
      let nuevoEstado: Cuota['estado'];
      if (nuevoTotalPagado >= cuota.montoTotal) {
        nuevoEstado = 'pagada';
      } else if (nuevoTotalPagado > 0) {
        nuevoEstado = 'parcial';
      } else {
        nuevoEstado = cuota.estado === 'vencida' ? 'vencida' : 'pendiente';
      }

      // Actualizar estado de la cuota
      const cuotaActualizada: Cuota = {
        ...cuota,
        estado: nuevoEstado,
        fechaPago: nuevoEstado === 'pagada' ? pagoData.fechaPago : cuota.fechaPago,
        montoPagado: nuevoTotalPagado,
      };

      await StorageService.updateCuota(cuotaActualizada);

      // Usar la nueva acción que maneja tanto pagos completos como parciales
      dispatch({ 
        type: 'UPDATE_CUOTA_WITH_PAYMENT', 
        payload: { cuotaId, cuotaActualizada, pago } 
      });

    } catch (error) {
      console.error('Error marcando cuota como pagada:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al registrar pago' });
      throw error;
    }
  };

  // ===== FUNCIONES PARA PAGOS =====
  const obtenerPagosPorCuota = (cuotaId: string): Pago[] => {
    return state.pagos
      .filter(p => p.cuotaId === cuotaId)
      .sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime());
  };

  const obtenerPagosPorPrestamo = (prestamoId: string): Pago[] => {
    return state.pagos
      .filter(p => p.prestamoId === prestamoId)
      .sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime());
  };

  // ===== FUNCIONES DE CONFIGURACIÓN =====
  const actualizarConfiguracion = async (configuracionParcial: Partial<ConfiguracionApp>): Promise<void> => {
    try {
      const nuevaConfiguracion = { ...state.configuracion, ...configuracionParcial };
      await StorageService.saveConfiguracion(nuevaConfiguracion);
      dispatch({ type: 'SET_CONFIGURACION', payload: nuevaConfiguracion });
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al actualizar configuración' });
      throw error;
    }
  };

  // ===== UTILIDADES =====
  const crearRespaldo = async (): Promise<string> => {
    try {
      return await StorageService.createBackup();
    } catch (error) {
      console.error('Error creando respaldo:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al crear respaldo' });
      throw error;
    }
  };

  const restaurarRespaldo = async (respaldoString: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await StorageService.restoreFromBackup(respaldoString);
      await inicializarApp();
    } catch (error) {
      console.error('Error restaurando respaldo:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al restaurar respaldo' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const limpiarDatos = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await StorageService.clearAllData();
      dispatch({ type: 'INITIALIZE_APP', payload: initialState });
    } catch (error) {
      console.error('Error limpiando datos:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al limpiar datos' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ===== FUNCIONES AUXILIARES =====
  const programarNotificacionesPagos = async (cuotas: Cuota[], configuracion: ConfiguracionApp): Promise<void> => {
    try {
      const cuotasProximas = cuotas.filter(cuota => {
        const diasRestantes = Math.ceil(
          (new Date(cuota.fechaVencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return cuota.estado === 'pendiente' && diasRestantes <= configuracion.diasAnticipacion && diasRestantes >= 0;
      });

      for (const cuota of cuotasProximas) {
        const cliente = state.clientes.find(c => c.id === cuota.clienteId);
        if (cliente) {
          await NotificationService.schedulePaymentReminder(
            cliente.nombre,
            new Date(cuota.fechaVencimiento),
            cuota.montoTotal
          );
        }
      }
    } catch (error) {
      console.error('Error programando notificaciones:', error);
    }
  };

  const programarNotificacionesCuotas = async (cuotas: Cuota[], configuracion: ConfiguracionApp): Promise<void> => {
    try {
      for (const cuota of cuotas) {
        const cliente = state.clientes.find(c => c.id === cuota.clienteId);
        if (cliente) {
          const notificationId = await NotificationService.schedulePaymentReminder(
            cliente.nombre,
            new Date(cuota.fechaVencimiento),
            cuota.montoTotal
          );
          
          // Actualizar cuota con ID de notificación
          const cuotaConNotificacion = { ...cuota, notificacionId: notificationId };
          await StorageService.updateCuota(cuotaConNotificacion);
        }
      }
    } catch (error) {
      console.error('Error programando notificaciones de cuotas:', error);
    }
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    
    // Clientes
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    obtenerCliente,
    obtenerClientesFiltrados,
    
    // Préstamos
    crearPrestamo,
    actualizarPrestamo,
    eliminarPrestamo,
    obtenerPrestamo,
    obtenerPrestamosFiltrados,
    obtenerPrestamosPorCliente,
    
    // Cuotas
    obtenerCuotasFiltradas,
    obtenerCuotasPorPrestamo,
    obtenerCuotasVencidas,
    obtenerCuotasProximasVencer,
    marcarCuotaPagada,
    
    // Pagos
    obtenerPagosPorCuota,
    obtenerPagosPorPrestamo,
    
    // Configuración
    actualizarConfiguracion,
    
    // Utilidades
    inicializarApp,
    crearRespaldo,
    restaurarRespaldo,
    limpiarDatos,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// ===== HOOK PERSONALIZADO =====
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
}