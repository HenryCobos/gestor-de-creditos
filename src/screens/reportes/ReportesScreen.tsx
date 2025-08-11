import React, { useState, useMemo } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge, LoadingSpinner, EmptyState, OptionSelector } from '../../components';
import { BottomBannerAd } from '../../components/ads';
import { formatearFecha, formatearFechaTexto } from '../../utils/dateUtils';
import { addMonths, subMonths, format, parseISO, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

type PeriodoReporte = 'hoy' | 'semana' | 'mes' | 'trimestre' | 'año' | 'personalizado';

interface EstadisticasGenerales {
  // Clientes
  totalClientes: number;
  clientesActivos: number;
  clientesInactivos: number;
  
  // Préstamos
  totalPrestamos: number;
  prestamosActivos: number;
  prestamosCompletados: number;
  prestamosVencidos: number;
  
  // Financiero
  capitalPrestado: number;
  capitalRecuperado: number;
  interesesGenerados: number;
  montoPendiente: number;
  montoVencido: number;
  
  // Cuotas
  totalCuotas: number;
  cuotasPagadas: number;
  cuotasPendientes: number;
  cuotasVencidas: number;
  
  // Rentabilidad
  tasaRecuperacion: number;
  margenGanancia: number;
  promedioInteres: number;
}

export function ReportesScreen() {
  const { state } = useApp();
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<PeriodoReporte>('mes');
  const [fechaInicio, setFechaInicio] = useState(startOfMonth(new Date()));
  const [fechaFin, setFechaFin] = useState(endOfMonth(new Date()));

  // Filtrar datos por período
  const datosFiltrados = useMemo(() => {
    const inicioStr = format(fechaInicio, 'yyyy-MM-dd');
    const finStr = format(fechaFin, 'yyyy-MM-dd');
    
    const prestamos = state.prestamos.filter(p => 
      p.fechaPrestamo >= inicioStr && p.fechaPrestamo <= finStr
    );
    
    const cuotas = state.cuotas.filter(c => {
      const fechaCuota = c.fechaVencimiento;
      return fechaCuota >= inicioStr && fechaCuota <= finStr;
    });
    
    const pagos = state.pagos.filter(p => {
      const fechaPago = p.fechaPago;
      return fechaPago >= inicioStr && fechaPago <= finStr;
    });
    
    return { prestamos, cuotas, pagos };
  }, [state, fechaInicio, fechaFin]);

  // Calcular estadísticas generales
  const estadisticas: EstadisticasGenerales = useMemo(() => {
    const { prestamos, cuotas, pagos } = datosFiltrados;
    
    // Clientes únicos con préstamos en el período
    const clientesConPrestamos = new Set(prestamos.map(p => p.clienteId));
    const clientesActivos = new Set(
      prestamos.filter(p => p.estado === 'activo').map(p => p.clienteId)
    );
    
    // Estadísticas de préstamos
    const prestamosActivos = prestamos.filter(p => p.estado === 'activo');
    const prestamosCompletados = prestamos.filter(p => p.estado === 'pagado');
    const prestamosVencidos = prestamos.filter(p => p.estado === 'vencido');
    
    // Cálculos financieros
    const capitalPrestado = prestamos.reduce((sum, p) => sum + p.monto, 0);
    const capitalRecuperado = pagos.reduce((sum, p) => sum + p.monto, 0);
    const interesesGenerados = prestamos.reduce((sum, p) => sum + p.montoInteres, 0);
    
    // Cuotas
    const cuotasPagadas = cuotas.filter(c => c.estado === 'pagada');
    const cuotasPendientes = cuotas.filter(c => c.estado === 'pendiente');
    const cuotasVencidas = cuotas.filter(c => c.estado === 'vencida');
    
    const montoPendiente = cuotasPendientes.reduce((sum, c) => sum + c.montoTotal, 0);
    const montoVencido = cuotasVencidas.reduce((sum, c) => sum + c.montoTotal, 0);
    
    // Tasas y márgenes
    const tasaRecuperacion = capitalPrestado > 0 ? (capitalRecuperado / capitalPrestado) * 100 : 0;
    const margenGanancia = capitalPrestado > 0 ? (interesesGenerados / capitalPrestado) * 100 : 0;
    const promedioInteres = prestamos.length > 0 
      ? prestamos.reduce((sum, p) => sum + p.tasaInteres, 0) / prestamos.length 
      : 0;
    
    return {
      totalClientes: state.clientes.length,
      clientesActivos: clientesActivos.size,
      clientesInactivos: state.clientes.length - clientesActivos.size,
      
      totalPrestamos: prestamos.length,
      prestamosActivos: prestamosActivos.length,
      prestamosCompletados: prestamosCompletados.length,
      prestamosVencidos: prestamosVencidos.length,
      
      capitalPrestado,
      capitalRecuperado,
      interesesGenerados,
      montoPendiente,
      montoVencido,
      
      totalCuotas: cuotas.length,
      cuotasPagadas: cuotasPagadas.length,
      cuotasPendientes: cuotasPendientes.length,
      cuotasVencidas: cuotasVencidas.length,
      
      tasaRecuperacion,
      margenGanancia,
      promedioInteres,
    };
  }, [datosFiltrados, state.clientes.length]);

  // Top clientes por monto prestado
  const topClientes = useMemo(() => {
    const clienteStats = state.clientes.map(cliente => {
      const prestamosCliente = state.prestamos.filter(p => p.clienteId === cliente.id);
      const totalPrestado = prestamosCliente.reduce((sum, p) => sum + p.monto, 0);
      const totalPagado = state.pagos
        .filter(pago => pago.clienteId === cliente.id)
        .reduce((sum, pago) => sum + pago.monto, 0);
      
      return {
        cliente,
        totalPrestado,
        totalPagado,
        prestamosActivos: prestamosCliente.filter(p => p.estado === 'activo').length,
        ultimoPrestamo: prestamosCliente.length > 0 
          ? Math.max(...prestamosCliente.map(p => new Date(p.fechaPrestamo).getTime()))
          : 0
      };
    })
    .filter(c => c.totalPrestado > 0)
    .sort((a, b) => b.totalPrestado - a.totalPrestado)
    .slice(0, 5);
    
    return clienteStats;
  }, [state]);

  const handleCambioPeriodo = (periodo: PeriodoReporte) => {
    setPeriodoSeleccionado(periodo);
    
    const hoy = new Date();
    
    switch (periodo) {
      case 'hoy':
        setFechaInicio(hoy);
        setFechaFin(hoy);
        break;
      case 'semana':
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);
        setFechaInicio(inicioSemana);
        setFechaFin(finSemana);
        break;
      case 'mes':
        setFechaInicio(startOfMonth(hoy));
        setFechaFin(endOfMonth(hoy));
        break;
      case 'trimestre':
        const inicioTrimestre = new Date(hoy.getFullYear(), Math.floor(hoy.getMonth() / 3) * 3, 1);
        const finTrimestre = new Date(inicioTrimestre);
        finTrimestre.setMonth(finTrimestre.getMonth() + 3);
        finTrimestre.setDate(0);
        setFechaInicio(inicioTrimestre);
        setFechaFin(finTrimestre);
        break;
      case 'año':
        const inicioAño = new Date(hoy.getFullYear(), 0, 1);
        const finAño = new Date(hoy.getFullYear(), 11, 31);
        setFechaInicio(inicioAño);
        setFechaFin(finAño);
        break;
    }
  };

  const formatearPorcentaje = (valor: number): string => {
    return `${valor.toFixed(1)}%`;
  };

  const formatearMoneda = (valor: number): string => {
    return `$${valor.toLocaleString()}`;
  };

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'activo': return '#4CAF50';
      case 'vencido': return '#F44336';
      case 'completado': case 'pagado': return '#2196F3';
      default: return '#666';
    }
  };

  if (state.isLoading) {
    return <LoadingSpinner text="Generando reportes..." />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Selector de Período */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>📊 Período de Análisis</Text>
        
        <OptionSelector
          variant="buttons"
          options={[
            { key: 'hoy', label: 'Hoy', icon: '📅' },
            { key: 'semana', label: 'Semana', icon: '📋' },
            { key: 'mes', label: 'Mes', icon: '🗓️' },
            { key: 'trimestre', label: 'Trimestre', icon: '📆' },
            { key: 'año', label: 'Año', icon: '📊' }
          ]}
          selectedKey={periodoSeleccionado}
          onSelect={(key) => handleCambioPeriodo(key as PeriodoReporte)}
          style={styles.optionSelector}
        />
        
        <Text style={styles.periodRange}>
          {formatearFechaTexto(fechaInicio)} - {formatearFechaTexto(fechaFin)}
        </Text>
      </Card>

      {/* Métricas Principales */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>💰 Resumen Financiero</Text>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{formatearMoneda(estadisticas.capitalPrestado)}</Text>
            <Text style={styles.metricLabel}>Capital Prestado</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, styles.successText]}>
              {formatearMoneda(estadisticas.capitalRecuperado)}
            </Text>
            <Text style={styles.metricLabel}>Recuperado</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, styles.primaryText]}>
              {formatearMoneda(estadisticas.interesesGenerados)}
            </Text>
            <Text style={styles.metricLabel}>Intereses</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, styles.warningText]}>
              {formatearMoneda(estadisticas.montoPendiente)}
            </Text>
            <Text style={styles.metricLabel}>Pendiente</Text>
          </View>
        </View>

        {estadisticas.montoVencido > 0 && (
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>⚠️ Atención</Text>
            <Text style={styles.alertText}>
              Tienes {formatearMoneda(estadisticas.montoVencido)} en cuotas vencidas que requieren seguimiento.
            </Text>
          </View>
        )}
      </Card>

      {/* Indicadores de Rendimiento */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>📈 Indicadores Clave</Text>
        
        <View style={styles.kpiGrid}>
          <View style={styles.kpiItem}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Tasa de Recuperación</Text>
              <Badge 
                variant={estadisticas.tasaRecuperacion >= 80 ? 'success' : 
                        estadisticas.tasaRecuperacion >= 60 ? 'warning' : 'danger'} 
                text={formatearPorcentaje(estadisticas.tasaRecuperacion)} 
              />
            </View>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(estadisticas.tasaRecuperacion, 100)}%`,
                  backgroundColor: estadisticas.tasaRecuperacion >= 80 ? '#4CAF50' : 
                                  estadisticas.tasaRecuperacion >= 60 ? '#FF9800' : '#F44336'
                }
              ]} />
            </View>
          </View>
          
          <View style={styles.kpiItem}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Margen de Ganancia</Text>
              <Badge variant="info" text={formatearPorcentaje(estadisticas.margenGanancia)} />
            </View>
            <Text style={styles.kpiDescription}>
              Sobre capital prestado: {formatearMoneda(estadisticas.capitalPrestado)}
            </Text>
          </View>
          
          <View style={styles.kpiItem}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Interés Promedio</Text>
              <Badge variant="default" text={formatearPorcentaje(estadisticas.promedioInteres)} />
            </View>
            <Text style={styles.kpiDescription}>
              Promedio de {estadisticas.totalPrestamos} préstamos
            </Text>
          </View>
        </View>
      </Card>

      {/* Estadísticas por Categoría */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>👥 Clientes y Préstamos</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statGroup}>
            <Text style={styles.statGroupTitle}>Clientes</Text>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{estadisticas.totalClientes}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Activos</Text>
              <Text style={[styles.statValue, styles.successText]}>{estadisticas.clientesActivos}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Inactivos</Text>
              <Text style={[styles.statValue, styles.grayText]}>{estadisticas.clientesInactivos}</Text>
            </View>
          </View>
          
          <View style={styles.statGroup}>
            <Text style={styles.statGroupTitle}>Préstamos</Text>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{estadisticas.totalPrestamos}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Activos</Text>
              <Text style={[styles.statValue, styles.successText]}>{estadisticas.prestamosActivos}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Completados</Text>
              <Text style={[styles.statValue, styles.primaryText]}>{estadisticas.prestamosCompletados}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Vencidos</Text>
              <Text style={[styles.statValue, styles.warningText]}>{estadisticas.prestamosVencidos}</Text>
            </View>
          </View>
          
          <View style={styles.statGroup}>
            <Text style={styles.statGroupTitle}>Cuotas</Text>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{estadisticas.totalCuotas}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pagadas</Text>
              <Text style={[styles.statValue, styles.successText]}>{estadisticas.cuotasPagadas}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pendientes</Text>
              <Text style={[styles.statValue, styles.primaryText]}>{estadisticas.cuotasPendientes}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Vencidas</Text>
              <Text style={[styles.statValue, styles.warningText]}>{estadisticas.cuotasVencidas}</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Top Clientes */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>🏆 Top Clientes</Text>
        
        {topClientes.length === 0 ? (
          <EmptyState
            title="Sin datos de clientes"
            description="No hay información de clientes para mostrar en este período"
          />
        ) : (
          <FlatList
            data={topClientes}
            keyExtractor={(item) => item.cliente.id}
            renderItem={({ item, index }) => (
              <View style={styles.topClienteItem}>
                <View style={styles.topClienteHeader}>
                  <View style={styles.topClienteRank}>
                    <Text style={styles.rankNumber}>#{index + 1}</Text>
                  </View>
                  <View style={styles.topClienteInfo}>
                    <Text style={styles.topClienteNombre}>{item.cliente.nombre}</Text>
                    <Text style={styles.topClienteStats}>
                      {item.prestamosActivos} préstamos activos
                    </Text>
                  </View>
                  <View style={styles.topClienteMontos}>
                    <Text style={styles.topClienteMonto}>
                      {formatearMoneda(item.totalPrestado)}
                    </Text>
                    <Text style={styles.topClientePagado}>
                      Pagado: {formatearMoneda(item.totalPagado)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.clienteProgressBar}>
                  <View style={[
                    styles.clienteProgressFill,
                    { 
                      width: `${item.totalPrestado > 0 ? (item.totalPagado / item.totalPrestado) * 100 : 0}%` 
                    }
                  ]} />
                </View>
              </View>
            )}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </Card>

      {/* Banner publicitario */}
      <BottomBannerAd 
        onReceiveAd={() => console.log('📺 Banner cargado en Reportes')}
        onError={(error) => console.warn('⚠️ Error en banner Reportes:', error)}
      />
      
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  optionSelector: {
    marginBottom: 16,
  },
  periodRange: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  successText: {
    color: '#4CAF50',
  },
  warningText: {
    color: '#F44336',
  },
  primaryText: {
    color: '#2196F3',
  },
  grayText: {
    color: '#999',
  },
  alertBox: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 13,
    color: '#E65100',
  },
  kpiGrid: {
    gap: 16,
  },
  kpiItem: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  kpiDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statGroup: {
    flex: 1,
  },
  statGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  topClienteItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  topClienteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  topClienteRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  topClienteInfo: {
    flex: 1,
  },
  topClienteNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  topClienteStats: {
    fontSize: 12,
    color: '#666',
  },
  topClienteMontos: {
    alignItems: 'flex-end',
  },
  topClienteMonto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  topClientePagado: {
    fontSize: 11,
    color: '#4CAF50',
  },
  clienteProgressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  clienteProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  separator: {
    height: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});