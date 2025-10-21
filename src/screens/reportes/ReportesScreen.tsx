import React, { useState, useMemo } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge, LoadingSpinner, EmptyState, OptionSelector, PremiumBadge, ExportModal } from '../../components';
import { ContextualPaywall } from '../../components/paywall/ContextualPaywall';
import { usePremium } from '../../hooks/usePremium';
import { useContextualPaywall } from '../../hooks/useContextualPaywall';
import { isFeatureAllowed } from '../../utils/featureGating';
import { useNavigation } from '@react-navigation/native';
// Ads eliminados
import { formatearFecha, formatearFechaTexto } from '../../utils/dateUtils';
import { addMonths, subMonths, format, parseISO, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ReportData } from '../../services/exportService';

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
  const premium = usePremium();
  const contextualPaywall = useContextualPaywall();
  const navigation = useNavigation();
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<PeriodoReporte>('mes');
  const [fechaInicio, setFechaInicio] = useState(startOfMonth(new Date()));
  const [fechaFin, setFechaFin] = useState(endOfMonth(new Date()));
  const [exportModalVisible, setExportModalVisible] = useState(false);

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

  const gate = isFeatureAllowed('reportes_avanzados', {
    clientesCount: state.clientes.length,
    prestamosActivosCount: state.prestamos.filter(p => p.estado === 'activo').length,
    isPremium: premium.isPremium,
  });

  const handleUpgradeReports = () => {
    contextualPaywall.showPaywall('reportes_avanzados');
  };

  const generateReportData = (): ReportData => {
    const prestamos = datosFiltrados.prestamos;
    const cuotas = datosFiltrados.cuotas;
    const pagos = datosFiltrados.pagos;
    
    // Calcular métricas por cliente
    const clientesData = state.clientes.map(cliente => {
      const prestamosCliente = prestamos.filter(p => p.clienteId === cliente.id);
      const capitalPrestado = prestamosCliente.reduce((sum, p) => sum + p.montoTotal, 0);
      const capitalRecuperado = pagos
        .filter(p => prestamosCliente.some(pr => pr.id === p.prestamoId))
        .reduce((sum, p) => sum + p.monto, 0);
      
      return {
        id: cliente.id,
        nombre: cliente.nombre,
        telefono: cliente.telefono || 'N/A',
        totalPrestamos: prestamosCliente.length,
        capitalPrestado,
        capitalRecuperado,
        montoPendiente: capitalPrestado - capitalRecuperado,
      };
    });

    // Calcular métricas por préstamo
    const prestamosData = prestamos.map(prestamo => {
      const cliente = state.clientes.find(c => c.id === prestamo.clienteId);
      const cuotasPrestamo = cuotas.filter(c => c.prestamoId === prestamo.id);
      
      return {
        id: prestamo.id,
        clienteNombre: cliente?.nombre || 'Cliente no encontrado',
        monto: prestamo.montoTotal,
        fechaPrestamo: prestamo.fechaPrestamo,
        estado: prestamo.estado,
        cuotasPagadas: cuotasPrestamo.filter(c => c.estado === 'pagada').length,
        cuotasTotal: prestamo.numeroCuotas,
      };
    });

    return {
      // Estadísticas generales
      totalClientes: state.clientes.length,
      totalPrestamos: prestamos.length,
      capitalPrestado: estadisticas.capitalPrestado,
      capitalRecuperado: estadisticas.capitalRecuperado,
      interesesGenerados: estadisticas.interesesGenerados,
      montoPendiente: estadisticas.montoPendiente,
      montoVencido: estadisticas.montoVencido,
      
      // Indicadores
      tasaRecuperacion: estadisticas.tasaRecuperacion,
      margenGanancia: estadisticas.margenGanancia,
      promedioInteres: estadisticas.promedioInteres,
      
      // Detalles
      clientes: clientesData,
      prestamos: prestamosData,
      
      // Período
      periodo: {
        inicio: format(fechaInicio, 'yyyy-MM-dd'),
        fin: format(fechaFin, 'yyyy-MM-dd'),
        tipo: periodoSeleccionado,
      },
    };
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header con información del plan */}
      <Card style={styles.card}>
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>
            {gate.allowed ? '📊 Reportes Avanzados' : '📊 Reportes Básicos'}
          </Text>
          {!gate.allowed && (
            <PremiumBadge>Básico</PremiumBadge>
          )}
        </View>
        <Text style={styles.headerDescription}>
          {gate.allowed 
            ? 'Acceso completo a todos los reportes, gráficos y exportación'
            : 'Vista limitada de reportes básicos. Mejora a Premium para acceso completo.'
          }
        </Text>
      </Card>
      {/* Selector de Período */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>📊 Período de Análisis</Text>
        
        <OptionSelector
          variant="buttons"
          options={gate.allowed ? [
            { key: 'hoy', label: 'Hoy', icon: '📅' },
            { key: 'semana', label: 'Semana', icon: '📋' },
            { key: 'mes', label: 'Mes', icon: '🗓️' },
            { key: 'trimestre', label: 'Trimestre', icon: '📆' },
            { key: 'año', label: 'Año', icon: '📊' }
          ] : [
            { key: 'hoy', label: 'Hoy', icon: '📅' },
            { key: 'semana', label: 'Semana', icon: '📋' },
            { key: 'mes', label: 'Mes', icon: '🗓️' }
          ]}
          selectedKey={periodoSeleccionado}
          onSelect={(key) => handleCambioPeriodo(key as PeriodoReporte)}
          style={styles.optionSelector}
        />
        
        <Text style={styles.periodRange}>
          {formatearFechaTexto(fechaInicio)} - {formatearFechaTexto(fechaFin)}
        </Text>
        
        {!gate.allowed && (
          <View style={styles.upgradePrompt}>
            <Text style={styles.upgradeText}>
              🔒 Los períodos de trimestre y año son exclusivos de Premium
            </Text>
            <Button 
              title="Mejorar a Premium" 
              onPress={handleUpgradeReports}
              size="small"
              style={styles.upgradeButton}
            />
          </View>
        )}
      </Card>

      {/* Métricas Principales */}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💰 Resumen Financiero</Text>
          {!gate.allowed && <PremiumBadge>Básico</PremiumBadge>}
        </View>
        
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
          
          {gate.allowed && (
            <>
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
            </>
          )}
        </View>

        {!gate.allowed && (
          <View style={styles.upgradePrompt}>
            <Text style={styles.upgradeText}>
              🔒 Los detalles de intereses y montos pendientes son exclusivos de Premium
            </Text>
            <Button 
              title="Ver Detalles Completos" 
              onPress={handleUpgradeReports}
              size="small"
              style={styles.upgradeButton}
            />
          </View>
        )}

        {gate.allowed && estadisticas.montoVencido > 0 && (
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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📈 Indicadores Clave</Text>
          {!gate.allowed && <PremiumBadge>Básico</PremiumBadge>}
        </View>
        
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
          
          {gate.allowed && (
            <>
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
            </>
          )}
        </View>
        
        {!gate.allowed && (
          <View style={styles.upgradePrompt}>
            <Text style={styles.upgradeText}>
              🔒 Los análisis de margen de ganancia e interés promedio son exclusivos de Premium
            </Text>
            <Button 
              title="Ver Análisis Completo" 
              onPress={handleUpgradeReports}
              size="small"
              style={styles.upgradeButton}
            />
          </View>
        )}
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

      {/* Sección de Exportación - Solo Premium */}
      {gate.allowed ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>📤 Exportar Reportes</Text>
          <Text style={styles.exportDescription}>
            Exporta tus reportes en PDF para análisis externo
          </Text>
          
                  <Button 
                    title="📊 Exportar PDF" 
                    onPress={() => setExportModalVisible(true)}
                    style={styles.exportButton}
                  />
        </Card>
      ) : (
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📤 Exportar Reportes</Text>
            <PremiumBadge>Premium</PremiumBadge>
          </View>
                  <Text style={styles.exportDescription}>
                    Exporta tus reportes en PDF para análisis detallado
                  </Text>
          
          <View style={styles.upgradePrompt}>
            <Text style={styles.upgradeText}>
              🔒 La exportación de reportes es exclusiva de Premium
            </Text>
            <Button 
              title="Activar Exportación" 
              onPress={handleUpgradeReports}
              style={styles.upgradeButton}
            />
          </View>
        </Card>
      )}

      <View style={styles.bottomSpacing} />
      
      {/* Paywall Contextual */}
      <ContextualPaywall
        visible={contextualPaywall.visible}
        onClose={contextualPaywall.hidePaywall}
        packages={contextualPaywall.packages}
        loading={contextualPaywall.loading}
        error={contextualPaywall.error}
        onSelect={contextualPaywall.handleSubscribe}
        onRestore={contextualPaywall.handleRestore}
        onStartTrial={contextualPaywall.handleStartTrial}
        onRetry={contextualPaywall.handleRetry}
        context={contextualPaywall.context || {
          title: '',
          message: '',
          icon: '',
          featureName: '',
        }}
        pendingPayment={contextualPaywall.pendingPayment}
        onCompletePayment={contextualPaywall.onCompletePayment}
        onCancelPayment={contextualPaywall.onCancelPayment}
      />

      {/* Modal de Exportación */}
      <ExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        reportData={generateReportData()}
      />
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  upgradePrompt: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  upgradeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  upgradeButton: {
    alignSelf: 'flex-start',
  },
  exportDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
  },
});