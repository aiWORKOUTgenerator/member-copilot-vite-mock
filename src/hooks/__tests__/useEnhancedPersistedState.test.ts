import { renderHook, act } from '@testing-library/react';
import { useEnhancedPersistedState } from '../usePersistedState';

describe('useEnhancedPersistedState', () => {
  const mockStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockStorage.getItem.mockReturnValue(null);
    mockStorage.setItem.mockImplementation(() => {});
    mockStorage.removeItem.mockImplementation(() => {});
    
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default value when no stored data exists', () => {
    mockStorage.getItem.mockReturnValue(null);
    const defaultValue = { test: 'initial' };
    
    const { result } = renderHook(() => useEnhancedPersistedState('testKey', defaultValue));
    
    expect(result.current.state).toEqual(defaultValue);
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it('should load persisted data when available', () => {
    const storedValue = { test: 'stored' };
    mockStorage.getItem.mockReturnValue(JSON.stringify({
      data: storedValue,
      metadata: { version: 1, lastSaved: Date.now() }
    }));
    
    const { result } = renderHook(() => useEnhancedPersistedState('testKey', { test: 'initial' }));
    
    expect(result.current.state).toEqual(storedValue);
  });

  it('should update state and persist changes', () => {
    mockStorage.getItem.mockReturnValue(null);
    const { result } = renderHook(() => useEnhancedPersistedState('testKey', { test: 'initial' }));
    
    act(() => {
      result.current.setState({ test: 'updated' });
    });

    expect(result.current.state.test).toBe('updated');

    // Fast-forward debounce timer
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(mockStorage.setItem).toHaveBeenCalled();
    const savedData = JSON.parse(mockStorage.setItem.mock.calls[mockStorage.setItem.mock.calls.length - 1][1]);
    expect(savedData.data.test).toBe('updated');
  });

  it('should handle storage errors gracefully', () => {
    mockStorage.setItem.mockImplementation(() => {
      throw new Error('Storage full');
    });
    
    const { result } = renderHook(() => useEnhancedPersistedState('testKey', { test: 'initial' }));
    
    act(() => {
      result.current.setState({ test: 'updated' });
    });

    expect(result.current.state.test).toBe('updated');

    // Fast-forward debounce timer
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it('should force save immediately when requested', () => {
    mockStorage.getItem.mockReturnValue(null);
    const { result } = renderHook(() => useEnhancedPersistedState('testKey', { test: 'initial' }));
    
    act(() => {
      result.current.setState({ test: 'updated' });
      result.current.forceSave();
    });
    
    expect(mockStorage.setItem).toHaveBeenCalled();
    const savedData = JSON.parse(mockStorage.setItem.mock.calls[mockStorage.setItem.mock.calls.length - 1][1]);
    expect(savedData.data.test).toBe('updated');
  });
}); 