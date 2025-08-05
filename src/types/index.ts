// ===== ENTIDADES PRINCIPALES =====

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  direccion?: string;
  notas?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface Prestamo {
  id: string;
  clienteId: string;
  monto: number;
  fechaPrestamo: string;
  numeroCuotas: number;
  tasaInteres: number;
  periodoTasa: 'anual' | 'mensual' | 'quincenal' | 'semanal';
  tipoInteres: 'simple' | 'compuesto' | 'mensual_fijo' | 'mensual_sobre_saldo' | 'mensual_directo';
  frecuenciaPago: 'diario' | 'semanal' | 'quincenal' | 'mensual';
  fechaVencimiento: string;
  estado: 'activo' | 'pagado' | 'vencido' | 'cancelado';
  notas?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  // Campos calculados
  montoTotal: number;
  montoInteres: number;
  montoCuota: number;
}

export interface Cuota {
  id: string;
  prestamoId: string;
  clienteId: string;
  numeroCuota: number;
  fechaVencimiento: string;
  montoCapital: number;
  montoInteres: number;
  montoTotal: number;
  estado: 'pendiente' | 'pagada' | 'vencida' | 'parcial';
  fechaPago?: string;
  montoPagado?: number;
  notas?: string;
  notificacionId?: string; // ID de la notificación programada
}

export interface Pago {
  id: string;
  cuotaId: string;
  prestamoId: string;
  clienteId: string;
  monto: number;
  fechaPago: string;
  metodoPago?: 'efectivo' | 'transferencia' | 'cheque' | 'otro';
  notas?: string;
  fechaCreacion: string;
}

// ===== TIPOS PARA FORMULARIOS =====

export interface ClienteFormData {
  nombre: string;
  telefono: string;
  email?: string;
  direccion?: string;
  notas?: string;
}

export interface PrestamoFormData {
  clienteId: string;
  monto: number;
  fechaPrestamo: string;
  numeroCuotas: number;
  tasaInteres: number;
  periodoTasa: 'anual' | 'mensual' | 'quincenal' | 'semanal';
  tipoInteres: 'simple' | 'compuesto' | 'mensual_fijo' | 'mensual_sobre_saldo' | 'mensual_directo';
  frecuenciaPago: 'diario' | 'semanal' | 'quincenal' | 'mensual';
  notas?: string;
}

export interface PagoFormData {
  cuotaId: string;
  monto: number;
  fechaPago: string;
  metodoPago?: 'efectivo' | 'transferencia' | 'cheque' | 'otro';
  notas?: string;
}

// ===== TIPOS PARA REPORTES =====

export interface ReporteResumen {
  totalPrestado: number;
  totalRecuperado: number;
  totalIntereses: number;
  totalPendiente: number;
  clientesActivos: number;
  prestamosActivos: number;
  cuotasVencidas: number;
}

export interface ReporteCliente {
  cliente: Cliente;
  totalPrestado: number;
  totalPagado: number;
  totalPendiente: number;
  prestamosActivos: number;
  cuotasVencidas: number;
  ultimoPago?: string;
}

export interface ReporteMensual {
  mes: string;
  año: number;
  totalPrestado: number;
  totalRecuperado: number;
  interesesGanados: number;
  nuevosClientes: number;
  nuevosPrestamos: number;
}

// ===== TIPOS PARA FILTROS Y BÚSQUEDAS =====

export interface FiltroClientes {
  busqueda?: string;
  orderBy?: 'nombre' | 'fechaCreacion' | 'totalPrestado';
  order?: 'asc' | 'desc';
}

export interface FiltroPrestamos {
  busqueda?: string;
  clienteId?: string;
  estado?: Prestamo['estado'];
  fechaDesde?: string;
  fechaHasta?: string;
  orderBy?: 'fechaPrestamo' | 'monto' | 'fechaVencimiento';
  order?: 'asc' | 'desc';
}

export interface FiltroCuotas {
  clienteId?: string;
  prestamoId?: string;
  estado?: Cuota['estado'];
  fechaDesde?: string;
  fechaHasta?: string;
  proximasVencer?: boolean; // Próximas 7 días
  orderBy?: 'fechaVencimiento' | 'monto' | 'numeroCuota';
  order?: 'asc' | 'desc';
}

// ===== TIPOS PARA NAVEGACIÓN =====

export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Clientes: undefined;
  ClienteDetalle: { clienteId: string };
  ClienteForm: { clienteId?: string };
  Prestamos: { clienteId?: string };
  PrestamoDetalle: { prestamoId: string };
  PrestamoForm: { clienteId?: string; prestamoId?: string };
  Pagos: { prestamoId?: string };
  PagoForm: { cuotaId: string };
  Calendario: undefined;
  Reportes: undefined;
  Configuracion: undefined;
};

// ===== TIPOS PARA CONFIGURACIÓN =====

export interface ConfiguracionApp {
  moneda: string;
  formatoFecha: string;
  recordatoriosPago: boolean;
  diasAnticipacion: number;
  horaRecordatorio: string;
  respaldoAutomatico: boolean;
  tema: 'claro' | 'oscuro' | 'sistema';
}

// ===== TIPOS PARA ESTADO DE LA APP =====

export interface AppState {
  // Datos
  clientes: Cliente[];
  prestamos: Prestamo[];
  cuotas: Cuota[];
  pagos: Pago[];
  
  // Estado de UI
  isLoading: boolean;
  error: string | null;
  
  // Configuración
  configuracion: ConfiguracionApp;
  
  // Filtros activos
  filtroClientes: FiltroClientes;
  filtroPrestamos: FiltroPrestamos;
  filtroCuotas: FiltroCuotas;
}

// ===== ACCIONES PARA EL REDUCER =====

export type AppAction =
  // Clientes
  | { type: 'SET_CLIENTES'; payload: Cliente[] }
  | { type: 'ADD_CLIENTE'; payload: Cliente }
  | { type: 'UPDATE_CLIENTE'; payload: Cliente }
  | { type: 'DELETE_CLIENTE'; payload: string }
  
  // Préstamos
  | { type: 'SET_PRESTAMOS'; payload: Prestamo[] }
  | { type: 'ADD_PRESTAMO'; payload: { prestamo: Prestamo; cuotas: Cuota[] } }
  | { type: 'UPDATE_PRESTAMO'; payload: Prestamo }
  | { type: 'DELETE_PRESTAMO'; payload: string }
  
  // Cuotas
  | { type: 'SET_CUOTAS'; payload: Cuota[] }
  | { type: 'UPDATE_CUOTA'; payload: Cuota }
  | { type: 'MARK_CUOTA_PAID'; payload: { cuotaId: string; pago: Pago } }
  
  // Pagos
  | { type: 'SET_PAGOS'; payload: Pago[] }
  | { type: 'ADD_PAGO'; payload: Pago }
  | { type: 'DELETE_PAGO'; payload: string }
  
  // Estado de UI
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  
  // Configuración
  | { type: 'SET_CONFIGURACION'; payload: ConfiguracionApp }
  
  // Filtros
  | { type: 'SET_FILTRO_CLIENTES'; payload: FiltroClientes }
  | { type: 'SET_FILTRO_PRESTAMOS'; payload: FiltroPrestamos }
  | { type: 'SET_FILTRO_CUOTAS'; payload: FiltroCuotas }
  
  // Inicialización
  | { type: 'INITIALIZE_APP'; payload: Partial<AppState> }
  
  // Reset completo
  | { type: 'RESET_APP' };

// ===== CONSTANTES =====

export const FRECUENCIAS_PAGO = [
  { value: 'diario', label: 'Diario' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' },
] as const;

export const PERIODOS_TASA = [
  { value: 'anual', label: 'Anual' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'semanal', label: 'Semanal' },
] as const;

export const TIPOS_INTERES = [
  { value: 'simple', label: 'Interés Simple' },
  { value: 'compuesto', label: 'Interés Compuesto' },
  { value: 'mensual_fijo', label: 'Interés Mensual Fijo' },
  { value: 'mensual_sobre_saldo', label: 'Interés Mensual sobre Saldo' },
  { value: 'mensual_directo', label: 'Interés Mensual Directo' },
] as const;

export const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'otro', label: 'Otro' },
] as const;

export const ESTADOS_PRESTAMO = [
  { value: 'activo', label: 'Activo', color: '#4CAF50' },
  { value: 'pagado', label: 'Pagado', color: '#2196F3' },
  { value: 'vencido', label: 'Vencido', color: '#F44336' },
  { value: 'cancelado', label: 'Cancelado', color: '#757575' },
] as const;

export const ESTADOS_CUOTA = [
  { value: 'pendiente', label: 'Pendiente', color: '#FF9800' },
  { value: 'pagada', label: 'Pagada', color: '#4CAF50' },
  { value: 'vencida', label: 'Vencida', color: '#F44336' },
  { value: 'parcial', label: 'Parcial', color: '#2196F3' },
] as const;