import React, { useState, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { PayPalProduct } from '../../services/payments';

interface PayPalWebViewProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  product: PayPalProduct;
  approvalUrl: string;
}

const { width, height } = Dimensions.get('window');

export const PayPalWebView: React.FC<PayPalWebViewProps> = ({
  visible,
  onClose,
  onSuccess,
  onError,
  product,
  approvalUrl,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setError('Error al cargar la página de PayPal');
    setLoading(false);
  };

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log('🔍 Navegando a:', url);

    // Verificar si es la URL de éxito
    if (url.includes('henrycobos.github.io/gestor-creditos-landing/success') || url.includes('payment=success')) {
      // Extraer el token de la URL
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const token = urlParams.get('token');
      const PayerID = urlParams.get('PayerID');

      if (token && PayerID) {
        console.log('✅ Pago aprobado por el usuario:', { token, PayerID });
        onSuccess(token);
        return;
      } else {
        // Si no hay token/PayerID pero es URL de éxito, asumir éxito
        console.log('✅ Pago exitoso detectado (sin token específico)');
        onSuccess('paypal_success');
        return;
      }
    }

    // Verificar si es la URL de cancelación
    if (url.includes('henrycobos.github.io/gestor-creditos-landing/cancel') || url.includes('payment=cancel')) {
      console.log('❌ Pago cancelado por el usuario');
      onError('Pago cancelado por el usuario');
      return;
    }

    // Verificar si hay errores de PayPal
    if (url.includes('error') || url.includes('cancel')) {
      console.log('❌ Error en el flujo de PayPal');
      onError('Error en el proceso de pago');
      return;
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('📨 Mensaje del WebView:', data);

      if (data.type === 'PAYMENT_SUCCESS') {
        onSuccess(data.transactionId);
      } else if (data.type === 'PAYMENT_ERROR') {
        onError(data.error);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const retry = () => {
    setError(null);
    setLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Completar Pago</Text>
          <Text style={styles.subtitle}>
            {product.name} - ${product.price}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0070BA" />
            <Text style={styles.loadingText}>Cargando PayPal...</Text>
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={retry}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: approvalUrl }}
          style={styles.webview}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="compatibility"
          userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0070BA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webview: {
    flex: 1,
  },
});
