import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Card, 
  Button, 
  LoadingSpinner, 
  EmptyState, 
  Badge,
  PrestamoCard 
} from '../../components';
import { formatearFecha } from '../../utils/dateUtils';

type RouteProps = RouteProp<RootStackParamList, 'ClienteDetalle'>;

export function ClienteDetalleScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { clienteId } = route.params;
  
  const { 
    obtenerCliente, 
    obtenerPrestamosPorCliente,
    obtenerPagosPorPrestamo,
    eliminarCliente,
    state 
  } = useApp();
  
  const [refreshing, setRefreshing] = useState(false);
  
  const cliente = obtenerCliente(clienteId);
  const prestamos = obtenerPrestamosPorCliente(clienteId);
  const cuotas = state.cuotas.filter(c => c.clienteId === clienteId);
  
  // Obtener todos los pagos del cliente a través de sus préstamos
  const pagos = prestamos.reduce((allPagos: any[], prestamo) => {
    const pagosPrestamo = obtenerPagosPorPrestamo(prestamo.id);
    return [...allPagos, ...pagosPrestamo];
  }, []);

  useEffect(() => {
    if (cliente) {
      navigation.setOptions({
        title: cliente.nombre,
      });
    }
  }, [navigation, cliente]);

  useEffect(() => {
    if (!cliente) {
      Alert.alert(
        'Error',
        'Cliente no encontrado',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [cliente, navigation]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleEdit = () => {
    (navigation as any).navigate('ClienteForm', { clienteId });
  };

  const handleDelete = () => {
    if (!cliente) return;

    if (prestamos.length > 0) {
      Alert.alert(
        'No se puede eliminar',
        `${cliente.nombre} tiene ${prestamos.length} préstamo${prestamos.length > 1 ? 's' : ''} asociado${prestamos.length > 1 ? 's' : ''}. Elimina primero los préstamos.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar a ${cliente.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarCliente(clienteId);
              (navigation as any).navigate('Clientes');
            } catch (error) {
              Alert.alert(
                'Error',
                'No se pudo eliminar el cliente. Intenta nuevamente.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const handleCreatePrestamo = () => {
    (navigation as any).navigate('PrestamoForm', { clienteId });
  };

  const handleViewPrestamo = (prestamoId: string) => {
    (navigation as any).navigate('PrestamoDetalle', { prestamoId });
  };

  const calcularEstadisticas = () => {
    const totalPrestado = prestamos.reduce((sum: number, p) => sum + p.montoTotal, 0);
    const totalPagado = pagos.reduce((sum: number, p: any) => sum + p.monto, 0);
    const totalPendiente = totalPrestado - totalPagado;
    const prestamosActivos = prestamos.filter(p => p.estado === 'activo').length;
    const cuotasVencidas = cuotas.filter((c) => c.estado === 'vencida').length;
    const ultimoPago = pagos.length > 0 ? pagos[0].fechaPago : null;

    return {
      totalPrestado,
      totalPagado,
      totalPendiente,
      prestamosActivos,
      cuotasVencidas,
      ultimoPago,
    };
  };

  if (state.isLoading) {
    return <LoadingSpinner text="Cargando cliente..." />;
  }

  if (!cliente) {
    return (
      <EmptyState
        title="Cliente no encontrado"
        description="El cliente que buscas no existe o fue eliminado"
        actionText="Volver"
        onAction={() => navigation.goBack()}
      />
    );
  }

  const stats = calcularEstadisticas();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#2196F3']}
        />
      }
    >
      {/* Información del cliente */}
      <Card style={styles.clienteCard}>
        <View style={styles.clienteHeader}>
          <View style={styles.clienteInfo}>
            <Text style={styles.nombre}>{cliente.nombre}</Text>
            <Text style={styles.telefono}>📞 {cliente.telefono}</Text>
            {cliente.email && (
              <Text style={styles.email}>✉️ {cliente.email}</Text>
            )}
            {cliente.direccion && (
              <Text style={styles.direccion}>📍 {cliente.direccion}</Text>
            )}
          </View>
        </View>

        {cliente.notas && (
          <Text style={styles.notas}>{cliente.notas}</Text>
        )}

        <Text style={styles.fechaCreacion}>
          Cliente desde: {formatearFecha(cliente.fechaCreacion)}
        </Text>

        <View style={styles.actionButtons}>
          <Button
            title="✏️ Editar"
            onPress={handleEdit}
            variant="outline"
            size="small"
            style={styles.actionButton}
          />
          <Button
            title="🗑️ Eliminar"
            onPress={handleDelete}
            variant="danger"
            size="small"
            style={styles.actionButton}
          />
        </View>
      </Card>

      {/* Estadísticas */}
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Resumen Financiero</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              ${stats.totalPrestado.toLocaleString('es-CO')}
            </Text>
            <Text style={styles.statLabel}>Total Prestado</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>
              ${stats.totalPagado.toLocaleString('es-CO')}
            </Text>
            <Text style={styles.statLabel}>Total Pagado</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F44336' }]}>
              ${stats.totalPendiente.toLocaleString('es-CO')}
            </Text>
            <Text style={styles.statLabel}>Pendiente</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.prestamosActivos}</Text>
            <Text style={styles.statLabel}>Préstamos Activos</Text>
          </View>
        </View>

        {stats.cuotasVencidas > 0 && (
          <Badge
            text={`${stats.cuotasVencidas} cuota${stats.cuotasVencidas > 1 ? 's' : ''} vencida${stats.cuotasVencidas > 1 ? 's' : ''}`}
            variant="danger"
            style={styles.vencidaBadge}
          />
        )}

        {stats.ultimoPago && (
          <Text style={styles.ultimoPago}>
            Último pago: {formatearFecha(stats.ultimoPago)}
          </Text>
        )}
      </Card>

      {/* Préstamos */}
      <Card style={styles.prestamosCard}>
        <View style={styles.prestamosHeader}>
          <Text style={styles.prestamosTitle}>
            Préstamos ({prestamos.length})
          </Text>
          <Button
            title="+ Nuevo Préstamo"
            onPress={handleCreatePrestamo}
            size="small"
          />
        </View>

        {prestamos.length === 0 ? (
          <EmptyState
            title="No hay préstamos"
            description="Este cliente no tiene préstamos registrados"
            actionText="Crear Préstamo"
            onAction={handleCreatePrestamo}
          />
        ) : (
          <View style={styles.prestamosList}>
            {prestamos.map((prestamo) => {
              const cuotasPrestamo = cuotas.filter((c) => c.prestamoId === prestamo.id);
              const cuotasPagadas = cuotasPrestamo.filter((c) => c.estado === 'pagada').length;
              const porcentajeAvance = (cuotasPagadas / prestamo.numeroCuotas) * 100;

              return (
                <PrestamoCard
                  key={prestamo.id}
                  prestamo={prestamo}
                  onPress={() => handleViewPrestamo(prestamo.id)}
                  cuotasPagadas={cuotasPagadas}
                  porcentajeAvance={porcentajeAvance}
                />
              );
            })}
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },

  clienteCard: {
    marginBottom: 16,
  },

  clienteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  clienteInfo: {
    flex: 1,
  },

  nombre: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },

  telefono: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },

  email: {
    fontSize: 16,
    color: '#2196F3',
    marginBottom: 4,
  },

  direccion: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },

  notas: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },

  fechaCreacion: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 16,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    flex: 1,
  },

  statsCard: {
    marginBottom: 16,
  },

  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },

  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },

  vencidaBadge: {
    alignSelf: 'center',
    marginBottom: 8,
  },

  ultimoPago: {
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
  },

  prestamosCard: {
    marginBottom: 16,
  },

  prestamosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  prestamosTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },

  prestamosList: {
    gap: 8,
  },
});