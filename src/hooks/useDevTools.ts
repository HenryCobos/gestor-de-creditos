import { useState, useEffect, useCallback } from 'react';
import { DevToolsService } from '../services/devTools';
import type { DevToolsConfig } from '../services/devTools';

export function useDevTools() {
  const [config, setConfig] = useState<DevToolsConfig>(DevToolsService.getConfig());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Inicializar el servicio
    DevToolsService.initialize().then(() => {
      setConfig(DevToolsService.getConfig());
      setIsLoading(false);
    });

    // Suscribirse a cambios
    const unsubscribe = DevToolsService.subscribe((newConfig) => {
      setConfig(newConfig);
    });

    return unsubscribe;
  }, []);

  const setSimulatePremium = useCallback(async (simulate: boolean) => {
    await DevToolsService.setSimulatePremium(simulate);
  }, []);

  const setOverrideLimits = useCallback(async (limits: Partial<DevToolsConfig['overrideLimits']>) => {
    await DevToolsService.setOverrideLimits(limits);
  }, []);

  const toggleDevControls = useCallback(async () => {
    await DevToolsService.toggleDevControls();
  }, []);

  const reset = useCallback(async () => {
    await DevToolsService.reset();
  }, []);

  return {
    config,
    isLoading,
    setSimulatePremium,
    setOverrideLimits,
    toggleDevControls,
    reset,
  };
}
