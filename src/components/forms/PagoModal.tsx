import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Input, Button, ModalSelector } from '../ui';
import { Cuota, Pago } from '../../types';

interface PagoModalProps {
  visible: boolean;
  cuota: Cuota | null;
  pagosAnteriores: Pago[];
  onClose: () => void;
  onConfirm: (monto: number, metodoPago: string, notas: string) => void;
}

const METODOS_PAGO = [
  { key: 'efectivo', label: '💵 Efectivo' },
  { key: 'transferencia', label: '🏦 Transferencia' },
  { key: 'cheque', label: '📝 Cheque' },
  { key: 'otro', label: '📋 Otro' },
];

export function PagoModal({ visible, cuota, pagosAnteriores, onClose, onConfirm }: PagoModalProps) {
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [notas, setNotas] = useState('');

  const calculos = useMemo(() => {
    if (!cuota) return null;

    const totalPagado = (pagosAnteriores || []).reduce((sum, p) => sum + p.monto, 0);
    const montoPendiente = cuota.montoTotal - totalPagado;
    const porcentajePagado = (totalPagado / cuota.montoTotal) * 100;

    return {
      totalPagado,
      montoPendiente,
      porcentajePagado,
      montoTotal: cuota.montoTotal,
    };
  }, [cuota, pagosAnteriores]);

  const handleConfirm = () => {
    if (!cuota || !calculos) return;

    const montoNumerico = parseFloat(monto);

    // Validaciones
    if (!monto || isNaN(montoNumerico) || montoNumerico <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    if (montoNumerico > calculos.montoPendiente) {
      Alert.alert(
        'Monto excesivo',
        `El monto ingresado ($${montoNumerico.toLocaleString()}) es mayor al pendiente ($${calculos.montoPendiente.toLocaleString()}). ¿Deseas continuar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Continuar', 
            onPress: () => {
              onConfirm(montoNumerico, metodoPago, notas);
              resetForm();
            }
          }
        ]
      );
      return;
    }

    onConfirm(montoNumerico, metodoPago, notas);
    resetForm();
  };

  const resetForm = () => {
    setMonto('');
    setMetodoPago('efectivo');
    setNotas('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const setMontoCompleto = () => {
    if (calculos) {
      setMonto(calculos.montoPendiente.toString());
    }
  };

  if (!visible || !cuota || !calculos) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Registrar Pago</Text>
              <Text style={styles.subtitle}>Cuota #{cuota.numeroCuota}</Text>
            </View>

            {/* Información de la cuota */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Monto Total:</Text>
                <Text style={styles.infoValue}>
                  ${calculos.montoTotal.toLocaleString('es-CO')}
                </Text>
              </View>

              {calculos.totalPagado > 0 && (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ya Pagado:</Text>
                    <Text style={[styles.infoValue, styles.successText]}>
                      ${calculos.totalPagado.toLocaleString('es-CO')}
                    </Text>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${calculos.porcentajePagado}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {calculos.porcentajePagado.toFixed(1)}% pagado
                    </Text>
                  </View>
                </>
              )}

              <View style={[styles.infoRow, styles.pendienteRow]}>
                <Text style={[styles.infoLabel, styles.pendienteLabel]}>
                  Pendiente:
                </Text>
                <Text style={[styles.infoValue, styles.pendienteValue]}>
                  ${calculos.montoPendiente.toLocaleString('es-CO')}
                </Text>
              </View>
            </View>

            {/* Historial de pagos anteriores */}
            {pagosAnteriores && pagosAnteriores.length > 0 && (
              <View style={styles.historialCard}>
                <Text style={styles.historialTitle}>
                  Pagos anteriores ({pagosAnteriores.length})
                </Text>
                {pagosAnteriores.slice(0, 3).map((pago) => (
                  <View key={pago.id} style={styles.pagoItem}>
                    <Text style={styles.pagoFecha}>{pago.fechaPago}</Text>
                    <Text style={styles.pagoMonto}>
                      ${pago.monto.toLocaleString('es-CO')}
                    </Text>
                  </View>
                ))}
                {pagosAnteriores.length > 3 && (
                  <Text style={styles.masText}>
                    +{pagosAnteriores.length - 3} pagos más
                  </Text>
                )}
              </View>
            )}

            {/* Formulario de pago */}
            <View style={styles.form}>
              <View style={styles.montoInputContainer}>
                <Input
                  label="Monto a pagar *"
                  value={monto}
                  onChangeText={(text) => {
                    // Solo permitir números y punto decimal
                    const filtered = text.replace(/[^0-9.]/g, '');
                    setMonto(filtered);
                  }}
                  placeholder="Ingresa el monto"
                  keyboardType="decimal-pad"
                  required
                />
                <TouchableOpacity 
                  style={styles.montoCompletoButton}
                  onPress={setMontoCompleto}
                >
                  <Text style={styles.montoCompletoText}>
                    Pagar completo
                  </Text>
                </TouchableOpacity>
              </View>

              <ModalSelector
                label="Método de pago"
                placeholder="Selecciona método..."
                value={metodoPago}
                items={METODOS_PAGO.map(metodo => ({
                  label: metodo.label,
                  value: metodo.key
                }))}
                onValueChange={(value: string) => setMetodoPago(value)}
              />

              <Input
                label="Notas (opcional)"
                value={notas}
                onChangeText={setNotas}
                placeholder="Observaciones del pago..."
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Botones */}
            <View style={styles.buttonContainer}>
              <Button
                title="Cancelar"
                onPress={handleClose}
                variant="outline"
                style={styles.button}
              />
              <Button
                title="Registrar Pago"
                onPress={handleConfirm}
                style={styles.button}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  successText: {
    color: '#27ae60',
  },
  progressBarContainer: {
    marginVertical: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27ae60',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  pendienteRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  pendienteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  pendienteValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e74c3c',
  },
  historialCard: {
    backgroundColor: '#fff9e6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  historialTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 12,
  },
  pagoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ffeaa7',
  },
  pagoFecha: {
    fontSize: 13,
    color: '#666',
  },
  pagoMonto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
  },
  masText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  montoInputContainer: {
    position: 'relative',
  },
  montoCompletoButton: {
    position: 'absolute',
    right: 0,
    top: 32,
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  montoCompletoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

