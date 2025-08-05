import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'small' | 'medium';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({
  text,
  variant = 'default',
  size = 'medium',
  style,
  textStyle,
}: BadgeProps) {
  const badgeStyle = [
    styles.badge,
    styles[variant],
    styles[size],
    style,
  ];

  const textStyleComputed = [
    styles.text,
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyleComputed}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  
  // Variants
  success: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  warning: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  danger: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  info: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  default: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  
  // Sizes
  small: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  
  // Text styles
  text: {
    fontWeight: '500',
  },
  
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
});