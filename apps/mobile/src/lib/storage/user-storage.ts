import { Platform } from 'react-native';
import { createMMKV } from 'react-native-mmkv';

export interface User {
  _id: string;
  _creationTime: number;
  enabled?: boolean;
  email: string;
  name: string;
  avatar?: string;
  role: 'CLIENT' | 'EMPLOYEE' | 'ADMIN';
  userId: string;
}

const userStorage = createMMKV({
  id: 'user-storage',
  ...(Platform.OS !== 'web' && { encryptionKey: 'user-secret-key' }),
});

export const userStorageKeys = {
  USER_DATA: 'user-data',
  IS_LOADING: 'is-loading',
} as const;

export const setUser = (user: User | null) => {
  if (user) {
    userStorage.set(userStorageKeys.USER_DATA, JSON.stringify(user));
  } else {
    userStorage.remove(userStorageKeys.USER_DATA);
  }
};

export const getUser = (): User | null => {
  const userData = userStorage.getString(userStorageKeys.USER_DATA);
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }
  return null;
};

export const setLoading = (isLoading: boolean) => {
  userStorage.set(userStorageKeys.IS_LOADING, isLoading);
};

export const getLoading = (): boolean => {
  const isLoading = userStorage.getBoolean(userStorageKeys.IS_LOADING);
  return isLoading ?? false;
};

// Initialize loading state to false on first load
export const initializeLoadingState = () => {
  const currentLoading = getLoading();
  if (currentLoading === undefined || currentLoading === null) {
    setLoading(false);
  }
};
