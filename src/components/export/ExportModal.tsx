import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Button } from '../ui';
import { useExport } from '../../hooks/useExport';
import { ReportData } from '../../services/exportService';
import { ReviewService } from '../../services/reviewService';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  reportData: ReportData;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  reportData,
}) => {
  console.log('ExportModal renderizado, visible:', visible);
  console.log('ReportData:', reportData);
  
  const { isExporting, exportToPDF } = useExport();
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | null>(null);

  const handleExport = async () => {
    console.log('handleExport llamado para PDF');
    setSelectedFormat('pdf');
    
    try {
      console.log('Exportando a PDF...');
      await exportToPDF(reportData);
      console.log('Exportación completada, cerrando modal...');
      
      // Trigger de reseña después de exportar reporte exitosamente
      await ReviewService.triggerOnReportExported();
      
      onClose();
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setSelectedFormat(null);
    }
  };


  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Exportar Reporte</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.description}>
              Selecciona el formato para exportar tu reporte
            </Text>
            
            <View style={styles.periodContainer}>
              <Text style={styles.periodLabel}>Período:</Text>
              <Text style={styles.periodText}>
                {reportData.periodo.inicio} - {reportData.periodo.fin}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.exportButton, selectedFormat === 'pdf' && styles.exportButtonSelected]}
              onPress={handleExport}
              disabled={isExporting}
            >
              <Text style={styles.exportButtonIcon}>📊</Text>
              <View style={styles.exportButtonContent}>
                <Text style={styles.exportButtonTitle}>Exportar PDF</Text>
                <Text style={styles.exportButtonDescription}>Reporte completo con gráficos y tablas profesionales</Text>
              </View>
            </TouchableOpacity>

            {isExporting && (
              <View style={styles.exportingContainer}>
                <Text style={styles.exportingText}>⏳ Generando archivo...</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClose}
              disabled={isExporting}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  periodContainer: {
    backgroundColor: '#f0f7ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  periodLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  exportButtonSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#f3f8ff',
  },
  exportButtonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  exportButtonContent: {
    flex: 1,
  },
  exportButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exportButtonDescription: {
    fontSize: 14,
    color: '#666',
  },
  exportingContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  exportingText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
});

