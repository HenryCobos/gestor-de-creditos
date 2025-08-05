import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Option {
  key: string;
  label: string;
  icon?: string;
  color?: string;
}

interface OptionSelectorProps {
  options: Option[];
  selectedKey: string;
  onSelect: (key: string) => void;
  variant?: 'buttons' | 'chips' | 'cards';
  multiSelect?: boolean;
  selectedKeys?: string[];
  onMultiSelect?: (keys: string[]) => void;
  title?: string;
  style?: any;
}

export function OptionSelector({
  options,
  selectedKey,
  onSelect,
  variant = 'buttons',
  multiSelect = false,
  selectedKeys = [],
  onMultiSelect,
  title,
  style
}: OptionSelectorProps) {
  
  const handleSingleSelect = (key: string) => {
    onSelect(key);
  };

  const handleMultiSelect = (key: string) => {
    if (!onMultiSelect) return;
    
    const newSelection = selectedKeys.includes(key)
      ? selectedKeys.filter(k => k !== key)
      : [...selectedKeys, key];
    
    onMultiSelect(newSelection);
  };

  const isSelected = (key: string) => {
    return multiSelect ? selectedKeys.includes(key) : selectedKey === key;
  };

  const renderButton = (option: Option) => (
    <TouchableOpacity
      key={option.key}
      style={[
        styles.buttonOption,
        isSelected(option.key) && styles.buttonOptionSelected,
        option.color && isSelected(option.key) && { 
          backgroundColor: option.color, 
          borderColor: option.color 
        }
      ]}
      onPress={() => multiSelect ? handleMultiSelect(option.key) : handleSingleSelect(option.key)}
      activeOpacity={0.7}
    >
      {option.icon && (
        <Text style={[
          styles.buttonIcon,
          isSelected(option.key) && styles.buttonIconSelected
        ]}>
          {option.icon}
        </Text>
      )}
      <Text style={[
        styles.buttonText,
        isSelected(option.key) && styles.buttonTextSelected
      ]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const renderChip = (option: Option) => (
    <TouchableOpacity
      key={option.key}
      style={[
        styles.chipOption,
        isSelected(option.key) && styles.chipOptionSelected,
        option.color && isSelected(option.key) && { 
          backgroundColor: option.color 
        }
      ]}
      onPress={() => multiSelect ? handleMultiSelect(option.key) : handleSingleSelect(option.key)}
      activeOpacity={0.7}
    >
      {option.icon && (
        <Text style={[
          styles.chipIcon,
          isSelected(option.key) && styles.chipIconSelected
        ]}>
          {option.icon}
        </Text>
      )}
      <Text style={[
        styles.chipText,
        isSelected(option.key) && styles.chipTextSelected
      ]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const renderCard = (option: Option) => (
    <TouchableOpacity
      key={option.key}
      style={[
        styles.cardOption,
        isSelected(option.key) && styles.cardOptionSelected,
        option.color && isSelected(option.key) && { 
          borderColor: option.color 
        }
      ]}
      onPress={() => multiSelect ? handleMultiSelect(option.key) : handleSingleSelect(option.key)}
      activeOpacity={0.7}
    >
      {option.icon && (
        <Text style={[
          styles.cardIcon,
          isSelected(option.key) && { color: option.color || '#2196F3' }
        ]}>
          {option.icon}
        </Text>
      )}
      <Text style={[
        styles.cardText,
        isSelected(option.key) && styles.cardTextSelected
      ]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const renderOptions = () => {
    switch (variant) {
      case 'chips':
        return options.map(renderChip);
      case 'cards':
        return options.map(renderCard);
      default:
        return options.map(renderButton);
    }
  };

  const getContainerStyle = () => {
    switch (variant) {
      case 'chips':
        return styles.chipsContainer;
      case 'cards':
        return styles.cardsContainer;
      default:
        return styles.buttonsContainer;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      {variant === 'cards' ? (
        <View style={getContainerStyle()}>
          {renderOptions()}
        </View>
      ) : (
        <ScrollView 
          horizontal={variant === 'buttons'} 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={getContainerStyle()}
        >
          {renderOptions()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  
  // Buttons variant
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  buttonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    minHeight: 48, // Mejor accesibilidad táctil
    minWidth: 80,
    justifyContent: 'center',
  },
  buttonOptionSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  buttonIcon: {
    fontSize: 16,
    marginRight: 6,
    color: '#666',
  },
  buttonIconSelected: {
    color: '#fff',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  buttonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  
  // Chips variant
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 40,
  },
  chipOptionSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  chipIcon: {
    fontSize: 14,
    marginRight: 6,
    color: '#666',
  },
  chipIconSelected: {
    color: '#fff',
  },
  chipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  
  // Cards variant
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardOption: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    minHeight: 80,
    justifyContent: 'center',
    // Sombra sutil
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardOptionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#f8fbff',
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: 8,
    color: '#666',
  },
  cardText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  cardTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
});