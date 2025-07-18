import { useState, useEffect, useCallback, useRef } from 'react';

interface PersistedStateMetadata {
  lastSaved: number;
  version: number;
}

interface PersistedData<T> {
  data: T;
  metadata: PersistedStateMetadata;
}

const CURRENT_VERSION = 2; // Incremented for availableLocations addition
const DEBOUNCE_DELAY = 1000; // 1 second

/**
 * Migrates data from one version to another
 * @param data The data to migrate
 * @param fromVersion The version to migrate from
 * @returns The migrated data
 */
function migrateData<T>(data: T, fromVersion: number): T {
  let migratedData = { ...data };

  // Migration from version 1 to 2
  if (fromVersion === 1) {
    if (typeof migratedData === 'object' && migratedData !== null) {
      migratedData = {
        ...migratedData,
        availableLocations: [] // Initialize with empty array
      };
    }
  }

  return migratedData;
}

/**
 * Enhanced hook for persisting state to localStorage with additional features:
 * - Debounced auto-save
 * - Last saved timestamp tracking
 * - Version control for data structure changes
 * - Backup/restore functionality
 */
export function useEnhancedPersistedState<T>(
  key: string,
  defaultValue: T,
  options = { debounceDelay: DEBOUNCE_DELAY }
) {
  // Initialize state with persisted data or default value
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item) as PersistedData<T>;
        // Handle data migration if needed
        if (parsed.metadata?.version < CURRENT_VERSION) {
          const migratedData = migrateData(parsed.data, parsed.metadata.version);
          // Save migrated data immediately
          const newMetadata = { lastSaved: Date.now(), version: CURRENT_VERSION };
          window.localStorage.setItem(key, JSON.stringify({ data: migratedData, metadata: newMetadata }));
          return migratedData;
        }
        return parsed.data;
      }
      return defaultValue;
    } catch (error) {
      console.warn(`Failed to load persisted state for key "${key}":`, error);
      return defaultValue;
    }
  });

  // Keep a ref to the current state for forceSave
  const stateRef = useRef<T>(state);
  stateRef.current = state;

  // Track metadata separately
  const [metadata, setMetadata] = useState<PersistedStateMetadata>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item) as PersistedData<T>;
        if (parsed.metadata) {
          return parsed.metadata;
        }
      }
    } catch (error) {
      console.warn(`Failed to load metadata for key "${key}":`, error);
    }
    return {
      lastSaved: Date.now(),
      version: CURRENT_VERSION
    };
  });

  // Track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Save state to localStorage
  const saveState = useCallback((newState: T) => {
    try {
      const newMetadata: PersistedStateMetadata = {
        lastSaved: Date.now(),
        version: CURRENT_VERSION
      };

      const persistedData: PersistedData<T> = {
        data: newState,
        metadata: newMetadata
      };

      window.localStorage.setItem(key, JSON.stringify(persistedData));
      setMetadata(newMetadata);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.warn(`Failed to persist state for key "${key}":`, error);
    }
  }, [key]);

  // Debounced save effect
  useEffect(() => {
    setHasUnsavedChanges(true);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveState(state);
    }, options.debounceDelay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [state, saveState, options.debounceDelay]);

  // Removed backup functionality

  // Regular setState that only updates state (doesn't immediately save)
  const updateState = useCallback((newState: T | ((prevState: T) => T)) => {
    // Update the ref synchronously before React processes the state update
    const nextState = typeof newState === 'function' ? (newState as ((prevState: T) => T))(stateRef.current) : newState;
    stateRef.current = nextState;
    
    setState(nextState);
  }, []);

  // Force save
  const forceSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    saveState(stateRef.current);
  }, [saveState]);

  return {
    state,
    setState: updateState,
    metadata,
    hasUnsavedChanges,
    forceSave
  };
}

// Legacy usePersistedState hook has been removed
// All components should now use useEnhancedPersistedState
// See the enhanced hook above for the new implementation 