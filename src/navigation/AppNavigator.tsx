import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { RootStackParamList } from '../types';
import { 
  HomeScreen,
  ClientesScreen, 
  ClienteFormScreen, 
  ClienteDetalleScreen,
  PrestamosScreen,
  PrestamoFormScreen,
  PrestamoDetalleScreen,
  CalendarioScreen,
  ConfiguracionScreen,
  ReportesScreen
} from '../screens';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();









// Navegación por tabs principales
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
        },
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Inicio',
          tabBarLabel: 'Inicio',
          tabBarIcon: () => <Text style={styles.tabIcon}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Clientes"
        component={ClientesScreen}
        options={{
          title: 'Clientes',
          tabBarLabel: 'Clientes',
          tabBarIcon: () => <Text style={styles.tabIcon}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="Prestamos"
        component={PrestamosScreen}
        options={{
          title: 'Préstamos',
          tabBarLabel: 'Préstamos',
          tabBarIcon: () => <Text style={styles.tabIcon}>💰</Text>,
        }}
      />
      <Tab.Screen
        name="Calendario"
        component={CalendarioScreen}
        options={{
          title: 'Calendario',
          tabBarLabel: 'Calendario',
          tabBarIcon: () => <Text style={styles.tabIcon}>📅</Text>,
        }}
      />
      <Tab.Screen
        name="Reportes"
        component={ReportesScreen}
        options={{
          title: 'Reportes',
          tabBarLabel: 'Reportes',
          tabBarIcon: () => <Text style={styles.tabIcon}>📊</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Navegación principal con tabs */}
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        
        {/* Pantallas de clientes */}
        <Stack.Screen
          name="ClienteForm"
          component={ClienteFormScreen}
          options={{ title: 'Cliente' }}
        />
        <Stack.Screen
          name="ClienteDetalle"
          component={ClienteDetalleScreen}
          options={{ title: 'Detalle Cliente' }}
        />
        
        {/* Pantallas de préstamos */}
        <Stack.Screen
          name="PrestamoForm"
          component={PrestamoFormScreen}
          options={{ title: 'Préstamo' }}
        />
        <Stack.Screen
          name="PrestamoDetalle"
          component={PrestamoDetalleScreen}
          options={{ title: 'Detalle Préstamo' }}
        />
        <Stack.Screen
          name="Pagos"
          component={PrestamosScreen}
          options={{ title: 'Pagos' }}
        />
        <Stack.Screen
          name="PagoForm"
          component={PrestamosScreen}
          options={{ title: 'Registrar Pago' }}
        />
        <Stack.Screen
          name="Configuracion"
          component={ConfiguracionScreen}
          options={{ title: 'Configuración' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresContainer: {
    alignItems: 'flex-start',
    gap: 12,
  },
  featureItem: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  tabIcon: {
    fontSize: 20,
  },
});