import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Badge } from '../ui';
import { Cliente } from '../../types';
import { formatearFecha } from '../../utils/dateUtils';

interface ClienteCardProps {
  cliente: Cliente;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  totalPrestado?: number;
  prestamosActivos?: number;
}

export function ClienteCard({
  cliente,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
  totalPrestado = 0,
  prestamosActivos = 0,
}: ClienteCardProps) {
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.clienteInfo}>
          <Text style={styles.nombre}>{cliente.nombre}</Text>
          <Text style={styles.telefono}>{cliente.telefono}</Text>
          {cliente.email && (
            <Text style={styles.email}>{cliente.email}</Text>
          )}
        </View>
        
        <View style={styles.stats}>
          {totalPrestado > 0 && (
            <Text style={styles.totalPrestado}>
              ${totalPrestado.toLocaleString('es-CO')}
            </Text>
          )}
          {prestamosActivos > 0 && (
            <Badge
              text={`${prestamosActivos} préstamo${prestamosActivos > 1 ? 's' : ''}`}
              variant="info"
              size="small"
            />
          )}
        </View>
      </View>

      {cliente.direccion && (
        <Text style={styles.direccion} numberOfLines={1}>
          📍 {cliente.direccion}
        </Text>
      )}

      {cliente.notas && (
        <Text style={styles.notas} numberOfLines={2}>
          {cliente.notas}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.fechaCreacion}>
          Creado: {formatearFecha(cliente.fechaCreacion)}
        </Text>

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
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  clienteInfo: {
    flex: 1,
  },

  nombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },

  telefono: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },

  email: {
    fontSize: 14,
    color: '#2196F3',
  },

  stats: {
    alignItems: 'flex-end',
    gap: 4,
  },

  totalPrestado: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },

  direccion: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },

  notas: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 8,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  fechaCreacion: {
    fontSize: 12,
    color: '#999999',
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
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