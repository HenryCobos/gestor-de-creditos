import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Text } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Input, Button, Card, ModalSelector } from '../ui';
import { PrestamoFormData, Cliente, FRECUENCIAS_PAGO, TIPOS_INTERES, PERIODOS_TASA } from '../../types';
import { CalculationService } from '../../services/calculations';
import { formatearFecha, getFechaActual } from '../../utils/dateUtils';


interface PrestamoFormProps {
  clientes: Cliente[];
  clienteSeleccionado?: string;
  initialValues?: Partial<PrestamoFormData>;
  onSubmit: (values: PrestamoFormData) => Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  isLoading?: boolean;
}

const validationSchema = Yup.object().shape({
  clienteId: Yup.string().required('Selecciona un cliente'),
  monto: Yup.number()
    .min(1, 'El monto debe ser mayor a 0')
    .max(1000000000, 'El monto no puede ser mayor a $1,000,000,000')
    .required('El monto es obligatorio'),
  fechaPrestamo: Yup.string().required('La fecha es obligatoria'),
  numeroCuotas: Yup.number()
    .min(1, 'Debe tener al menos 1 cuota')
    .max(1000, 'No puede tener más de 1000 cuotas')
    .integer('El número de cuotas debe ser un número entero')
    .required('El número de cuotas es obligatorio'),
  tasaInteres: Yup.number()
    .min(0, 'La tasa no puede ser negativa')
    .max(100, 'La tasa no puede ser mayor al 100%')
    .required('La tasa de interés es obligatoria'),
  periodoTasa: Yup.string()
    .oneOf(['anual', 'mensual', 'quincenal', 'semanal'], 'Selecciona un período válido')
    .required('Selecciona el período de la tasa'),
  tipoInteres: Yup.string()
    .oneOf(['simple', 'compuesto', 'mensual_fijo', 'mensual_sobre_saldo', 'mensual_directo'], 'Selecciona un tipo de interés válido')
    .required('Selecciona el tipo de interés'),
  frecuenciaPago: Yup.string()
    .oneOf(['diario', 'semanal', 'quincenal', 'mensual'], 'Selecciona una frecuencia válida')
    .required('Selecciona la frecuencia de pago'),
  notas: Yup.string()
    .max(500, 'Las notas no pueden tener más de 500 caracteres')
    .optional(),
});

const defaultValues: PrestamoFormData = {
  clienteId: '',
  monto: 0,
  fechaPrestamo: getFechaActual(),
  numeroCuotas: 1,
  tasaInteres: 0,
  periodoTasa: 'mensual',
  tipoInteres: 'mensual_directo',
  frecuenciaPago: 'diario',
  notas: '',
};

export function PrestamoForm({
  clientes,
  clienteSeleccionado,
  initialValues,
  onSubmit,
  onCancel,
  submitText = 'Crear Préstamo',
  isLoading = false,
}: PrestamoFormProps) {
  const [mostrarSimulacion, setMostrarSimulacion] = useState(false);
  const [simulacion, setSimulacion] = useState<any>(null);

  const formInitialValues = { 
    ...defaultValues, 
    ...initialValues,
    clienteId: clienteSeleccionado || initialValues?.clienteId || '',
  };

  const handleSubmit = async (values: PrestamoFormData) => {
    try {
      // Validar datos antes de enviar
      const validacion = CalculationService.validarDatosPrestamo(values);
      if (!validacion.valido) {
        Alert.alert(
          'Datos inválidos',
          validacion.errores.join('\n'),
          [{ text: 'OK' }]
        );
        return;
      }

      await onSubmit(values);
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo crear el préstamo. Intenta nuevamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const simularPrestamo = (values: PrestamoFormData) => {
    try {
      const validacion = CalculationService.validarDatosPrestamo(values);
      if (!validacion.valido) {
        Alert.alert(
          'Datos inválidos',
          'Completa todos los campos correctamente para simular.',
          [{ text: 'OK' }]
        );
        return;
      }

      const simulacionData = CalculationService.simularEscenarios(values);
      setSimulacion(simulacionData);
      setMostrarSimulacion(true);
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo simular el préstamo.',
        [{ text: 'OK' }]
      );
    }
  };

  const formatearMoneda = (valor: number) => {
    return `$${valor.toLocaleString('es-CO')}`;
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Formik
        initialValues={formInitialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, isValid }) => (
          <View style={styles.form}>
            {/* Selección de Cliente */}
            <ModalSelector
              label="Cliente *"
              placeholder="Selecciona un cliente..."
              value={values.clienteId}
              items={clientes.map(cliente => ({
                label: `${cliente.nombre} - ${cliente.telefono}`,
                value: cliente.id,
                icon: '👤'
              }))}
              onValueChange={(value) => setFieldValue('clienteId', value)}
              error={touched.clienteId && errors.clienteId ? errors.clienteId : undefined}
            />

            {/* Monto */}
            <Input
              label="Monto del préstamo"
              value={values.monto.toString()}
              onChangeText={(text) => {
                const numericValue = parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
                setFieldValue('monto', numericValue);
              }}
              onBlur={handleBlur('monto')}
              error={touched.monto && errors.monto ? errors.monto : undefined}
              placeholder="Ej: 1000000"
              required
              keyboardType="numeric"
            />

            {/* Fecha del préstamo */}
            <Input
              label="Fecha del préstamo"
              value={values.fechaPrestamo}
              onChangeText={handleChange('fechaPrestamo')}
              onBlur={handleBlur('fechaPrestamo')}
              error={touched.fechaPrestamo && errors.fechaPrestamo ? errors.fechaPrestamo : undefined}
              placeholder="YYYY-MM-DD"
              required
            />

            {/* Número de cuotas */}
            <Input
              label="Número de cuotas"
              value={values.numeroCuotas.toString()}
              onChangeText={(text) => {
                const numericValue = parseInt(text.replace(/[^0-9]/g, '')) || 1;
                setFieldValue('numeroCuotas', numericValue);
              }}
              onBlur={handleBlur('numeroCuotas')}
              error={touched.numeroCuotas && errors.numeroCuotas ? errors.numeroCuotas : undefined}
              placeholder="Ej: 12"
              required
              keyboardType="numeric"
            />

            {/* Tasa de interés */}
            <Input
              label="Tasa de interés (%)"
              value={values.tasaInteres.toString()}
              onChangeText={(text) => {
                const numericValue = parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
                setFieldValue('tasaInteres', numericValue);
              }}
              onBlur={handleBlur('tasaInteres')}
              error={touched.tasaInteres && errors.tasaInteres ? errors.tasaInteres : undefined}
              placeholder="Ej: 20"
              required
              keyboardType="numeric"
            />

            {/* Período de la tasa */}
            <ModalSelector
              label="Período de la tasa *"
              placeholder="Selecciona el período..."
              value={values.periodoTasa}
              items={PERIODOS_TASA.map(periodo => ({
                label: periodo.label,
                value: periodo.value,
                icon: periodo.value === 'anual' ? '📅' : 
                      periodo.value === 'mensual' ? '🗓️' :
                      periodo.value === 'quincenal' ? '📋' : '📆'
              }))}
              onValueChange={(value) => setFieldValue('periodoTasa', value)}
              error={touched.periodoTasa && errors.periodoTasa ? errors.periodoTasa : undefined}
            />

            {/* Tipo de interés */}
            <ModalSelector
              label="Tipo de interés *"
              placeholder="Selecciona el tipo de interés..."
              value={values.tipoInteres}
              items={TIPOS_INTERES.map(tipo => ({
                label: tipo.label,
                value: tipo.value,
                icon: tipo.value === 'simple' ? '📈' : 
                      tipo.value === 'compuesto' ? '📊' :
                      tipo.value === 'mensual_fijo' ? '💰' : 
                      tipo.value === 'mensual_sobre_saldo' ? '📉' : '🎯'
              }))}
              onValueChange={(value) => setFieldValue('tipoInteres', value)}
              error={touched.tipoInteres && errors.tipoInteres ? errors.tipoInteres : undefined}
            />

            {/* Frecuencia de pago */}
            <ModalSelector
              label="Frecuencia de pago *"
              placeholder="Selecciona la frecuencia..."
              value={values.frecuenciaPago}
              items={FRECUENCIAS_PAGO.map(frecuencia => ({
                label: frecuencia.label,
                value: frecuencia.value,
                icon: frecuencia.value === 'diario' ? '📅' : 
                      frecuencia.value === 'semanal' ? '📋' :
                      frecuencia.value === 'quincenal' ? '🗓️' : '📆'
              }))}
              onValueChange={(value) => setFieldValue('frecuenciaPago', value)}
              error={touched.frecuenciaPago && errors.frecuenciaPago ? errors.frecuenciaPago : undefined}
            />

            {/* Notas */}
            <Input
              label="Notas adicionales"
              value={values.notas}
              onChangeText={handleChange('notas')}
              onBlur={handleBlur('notas')}
              error={touched.notas && errors.notas ? errors.notas : undefined}
              placeholder="Información adicional sobre el préstamo..."
              multiline
              numberOfLines={3}
              autoCapitalize="sentences"
            />

            {/* Botón de simulación */}
            <Button
              title="Simular Préstamo"
              onPress={() => simularPrestamo(values)}
              variant="outline"
              disabled={!isValid}
              style={styles.simulateButton}
            />

            {/* Simulación */}
            {mostrarSimulacion && simulacion && (
              <Card style={styles.simulationCard}>
                <Text style={styles.simulationTitle}>Simulación del Préstamo</Text>
                
                <View style={styles.simulationRow}>
                  <Text style={styles.simulationLabel}>Interés Simple:</Text>
                  <Text style={styles.simulationValue}>
                    {formatearMoneda(simulacion.interesSimple.montoTotal)}
                  </Text>
                </View>
                
                <View style={styles.simulationRow}>
                  <Text style={styles.simulationLabel}>Interés Compuesto:</Text>
                  <Text style={styles.simulationValue}>
                    {formatearMoneda(simulacion.interesCompuesto.montoTotal)}
                  </Text>
                </View>
                
                <View style={styles.simulationRow}>
                  <Text style={styles.simulationLabel}>Cuota:</Text>
                  <Text style={styles.simulationValue}>
                    {formatearMoneda(simulacion[values.tipoInteres].montoCuota)}
                  </Text>
                </View>
                
                <View style={styles.simulationRow}>
                  <Text style={styles.simulationLabel}>Total Intereses:</Text>
                  <Text style={styles.simulationValue}>
                    {formatearMoneda(simulacion[values.tipoInteres].montoInteres)}
                  </Text>
                </View>

                <Text style={styles.recommendationText}>
                  Recomendación: {simulacion.recomendacion === 'compuesto' ? 'Interés Compuesto' : 'Interés Simple'}
                </Text>
              </Card>
            )}

            {/* Botones de acción */}
            <View style={styles.buttonContainer}>
              <Button
                title={submitText}
                onPress={handleSubmit}
                disabled={!isValid}
                loading={isLoading}
                style={styles.submitButton}
              />

              {onCancel && (
                <Button
                  title="Cancelar"
                  onPress={onCancel}
                  variant="outline"
                  disabled={isLoading}
                />
              )}
            </View>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  form: {
    padding: 16,
    gap: 8,
  },

  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 4,
  },

  simulateButton: {
    marginTop: 16,
  },

  simulationCard: {
    marginTop: 16,
    backgroundColor: '#E3F2FD',
  },

  simulationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 12,
  },

  simulationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  simulationLabel: {
    fontSize: 14,
    color: '#333333',
  },

  simulationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },

  recommendationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 8,
    textAlign: 'center',
  },
  
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  
  submitButton: {
    marginBottom: 8,
  },
});