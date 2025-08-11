import React, { useMemo } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { Card, Button, Badge, LoadingSpinner, EmptyState } from '../../components';
import { formatearFecha, formatearFechaTexto, getEstadoFecha } from '../../utils/dateUtils';
import { addDays, parseISO, differenceInDays } from 'date-fns';
import { BottomBannerAd, useInterstitialAds, AdMobDebug, AdPlaceholder } from '../../components/ads';

export function HomeScreen() {
  const navigation = useNavigation();
  const { state } = useApp();
  const { showOnNavigation } = useInterstitialAds();

  // Función para navegar con intersticial
  const navegarConIntersticial = async (pantalla: string) => {
    // Mostrar intersticial antes de navegar (respeta políticas automáticamente)
    await showOnNavigation();
    (navigation as any).navigate(pantalla);
  };

  // Estadísticas principales
  const estadisticasHome = useMemo(() => {
    const hoy = new Date();
    const en7Dias = addDays(hoy, 7);
    
    // Cuotas próximas a vencer (próximos 7 días)
    const cuotasProximas = state.cuotas.filter(cuota => {
      if (cuota.estado === 'pagada') return false;
      const fechaCuota = parseISO(cuota.fechaVencimiento);
      return fechaCuota >= hoy && fechaCuota <= en7Dias;
    }).sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));

    // Cuotas vencidas
    const cuotasVencidas = state.cuotas.filter(cuota => {
      if (cuota.estado === 'pagada') return false;
      const fechaCuota = parseISO(cuota.fechaVencimiento);
      return fechaCuota < hoy;
    });

    // Préstamos activos
    const prestamosActivos = state.prestamos.filter(p => p.estado === 'activo');
    
    // Cálculos financieros
    const capitalPrestado = state.prestamos.reduce((sum, p) => sum + p.monto, 0);
    const capitalRecuperado = state.pagos.reduce((sum, p) => sum + p.monto, 0);
    const montoPendiente = state.cuotas
      .filter(c => c.estado !== 'pagada')
      .reduce((sum, c) => sum + c.montoTotal, 0);
    const montoVencido = cuotasVencidas.reduce((sum, c) => sum + c.montoTotal, 0);

    // Clientes activos (con préstamos activos)
    const clientesActivos = new Set(prestamosActivos.map(p => p.clienteId));

    return {
      totalClientes: state.clientes.length,
      clientesActivos: clientesActivos.size,
      totalPrestamos: state.prestamos.length,
      prestamosActivos: prestamosActivos.length,
      capitalPrestado,
      capitalRecuperado,
      montoPendiente,
      montoVencido,
      cuotasProximas,
      cuotasVencidas,
      tasaRecuperacion: capitalPrestado > 0 ? (capitalRecuperado / capitalPrestado) * 100 : 0,
    };
  }, [state]);

  // Acciones rápidas
  const accionesRapidas = [
    {
      id: 'nuevo-cliente',
      titulo: 'Nuevo Cliente',
      icono: '👤',
      color: '#4CAF50',
      accion: () => (navigation as any).navigate('ClienteForm'),
    },
    {
      id: 'nuevo-prestamo',
      titulo: 'Nuevo Préstamo',
      icono: '💰',
      color: '#2196F3',
              accion: () => navegarConIntersticial('PrestamoForm'),
    },
    {
      id: 'calendario',
      titulo: 'Calendario',
      icono: '📅',
      color: '#FF9800',
      accion: () => (navigation as any).navigate('Calendario'),
    },
    {
      id: 'reportes',
      titulo: 'Reportes',
      icono: '📊',
      color: '#9C27B0',
      accion: () => (navigation as any).navigate('Reportes'),
    },
  ];

  const formatearMoneda = (valor: number): string => {
    return `$${valor.toLocaleString()}`;
  };

  const formatearPorcentaje = (valor: number): string => {
    return `${valor.toFixed(1)}%`;
  };

  const obtenerSaludo = (): string => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getDiasVencimiento = (fechaVencimiento: string): number => {
    return differenceInDays(parseISO(fechaVencimiento), new Date());
  };

  if (state.isLoading) {
    return <LoadingSpinner text="Cargando dashboard..." />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Saludo y Estado General */}
      <Card style={styles.card}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>{obtenerSaludo()}</Text>
          <Text style={styles.appName}>Gestor de Créditos</Text>
        </View>
        
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{estadisticasHome.totalClientes}</Text>
            <Text style={styles.quickStatLabel}>Clientes</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{estadisticasHome.prestamosActivos}</Text>
            <Text style={styles.quickStatLabel}>Préstamos Activos</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={[styles.quickStatValue, styles.successText]}>
              {formatearPorcentaje(estadisticasHome.tasaRecuperacion)}
            </Text>
            <Text style={styles.quickStatLabel}>Recuperación</Text>
          </View>
        </View>
      </Card>

      {/* Resumen Financiero */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>💰 Resumen Financiero</Text>
        
        <View style={styles.financialGrid}>
          <View style={styles.financialItem}>
            <View style={[styles.financialIcon, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.financialIconText}>💵</Text>
            </View>
            <View style={styles.financialInfo}>
              <Text style={styles.financialValue}>
                {formatearMoneda(estadisticasHome.capitalPrestado)}
              </Text>
              <Text style={styles.financialLabel}>Capital Prestado</Text>
            </View>
          </View>
          
          <View style={styles.financialItem}>
            <View style={[styles.financialIcon, { backgroundColor: '#E8F5E8' }]}>
              <Text style={styles.financialIconText}>💚</Text>
            </View>
            <View style={styles.financialInfo}>
              <Text style={[styles.financialValue, styles.successText]}>
                {formatearMoneda(estadisticasHome.capitalRecuperado)}
              </Text>
              <Text style={styles.financialLabel}>Recuperado</Text>
            </View>
          </View>
          
          <View style={styles.financialItem}>
            <View style={[styles.financialIcon, { backgroundColor: '#FFF3E0' }]}>
              <Text style={styles.financialIconText}>⏳</Text>
            </View>
            <View style={styles.financialInfo}>
              <Text style={[styles.financialValue, styles.warningText]}>
                {formatearMoneda(estadisticasHome.montoPendiente)}
              </Text>
              <Text style={styles.financialLabel}>Pendiente</Text>
            </View>
          </View>
          
          {estadisticasHome.montoVencido > 0 && (
            <View style={styles.financialItem}>
              <View style={[styles.financialIcon, { backgroundColor: '#FFEBEE' }]}>
                <Text style={styles.financialIconText}>🚨</Text>
              </View>
              <View style={styles.financialInfo}>
                <Text style={[styles.financialValue, styles.errorText]}>
                  {formatearMoneda(estadisticasHome.montoVencido)}
                </Text>
                <Text style={styles.financialLabel}>Vencido</Text>
              </View>
            </View>
          )}
        </View>
      </Card>

      {/* Alertas y Notificaciones */}
      {(estadisticasHome.cuotasVencidas.length > 0 || estadisticasHome.cuotasProximas.length > 0) && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>🔔 Alertas Importantes</Text>
          
          {estadisticasHome.cuotasVencidas.length > 0 && (
            <View style={styles.alertItem}>
              <View style={styles.alertIcon}>
                <Text style={styles.alertIconText}>⚠️</Text>
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Cuotas Vencidas</Text>
                <Text style={styles.alertDescription}>
                  {estadisticasHome.cuotasVencidas.length} cuotas vencidas por {formatearMoneda(estadisticasHome.montoVencido)}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.alertAction}
                onPress={() => (navigation as any).navigate('Calendario')}
              >
                <Text style={styles.alertActionText}>Ver</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {estadisticasHome.cuotasProximas.length > 0 && (
            <View style={styles.alertItem}>
              <View style={[styles.alertIcon, { backgroundColor: '#FFF3E0' }]}>
                <Text style={styles.alertIconText}>📅</Text>
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Próximos Vencimientos</Text>
                <Text style={styles.alertDescription}>
                  {estadisticasHome.cuotasProximas.length} cuotas vencen en los próximos 7 días
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.alertAction}
                onPress={() => (navigation as any).navigate('Calendario')}
              >
                <Text style={styles.alertActionText}>Ver</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      )}

      {/* Próximas Cuotas */}
      {estadisticasHome.cuotasProximas.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>📋 Próximas Cuotas (7 días)</Text>
          
          <FlatList
            data={estadisticasHome.cuotasProximas.slice(0, 5)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const cliente = state.clientes.find(c => c.id === item.clienteId);
              const diasRestantes = getDiasVencimiento(item.fechaVencimiento);
              const estadoFecha = getEstadoFecha(item.fechaVencimiento);
              
              return (
                <TouchableOpacity 
                  style={styles.cuotaItem}
                  onPress={() => {
                    const prestamo = state.prestamos.find(p => p.id === item.prestamoId);
                    if (prestamo) {
                      (navigation as any).navigate('PrestamoDetalle', { prestamoId: prestamo.id });
                    }
                  }}
                >
                  <View style={styles.cuotaInfo}>
                    <Text style={styles.cuotaCliente}>{cliente?.nombre || 'Cliente desconocido'}</Text>
                    <Text style={styles.cuotaDetalle}>
                      Cuota #{item.numeroCuota} • {formatearMoneda(item.montoTotal)}
                    </Text>
                    <Text style={styles.cuotaFecha}>
                      {formatearFechaTexto(item.fechaVencimiento)}
                    </Text>
                  </View>
                  <View style={styles.cuotaEstado}>
                    <Badge 
                      variant={diasRestantes === 0 ? 'danger' : diasRestantes <= 2 ? 'warning' : 'info'}
                      text={diasRestantes === 0 ? 'Hoy' : `${diasRestantes}d`}
                    />
                  </View>
                </TouchableOpacity>
              );
            }}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListFooterComponent={() => {
              if (estadisticasHome.cuotasProximas.length > 5) {
                return (
                  <TouchableOpacity 
                    style={styles.viewMoreButton}
                    onPress={() => (navigation as any).navigate('Calendario')}
                  >
                    <Text style={styles.viewMoreText}>
                      Ver {estadisticasHome.cuotasProximas.length - 5} más en el calendario
                    </Text>
                  </TouchableOpacity>
                );
              }
              return null;
            }}
          />
        </Card>
      )}

      {/* Acciones Rápidas */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
        
        <View style={styles.actionsGrid}>
          {accionesRapidas.map((accion) => (
            <TouchableOpacity
              key={accion.id}
              style={[styles.actionButton, { borderColor: accion.color }]}
              onPress={accion.accion}
            >
              <Text style={[styles.actionIcon, { color: accion.color }]}>
                {accion.icono}
              </Text>
              <Text style={styles.actionTitle}>{accion.titulo}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Estado de la App */}
      {(state.clientes.length === 0 || state.prestamos.length === 0) && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>🚀 Primeros Pasos</Text>
          
          {state.clientes.length === 0 && (
            <View style={styles.onboardingItem}>
              <Text style={styles.onboardingIcon}>👥</Text>
              <View style={styles.onboardingContent}>
                <Text style={styles.onboardingTitle}>Agrega tu primer cliente</Text>
                <Text style={styles.onboardingDescription}>
                  Comienza registrando los datos de tus clientes
                </Text>
              </View>
              <Button
                title="Crear"
                onPress={() => (navigation as any).navigate('ClienteForm')}
                size="small"
                variant="outline"
              />
            </View>
          )}
          
          {state.clientes.length > 0 && state.prestamos.length === 0 && (
            <View style={styles.onboardingItem}>
              <Text style={styles.onboardingIcon}>💰</Text>
              <View style={styles.onboardingContent}>
                <Text style={styles.onboardingTitle}>Crea tu primer préstamo</Text>
                <Text style={styles.onboardingDescription}>
                  Registra un préstamo y genera su cronograma automáticamente
                </Text>
              </View>
              <Button
                title="Crear"
                onPress={() => navegarConIntersticial('PrestamoForm')}
                size="small"
                variant="outline"
              />
            </View>
          )}
        </Card>
      )}

      {/* Banner publicitario */}
      <BottomBannerAd 
        onReceiveAd={() => console.log('📺 Banner cargado en Home')}
        onError={(error) => console.warn('⚠️ Error en banner Home:', error)}
      />

      {/* Componentes de Debug y Demostración */}
      <AdMobDebug />
      
      <AdPlaceholder 
        type="intersticial" 
        onPress={() => navegarConIntersticial('PrestamoForm')}
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
  greetingContainer: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  appName: {
    fontSize: 16,
    color: '#666',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  successText: {
    color: '#4CAF50',
  },
  warningText: {
    color: '#FF9800',
  },
  errorText: {
    color: '#F44336',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  financialGrid: {
    gap: 12,
  },
  financialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  financialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  financialIconText: {
    fontSize: 20,
  },
  financialInfo: {
    flex: 1,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  financialLabel: {
    fontSize: 12,
    color: '#666',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    marginBottom: 8,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFCDD2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertIconText: {
    fontSize: 18,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 2,
  },
  alertDescription: {
    fontSize: 12,
    color: '#F57C00',
  },
  alertAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2196F3',
    borderRadius: 16,
  },
  alertActionText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  cuotaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  cuotaInfo: {
    flex: 1,
  },
  cuotaCliente: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  cuotaDetalle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  cuotaFecha: {
    fontSize: 11,
    color: '#999',
  },
  cuotaEstado: {
    marginLeft: 12,
  },
  separator: {
    height: 8,
  },
  viewMoreButton: {
    padding: 12,
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    aspectRatio: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  onboardingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    marginBottom: 8,
  },
  onboardingIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  onboardingContent: {
    flex: 1,
  },
  onboardingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 4,
  },
  onboardingDescription: {
    fontSize: 14,
    color: '#1976D2',
  },
  bottomSpacing: {
    height: 32,
  },
});