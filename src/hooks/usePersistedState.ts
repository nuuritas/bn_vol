import { useState, useEffect } from 'react';

const usePersistedState = <T>(key: string, defaultValue: T): [T, (value: T) => void] => {
  const [state, setState] = useState<T>(() => {
    try {
      const persistedState = localStorage.getItem(key);
      return persistedState !== null ? JSON.parse(persistedState) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

export default usePersistedState;