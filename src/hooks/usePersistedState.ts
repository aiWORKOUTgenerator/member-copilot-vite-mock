import { useState, useEffect, useCallback, useRef } from 'react';

interface PersistedStateMetadata {
  lastSaved: number;
  version: number;
}

interface PersistedData<T> {
  data: T;
  metadata: PersistedStateMetadata;
}

const CURRENT_VERSION = 1;
const DEBOUNCE_DELAY = 1000; // 1 second

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
        // Only use persisted data if it's the current version
        if (parsed.metadata?.version === CURRENT_VERSION) {
          return parsed.data;
        }
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

  // Create backup
  const createBackup = useCallback(() => {
    try {
      const backup = {
        data: state,
        metadata: {
          ...metadata,
          backupDate: Date.now()
        }
      };
      const backupKey = `${key}_backup`;
      window.localStorage.setItem(backupKey, JSON.stringify(backup));
      return true;
    } catch (error) {
      console.warn(`Failed to create backup for key "${key}":`, error);
      return false;
    }
  }, [key, state, metadata]);

  // Restore from backup
  const restoreFromBackup = useCallback(() => {
    try {
      const backupKey = `${key}_backup`;
      const backup = window.localStorage.getItem(backupKey);
      if (backup) {
        const parsed = JSON.parse(backup) as PersistedData<T>;
        setState(parsed.data);
        return true;
      }
      return false;
    } catch (error) {
      console.warn(`Failed to restore backup for key "${key}":`, error);
      return false;
    }
  }, [key]);

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
    createBackup,
    restoreFromBackup,
    forceSave
  };
}

/**
 * Legacy hook for backward compatibility
 * @deprecated Use useEnhancedPersistedState instead
 */
export function usePersistedState<T>(key: string, defaultValue: T) {
  const { state, setState } = useEnhancedPersistedState<T>(key, defaultValue);
  return [state, setState] as const;
} 