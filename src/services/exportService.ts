import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Alert } from 'react-native';

export interface ReportData {
  // Estadísticas generales
  totalClientes: number;
  totalPrestamos: number;
  capitalPrestado: number;
  capitalRecuperado: number;
  interesesGenerados: number;
  montoPendiente: number;
  montoVencido: number;
  
  // Indicadores
  tasaRecuperacion: number;
  margenGanancia: number;
  promedioInteres: number;
  
  // Detalles por cliente
  clientes: Array<{
    id: string;
    nombre: string;
    telefono: string;
    totalPrestamos: number;
    capitalPrestado: number;
    capitalRecuperado: number;
    montoPendiente: number;
  }>;
  
  // Detalles por préstamo
  prestamos: Array<{
    id: string;
    clienteNombre: string;
    monto: number;
    fechaPrestamo: string;
    estado: string;
    cuotasPagadas: number;
    cuotasTotal: number;
  }>;
  
  // Período del reporte
  periodo: {
    inicio: string;
    fin: string;
    tipo: string;
  };
}

export class ExportService {
  /**
   * Exporta reportes a PDF
   */
  static async exportToPDF(data: ReportData): Promise<void> {
    try {
      console.log('Iniciando exportación PDF...');
      
      const htmlContent = this.generatePDFHTML(data);
      console.log('HTML generado:', htmlContent.substring(0, 100) + '...');
      
      // Generar PDF usando expo-print
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      
      console.log('PDF generado en:', uri);
      
      // Verificar si se puede compartir
      if (await Sharing.isAvailableAsync()) {
        console.log('Compartiendo archivo...');
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir Reporte PDF',
          UTI: 'com.adobe.pdf',
        });
        
        Alert.alert(
          'Éxito',
          'Reporte PDF generado y listo para compartir',
          [{ text: 'Entendido' }]
        );
      } else {
        Alert.alert(
          'PDF Generado',
          `El PDF se ha generado en: ${uri}`,
          [{ text: 'Entendido' }]
        );
      }
      
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      Alert.alert('Error', `Error al generar PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }



  /**
   * Genera HTML para PDF
   */
  private static generatePDFHTML(data: ReportData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte de Créditos</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .section h2 { color: #2196F3; border-bottom: 2px solid #2196F3; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .metric { display: inline-block; margin: 10px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
          .metric-value { font-size: 18px; font-weight: bold; color: #333; }
          .metric-label { font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Créditos</h1>
          <p>Período: ${data.periodo.inicio} - ${data.periodo.fin}</p>
        </div>
        
        <div class="section">
          <h2>Resumen Ejecutivo</h2>
          <div class="metric">
            <div class="metric-value">${data.totalClientes}</div>
            <div class="metric-label">Total Clientes</div>
          </div>
          <div class="metric">
            <div class="metric-value">${data.totalPrestamos}</div>
            <div class="metric-label">Total Préstamos</div>
          </div>
          <div class="metric">
            <div class="metric-value">${this.formatCurrency(data.capitalPrestado)}</div>
            <div class="metric-label">Capital Prestado</div>
          </div>
          <div class="metric">
            <div class="metric-value">${this.formatCurrency(data.capitalRecuperado)}</div>
            <div class="metric-label">Capital Recuperado</div>
          </div>
        </div>
        
        <div class="section">
          <h2>Indicadores de Rendimiento</h2>
          <p><strong>Tasa de Recuperación:</strong> ${data.tasaRecuperacion.toFixed(2)}%</p>
          <p><strong>Margen de Ganancia:</strong> ${data.margenGanancia.toFixed(2)}%</p>
          <p><strong>Interés Promedio:</strong> ${data.promedioInteres.toFixed(2)}%</p>
        </div>
        
        <div class="section">
          <h2>Detalle por Cliente</h2>
          <table>
            <tr>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Total Préstamos</th>
              <th>Capital Prestado</th>
              <th>Capital Recuperado</th>
              <th>Monto Pendiente</th>
            </tr>
            ${data.clientes.map(cliente => `
              <tr>
                <td>${cliente.nombre}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.totalPrestamos}</td>
                <td>${this.formatCurrency(cliente.capitalPrestado)}</td>
                <td>${this.formatCurrency(cliente.capitalRecuperado)}</td>
                <td>${this.formatCurrency(cliente.montoPendiente)}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Formatea números como moneda
   */
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  }
}
