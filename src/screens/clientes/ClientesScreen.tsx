import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { useApp } from '../../context/AppContext';
import { Button, LoadingSpinner, EmptyState, Input, ClienteCard, LimitIndicator, PremiumBadge } from '../../components';
import { SimplePaywall } from '../../components/paywall/SimplePaywall';
// Ads eliminados
import { usePremium } from '../../hooks/usePremium';
import { useContextualPaywall } from '../../hooks/useContextualPaywall';
import { useConversionFlow } from '../../hooks/useConversionFlow';
import { isFeatureAllowed } from '../../utils/featureGating';

export function ClientesScreen() {
  const navigation = useNavigation();
  const premium = usePremium();
  const contextualPaywall = useContextualPaywall();
  const conversionFlow = useConversionFlow();
  const { 
    state, 
    obtenerClientesFiltrados, 
    eliminarCliente,
    dispatch,
    obtenerPrestamosPorCliente 
  } = useApp();
  
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Aplicar filtro de búsqueda
  useEffect(() => {
    dispatch({
      type: 'SET_FILTRO_CLIENTES',
      payload: {
        busqueda: searchText.trim(),
        orderBy: 'nombre',
        order: 'asc',
      },
    });
  }, [searchText, dispatch]);

  const clientesFiltrados = obtenerClientesFiltrados();

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular refresh - en una app real esto recargaria datos del servidor
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleCreateCliente = () => {
    // Verificar si debe mostrar paywall preventivo
    if (conversionFlow.shouldShowPreventivePaywall()) {
      conversionFlow.showPaywall('preventive');
      contextualPaywall.showPaywall('create_cliente');
      return;
    }

    const gate = isFeatureAllowed('create_cliente', {
      clientesCount: state.clientes.length,
      prestamosActivosCount: state.prestamos.filter(p => p.estado === 'activo').length,
      isPremium: premium.isPremium,
    });
    if (!gate.allowed) {
      conversionFlow.showPaywall('blocking');
      contextualPaywall.showPaywall('create_cliente');
      return;
    }
    (navigation as any).navigate('ClienteForm');
  };

  const handleEditCliente = (clienteId: string) => {
    (navigation as any).navigate('ClienteForm', { clienteId });
  };

  const handleViewCliente = async (clienteId: string) => {
    (navigation as any).navigate('ClienteDetalle', { clienteId });
  };

  const handleDeleteCliente = (clienteId: string, clienteNombre: string) => {
    const prestamos = obtenerPrestamosPorCliente(clienteId);
    
    if (prestamos.length > 0) {
      Alert.alert(
        'No se puede eliminar',
        `${clienteNombre} tiene ${prestamos.length} préstamo${prestamos.length > 1 ? 's' : ''} asociado${prestamos.length > 1 ? 's' : ''}. Elimina primero los préstamos.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar a ${clienteNombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarCliente(clienteId);
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

  const calcularEstadisticasCliente = (clienteId: string) => {
    const prestamos = obtenerPrestamosPorCliente(clienteId);
    const totalPrestado = prestamos.reduce((sum, p) => sum + p.montoTotal, 0);
    const prestamosActivos = prestamos.filter(p => p.estado === 'activo').length;
    
    return {
      totalPrestado,
      prestamosActivos,
    };
  };

  if (state.isLoading) {
    return <LoadingSpinner text="Cargando clientes..." />;
  }

  return (
    <View style={styles.container}>
      {/* Indicador de límites para usuarios no premium */}
      {!premium.isPremium && (
        <LimitIndicator
          current={state.clientes.length}
          limit={10}
          label="Clientes"
          icon="👥"
          onUpgrade={() => contextualPaywall.showPaywall('create_cliente')}
        />
      )}

      {/* Header con búsqueda y botones */}
      <View style={styles.header}>
        <Input
          placeholder="Buscar clientes..."
          value={searchText}
          onChangeText={setSearchText}
          containerStyle={styles.searchInput}
        />
        
        <Button
          title="⚙️"
          onPress={() => (navigation as any).navigate('Configuracion')}
          size="small"
          variant="outline"
          style={styles.settingsButton}
        />
        
        <Button
          title="+ Nuevo Cliente"
          onPress={handleCreateCliente}
          size="small"
          style={styles.createButton}
        />
      </View>


      {/* Lista de clientes */}
      {clientesFiltrados.length === 0 ? (
        <EmptyState
          title={searchText ? "No se encontraron clientes" : "No hay clientes"}
          description={
            searchText 
              ? "Intenta con una búsqueda diferente"
              : "Comienza agregando tu primer cliente"
          }
          actionText={!searchText ? "Agregar Cliente" : undefined}
          onAction={!searchText ? handleCreateCliente : undefined}
        />
      ) : (
        <FlatList
          data={clientesFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const stats = calcularEstadisticasCliente(item.id);
            return (
              <ClienteCard
                cliente={item}
                onPress={() => handleViewCliente(item.id)}
                onEdit={() => handleEditCliente(item.id)}
                onDelete={() => handleDeleteCliente(item.id, item.nombre)}
                showActions={true}
                totalPrestado={stats.totalPrestado}
                prestamosActivos={stats.prestamosActivos}
              />
            );
          }}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#2196F3']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Paywall Simple */}
      <SimplePaywall
        visible={contextualPaywall.visible}
        onClose={contextualPaywall.hidePaywall}
        onSelect={contextualPaywall.handleSubscribe}
        onStartTrial={contextualPaywall.handleStartTrial}
        context={{
          currentUsage: contextualPaywall.context?.currentUsage || state.clientes.length,
          limit: contextualPaywall.context?.limit || 10,
          featureName: contextualPaywall.context?.featureName || 'Clientes',
        }}
      />
      
      {/* Espacio inferior para safe area */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  header: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  
  searchInput: {
    flex: 1,
    marginVertical: 0,
  },
  settingsButton: {
    minWidth: 40,
    paddingHorizontal: 12,
  },
  
  createButton: {
    alignSelf: 'flex-end',
  },
  
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
});