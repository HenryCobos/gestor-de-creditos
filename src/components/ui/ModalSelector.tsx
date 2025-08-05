import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Pressable } from 'react-native';

interface ModalSelectorItem {
  label: string;
  value: string;
  icon?: string;
}

interface ModalSelectorProps {
  label: string;
  placeholder?: string;
  value?: string;
  items: ModalSelectorItem[];
  onValueChange: (value: string, item: ModalSelectorItem) => void;
  style?: any;
  error?: string;
  disabled?: boolean;
}

export function ModalSelector({
  label,
  placeholder = 'Seleccionar...',
  value,
  items,
  onValueChange,
  style,
  error,
  disabled = false
}: ModalSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = items.find(item => item.value === value);

  const handleSelectItem = (item: ModalSelectorItem) => {
    onValueChange(item.value, item);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.selector,
          error && styles.selectorError,
          disabled && styles.selectorDisabled
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <View style={styles.selectorContent}>
          {selectedItem?.icon && (
            <Text style={styles.selectedIcon}>{selectedItem.icon}</Text>
          )}
          <Text style={[
            styles.selectedText,
            !selectedItem && styles.placeholderText
          ]}>
            {selectedItem ? selectedItem.label : placeholder}
          </Text>
        </View>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item.value === value && styles.modalItemSelected
                  ]}
                  onPress={() => handleSelectItem(item)}
                >
                  <View style={styles.modalItemContent}>
                    {item.icon && (
                      <Text style={styles.modalItemIcon}>{item.icon}</Text>
                    )}
                    <Text style={[
                      styles.modalItemText,
                      item.value === value && styles.modalItemTextSelected
                    ]}>
                      {item.label}
                    </Text>
                  </View>
                  {item.value === value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  selectorError: {
    borderColor: '#F44336',
  },
  selectorDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  selectedText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalItemSelected: {
    backgroundColor: '#f8fbff',
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalItemIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  modalItemTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#2196F3',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
  },
});