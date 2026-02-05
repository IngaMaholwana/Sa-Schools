import { useState, useEffect } from 'react';
import { loadSchoolsDataParallel, type SchoolsDataState } from '@/data/schools-loader';
import type { School } from '@/data/schools';

interface UseSchoolsDataReturn {
  schools: School[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => void;
}

// Cache for loaded schools data
let cachedSchools: School[] | null = null;
let loadingPromise: Promise<School[]> | null = null;

/**
 * Hook to load and use schools data
 * Data is cached globally to avoid reloading
 */
export function useSchoolsData(): UseSchoolsDataReturn {
  const [state, setState] = useState<Omit<SchoolsDataState, 'progress'>>({
    schools: cachedSchools || [],
    loading: !cachedSchools,
    error: null,
  });

  const loadData = async () => {
    // If already cached, use it
    if (cachedSchools) {
      setState({
        schools: cachedSchools,
        loading: false,
        error: null,
      });
      return;
    }

    // If already loading, wait for it
    if (loadingPromise) {
      try {
        const schools = await loadingPromise;
        setState({
          schools,
          loading: false,
          error: null,
        });
      } catch {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load schools data',
        }));
      }
      return;
    }

    // Start loading
    setState(prev => ({ ...prev, loading: true, error: null }));

    loadingPromise = loadSchoolsDataParallel();

    try {
      const schools = await loadingPromise;
      cachedSchools = schools;
      setState({
        schools,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        schools: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load schools data',
      });
    } finally {
      loadingPromise = null;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refetch = () => {
    cachedSchools = null;
    loadingPromise = null;
    loadData();
  };

  return {
    schools: state.schools,
    loading: state.loading,
    error: state.error,
    totalCount: state.schools.length,
    refetch,
  };
}
