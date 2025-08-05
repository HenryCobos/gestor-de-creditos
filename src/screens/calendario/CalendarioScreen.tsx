import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge, LoadingSpinner, EmptyState, CuotaCard, OptionSelector } from '../../components';
import { formatearFecha, formatearFechaTexto, getEstadoFecha, obtenerDiasDelMes, getFechaActual } from '../../utils/dateUtils';
import { addMonths, subMonths, format, parseISO, startOfMonth, endOfMonth, isSameDay, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

type VistaCalendario = 'mes' | 'semana' | 'proximos';
type FiltroEstado = 'todos' | 'pendiente' | 'vencida' | 'pagada';

export function CalendarioScreen() {
  const navigation = useNavigation();
  const { 
    state, 
    obtenerCuotasFiltradas, 
    marcarCuotaPagada, 
    obtenerCliente, 
    obtenerPrestamo,
    dispatch 
  } = useApp();
  
  const [fechaActual, setFechaActual] = useState(new Date());
  const [vista, setVista] = useState<VistaCalendario>('mes');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null);

  // Configurar filtros en el contexto
  useEffect(() => {
    const inicioMes = startOfMonth(fechaActual);
    const finMes = endOfMonth(fechaActual);
    
    dispatch({
      type: 'SET_FILTRO_CUOTAS',
      payload: {
        fechaDesde: format(inicioMes, 'yyyy-MM-dd'),
        fechaHasta: format(finMes, 'yyyy-MM-dd'),
        estado: filtroEstado === 'todos' ? undefined : filtroEstado as any,
        orderBy: 'fechaVencimiento',
        order: 'asc'
      }
    });
  }, [fechaActual, filtroEstado, dispatch]);

  // Obtener cuotas filtradas
  const cuotasDelPeriodo = obtenerCuotasFiltradas();

  // Cuotas del día seleccionado
  const cuotasDelDia = useMemo(() => {
    if (!diaSeleccionado) return [];
    
    return cuotasDelPeriodo.filter(cuota => 
      isSameDay(parseISO(cuota.fechaVencimiento), diaSeleccionado)
    );
  }, [cuotasDelPeriodo, diaSeleccionado]);

  // Próximas cuotas (próximos 7 días)
  const proximasCuotas = useMemo(() => {
    const hoy = new Date();
    const en7Dias = new Date();
    en7Dias.setDate(hoy.getDate() + 7);
    
    return state.cuotas
      .filter(cuota => {
        const fechaCuota = parseISO(cuota.fechaVencimiento);
        return fechaCuota >= hoy && fechaCuota <= en7Dias && cuota.estado !== 'pagada';
      })
      .sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));
  }, [state.cuotas]);

  // Estadísticas del período
  const estadisticasPeriodo = useMemo(() => {
    const cuotasPendientes = cuotasDelPeriodo.filter(c => c.estado === 'pendiente');
    const cuotasVencidas = cuotasDelPeriodo.filter(c => c.estado === 'vencida');
    const cuotasPagadas = cuotasDelPeriodo.filter(c => c.estado === 'pagada');
    
    const montoPendiente = cuotasPendientes.reduce((sum, c) => sum + c.montoTotal, 0);
    const montoVencido = cuotasVencidas.reduce((sum, c) => sum + c.montoTotal, 0);
    const montoPagado = cuotasPagadas.reduce((sum, c) => sum + c.montoTotal, 0);
    
    return {
      totalCuotas: cuotasDelPeriodo.length,
      cuotasPendientes: cuotasPendientes.length,
      cuotasVencidas: cuotasVencidas.length,
      cuotasPagadas: cuotasPagadas.length,
      montoPendiente,
      montoVencido,
      montoPagado,
      montoTotal: montoPendiente + montoVencido + montoPagado
    };
  }, [cuotasDelPeriodo]);

  // Generar días del mes con indicadores
  const diasDelMes = useMemo(() => {
    const dias = obtenerDiasDelMes(fechaActual);
    
    return dias.map(dia => {
      const cuotasDelDia = cuotasDelPeriodo.filter(cuota => 
        isSameDay(parseISO(cuota.fechaVencimiento), dia)
      );
      
      const tienePendientes = cuotasDelDia.some(c => c.estado === 'pendiente');
      const tieneVencidas = cuotasDelDia.some(c => c.estado === 'vencida');
      const tienePagadas = cuotasDelDia.some(c => c.estado === 'pagada');
      
      let indicador = 'none';
      if (tieneVencidas) indicador = 'vencida';
      else if (tienePendientes) indicador = 'pendiente';
      else if (tienePagadas) indicador = 'pagada';
      
      return {
        fecha: dia,
        cuotas: cuotasDelDia.length,
        indicador
      };
    });
  }, [fechaActual, cuotasDelPeriodo]);

  const navegarMes = (direccion: 'anterior' | 'siguiente') => {
    setFechaActual(prev => 
      direccion === 'anterior' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
    setDiaSeleccionado(null);
  };

  const seleccionarDia = (fecha: Date) => {
    setDiaSeleccionado(fecha);
  };

  const handleMarcarCuotaPagada = async (cuotaId: string, montoPagado: number) => {
    try {
      await marcarCuotaPagada(cuotaId, {
        cuotaId: cuotaId,
        monto: montoPagado,
        fechaPago: new Date().toISOString().split('T')[0],
        notas: 'Pago registrado desde calendario'
      });
      Alert.alert('Éxito', 'Cuota marcada como pagada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo marcar la cuota como pagada');
      console.error('Error al marcar cuota como pagada:', error);
    }
  };

  const irADetallePrestamo = (prestamoId: string) => {
    (navigation as any).navigate('PrestamoDetalle', { prestamoId });
  };

  const getIndicadorColor = (indicador: string) => {
    switch (indicador) {
      case 'vencida': return '#F44336';
      case 'pendiente': return '#FF9800';
      case 'pagada': return '#4CAF50';
      default: return 'transparent';
    }
  };

  if (state.isLoading) {
    return <LoadingSpinner text="Cargando calendario..." />;
  }

  const renderVistaCalendario = () => {
    switch (vista) {
      case 'proximos':
        return (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Próximos 7 días ({proximasCuotas.length} cuotas)</Text>
            {proximasCuotas.length === 0 ? (
              <EmptyState
                title="No hay cuotas próximas"
                description="No tienes cuotas pendientes en los próximos 7 días"
              />
            ) : (
              <FlatList
                data={proximasCuotas}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const cliente = obtenerCliente(item.clienteId);
                  const prestamo = obtenerPrestamo(item.prestamoId);
                  
                  return (
                    <CuotaCard
                      cuota={item}
                      cliente={cliente}
                      onPress={() => irADetallePrestamo(item.prestamoId)}
                      onMarkPaid={() => handleMarcarCuotaPagada(item.id, item.montoTotal)}
                      showActions={item.estado !== 'pagada'}
                    />
                  );
                }}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </Card>
        );

      case 'mes':
      default:
        return (
          <>
            {/* Vista del calendario mensual */}
            <Card style={styles.card}>
              <View style={styles.calendarioHeader}>
                <TouchableOpacity onPress={() => navegarMes('anterior')} style={styles.navButton}>
                  <Text style={styles.navButtonText}>◀</Text>
                </TouchableOpacity>
                
                <Text style={styles.mesAno}>
                  {format(fechaActual, 'MMMM yyyy', { locale: es })}
                </Text>
                
                <TouchableOpacity onPress={() => navegarMes('siguiente')} style={styles.navButton}>
                  <Text style={styles.navButtonText}>▶</Text>
                </TouchableOpacity>
              </View>

              {/* Días de la semana */}
              <View style={styles.diasSemana}>
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
                  <Text key={dia} style={styles.diaSemanaText}>{dia}</Text>
                ))}
              </View>

              {/* Grid del calendario */}
              <View style={styles.calendarioGrid}>
                {diasDelMes.map((dia, index) => {
                  const esHoy = isSameDay(dia.fecha, new Date());
                  const estaSeleccionado = diaSeleccionado && isSameDay(dia.fecha, diaSeleccionado);
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.diaCalendario,
                        esHoy && styles.diaHoy,
                        estaSeleccionado && styles.diaSeleccionado
                      ]}
                      onPress={() => seleccionarDia(dia.fecha)}
                    >
                      <Text style={[
                        styles.numeroDia,
                        esHoy && styles.numeroDiaHoy,
                        estaSeleccionado && styles.numeroDiaSeleccionado
                      ]}>
                        {format(dia.fecha, 'd')}
                      </Text>
                      
                      {dia.cuotas > 0 && (
                        <View style={[
                          styles.indicadorCuotas,
                          { backgroundColor: getIndicadorColor(dia.indicador) }
                        ]}>
                          <Text style={styles.numeroCuotas}>{dia.cuotas}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            {/* Cuotas del día seleccionado */}
            {diaSeleccionado && (
              <Card style={styles.card}>
                <Text style={styles.cardTitle}>
                  {formatearFechaTexto(diaSeleccionado)} ({cuotasDelDia.length} cuotas)
                </Text>
                
                {cuotasDelDia.length === 0 ? (
                  <Text style={styles.noCuotasText}>No hay cuotas para este día</Text>
                ) : (
                  <FlatList
                    data={cuotasDelDia}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                      const cliente = obtenerCliente(item.clienteId);
                      const prestamo = obtenerPrestamo(item.prestamoId);
                      
                      return (
                        <CuotaCard
                          cuota={item}
                          cliente={cliente}
                          onPress={() => irADetallePrestamo(item.prestamoId)}
                          onMarkPaid={() => handleMarcarCuotaPagada(item.id, item.montoTotal)}
                          showActions={item.estado !== 'pagada'}
                        />
                      );
                    }}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                  />
                )}
              </Card>
            )}
          </>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Estadísticas del período */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Resumen del Período</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{estadisticasPeriodo.totalCuotas}</Text>
            <Text style={styles.statLabel}>Total Cuotas</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.warningText]}>{estadisticasPeriodo.cuotasVencidas}</Text>
            <Text style={styles.statLabel}>Vencidas</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.primaryText]}>{estadisticasPeriodo.cuotasPendientes}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.successText]}>{estadisticasPeriodo.cuotasPagadas}</Text>
            <Text style={styles.statLabel}>Pagadas</Text>
          </View>
        </View>

        <View style={styles.montoStats}>
          <View style={styles.montoItem}>
            <Text style={styles.montoLabel}>Total a Cobrar</Text>
            <Text style={styles.montoValue}>${estadisticasPeriodo.montoTotal.toLocaleString()}</Text>
          </View>
          
          {estadisticasPeriodo.montoVencido > 0 && (
            <View style={styles.montoItem}>
              <Text style={[styles.montoLabel, styles.warningText]}>Vencido</Text>
              <Text style={[styles.montoValue, styles.warningText]}>
                ${estadisticasPeriodo.montoVencido.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Controles de vista */}
      <Card style={styles.card}>
        <OptionSelector
          title="Vista del Calendario"
          variant="buttons"
          options={[
            { key: 'mes', label: 'Mes', icon: '📅' },
            { key: 'proximos', label: 'Próximos 7 días', icon: '⏰' }
          ]}
          selectedKey={vista}
          onSelect={(key) => setVista(key as VistaCalendario)}
          style={styles.optionSelector}
        />

        <OptionSelector
          title="Filtrar por Estado"
          variant="chips"
          options={[
            { key: 'todos', label: 'Todos', icon: '📋' },
            { key: 'pendiente', label: 'Pendientes', icon: '⏳', color: '#2196F3' },
            { key: 'vencida', label: 'Vencidas', icon: '⚠️', color: '#F44336' },
            { key: 'pagada', label: 'Pagadas', icon: '✅', color: '#4CAF50' }
          ]}
          selectedKey={filtroEstado}
          onSelect={(key) => setFiltroEstado(key as FiltroEstado)}
          style={styles.optionSelector}
        />
      </Card>

      {/* Vista del calendario */}
      {renderVistaCalendario()}

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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
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
  montoStats: {
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  montoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  montoLabel: {
    fontSize: 14,
    color: '#666',
  },
  montoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionSelector: {
    marginBottom: 12,
  },
  calendarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  navButtonText: {
    fontSize: 18,
    color: '#333',
  },
  mesAno: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  diasSemana: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  diaSemanaText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  calendarioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  diaCalendario: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 8,
    margin: 1,
  },
  diaHoy: {
    backgroundColor: '#E3F2FD',
  },
  diaSeleccionado: {
    backgroundColor: '#2196F3',
  },
  numeroDia: {
    fontSize: 14,
    color: '#333',
  },
  numeroDiaHoy: {
    color: '#2196F3',
    fontWeight: '600',
  },
  numeroDiaSeleccionado: {
    color: '#fff',
    fontWeight: '600',
  },
  indicadorCuotas: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numeroCuotas: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  noCuotasText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  separator: {
    height: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});