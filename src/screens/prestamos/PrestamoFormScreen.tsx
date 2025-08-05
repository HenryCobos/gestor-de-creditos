import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList, PrestamoFormData } from '../../types';
import { useApp } from '../../context/AppContext';
import { PrestamoForm, LoadingSpinner } from '../../components';

type RouteProps = RouteProp<RootStackParamList, 'PrestamoForm'>;

export function PrestamoFormScreen() {
  const navigation = useNavigation(); // Cast to any for navigation calls
  const route = useRoute<RouteProps>();
  const { prestamoId, clienteId } = route.params || {};
  const { 
    obtenerPrestamo, 
    crearPrestamo, 
    actualizarPrestamo, 
    state,
    obtenerCliente 
  } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [prestamo, setPrestamo] = useState(prestamoId ? obtenerPrestamo(prestamoId) : undefined);
  
  const isEditing = !!prestamoId;
  const screenTitle = isEditing ? 'Editar Préstamo' : 'Nuevo Préstamo';
  
  // Cliente seleccionado (si viene de la pantalla de cliente)
  const clienteSeleccionado = clienteId ? obtenerCliente(clienteId) : undefined;

  useEffect(() => {
    // Actualizar título de la pantalla
    (navigation as any).setOptions({ title: screenTitle });
  }, [navigation, screenTitle]);

  useEffect(() => {
    // Cargar datos del préstamo si estamos editando
    if (prestamoId) {
      const prestamoData = obtenerPrestamo(prestamoId);
      if (!prestamoData) {
        Alert.alert(
          'Error',
          'No se pudo encontrar el préstamo',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }
      setPrestamo(prestamoData);
    }
  }, [prestamoId, obtenerPrestamo, navigation]);

  const handleSubmit = async (formData: PrestamoFormData) => {
    setIsLoading(true);
    try {
      if (isEditing && prestamo) {
        await actualizarPrestamo(prestamo.id, formData);
        Alert.alert(
          'Éxito',
          'Préstamo actualizado correctamente',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        const nuevoPrestamo = await crearPrestamo(formData);
        Alert.alert(
          'Éxito',
          `Préstamo creado correctamente por $${nuevoPrestamo.monto.toLocaleString()}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error al guardar préstamo:', error);
      Alert.alert(
        'Error',
        isEditing 
          ? 'No se pudo actualizar el préstamo' 
          : 'No se pudo crear el préstamo'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const getInitialValues = (): Partial<PrestamoFormData> => {
    if (prestamo) {
      return {
        clienteId: prestamo.clienteId,
        monto: prestamo.monto,
        tasaInteres: prestamo.tasaInteres,
        periodoTasa: prestamo.periodoTasa || 'anual',
        tipoInteres: prestamo.tipoInteres,
        numeroCuotas: prestamo.numeroCuotas,
        frecuenciaPago: prestamo.frecuenciaPago,
        fechaPrestamo: prestamo.fechaPrestamo,
        notas: prestamo.notas || ''
      };
    }
    
    // Si viene con un cliente preseleccionado
    if (clienteSeleccionado) {
      return {
        clienteId: clienteSeleccionado.id
      };
    }
    
    return {};
  };

  if (state.isLoading && isEditing) {
    return <LoadingSpinner text="Cargando préstamo..." />;
  }

  return (
    <View style={styles.container}>
      <PrestamoForm
        clientes={state.clientes}
        clienteSeleccionado={clienteSeleccionado?.id}
        initialValues={getInitialValues()}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitText={isEditing ? 'Actualizar Préstamo' : 'Crear Préstamo'}
        isLoading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});