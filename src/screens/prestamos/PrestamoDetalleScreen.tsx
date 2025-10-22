import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Alert, RefreshControl, FlatList } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { useApp } from '../../context/AppContext';
import { Card, Button, LoadingSpinner, EmptyState, Badge, CuotaCard, PagoModal } from '../../components';
import { formatearFecha, formatearFechaTexto, getEstadoFecha } from '../../utils/dateUtils';
import { CalculationService } from '../../services/calculations';
import { ReviewService } from '../../services/reviewService';

type RouteProps = RouteProp<RootStackParamList, 'PrestamoDetalle'>;

export function PrestamoDetalleScreen() {
  const navigation = useNavigation(); // Cast to any for navigation calls
  const route = useRoute<RouteProps>();
  const { prestamoId } = route.params;
  const { 
    obtenerPrestamo, 
    obtenerCliente, 
    obtenerCuotasPorPrestamo,
    obtenerPagosPorPrestamo,
    obtenerPagosPorCuota,
    eliminarPrestamo, 
    marcarCuotaPagada,
    state 
  } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [modalPagoVisible, setModalPagoVisible] = useState(false);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<string | null>(null);
  
  const prestamo = obtenerPrestamo(prestamoId);
  const cliente = prestamo ? obtenerCliente(prestamo.clienteId) : undefined;
  const cuotas = obtenerCuotasPorPrestamo(prestamoId);
  const pagos = obtenerPagosPorPrestamo(prestamoId);

  useEffect(() => {
    // Actualizar título con nombre del cliente
    if (cliente) {
      (navigation as any).setOptions({ title: `Préstamo - ${cliente.nombre}` });
    }
  }, [navigation, cliente]);

  useEffect(() => {
    // Redirigir si el préstamo no existe
    if (!prestamo) {
      Alert.alert(
        'Error',
        'No se pudo encontrar el préstamo',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [prestamo, navigation]);

  const handleEdit = () => {
    (navigation as any).navigate('PrestamoForm', { prestamoId });
  };

  const handleDelete = () => {
    if (!prestamo || !cliente) return;
    
    const cuotasPagadas = cuotas.filter(c => c.estado === 'pagada').length;
    
    if (cuotasPagadas > 0) {
      Alert.alert(
        'No se puede eliminar',
        `Este préstamo tiene ${cuotasPagadas} cuota(s) pagada(s). No se puede eliminar un préstamo con pagos registrados.`,
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar este préstamo de $${prestamo.monto.toLocaleString()} para ${cliente.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarPrestamo(prestamoId);
              Alert.alert(
                'Éxito', 
                'Préstamo eliminado correctamente',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el préstamo');
              console.error('Error al eliminar préstamo:', error);
            }
          }
        }
      ]
    );
  };

  const handleMarcarCuotaPagada = async (cuotaId: string) => {
    setCuotaSeleccionada(cuotaId);
    setModalPagoVisible(true);
  };

  const handleConfirmarPago = async (monto: number, metodoPago: string, notas: string) => {
    try {
      await marcarCuotaPagada(cuotaSeleccionada!, {
        cuotaId: cuotaSeleccionada!,
        monto: monto,
        fechaPago: new Date().toISOString().split('T')[0],
        metodoPago: metodoPago as 'efectivo' | 'transferencia' | 'cheque' | 'otro',
        notas: notas
      });
      
      setModalPagoVisible(false);
      setCuotaSeleccionada(null);
      
      // Verificar si el préstamo se completó
      const cuotasActualizadas = obtenerCuotasPorPrestamo(prestamoId);
      const todasPagadas = cuotasActualizadas.every(c => c.estado === 'pagada');
      
      if (todasPagadas) {
        // ¡Préstamo completado! - Momento perfecto para pedir reseña
        Alert.alert(
          '¡Felicitaciones! 🎉', 
          'Préstamo completado exitosamente',
          [{ 
            text: 'Genial', 
            onPress: async () => {
              // Trigger de reseña después de completar préstamo (prioridad alta)
              await ReviewService.triggerOnLoanCompleted();
            }
          }]
        );
      } else {
        Alert.alert('Éxito', 'Pago registrado correctamente');
        // Trigger de milestone de pagos
        await ReviewService.triggerOnPaymentMilestone();
      }
    } catch (error) {
      console.error('Error registrando pago:', error);
      Alert.alert('Error', 'No se pudo registrar el pago');
    }
  };

  const calcularEstadisticas = () => {
    if (!prestamo) return null;
    
    const totalPagado = pagos.reduce((sum: number, pago: any) => sum + pago.monto, 0);
    return CalculationService.calcularEstadisticasPrestamo(prestamo, cuotas, totalPagado);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simular refresh - en una app real aquí podrías recargar datos
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return { variant: 'success' as const, text: 'Activo' };
      case 'completado':
        return { variant: 'info' as const, text: 'Completado' };
      case 'vencido':
        return { variant: 'danger' as const, text: 'Vencido' };
      case 'cancelado':
        return { variant: 'warning' as const, text: 'Cancelado' };
      default:
        return { variant: 'default' as const, text: estado };
    }
  };

  const getTipoInteresBadge = (tipo: string) => {
    switch (tipo) {
      case 'simple':
        return { variant: 'info' as const, text: 'Interés Simple' };
      case 'compuesto':
        return { variant: 'warning' as const, text: 'Interés Compuesto' };
      case 'mensual_fijo':
        return { variant: 'success' as const, text: 'Interés Mensual Fijo' };
      case 'mensual_sobre_saldo':
        return { variant: 'default' as const, text: 'Interés Mensual sobre Saldo' };
      case 'mensual_directo':
        return { variant: 'info' as const, text: 'Interés Mensual Directo' };
      default:
        return { variant: 'default' as const, text: tipo };
    }
  };

  const getFrecuenciaPagoText = (frecuencia: string) => {
    switch (frecuencia) {
      case 'semanal': return 'Semanal';
      case 'quincenal': return 'Quincenal';
      case 'mensual': return 'Mensual';
      case 'bimestral': return 'Bimestral';
      case 'trimestral': return 'Trimestral';
      default: return frecuencia;
    }
  };

  if (state.isLoading) {
    return <LoadingSpinner text="Cargando préstamo..." />;
  }

  if (!prestamo || !cliente) {
    return (
      <EmptyState
        title="Préstamo no encontrado"
        description="No se pudo cargar la información del préstamo"
        actionText="Volver"
        onAction={() => navigation.goBack()}
      />
    );
  }

  const estadisticas = calcularEstadisticas();
  const estadoBadge = getEstadoBadge(prestamo.estado);
  const tipoInteresBadge = getTipoInteresBadge(prestamo.tipoInteres);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
      {/* Información del Cliente */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Cliente</Text>
        <View style={styles.clienteInfo}>
          <Text style={styles.clienteNombre}>{cliente.nombre}</Text>
          {cliente.telefono && (
            <Text style={styles.clienteTelefono}>📞 {cliente.telefono}</Text>
          )}
        </View>
      </Card>

      {/* Información del Préstamo */}
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Información del Préstamo</Text>
          <Badge variant={estadoBadge.variant} text={estadoBadge.text} />
        </View>
        
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Monto Original</Text>
            <Text style={styles.infoValue}>${prestamo.monto.toLocaleString()}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tasa de Interés</Text>
            <Text style={styles.infoValue}>{prestamo.tasaInteres}% {prestamo.periodoTasa || 'anual'}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tipo de Interés</Text>
            <Badge variant={tipoInteresBadge.variant} text={tipoInteresBadge.text} />
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Cuotas</Text>
            <Text style={styles.infoValue}>{prestamo.numeroCuotas}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Frecuencia</Text>
            <Text style={styles.infoValue}>{getFrecuenciaPagoText(prestamo.frecuenciaPago)}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Fecha de Inicio</Text>
            <Text style={styles.infoValue}>{formatearFechaTexto(prestamo.fechaPrestamo)}</Text>
          </View>
        </View>

        {prestamo.notas && (
          <View style={styles.observaciones}>
            <Text style={styles.infoLabel}>Notas</Text>
            <Text style={styles.observacionesText}>{prestamo.notas}</Text>
          </View>
        )}
      </Card>

      {/* Estadísticas */}
      {estadisticas && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Progreso del Préstamo</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${estadisticas.totalPrestado.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Prestado</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.greenText]}>${estadisticas.totalPagado.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Pagado</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.redText]}>${estadisticas.totalPendiente.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Pendiente</Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${estadisticas.porcentajeAvance}%` }]} 
            />
          </View>
          <Text style={styles.progressText}>{estadisticas.porcentajeAvance.toFixed(1)}% completado</Text>
          
          <View style={styles.cuotasStats}>
            <Badge variant="success" text={`${estadisticas.cuotasPagadas} Pagadas`} />
            <Badge variant="warning" text={`${estadisticas.cuotasPendientes} Pendientes`} />
            {estadisticas.cuotasVencidas > 0 && (
              <Badge variant="danger" text={`${estadisticas.cuotasVencidas} Vencidas`} />
            )}
          </View>
        </Card>
      )}

      {/* Cronograma de Cuotas */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Cronograma de Cuotas ({cuotas.length})</Text>
        
        {cuotas.length === 0 ? (
          <EmptyState
            title="Sin cuotas"
            description="No se han generado cuotas para este préstamo"
          />
        ) : (
          <FlatList
            data={cuotas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CuotaCard
                cuota={item}
                onMarkPaid={() => handleMarcarCuotaPagada(item.id)}
                showActions={item.estado !== 'pagada'}
                montoPagado={item.montoPagado || 0}
              />
            )}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </Card>

      {/* Acciones */}
      <Card style={styles.card}>
        <View style={styles.actionsContainer}>
          <Button
            title="Editar Préstamo"
            onPress={handleEdit}
            variant="outline"
            size="medium"
            style={styles.actionButton}
          />
          <Button
            title="Eliminar Préstamo"
            onPress={handleDelete}
            variant="outline"
            size="medium"
            style={StyleSheet.flatten([styles.actionButton, styles.deleteButton])}
            textStyle={styles.deleteButtonText}
          />
        </View>
      </Card>

      <View style={styles.bottomSpacing} />
    </ScrollView>

    {/* Modal de Pago */}
    {cuotaSeleccionada && (
      <PagoModal
        visible={modalPagoVisible}
        cuota={cuotas.find(c => c.id === cuotaSeleccionada) || null}
        pagosAnteriores={obtenerPagosPorCuota(cuotaSeleccionada)}
        onClose={() => {
          setModalPagoVisible(false);
          setCuotaSeleccionada(null);
        }}
        onConfirm={handleConfirmarPago}
      />
    )}
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clienteInfo: {
    gap: 8,
  },
  clienteNombre: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  clienteTelefono: {
    fontSize: 16,
    color: '#666',
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  observaciones: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  observacionesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
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
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  greenText: {
    color: '#4CAF50',
  },
  redText: {
    color: '#F44336',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginVertical: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  cuotasStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  separator: {
    height: 8,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    borderColor: '#F44336',
  },
  deleteButtonText: {
    color: '#F44336',
  },
  bottomSpacing: {
    height: 32,
  },
});