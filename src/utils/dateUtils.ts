import { format, parseISO, isValid, differenceInDays, addDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

// ===== FORMATEADORES DE FECHA =====

/**
 * Formatea una fecha en formato legible
 */
export const formatearFecha = (fecha: string | Date, formato: string = 'dd/MM/yyyy'): string => {
  try {
    const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    if (!isValid(fechaObj)) {
      return 'Fecha inválida';
    }
    return format(fechaObj, formato, { locale: es });
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha con texto descriptivo
 */
export const formatearFechaTexto = (fecha: string | Date): string => {
  try {
    const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    if (!isValid(fechaObj)) {
      return 'Fecha inválida';
    }
    return format(fechaObj, "dd 'de' MMMM 'de' yyyy", { locale: es });
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha con día de la semana
 */
export const formatearFechaCompleta = (fecha: string | Date): string => {
  try {
    const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    if (!isValid(fechaObj)) {
      return 'Fecha inválida';
    }
    return format(fechaObj, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es });
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Formatea fecha para input de tipo date
 */
export const formatearParaInput = (fecha: string | Date): string => {
  try {
    const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    if (!isValid(fechaObj)) {
      return '';
    }
    return format(fechaObj, 'yyyy-MM-dd');
  } catch (error) {
    return '';
  }
};

// ===== VALIDADORES DE FECHA =====

/**
 * Valida si una fecha es válida
 */
export const esFechaValida = (fecha: string | Date): boolean => {
  try {
    const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    return isValid(fechaObj);
  } catch (error) {
    return false;
  }
};

/**
 * Valida si una fecha está en un rango válido
 */
export const esFechaEnRango = (
  fecha: string | Date,
  fechaMinima?: string | Date,
  fechaMaxima?: string | Date
): boolean => {
  try {
    const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    
    if (!isValid(fechaObj)) {
      return false;
    }

    if (fechaMinima) {
      const fechaMinimaObj = typeof fechaMinima === 'string' ? parseISO(fechaMinima) : fechaMinima;
      if (isValid(fechaMinimaObj) && fechaObj < fechaMinimaObj) {
        return false;
      }
    }

    if (fechaMaxima) {
      const fechaMaximaObj = typeof fechaMaxima === 'string' ? parseISO(fechaMaxima) : fechaMaxima;
      if (isValid(fechaMaximaObj) && fechaObj > fechaMaximaObj) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
};

// ===== CALCULADORES DE DIFERENCIAS =====

/**
 * Calcula días entre dos fechas
 */
export const diasEntreFechas = (fechaInicio: string | Date, fechaFin: string | Date): number => {
  try {
    const fechaInicioObj = typeof fechaInicio === 'string' ? parseISO(fechaInicio) : fechaInicio;
    const fechaFinObj = typeof fechaFin === 'string' ? parseISO(fechaFin) : fechaFin;
    
    if (!isValid(fechaInicioObj) || !isValid(fechaFinObj)) {
      return 0;
    }
    
    return differenceInDays(fechaFinObj, fechaInicioObj);
  } catch (error) {
    return 0;
  }
};

/**
 * Calcula días desde hoy hasta una fecha
 */
export const diasHastaFecha = (fecha: string | Date): number => {
  return diasEntreFechas(new Date(), fecha);
};

/**
 * Calcula días desde una fecha hasta hoy
 */
export const diasDesdeFecha = (fecha: string | Date): number => {
  return diasEntreFechas(fecha, new Date());
};

// ===== COMPARADORES DE FECHA =====

/**
 * Verifica si una fecha es hoy
 */
export const esHoy = (fecha: string | Date): boolean => {
  try {
    const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    const hoy = new Date();
    
    if (!isValid(fechaObj)) {
      return false;
    }
    
    return formatearParaInput(fechaObj) === formatearParaInput(hoy);
  } catch (error) {
    return false;
  }
};

/**
 * Verifica si una fecha es mañana
 */
export const esManana = (fecha: string | Date): boolean => {
  try {
    const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    const manana = addDays(new Date(), 1);
    
    if (!isValid(fechaObj)) {
      return false;
    }
    
    return formatearParaInput(fechaObj) === formatearParaInput(manana);
  } catch (error) {
    return false;
  }
};

/**
 * Verifica si una fecha es en el futuro
 */
export const esFuturo = (fecha: string | Date): boolean => {
  try {
    const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    const hoy = startOfDay(new Date());
    
    if (!isValid(fechaObj)) {
      return false;
    }
    
    return startOfDay(fechaObj) > hoy;
  } catch (error) {
    return false;
  }
};

/**
 * Verifica si una fecha es en el pasado
 */
export const esPasado = (fecha: string | Date): boolean => {
  try {
    const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    const hoy = startOfDay(new Date());
    
    if (!isValid(fechaObj)) {
      return false;
    }
    
    return startOfDay(fechaObj) < hoy;
  } catch (error) {
    return false;
  }
};

/**
 * Verifica si una fecha está vencida
 */
export const estaVencida = (fecha: string | Date): boolean => {
  return esPasado(fecha);
};

/**
 * Verifica si una fecha está próxima a vencer (en los próximos N días)
 */
export const estaProximaVencer = (fecha: string | Date, dias: number = 7): boolean => {
  const diasRestantes = diasHastaFecha(fecha);
  return diasRestantes >= 0 && diasRestantes <= dias;
};

// ===== DESCRIPTORES DE FECHA =====

/**
 * Obtiene una descripción relativa de la fecha
 */
export const getDescripcionRelativa = (fecha: string | Date): string => {
  try {
    const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    
    if (!isValid(fechaObj)) {
      return 'Fecha inválida';
    }

    if (esHoy(fechaObj)) {
      return 'Hoy';
    }

    if (esManana(fechaObj)) {
      return 'Mañana';
    }

    const dias = diasHastaFecha(fechaObj);

    if (dias < 0) {
      const diasPasados = Math.abs(dias);
      if (diasPasados === 1) {
        return 'Ayer';
      } else if (diasPasados <= 7) {
        return `Hace ${diasPasados} días`;
      } else if (diasPasados <= 30) {
        const semanas = Math.floor(diasPasados / 7);
        return semanas === 1 ? 'Hace 1 semana' : `Hace ${semanas} semanas`;
      } else {
        const meses = Math.floor(diasPasados / 30);
        return meses === 1 ? 'Hace 1 mes' : `Hace ${meses} meses`;
      }
    } else {
      if (dias <= 7) {
        return `En ${dias} días`;
      } else if (dias <= 30) {
        const semanas = Math.floor(dias / 7);
        return semanas === 1 ? 'En 1 semana' : `En ${semanas} semanas`;
      } else {
        const meses = Math.floor(dias / 30);
        return meses === 1 ? 'En 1 mes' : `En ${meses} meses`;
      }
    }
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Obtiene el estado de una fecha (hoy, futuro, vencida, etc.)
 */
export const getEstadoFecha = (fecha: string | Date): {
  estado: 'hoy' | 'futuro' | 'vencida' | 'proxima';
  color: string;
  descripcion: string;
} => {
  try {
    const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    
    if (!isValid(fechaObj)) {
      return {
        estado: 'vencida',
        color: '#F44336',
        descripcion: 'Fecha inválida',
      };
    }

    if (esHoy(fechaObj)) {
      return {
        estado: 'hoy',
        color: '#FF9800',
        descripcion: 'Vence hoy',
      };
    }

    if (estaVencida(fechaObj)) {
      return {
        estado: 'vencida',
        color: '#F44336',
        descripcion: 'Vencida',
      };
    }

    if (estaProximaVencer(fechaObj)) {
      return {
        estado: 'proxima',
        color: '#FF9800',
        descripcion: 'Próxima a vencer',
      };
    }

    return {
      estado: 'futuro',
      color: '#4CAF50',
      descripcion: 'Futuro',
    };
  } catch (error) {
    return {
      estado: 'vencida',
      color: '#F44336',
      descripcion: 'Error',
    };
  }
};

// ===== GENERADORES DE FECHA =====

/**
 * Obtiene la fecha actual en formato string
 */
export const getFechaActual = (): string => {
  return formatearParaInput(new Date());
};

/**
 * Obtiene la fecha de inicio de semana
 */
export const getInicioSemana = (fecha?: string | Date): string => {
  const fechaObj = fecha ? (typeof fecha === 'string' ? parseISO(fecha) : fecha) : new Date();
  const inicioSemana = new Date(fechaObj);
  inicioSemana.setDate(fechaObj.getDate() - fechaObj.getDay());
  return formatearParaInput(inicioSemana);
};

/**
 * Obtiene la fecha de fin de semana
 */
export const getFinSemana = (fecha?: string | Date): string => {
  const fechaObj = fecha ? (typeof fecha === 'string' ? parseISO(fecha) : fecha) : new Date();
  const finSemana = new Date(fechaObj);
  finSemana.setDate(fechaObj.getDate() + (6 - fechaObj.getDay()));
  return formatearParaInput(finSemana);
};

/**
 * Obtiene el primer día del mes
 */
export const getInicioMes = (fecha?: string | Date): string => {
  const fechaObj = fecha ? (typeof fecha === 'string' ? parseISO(fecha) : fecha) : new Date();
  const inicioMes = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), 1);
  return formatearParaInput(inicioMes);
};

/**
 * Obtiene el último día del mes
 */
export const getFinMes = (fecha?: string | Date): string => {
  const fechaObj = fecha ? (typeof fecha === 'string' ? parseISO(fecha) : fecha) : new Date();
  const finMes = new Date(fechaObj.getFullYear(), fechaObj.getMonth() + 1, 0);
  return formatearParaInput(finMes);
};

// ===== UTILIDADES PARA COMPONENTES =====

/**
 * Formatea fecha para mostrar en listas
 */
export const formatearParaLista = (fecha: string | Date): {
  fecha: string;
  descripcion: string;
  estado: ReturnType<typeof getEstadoFecha>;
} => {
  return {
    fecha: formatearFecha(fecha),
    descripcion: getDescripcionRelativa(fecha),
    estado: getEstadoFecha(fecha),
  };
};

/**
 * Obtiene opciones de filtro por fecha
 */
export const getOpcionesFiltroFecha = () => {
  const hoy = new Date();
  
  return {
    hoy: {
      label: 'Hoy',
      fechaInicio: getFechaActual(),
      fechaFin: getFechaActual(),
    },
    estaSemana: {
      label: 'Esta semana',
      fechaInicio: getInicioSemana(hoy),
      fechaFin: getFinSemana(hoy),
    },
    esteMes: {
      label: 'Este mes',
      fechaInicio: getInicioMes(hoy),
      fechaFin: getFinMes(hoy),
    },
    proximaSemana: {
      label: 'Próxima semana',
      fechaInicio: getInicioSemana(addDays(hoy, 7)),
      fechaFin: getFinSemana(addDays(hoy, 7)),
    },
    proximoMes: {
      label: 'Próximo mes',
      fechaInicio: getInicioMes(addDays(hoy, 30)),
      fechaFin: getFinMes(addDays(hoy, 30)),
    },
  };
};

/**
 * Obtiene todos los días de un mes específico para mostrar en el calendario
 */
export const obtenerDiasDelMes = (fecha: Date): Date[] => {
  const inicio = startOfMonth(fecha);
  const fin = endOfMonth(fecha);
  const dias: Date[] = [];
  
  // Obtener el primer día de la semana del calendario (domingo de la primera semana)
  const primerDiaCalendario = new Date(inicio);
  primerDiaCalendario.setDate(inicio.getDate() - inicio.getDay());
  
  // Obtener el último día de la semana del calendario (sábado de la última semana)
  const ultimoDiaCalendario = new Date(fin);
  ultimoDiaCalendario.setDate(fin.getDate() + (6 - fin.getDay()));
  
  // Generar todos los días del calendario (6 semanas)
  const fechaActual = new Date(primerDiaCalendario);
  while (fechaActual <= ultimoDiaCalendario) {
    dias.push(new Date(fechaActual));
    fechaActual.setDate(fechaActual.getDate() + 1);
  }
  
  return dias;
};