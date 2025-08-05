import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Input, Button } from '../ui';
import { ClienteFormData } from '../../types';

interface ClienteFormProps {
  initialValues?: Partial<ClienteFormData>;
  onSubmit: (values: ClienteFormData) => Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  isLoading?: boolean;
}

const validationSchema = Yup.object().shape({
  nombre: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .required('El nombre es obligatorio'),
  telefono: Yup.string()
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(15, 'El teléfono no puede tener más de 15 dígitos')
    .required('El teléfono es obligatorio'),
  email: Yup.string()
    .email('Ingresa un email válido')
    .optional(),
  direccion: Yup.string()
    .max(200, 'La dirección no puede tener más de 200 caracteres')
    .optional(),
  notas: Yup.string()
    .max(500, 'Las notas no pueden tener más de 500 caracteres')
    .optional(),
});

const defaultValues: ClienteFormData = {
  nombre: '',
  telefono: '',
  email: '',
  direccion: '',
  notas: '',
};

export function ClienteForm({
  initialValues,
  onSubmit,
  onCancel,
  submitText = 'Guardar Cliente',
  isLoading = false,
}: ClienteFormProps) {
  const formInitialValues = { ...defaultValues, ...initialValues };

  const handleSubmit = async (values: ClienteFormData) => {
    try {
      await onSubmit(values);
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo guardar el cliente. Intenta nuevamente.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Formik
        initialValues={formInitialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isValid, dirty }) => (
          <View style={styles.form}>
            <Input
              label="Nombre completo"
              value={values.nombre}
              onChangeText={handleChange('nombre')}
              onBlur={handleBlur('nombre')}
              error={touched.nombre && errors.nombre ? errors.nombre : undefined}
              placeholder="Ej: Juan Pérez"
              required
              autoCapitalize="words"
              autoCorrect={false}
            />

            <Input
              label="Teléfono"
              value={values.telefono}
              onChangeText={handleChange('telefono')}
              onBlur={handleBlur('telefono')}
              error={touched.telefono && errors.telefono ? errors.telefono : undefined}
              placeholder="Ej: +57 300 123 4567"
              required
              keyboardType="phone-pad"
              autoCorrect={false}
            />

            <Input
              label="Email"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              error={touched.email && errors.email ? errors.email : undefined}
              placeholder="Ej: juan@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Dirección"
              value={values.direccion}
              onChangeText={handleChange('direccion')}
              onBlur={handleBlur('direccion')}
              error={touched.direccion && errors.direccion ? errors.direccion : undefined}
              placeholder="Ej: Calle 123 #45-67, Bogotá"
              autoCapitalize="words"
              autoCorrect={false}
            />

            <Input
              label="Notas adicionales"
              value={values.notas}
              onChangeText={handleChange('notas')}
              onBlur={handleBlur('notas')}
              error={touched.notas && errors.notas ? errors.notas : undefined}
              placeholder="Información adicional sobre el cliente..."
              multiline
              numberOfLines={3}
              autoCapitalize="sentences"
            />

            <View style={styles.buttonContainer}>
              <Button
                title={submitText}
                onPress={handleSubmit}
                disabled={!isValid || !dirty}
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
  
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  
  submitButton: {
    marginBottom: 8,
  },
});