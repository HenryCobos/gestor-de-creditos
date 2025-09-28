import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Button } from '../ui';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onLearnMore,
}) => {
  const features = [
    { icon: '👥', title: 'Gestión de Clientes', description: 'Registra y organiza tu cartera de clientes' },
    { icon: '💰', title: 'Control de Préstamos', description: 'Crea y administra préstamos con cronogramas automáticos' },
    { icon: '📊', title: 'Reportes Detallados', description: 'Analiza el rendimiento de tu negocio' },
    { icon: '🔔', title: 'Recordatorios', description: 'Notificaciones automáticas de vencimientos' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>💼</Text>
          <Text style={styles.logoText}>Gestor de Créditos</Text>
        </View>
        <Text style={styles.tagline}>La herramienta profesional para tu negocio de préstamos</Text>
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          Gestiona tu negocio de préstamos de manera{' '}
          <Text style={styles.highlight}>profesional</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          Todo lo que necesitas para administrar clientes, préstamos y cuotas en una sola aplicación.
        </Text>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>¿Por qué elegir Gestor de Créditos?</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>1000+</Text>
          <Text style={styles.statLabel}>Usuarios Activos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>$50M+</Text>
          <Text style={styles.statLabel}>En Préstamos Gestionados</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4.8★</Text>
          <Text style={styles.statLabel}>Calificación</Text>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaContainer}>
        <Button
          title="Comenzar Ahora"
          onPress={onGetStarted}
          style={styles.primaryButton}
        />
        <TouchableOpacity onPress={onLearnMore} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Conocer más</Text>
        </TouchableOpacity>
      </View>

      {/* Trust Indicators */}
      <View style={styles.trustContainer}>
        <Text style={styles.trustText}>✓ Exportación en PDF ✓ Datos seguros ✓ Soporte 24/7</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2c3e50',
  },
  tagline: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  hero: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2c3e50',
    lineHeight: 36,
    marginBottom: 16,
    textAlign: 'center',
  },
  highlight: {
    color: '#2196F3',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 24,
    textAlign: 'center',
  },
  featuresContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  ctaContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  trustContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  trustText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});
