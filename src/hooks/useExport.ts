import { useState, useCallback } from 'react';
import { ExportService, ReportData } from '../services/exportService';

export interface UseExportReturn {
  isExporting: boolean;
  exportToPDF: (data: ReportData) => Promise<void>;
  exportError: string | null;
}

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportToPDF = useCallback(async (data: ReportData) => {
    setIsExporting(true);
    setExportError(null);
    
    try {
      await ExportService.exportToPDF(data);
    } catch (error) {
      setExportError('Error al exportar PDF');
      console.error('Export PDF error:', error);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    isExporting,
    exportToPDF,
    exportError,
  };
}
