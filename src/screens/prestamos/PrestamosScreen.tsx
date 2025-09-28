import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { useApp } from '../../context/AppContext';
import { Button, LoadingSpinner, EmptyState, Input, PrestamoCard, LimitIndicator, PremiumBadge } from '../../components';
import { SimplePaywall } from '../../components/paywall/SimplePaywall';
// Ads eliminados
import { usePremium } from '../../hooks/usePremium';
import { useContextualPaywall } from '../../hooks/useContextualPaywall';
import { useConversionFlow } from '../../hooks/useConversionFlow';
import { isFeatureAllowed } from '../../utils/featureGating';

export function PrestamosScreen() {
  const navigation = useNavigation(); // Cast to any for navigation calls
  const premium = usePremium();
  const contextualPaywall = useContextualPaywall();
  const conversionFlow = useConversionFlow();
  const { 
    state, 
    obtenerPrestamosFiltrados, 
    eliminarPrestamo, 
    dispatch, 
    obtenerCliente,
    obtenerCuotasPorPrestamo 
  } = useApp();
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Actualizar filtro cuando cambie el texto de búsqueda
    dispatch({
      type: 'SET_FILTRO_PRESTAMOS',
      payload: {
        busqueda: searchText,
        estado: state.filtroPrestamos.estado,
        clienteId: state.filtroPrestamos.clienteId,
        fechaDesde: state.filtroPrestamos.fechaDesde,
        fechaHasta: state.filtroPrestamos.fechaHasta
      }
    });
  }, [searchText, dispatch]);

  const prestamosFiltrados = obtenerPrestamosFiltrados();

  const handleCreatePrestamo = () => {
    // Verificar si debe mostrar paywall preventivo
    if (conversionFlow.shouldShowPreventivePaywall()) {
      conversionFlow.showPaywall('preventive');
      contextualPaywall.showPaywall('create_prestamo');
      return;
    }

    const gate = isFeatureAllowed('create_prestamo', {
      clientesCount: state.clientes.length,
      prestamosActivosCount: state.prestamos.filter(p => p.estado === 'activo').length,
      isPremium: premium.isPremium,
    });
    if (!gate.allowed) {
      conversionFlow.showPaywall('blocking');
      contextualPaywall.showPaywall('create_prestamo');
      return;
    }
    (navigation as any).navigate('PrestamoForm');
  };

  const handleEditPrestamo = (prestamoId: string) => {
    (navigation as any).navigate('PrestamoForm', { prestamoId });
  };

  const handleViewPrestamo = async (prestamoId: string) => {
    (navigation as any).navigate('PrestamoDetalle', { prestamoId });
  };

  const handleDeletePrestamo = (prestamoId: string, clienteNombre: string, monto: number) => {
    const cuotas = obtenerCuotasPorPrestamo(prestamoId);
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
      `¿Estás seguro de que quieres eliminar el préstamo de $${monto.toLocaleString()} para ${clienteNombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarPrestamo(prestamoId);
              Alert.alert('Éxito', 'Préstamo eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el préstamo');
              console.error('Error al eliminar préstamo:', error);
            }
          }
        }
      ]
    );
  };

  const calcularEstadisticasPrestamo = (prestamoId: string) => {
    const cuotas = obtenerCuotasPorPrestamo(prestamoId);
    const cuotasPagadas = cuotas.filter(c => c.estado === 'pagada').length;
    const cuotasPendientes = cuotas.filter(c => c.estado === 'pendiente').length;
    const cuotasVencidas = cuotas.filter(c => c.estado === 'vencida').length;
    
    return {
      cuotasPagadas,
      cuotasPendientes,
      cuotasVencidas,
      totalCuotas: cuotas.length,
      proximasCuotas: cuotas
        .filter(c => c.estado === 'pendiente')
        .slice(0, 3)
    };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simular refresh - en una app real aquí podrías recargar datos
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (state.isLoading) {
    return <LoadingSpinner text="Cargando préstamos..." />;
  }

  return (
    <View style={styles.container}>
      {/* Indicador de límites para usuarios no premium */}
      {!premium.isPremium && (
        <LimitIndicator
          current={state.prestamos.filter(p => p.estado === 'activo').length}
          limit={10}
          label="Préstamos Activos"
          icon="💰"
          onUpgrade={() => contextualPaywall.showPaywall('create_prestamo')}
        />
      )}

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Input
            placeholder="Buscar por cliente o monto..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <Button
          title="⚙️"
          onPress={() => (navigation as any).navigate('Configuracion')}
          size="small"
          variant="outline"
          style={styles.settingsButton}
        />
        <Button
          title="Nuevo Préstamo"
          onPress={handleCreatePrestamo}
          size="medium"
          style={styles.createButton}
        />
      </View>

      <FlatList
        data={prestamosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const cliente = obtenerCliente(item.clienteId);
          const estadisticas = calcularEstadisticasPrestamo(item.id);
          
          return (
            <PrestamoCard
              prestamo={item}
              cliente={cliente}
              onPress={() => handleViewPrestamo(item.id)}
              onEdit={() => handleEditPrestamo(item.id)}
              onDelete={() => handleDeletePrestamo(
                item.id, 
                cliente?.nombre || 'Cliente desconocido', 
                item.monto
              )}
              showActions={true}
              cuotasPagadas={estadisticas.cuotasPagadas}
              porcentajeAvance={estadisticas.cuotasPagadas > 0 ? 
                (estadisticas.cuotasPagadas / (estadisticas.cuotasPagadas + estadisticas.cuotasPendientes + estadisticas.cuotasVencidas)) * 100 : 0}
            />
          );
        }}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No hay préstamos"
            description={
              searchText
                ? "No se encontraron préstamos que coincidan con tu búsqueda"
                : "Aún no has creado ningún préstamo.\n¡Crea tu primer préstamo!"
            }
            actionText="Crear Préstamo"
            onAction={handleCreatePrestamo}
          />
        }
      />
      
      {/* Paywall Simple */}
      <SimplePaywall
        visible={contextualPaywall.visible}
        onClose={contextualPaywall.hidePaywall}
        onSelect={contextualPaywall.handleSubscribe}
        onStartTrial={contextualPaywall.handleStartTrial}
        context={{
          currentUsage: contextualPaywall.context?.currentUsage || state.prestamos.filter(p => p.estado === 'activo').length,
          limit: contextualPaywall.context?.limit || 10,
          featureName: contextualPaywall.context?.featureName || 'Préstamos Activos',
        }}
      />
      
      {/* Espacio inferior para safe area */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flex: 1,
  },
  settingsButton: {
    minWidth: 40,
    paddingHorizontal: 12,
  },
  createButton: {
    paddingHorizontal: 16,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
});