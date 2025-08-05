import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Badge } from '../ui';
import { Prestamo, Cliente, ESTADOS_PRESTAMO } from '../../types';
import { formatearFecha, formatearParaLista } from '../../utils/dateUtils';

interface PrestamoCardProps {
  prestamo: Prestamo;
  cliente?: Cliente;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  cuotasPagadas?: number;
  porcentajeAvance?: number;
}

export function PrestamoCard({
  prestamo,
  cliente,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
  cuotasPagadas = 0,
  porcentajeAvance = 0,
}: PrestamoCardProps) {
  const estadoConfig = ESTADOS_PRESTAMO.find(e => e.value === prestamo.estado);
  const fechaInfo = formatearParaLista(prestamo.fechaVencimiento);

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.prestamoInfo}>
          {cliente && (
            <Text style={styles.clienteNombre}>{cliente.nombre}</Text>
          )}
          <Text style={styles.monto}>
            ${prestamo.monto.toLocaleString('es-CO')}
          </Text>
          <Text style={styles.detalles}>
            {prestamo.numeroCuotas} cuotas • {prestamo.frecuenciaPago} • {prestamo.tasaInteres}%
          </Text>
        </View>
        
        <View style={styles.estadoContainer}>
          <Badge
            text={estadoConfig?.label || 'Desconocido'}
            variant={getEstadoVariant(prestamo.estado)}
            size="small"
          />
          <Text style={styles.montoTotal}>
            Total: ${prestamo.montoTotal.toLocaleString('es-CO')}
          </Text>
        </View>
      </View>

      {/* Progreso */}
      <View style={styles.progreso}>
        <View style={styles.progresoHeader}>
          <Text style={styles.progresoTexto}>
            Progreso: {cuotasPagadas}/{prestamo.numeroCuotas} cuotas
          </Text>
          <Text style={styles.porcentaje}>
            {porcentajeAvance.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.barraProgreso}>
          <View 
            style={[
              styles.progresoFill, 
              { width: `${Math.min(porcentajeAvance, 100)}%` }
            ]} 
          />
        </View>
      </View>

      {/* Fechas */}
      <View style={styles.fechas}>
        <Text style={styles.fecha}>
          Inicio: {formatearFecha(prestamo.fechaPrestamo)}
        </Text>
        <Text style={[styles.fecha, { color: fechaInfo.estado.color }]}>
          Vence: {fechaInfo.fecha} ({fechaInfo.descripcion})
        </Text>
      </View>

      {prestamo.notas && (
        <Text style={styles.notas} numberOfLines={2}>
          {prestamo.notas}
        </Text>
      )}

      {showActions && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Text style={styles.editText}>✏️ Editar</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <Text style={styles.deleteText}>🗑️ Eliminar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
}

function getEstadoVariant(estado: Prestamo['estado']): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  switch (estado) {
    case 'activo':
      return 'success';
    case 'pagado':
      return 'info';
    case 'vencido':
      return 'danger';
    case 'cancelado':
      return 'default';
    default:
      return 'default';
  }
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  prestamoInfo: {
    flex: 1,
  },

  clienteNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },

  monto: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 4,
  },

  detalles: {
    fontSize: 12,
    color: '#666666',
  },

  estadoContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },

  montoTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },

  progreso: {
    marginBottom: 12,
  },

  progresoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  progresoTexto: {
    fontSize: 14,
    color: '#666666',
  },

  porcentaje: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },

  barraProgreso: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },

  progresoFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },

  fechas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  fecha: {
    fontSize: 12,
    color: '#666666',
  },

  notas: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 8,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  editText: {
    fontSize: 12,
    color: '#2196F3',
  },

  deleteText: {
    fontSize: 12,
    color: '#F44336',
  },
});