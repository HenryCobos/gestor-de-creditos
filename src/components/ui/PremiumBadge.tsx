import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface PremiumBadgeProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  disabled?: boolean;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  children,
  onPress,
  variant = 'medium',
  showIcon = true,
  disabled = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'small':
        return {
          container: styles.containerSmall,
          text: styles.textSmall,
          icon: styles.iconSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          text: styles.textLarge,
          icon: styles.iconLarge,
        };
      default:
        return {
          container: styles.containerMedium,
          text: styles.textMedium,
          icon: styles.iconMedium,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const BadgeContent = () => (
    <View style={[
      styles.badge,
      variantStyles.container,
      disabled && styles.disabled
    ]}>
      {showIcon && (
        <Text style={[styles.icon, variantStyles.icon]}>💎</Text>
      )}
      <Text style={[styles.text, variantStyles.text]}>
        {children}
      </Text>
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <BadgeContent />
      </TouchableOpacity>
    );
  }

  return <BadgeContent />;
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f39c12',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabled: {
    backgroundColor: '#bdc3c7',
    opacity: 0.6,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  
  // Small variant
  containerSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  textSmall: {
    fontSize: 10,
  },
  iconSmall: {
    fontSize: 10,
  },
  
  // Medium variant
  containerMedium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  textMedium: {
    fontSize: 11,
  },
  iconMedium: {
    fontSize: 12,
  },
  
  // Large variant
  containerLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  textLarge: {
    fontSize: 12,
  },
  iconLarge: {
    fontSize: 14,
  },
});
