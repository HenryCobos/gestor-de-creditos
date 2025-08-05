import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Badge } from '../ui';
import { Cuota, Cliente, ESTADOS_CUOTA } from '../../types';
import { formatearParaLista } from '../../utils/dateUtils';

interface CuotaCardProps {
  cuota: Cuota;
  cliente?: Cliente;
  onPress?: () => void;
  onMarkPaid?: () => void;
  showActions?: boolean;
  montoPagado?: number;
}

export function CuotaCard({
  cuota,
  cliente,
  onPress,
  onMarkPaid,
  showActions = false,
  montoPagado = 0,
}: CuotaCardProps) {
  const estadoConfig = ESTADOS_CUOTA.find(e => e.value === cuota.estado);
  const fechaInfo = formatearParaLista(cuota.fechaVencimiento);
  const montoRestante = cuota.montoTotal - montoPagado;

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.cuotaInfo}>
          <Text style={styles.numeroCuota}>
            Cuota #{cuota.numeroCuota}
          </Text>
          {cliente && (
            <Text style={styles.clienteNombre}>{cliente.nombre}</Text>
          )}
          <Text style={styles.monto}>
            ${cuota.montoTotal.toLocaleString('es-CO')}
          </Text>
        </View>
        
        <View style={styles.estadoContainer}>
          <Badge
            text={estadoConfig?.label || 'Desconocido'}
            variant={getEstadoVariant(cuota.estado)}
            size="small"
          />
          <Text style={[styles.fecha, { color: fechaInfo.estado.color }]}>
            {fechaInfo.descripcion}
          </Text>
        </View>
      </View>

      {/* Desglose */}
      <View style={styles.desglose}>
        <View style={styles.desgloseItem}>
          <Text style={styles.desgloseLabel}>Capital:</Text>
          <Text style={styles.desgloseValue}>
            ${cuota.montoCapital.toLocaleString('es-CO')}
          </Text>
        </View>
        <View style={styles.desgloseItem}>
          <Text style={styles.desgloseLabel}>Interés:</Text>
          <Text style={styles.desgloseValue}>
            ${cuota.montoInteres.toLocaleString('es-CO')}
          </Text>
        </View>
      </View>

      {/* Información de pago */}
      {montoPagado > 0 && (
        <View style={styles.pagoInfo}>
          <Text style={styles.pagado}>
            Pagado: ${montoPagado.toLocaleString('es-CO')}
          </Text>
          {montoRestante > 0 && (
            <Text style={styles.pendiente}>
              Pendiente: ${montoRestante.toLocaleString('es-CO')}
            </Text>
          )}
        </View>
      )}

      <Text style={styles.fechaVencimiento}>
        Vence: {fechaInfo.fecha}
      </Text>

      {cuota.fechaPago && (
        <Text style={styles.fechaPago}>
          Pagado: {formatearParaLista(cuota.fechaPago).fecha}
        </Text>
      )}

      {showActions && cuota.estado === 'pendiente' && onMarkPaid && (
        <TouchableOpacity style={styles.pagarButton} onPress={onMarkPaid}>
          <Text style={styles.pagarText}>💳 Marcar como pagada</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}

function getEstadoVariant(estado: Cuota['estado']): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  switch (estado) {
    case 'pagada':
      return 'success';
    case 'pendiente':
      return 'warning';
    case 'vencida':
      return 'danger';
    case 'parcial':
      return 'info';
    default:
      return 'default';
  }
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  cuotaInfo: {
    flex: 1,
  },

  numeroCuota: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },

  clienteNombre: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },

  monto: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
  },

  estadoContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },

  fecha: {
    fontSize: 12,
    fontWeight: '500',
  },

  desglose: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },

  desgloseItem: {
    alignItems: 'center',
  },

  desgloseLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },

  desgloseValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },

  pagoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  pagado: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },

  pendiente: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
  },

  fechaVencimiento: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },

  fechaPago: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },

  pagarButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },

  pagarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});