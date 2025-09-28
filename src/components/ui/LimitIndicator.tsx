import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './Card';

interface LimitIndicatorProps {
  current: number;
  limit: number;
  label: string;
  icon: string;
  onUpgrade?: () => void;
  showUpgradeButton?: boolean;
}

export const LimitIndicator: React.FC<LimitIndicatorProps> = ({
  current,
  limit,
  label,
  icon,
  onUpgrade,
  showUpgradeButton = true,
}) => {
  const percentage = (current / limit) * 100;
  const isNearLimit = percentage >= 80; // Mostrar advertencia al 80% (8 de 10)
  const isAtLimit = current >= limit;

  const getStatusColor = () => {
    if (isAtLimit) return '#e74c3c';
    if (isNearLimit) return '#f39c12';
    return '#27ae60';
  };

  const getStatusText = () => {
    if (isAtLimit) return 'Límite alcanzado';
    if (isNearLimit) return 'Cerca del límite';
    return 'Disponible';
  };

  return (
    <Card style={StyleSheet.flatten([
      styles.container,
      isAtLimit ? styles.limitReached : isNearLimit ? styles.nearLimit : null
    ])}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.label}>{label}</Text>
          <Text style={[styles.status, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
        <View style={styles.counter}>
          <Text style={[styles.counterText, { color: getStatusColor() }]}>
            {current}/{limit}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: getStatusColor()
              }
            ]} 
          />
        </View>
        <Text style={styles.percentageText}>
          {Math.round(percentage)}%
        </Text>
      </View>

      {(isNearLimit || isAtLimit) && showUpgradeButton && onUpgrade && (
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
          <Text style={styles.upgradeButtonText}>
            {isAtLimit ? 'Desbloquear límite' : 'Mejorar a Premium'}
          </Text>
        </TouchableOpacity>
      )}

      {(isNearLimit || isAtLimit) && (
        <View style={[styles.limitMessage, isNearLimit && !isAtLimit && styles.warningMessage]}>
          <Text style={[styles.limitMessageText, isNearLimit && !isAtLimit && styles.warningMessageText]}>
            {isAtLimit 
              ? `Has alcanzado el límite de ${limit} ${label.toLowerCase()}. Mejora a Premium para desbloquear límites ilimitados.`
              : `Cerca del límite: ${current}/${limit} ${label.toLowerCase()}. Te quedan ${limit - current} disponibles. Mejora a Premium para límites ilimitados.`
            }
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  limitReached: {
    borderLeftColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  nearLimit: {
    borderLeftColor: '#f39c12',
    backgroundColor: '#fef9e7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  counter: {
    alignItems: 'flex-end',
  },
  counterText: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d',
    minWidth: 35,
    textAlign: 'right',
  },
  upgradeButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  limitMessage: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c',
  },
  limitMessageText: {
    fontSize: 13,
    color: '#c0392b',
    lineHeight: 18,
  },
  warningMessage: {
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
    borderLeftColor: '#f39c12',
  },
  warningMessageText: {
    color: '#d68910',
  },
});
