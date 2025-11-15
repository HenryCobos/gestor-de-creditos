import { Prestamo, Cuota, PrestamoFormData } from '../types';
import { addDays, addWeeks, addMonths, format, parseISO } from 'date-fns';

// ===== TIPOS PARA CÁLCULOS =====

interface CronogramaPago {
  prestamo: Prestamo;
  cuotas: Cuota[];
}

interface CalculoInteres {
  montoTotal: number;
  montoInteres: number;
  montoCuota: number;
}

// ===== CLASE PRINCIPAL DE CÁLCULOS =====
export class CalculationService {

  /**
   * Convierte cualquier tasa a tasa anual para cálculos
   */
  static convertirTasaAAnual(
    tasa: number,
    periodoTasa: 'anual' | 'mensual' | 'quincenal' | 'semanal'
  ): number {
    switch (periodoTasa) {
      case 'anual':
        return tasa;
      case 'mensual':
        return tasa * 12;
      case 'quincenal':
        return tasa * 24; // 24 quincenas al año
      case 'semanal':
        return tasa * 52; // 52 semanas al año
      default:
        return tasa;
    }
  }

  /**
   * Calcula el interés simple
   * Fórmula: I = P * r * t
   * Donde: P = capital, r = tasa (decimal), t = tiempo
   */
  static calcularInteresSimple(
    capital: number,
    tasa: number,
    periodoTasa: 'anual' | 'mensual' | 'quincenal' | 'semanal',
    numeroCuotas: number,
    frecuenciaPago: Prestamo['frecuenciaPago']
  ): CalculoInteres {
    // Asegurar que los valores de entrada sean válidos
    capital = Number(capital) || 0;
    tasa = Number(tasa) || 0;
    numeroCuotas = Number(numeroCuotas) || 1;
    
    let montoInteres: number;
    
    // Convertir tasa a decimal
    const tasaDecimal = tasa / 100;
    
    if (periodoTasa === 'anual') {
      // Para tasa anual, calcular tiempo en años
      const tiempoEnAños = this.calcularTiempoEnAños(numeroCuotas, frecuenciaPago);
      montoInteres = capital * tasaDecimal * tiempoEnAños;
    } else if (periodoTasa === 'mensual') {
      // Para tasa mensual, calcular tiempo en meses
      const tiempoEnMeses = this.calcularTiempoEnMeses(numeroCuotas, frecuenciaPago);
      montoInteres = capital * tasaDecimal * tiempoEnMeses;
    } else if (periodoTasa === 'quincenal') {
      // Para tasa quincenal, calcular tiempo en quincenas
      const tiempoEnQuincenas = this.calcularTiempoEnQuincenas(numeroCuotas, frecuenciaPago);
      montoInteres = capital * tasaDecimal * tiempoEnQuincenas;
    } else if (periodoTasa === 'semanal') {
      // Para tasa semanal, calcular tiempo en semanas
      const tiempoEnSemanas = this.calcularTiempoEnSemanas(numeroCuotas, frecuenciaPago);
      montoInteres = capital * tasaDecimal * tiempoEnSemanas;
    } else {
      // Fallback: usar cálculo anual
      const tiempoEnAños = this.calcularTiempoEnAños(numeroCuotas, frecuenciaPago);
      montoInteres = capital * tasaDecimal * tiempoEnAños;
    }
    
    // Redondear a 2 decimales para evitar problemas de punto flotante
    montoInteres = Math.round(montoInteres * 100) / 100;
    const montoTotal = Math.round((capital + montoInteres) * 100) / 100;
    const montoCuota = Math.round((montoTotal / numeroCuotas) * 100) / 100;

    return {
      montoTotal,
      montoInteres,
      montoCuota,
    };
  }

  /**
   * Calcula el interés compuesto
   * Fórmula: A = P(1 + r/n)^(nt)
   * Donde: P = capital, r = tasa anual, n = frecuencia de capitalización, t = tiempo
   */
  static calcularInteresCompuesto(
    capital: number,
    tasa: number,
    periodoTasa: 'anual' | 'mensual' | 'quincenal' | 'semanal',
    numeroCuotas: number,
    frecuenciaPago: Prestamo['frecuenciaPago']
  ): CalculoInteres {
    // Convertir tasa a anual para el cálculo
    const tasaAnual = this.convertirTasaAAnual(tasa, periodoTasa);
    const tasaDecimal = tasaAnual / 100;
    
    // Obtener la frecuencia de capitalización por año
    const frecuenciaAnual = this.getFrecuenciaAnual(frecuenciaPago);
    
    // Calcular el tiempo en años
    const tiempoEnAños = this.calcularTiempoEnAños(numeroCuotas, frecuenciaPago);
    
    // Calcular interés compuesto
    const montoTotal = capital * Math.pow((1 + tasaDecimal / frecuenciaAnual), frecuenciaAnual * tiempoEnAños);
    const montoInteres = montoTotal - capital;
    const montoCuota = montoTotal / numeroCuotas;

    return {
      montoTotal,
      montoInteres,
      montoCuota,
    };
  }

  /**
   * Calcula el interés mensual fijo
   * El interés se aplica de forma fija cada mes sobre el capital inicial
   */
  static calcularInteresMensualFijo(
    capital: number,
    tasa: number,
    periodoTasa: 'anual' | 'mensual' | 'quincenal' | 'semanal',
    numeroCuotas: number,
    frecuenciaPago: Prestamo['frecuenciaPago']
  ): CalculoInteres {
    // Convertir tasa a mensual para este cálculo
    let tasaMensual: number;
    switch (periodoTasa) {
      case 'anual':
        tasaMensual = tasa / 12;
        break;
      case 'mensual':
        tasaMensual = tasa;
        break;
      case 'quincenal':
        tasaMensual = tasa * 2; // 2 quincenas por mes
        break;
      case 'semanal':
        tasaMensual = tasa * 4.33; // ~4.33 semanas por mes
        break;
      default:
        tasaMensual = tasa;
    }
    
    const tasaDecimal = tasaMensual / 100;
    
    // Para interés mensual fijo, calcular tiempo de forma más intuitiva
    const mesesTotales = this.calcularTiempoParaInteresMensual(numeroCuotas, frecuenciaPago);
    
    // Calcular interés mensual fijo
    const montoInteres = capital * tasaDecimal * mesesTotales;
    const montoTotal = capital + montoInteres;
    const montoCuota = montoTotal / numeroCuotas;

    return {
      montoTotal,
      montoInteres,
      montoCuota,
    };
  }

  /**
   * Calcula el interés mensual sobre saldo
   * El interés se aplica cada mes sobre el saldo pendiente
   */
  static calcularInteresMensualSobreSaldo(
    capital: number,
    tasa: number,
    periodoTasa: 'anual' | 'mensual' | 'quincenal' | 'semanal',
    numeroCuotas: number,
    frecuenciaPago: Prestamo['frecuenciaPago']
  ): CalculoInteres {
    // Convertir tasa a mensual para este cálculo
    let tasaMensual: number;
    switch (periodoTasa) {
      case 'anual':
        tasaMensual = tasa / 12;
        break;
      case 'mensual':
        tasaMensual = tasa;
        break;
      case 'quincenal':
        tasaMensual = tasa * 2; // 2 quincenas por mes
        break;
      case 'semanal':
        tasaMensual = tasa * 4.33; // ~4.33 semanas por mes
        break;
      default:
        tasaMensual = tasa;
    }
    
    const tasaDecimal = tasaMensual / 100;
    
    // Para interés mensual sobre saldo, usar tiempo más intuitivo
    const mesesTotales = this.calcularTiempoParaInteresMensual(numeroCuotas, frecuenciaPago);
    
    // Calcular cuota de capital fija
    const capitalPorCuota = capital / numeroCuotas;
    
    // Calcular interés total sumando interés sobre saldo decreciente
    let montoInteres = 0;
    let saldoPendiente = capital;
    
    // Aplicar interés mensual proporcionalmente al tiempo
    const interesPorPeriodo = tasaDecimal / mesesTotales;
    
    for (let i = 0; i < numeroCuotas; i++) {
      montoInteres += saldoPendiente * interesPorPeriodo;
      saldoPendiente -= capitalPorCuota;
    }
    
    const montoTotal = capital + montoInteres;
    const montoCuota = montoTotal / numeroCuotas;

    return {
      montoTotal,
      montoInteres,
      montoCuota,
    };
  }

  /**
   * Calcula el tiempo en meses según la frecuencia de pago
   */
  static calcularTiempoEnMeses(numeroCuotas: number, frecuenciaPago: Prestamo['frecuenciaPago']): number {
    numeroCuotas = Number(numeroCuotas) || 1;
    switch (frecuenciaPago) {
      case 'diario':
        return numeroCuotas / 30; // Aproximadamente 30 días por mes
      case 'semanal':
        return numeroCuotas / 4; // 4 semanas por mes
      case 'quincenal':
        return numeroCuotas / 2; // 2 quincenas por mes
      case 'mensual':
        return numeroCuotas;
      default:
        return numeroCuotas;
    }
  }

  /**
   * Calcula el tiempo en quincenas según la frecuencia de pago
   */
  static calcularTiempoEnQuincenas(numeroCuotas: number, frecuenciaPago: Prestamo['frecuenciaPago']): number {
    numeroCuotas = Number(numeroCuotas) || 1;
    switch (frecuenciaPago) {
      case 'diario':
        return numeroCuotas / 15; // Aproximadamente 15 días por quincena
      case 'semanal':
        return numeroCuotas / 2; // 2 semanas por quincena
      case 'quincenal':
        return numeroCuotas;
      case 'mensual':
        return numeroCuotas * 2; // 2 quincenas por mes
      default:
        return numeroCuotas;
    }
  }

  /**
   * Calcula el tiempo en semanas según la frecuencia de pago
   */
  static calcularTiempoEnSemanas(numeroCuotas: number, frecuenciaPago: Prestamo['frecuenciaPago']): number {
    numeroCuotas = Number(numeroCuotas) || 1;
    switch (frecuenciaPago) {
      case 'diario':
        return numeroCuotas / 7; // 7 días por semana
      case 'semanal':
        return numeroCuotas;
      case 'quincenal':
        return numeroCuotas * 2; // 2 semanas por quincena
      case 'mensual':
        return numeroCuotas * 4; // 4 semanas por mes
      default:
        return numeroCuotas;
    }
  }

  /**
   * Calcula el tiempo en meses para interés mensual de forma más intuitiva
   * Ejemplo: 24 cuotas diarias = 1 mes, 48 cuotas diarias = 2 meses
   */
  static calcularTiempoParaInteresMensual(numeroCuotas: number, frecuenciaPago: Prestamo['frecuenciaPago']): number {
    switch (frecuenciaPago) {
      case 'diario':
        // Para pagos diarios: cada 30 cuotas o menos = 1 mes
        return Math.max(1, Math.ceil(numeroCuotas / 30));
      case 'semanal':
        // Para pagos semanales: cada 4 cuotas o menos = 1 mes  
        return Math.max(1, Math.ceil(numeroCuotas / 4));
      case 'quincenal':
        // Para pagos quincenales: cada 2 cuotas o menos = 1 mes
        return Math.max(1, Math.ceil(numeroCuotas / 2));
      case 'mensual':
        // Para pagos mensuales: cada cuota = 1 mes
        return numeroCuotas;
      default:
        return Math.max(1, numeroCuotas);
    }
  }

  /**
   * Calcula el interés mensual directo
   * Aplica el porcentaje directamente sin conversiones - perfecto para casos como:
   * $200 al 20% mensual por 1 mes = $240 total
   */
  static calcularInteresMensualDirecto(
    capital: number,
    tasa: number,
    periodoTasa: 'anual' | 'mensual' | 'quincenal' | 'semanal',
    numeroCuotas: number,
    frecuenciaPago: Prestamo['frecuenciaPago']
  ): CalculoInteres {
    // Si la tasa es mensual, aplicarla directamente
    // Si no, convertir a equivalente mensual
    let tasaAplicar: number;
    
    if (periodoTasa === 'mensual') {
      tasaAplicar = tasa;
    } else {
      // Convertir otras tasas a mensual
      switch (periodoTasa) {
        case 'anual':
          tasaAplicar = tasa / 12;
          break;
        case 'quincenal':
          tasaAplicar = tasa * 2;
          break;
        case 'semanal':
          tasaAplicar = tasa * 4.33;
          break;
        default:
          tasaAplicar = tasa;
      }
    }

    // Calcular interés directo: capital × tasa × tiempo
    const tasaDecimal = tasaAplicar / 100;
    const tiempoEnMeses = this.calcularTiempoParaInteresMensual(numeroCuotas, frecuenciaPago);
    
    const montoInteres = capital * tasaDecimal * tiempoEnMeses;
    const montoTotal = capital + montoInteres;
    const montoCuota = montoTotal / numeroCuotas;

    return {
      montoTotal,
      montoInteres,
      montoCuota,
    };
  }

  /**
   * Crea un préstamo completo con todos los cálculos
   */
  static crearPrestamo(
    id: string,
    clienteId: string,
    formData: PrestamoFormData,
    fechaCreacion: string = new Date().toISOString()
  ): CronogramaPago {
    // Validar datos de entrada
    const validacion = this.validarDatosPrestamo(formData);
    if (!validacion.valido) {
      throw new Error(`Datos de préstamo inválidos: ${validacion.errores.join(', ')}`);
    }

    // Asegurar que todos los valores numéricos sean válidos
    const datosValidados: PrestamoFormData = {
      ...formData,
      monto: Number(formData.monto) || 0,
      numeroCuotas: Number(formData.numeroCuotas) || 1,
      tasaInteres: Number(formData.tasaInteres) || 0,
    };
    
    // Calcular montos según el tipo de interés
    let calculo: CalculoInteres;
    
    switch (datosValidados.tipoInteres) {
      case 'simple':
        calculo = this.calcularInteresSimple(
          datosValidados.monto,
          datosValidados.tasaInteres,
          datosValidados.periodoTasa,
          datosValidados.numeroCuotas,
          datosValidados.frecuenciaPago
        );
        break;
      case 'compuesto':
        calculo = this.calcularInteresCompuesto(
          datosValidados.monto,
          datosValidados.tasaInteres,
          datosValidados.periodoTasa,
          datosValidados.numeroCuotas,
          datosValidados.frecuenciaPago
        );
        break;
      case 'mensual_fijo':
        calculo = this.calcularInteresMensualFijo(
          datosValidados.monto,
          datosValidados.tasaInteres,
          datosValidados.periodoTasa,
          datosValidados.numeroCuotas,
          datosValidados.frecuenciaPago
        );
        break;
      case 'mensual_sobre_saldo':
        calculo = this.calcularInteresMensualSobreSaldo(
          datosValidados.monto,
          datosValidados.tasaInteres,
          datosValidados.periodoTasa,
          datosValidados.numeroCuotas,
          datosValidados.frecuenciaPago
        );
        break;
      case 'mensual_directo':
        calculo = this.calcularInteresMensualDirecto(
          datosValidados.monto,
          datosValidados.tasaInteres,
          datosValidados.periodoTasa,
          datosValidados.numeroCuotas,
          datosValidados.frecuenciaPago
        );
        break;
      default:
        calculo = this.calcularInteresSimple(
          datosValidados.monto,
          datosValidados.tasaInteres,
          datosValidados.periodoTasa,
          datosValidados.numeroCuotas,
          datosValidados.frecuenciaPago
        );
    }

    // Calcular fecha de vencimiento
    const fechaVencimiento = this.calcularFechaVencimiento(
      datosValidados.fechaPrestamo,
      datosValidados.numeroCuotas,
      datosValidados.frecuenciaPago
    );

    // Crear el préstamo con valores validados y redondeados
    const prestamo: Prestamo = {
      id,
      clienteId,
      monto: datosValidados.monto,
      fechaPrestamo: datosValidados.fechaPrestamo,
      numeroCuotas: datosValidados.numeroCuotas,
      tasaInteres: datosValidados.tasaInteres,
      periodoTasa: datosValidados.periodoTasa,
      tipoInteres: datosValidados.tipoInteres,
      frecuenciaPago: datosValidados.frecuenciaPago,
      fechaVencimiento,
      estado: 'activo',
      notas: datosValidados.notas,
      fechaCreacion,
      fechaActualizacion: fechaCreacion,
      montoTotal: calculo.montoTotal,
      montoInteres: calculo.montoInteres,
      montoCuota: calculo.montoCuota,
    };

    // Log para debugging (solo en desarrollo)
    if (__DEV__) {
      console.log('Prestamo creado:', {
        monto: prestamo.monto,
        tasaInteres: prestamo.tasaInteres,
        periodoTasa: prestamo.periodoTasa,
        numeroCuotas: prestamo.numeroCuotas,
        frecuenciaPago: prestamo.frecuenciaPago,
        montoTotal: prestamo.montoTotal,
        montoInteres: prestamo.montoInteres,
        montoCuota: prestamo.montoCuota
      });
    }

    // Generar cronograma de cuotas
    const cuotas = this.generarCronogramaCuotas(prestamo, clienteId);

    return {
      prestamo,
      cuotas,
    };
  }

  /**
   * Genera el cronograma completo de cuotas
   */
  static generarCronogramaCuotas(prestamo: Prestamo, clienteId: string): Cuota[] {
    const cuotas: Cuota[] = [];
    const fechaInicio = parseISO(prestamo.fechaPrestamo);
    
    // Validar valores de entrada
    const monto = Number(prestamo.monto) || 0;
    const numeroCuotas = Number(prestamo.numeroCuotas) || 1;
    const montoInteres = Number(prestamo.montoInteres) || 0;
    const montoCuota = Number(prestamo.montoCuota) || 0;
    
    // Calcular distribución de capital e interés por cuota (para interés simple se distribuye equitativamente)
    const capitalPorCuota = Math.round((monto / numeroCuotas) * 100) / 100;
    const interesPorCuota = Math.round((montoInteres / numeroCuotas) * 100) / 100;
    const montoTotalCuota = Math.round((capitalPorCuota + interesPorCuota) * 100) / 100;

    for (let i = 1; i <= numeroCuotas; i++) {
      // Calcular fecha de vencimiento de la cuota
      const fechaVencimiento = this.calcularFechaCuota(
        fechaInicio,
        i,
        prestamo.frecuenciaPago
      );

      // Ajustar la última cuota para compensar redondeos
      let capitalFinal = capitalPorCuota;
      let interesFinal = interesPorCuota;
      let totalFinal = montoTotalCuota;
      
      if (i === numeroCuotas) {
        // En la última cuota, ajustar para que la suma sea exacta
        const capitalAcumulado = capitalPorCuota * (numeroCuotas - 1);
        const interesAcumulado = interesPorCuota * (numeroCuotas - 1);
        
        capitalFinal = Math.round((monto - capitalAcumulado) * 100) / 100;
        interesFinal = Math.round((montoInteres - interesAcumulado) * 100) / 100;
        totalFinal = Math.round((capitalFinal + interesFinal) * 100) / 100;
      }

      const cuota: Cuota = {
        id: `${prestamo.id}_cuota_${i}`,
        prestamoId: prestamo.id,
        clienteId,
        numeroCuota: i,
        fechaVencimiento: format(fechaVencimiento, 'yyyy-MM-dd'),
        montoCapital: capitalFinal,
        montoInteres: interesFinal,
        montoTotal: totalFinal,
        estado: 'pendiente',
      };

      cuotas.push(cuota);
    }

    return cuotas;
  }

  /**
   * Actualiza el estado de un préstamo basado en sus cuotas
   */
  static actualizarEstadoPrestamo(prestamo: Prestamo, cuotas: Cuota[]): Prestamo {
    const cuotasPagadas = cuotas.filter(c => c.estado === 'pagada').length;
    const cuotasVencidas = cuotas.filter(c => c.estado === 'vencida').length;
    const hoy = new Date().toISOString().split('T')[0];

    let nuevoEstado: Prestamo['estado'] = prestamo.estado;

    if (cuotasPagadas === prestamo.numeroCuotas) {
      // Todas las cuotas están pagadas
      nuevoEstado = 'pagado';
    } else if (cuotasVencidas > 0) {
      // Hay cuotas vencidas
      nuevoEstado = 'vencido';
    } else {
      // Préstamo activo
      nuevoEstado = 'activo';
    }

    return {
      ...prestamo,
      estado: nuevoEstado,
      fechaActualizacion: new Date().toISOString(),
    };
  }

  /**
   * Actualiza el estado de las cuotas basado en la fecha actual
   */
  static actualizarEstadoCuotas(cuotas: Cuota[]): Cuota[] {
    const hoy = new Date().toISOString().split('T')[0];

    return cuotas.map(cuota => {
      if (cuota.estado === 'pendiente' && cuota.fechaVencimiento < hoy) {
        return {
          ...cuota,
          estado: 'vencida' as const,
        };
      }
      return cuota;
    });
  }

  /**
   * Calcula cuánto falta por pagar de una cuota
   */
  static calcularSaldoCuota(cuota: Cuota, pagosRealizados: number = 0): {
    montoPendiente: number;
    porcentajePagado: number;
    estadoCalculado: Cuota['estado'];
  } {
    const montoPendiente = Math.max(0, cuota.montoTotal - pagosRealizados);
    const porcentajePagado = (pagosRealizados / cuota.montoTotal) * 100;

    let estadoCalculado: Cuota['estado'] = cuota.estado;

    if (pagosRealizados >= cuota.montoTotal) {
      estadoCalculado = 'pagada';
    } else if (pagosRealizados > 0) {
      // Si hay pagos parciales, siempre mantener como 'parcial' 
      // para permitir completar el pago, sin importar si está vencida
      estadoCalculado = 'parcial';
    } else {
      // Solo marcar como vencida si no hay pagos
      const hoy = new Date().toISOString().split('T')[0];
      if (cuota.fechaVencimiento < hoy) {
        estadoCalculado = 'vencida';
      } else {
        estadoCalculado = 'pendiente';
      }
    }

    return {
      montoPendiente,
      porcentajePagado,
      estadoCalculado,
    };
  }

  /**
   * Calcula estadísticas de un préstamo
   */
  static calcularEstadisticasPrestamo(prestamo: Prestamo, cuotas: Cuota[], totalPagado: number): {
    totalPrestado: number;
    totalPagado: number;
    totalPendiente: number;
    porcentajeAvance: number;
    cuotasPagadas: number;
    cuotasPendientes: number;
    cuotasVencidas: number;
    proximasCuotas: Cuota[];
  } {
    // Validar y convertir valores de entrada
    const montoTotal = Number(prestamo.montoTotal) || 0;
    const pagado = Number(totalPagado) || 0;
    
    // Calcular valores con redondeo para evitar problemas de punto flotante
    const totalPendiente = Math.round((montoTotal - pagado) * 100) / 100;
    const porcentajeAvance = montoTotal > 0 ? Math.round(((pagado / montoTotal) * 100) * 100) / 100 : 0;
    
    // Contar cuotas por estado
    const cuotasPagadas = cuotas.filter(c => c.estado === 'pagada').length;
    const cuotasPendientes = cuotas.filter(c => c.estado === 'pendiente').length;
    const cuotasVencidas = cuotas.filter(c => c.estado === 'vencida').length;

    // Próximas 3 cuotas pendientes ordenadas por fecha
    const proximasCuotas = cuotas
      .filter(c => c.estado === 'pendiente' || c.estado === 'vencida')
      .sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime())
      .slice(0, 3);

    return {
      totalPrestado: montoTotal,
      totalPagado: pagado,
      totalPendiente: Math.max(0, totalPendiente), // Asegurar que no sea negativo
      porcentajeAvance: Math.min(100, Math.max(0, porcentajeAvance)), // Asegurar rango 0-100
      cuotasPagadas,
      cuotasPendientes,
      cuotasVencidas,
      proximasCuotas,
    };
  }

  // ===== MÉTODOS PRIVADOS AUXILIARES =====

  /**
   * Calcula el tiempo en años según la frecuencia de pago
   */
  private static calcularTiempoEnAños(numeroCuotas: number, frecuenciaPago: Prestamo['frecuenciaPago']): number {
    numeroCuotas = Number(numeroCuotas) || 1;
    switch (frecuenciaPago) {
      case 'diario':
        return numeroCuotas / 365;
      case 'semanal':
        return numeroCuotas / 52;
      case 'quincenal':
        return numeroCuotas / 24;
      case 'mensual':
        return numeroCuotas / 12;
      default:
        console.warn(`Frecuencia de pago no soportada: ${frecuenciaPago}, usando mensual como fallback`);
        return numeroCuotas / 12;
    }
  }

  /**
   * Obtiene la frecuencia anual de capitalización
   */
  private static getFrecuenciaAnual(frecuenciaPago: Prestamo['frecuenciaPago']): number {
    switch (frecuenciaPago) {
      case 'diario':
        return 365;
      case 'semanal':
        return 52;
      case 'quincenal':
        return 24;
      case 'mensual':
        return 12;
      default:
        throw new Error(`Frecuencia de pago no soportada: ${frecuenciaPago}`);
    }
  }

  /**
   * Calcula la fecha de vencimiento del préstamo
   */
  private static calcularFechaVencimiento(
    fechaInicio: string,
    numeroCuotas: number,
    frecuenciaPago: Prestamo['frecuenciaPago']
  ): string {
    const fecha = parseISO(fechaInicio);
    const fechaFinal = this.calcularFechaCuota(fecha, numeroCuotas, frecuenciaPago);
    return format(fechaFinal, 'yyyy-MM-dd');
  }

  /**
   * Calcula la fecha de una cuota específica
   */
  private static calcularFechaCuota(
    fechaInicio: Date,
    numeroCuota: number,
    frecuenciaPago: Prestamo['frecuenciaPago']
  ): Date {
    switch (frecuenciaPago) {
      case 'diario':
        return addDays(fechaInicio, numeroCuota);
      case 'semanal':
        return addWeeks(fechaInicio, numeroCuota);
      case 'quincenal':
        return addWeeks(fechaInicio, numeroCuota * 2);
      case 'mensual':
        return addMonths(fechaInicio, numeroCuota);
      default:
        throw new Error(`Frecuencia de pago no soportada: ${frecuenciaPago}`);
    }
  }

  // ===== MÉTODOS PARA VALIDACIONES =====

  /**
   * Valida si los datos del préstamo son correctos
   */
  static validarDatosPrestamo(formData: PrestamoFormData): {
    valido: boolean;
    errores: string[];
  } {
    const errores: string[] = [];

    if (formData.monto <= 0) {
      errores.push('El monto debe ser mayor a 0');
    }

    if (formData.monto > 1000000000) {
      errores.push('El monto no puede ser mayor a $1,000,000,000');
    }

    if (formData.numeroCuotas <= 0) {
      errores.push('El número de cuotas debe ser mayor a 0');
    }

    if (formData.numeroCuotas > 1000) {
      errores.push('El número de cuotas no puede ser mayor a 1000');
    }

    if (formData.tasaInteres < 0) {
      errores.push('La tasa de interés no puede ser negativa');
    }

    if (formData.tasaInteres > 100) {
      errores.push('La tasa de interés no puede ser mayor al 100%');
    }

    // Validar fecha
    const fechaPrestamo = new Date(formData.fechaPrestamo);
    const hoy = new Date();
    const hace10Anos = new Date();
    hace10Anos.setFullYear(hoy.getFullYear() - 10);
    const en10Anos = new Date();
    en10Anos.setFullYear(hoy.getFullYear() + 10);

    if (fechaPrestamo < hace10Anos || fechaPrestamo > en10Anos) {
      errores.push('La fecha del préstamo debe estar entre los últimos 10 años y los próximos 10 años');
    }

    return {
      valido: errores.length === 0,
      errores,
    };
  }

  /**
   * Simula diferentes escenarios de pago
   */
  static simularEscenarios(formData: PrestamoFormData): {
    interesSimple: CalculoInteres;
    interesCompuesto: CalculoInteres;
    diferencia: number;
    recomendacion: 'simple' | 'compuesto';
  } {
    const interesSimple = this.calcularInteresSimple(
      formData.monto,
      formData.tasaInteres,
      formData.periodoTasa,
      formData.numeroCuotas,
      formData.frecuenciaPago
    );

    const interesCompuesto = this.calcularInteresCompuesto(
      formData.monto,
      formData.tasaInteres,
      formData.periodoTasa,
      formData.numeroCuotas,
      formData.frecuenciaPago
    );

    const diferencia = interesCompuesto.montoInteres - interesSimple.montoInteres;
    
    // Recomendar el tipo que genere más intereses para el prestamista
    const recomendacion = diferencia > 0 ? 'compuesto' : 'simple';

    return {
      interesSimple,
      interesCompuesto,
      diferencia,
      recomendacion,
    };
  }
}