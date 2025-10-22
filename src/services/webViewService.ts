interface WebViewData {
  approvalUrl: string;
  orderId: string;
  product: any;
}

type WebViewCallback = (data: WebViewData) => void;
type HideCallback = () => void;

class WebViewService {
  private static instance: WebViewService;
  private currentWebViewData: WebViewData | null = null;
  private showCallbacks: WebViewCallback[] = [];
  private hideCallbacks: HideCallback[] = [];

  static getInstance(): WebViewService {
    if (!WebViewService.instance) {
      WebViewService.instance = new WebViewService();
    }
    return WebViewService.instance;
  }

  // Mostrar WebView
  showWebView(data: WebViewData) {
    console.log('🌐 WebViewService: Mostrando WebView con datos:', data);
    this.currentWebViewData = data;
    
    // Notificar a todos los listeners
    this.showCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error en callback de showWebView:', error);
      }
    });
  }

  // Ocultar WebView
  hideWebView() {
    console.log('🌐 WebViewService: Ocultando WebView');
    this.currentWebViewData = null;
    
    // Notificar a todos los listeners
    this.hideCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error en callback de hideWebView:', error);
      }
    });
  }

  // Suscribirse a eventos de mostrar WebView
  onShowWebView(callback: WebViewCallback) {
    this.showCallbacks.push(callback);
    
    // Si ya hay datos, ejecutar inmediatamente
    if (this.currentWebViewData) {
      callback(this.currentWebViewData);
    }
    
    // Retornar función de cleanup
    return () => {
      const index = this.showCallbacks.indexOf(callback);
      if (index > -1) {
        this.showCallbacks.splice(index, 1);
      }
    };
  }

  // Suscribirse a eventos de ocultar WebView
  onHideWebView(callback: HideCallback) {
    this.hideCallbacks.push(callback);
    
    // Retornar función de cleanup
    return () => {
      const index = this.hideCallbacks.indexOf(callback);
      if (index > -1) {
        this.hideCallbacks.splice(index, 1);
      }
    };
  }

  // Obtener datos actuales del WebView
  getCurrentWebViewData(): WebViewData | null {
    return this.currentWebViewData;
  }

  // Verificar si hay WebView activo
  hasActiveWebView(): boolean {
    return this.currentWebViewData !== null;
  }
}

export const webViewService = WebViewService.getInstance();
