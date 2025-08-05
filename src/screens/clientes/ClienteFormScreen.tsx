import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList, ClienteFormData } from '../../types';
import { useApp } from '../../context/AppContext';
import { ClienteForm, LoadingSpinner } from '../../components';

type RouteProps = RouteProp<RootStackParamList, 'ClienteForm'>;

export function ClienteFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { clienteId } = route.params || {};
  
  const { 
    obtenerCliente, 
    crearCliente, 
    actualizarCliente,
    state 
  } = useApp();
  
  const [isLoading, setIsLoading] = useState(false);
  const [cliente, setCliente] = useState(clienteId ? obtenerCliente(clienteId) : undefined);

  const isEditing = !!clienteId;
  const screenTitle = isEditing ? 'Editar Cliente' : 'Nuevo Cliente';

  useEffect(() => {
    navigation.setOptions({
      title: screenTitle,
    });
  }, [navigation, screenTitle]);

  useEffect(() => {
    if (clienteId) {
      const clienteActual = obtenerCliente(clienteId);
      if (!clienteActual) {
        Alert.alert(
          'Error',
          'Cliente no encontrado',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }
      setCliente(clienteActual);
    }
  }, [clienteId, obtenerCliente, navigation]);

  const handleSubmit = async (formData: ClienteFormData) => {
    setIsLoading(true);
    
    try {
      if (isEditing && clienteId) {
        await actualizarCliente(clienteId, formData);
        Alert.alert(
          'Éxito',
          'Cliente actualizado correctamente',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        const nuevoCliente = await crearCliente(formData);
        Alert.alert(
          'Éxito',
          'Cliente creado correctamente',
          [{ 
            text: 'OK', 
            onPress: () => {
              // Navegar al detalle del nuevo cliente
              (navigation as any).replace('ClienteDetalle', { clienteId: nuevoCliente.id });
            }
          }]
        );
      }
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      // El error ya se maneja en el contexto con Alert
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const getInitialValues = (): Partial<ClienteFormData> => {
    if (!cliente) return {};
    
    return {
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      email: cliente.email || '',
      direccion: cliente.direccion || '',
      notas: cliente.notas || '',
    };
  };

  if (state.isLoading && isEditing) {
    return <LoadingSpinner text="Cargando cliente..." />;
  }

  return (
    <View style={styles.container}>
      <ClienteForm
        initialValues={getInitialValues()}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitText={isEditing ? 'Actualizar Cliente' : 'Crear Cliente'}
        isLoading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});