import { useState, useEffect, useCallback } from 'react';

// South Africa center coordinates (fallback)
const SA_CENTER: [number, number] = [24.6, -28.5];

interface GeolocationState {
  coordinates: [number, number];
  loading: boolean;
  error: string | null;
  source: 'browser' | 'ip' | 'default';
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  fallbackToIP?: boolean;
}

/**
 * Hybrid geolocation hook
 * Priority: Browser Geolocation API → IP-based lookup → SA center fallback
 */
export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = false,
    timeout = 10000,
    maximumAge = 300000, // 5 minutes cache
    fallbackToIP = true,
  } = options;

  const [state, setState] = useState<GeolocationState>({
    coordinates: SA_CENTER,
    loading: true,
    error: null,
    source: 'default',
  });

  // Try browser geolocation
  const tryBrowserGeolocation = useCallback((): Promise<[number, number] | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          resolve(coords);
        },
        () => {
          // User denied or error - silent fail
          resolve(null);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    });
  }, [enableHighAccuracy, timeout, maximumAge]);

  // Try IP-based geolocation
  const tryIPGeolocation = useCallback(async (): Promise<[number, number] | null> => {
    try {
      // Use HTTPS endpoint to avoid mixed content issues
      const response = await fetch('https://ipapi.co/json/', {
        signal: AbortSignal.timeout(5000),
      });
      
      if (!response.ok) {
        throw new Error('IP lookup failed');
      }
      
      const data = await response.json();
      
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        // Basic validation - check if in reasonable range
        if (
          data.latitude >= -90 && data.latitude <= 90 &&
          data.longitude >= -180 && data.longitude <= 180
        ) {
          return [data.longitude, data.latitude];
        }
      }
      
      return null;
    } catch {
      // Network error, CORS, timeout - silent fail
      return null;
    }
  }, []);

  // Main effect to get location
  useEffect(() => {
    let cancelled = false;

    const getLocation = async () => {
      // 1. Try browser geolocation first (most accurate)
      const browserCoords = await tryBrowserGeolocation();
      if (!cancelled && browserCoords) {
        setState({
          coordinates: browserCoords,
          loading: false,
          error: null,
          source: 'browser',
        });
        return;
      }

      // 2. Fallback to IP-based geolocation
      if (fallbackToIP) {
        const ipCoords = await tryIPGeolocation();
        if (!cancelled && ipCoords) {
          setState({
            coordinates: ipCoords,
            loading: false,
            error: null,
            source: 'ip',
          });
          return;
        }
      }

      // 3. Final fallback to SA center
      if (!cancelled) {
        setState({
          coordinates: SA_CENTER,
          loading: false,
          error: 'Could not determine location',
          source: 'default',
        });
      }
    };

    getLocation();

    return () => {
      cancelled = true;
    };
  }, [tryBrowserGeolocation, tryIPGeolocation, fallbackToIP]);

  // Manual refresh function
  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
  }, []);

  return {
    ...state,
    isLocated: state.source !== 'default',
    refresh,
  };
}

/**
 * Get location once (for non-hook contexts)
 */
export async function getLocation(): Promise<[number, number]> {
  // Try browser first
  if (navigator.geolocation) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        });
      });
      return [position.coords.longitude, position.coords.latitude];
    } catch {
      // Silent fail
    }
  }

  // Try IP fallback
  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json();
    if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
      return [data.longitude, data.latitude];
    }
  } catch {
    // Silent fail
  }

  // Default to SA center
  return SA_CENTER;
}
