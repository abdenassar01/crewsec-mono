import { getItem, removeItem, setItem } from '@/lib/storage';

const TOKEN = 'token';

export type TokenType = {
  access: string;
  role: 'PARKING' | 'RESTORER' | 'ADMIN' | 'SUPER_ADMIN';
};

export const getToken = () => getItem<TokenType>(TOKEN);
export const removeToken = () => removeItem(TOKEN);
export const setToken = (value: TokenType) => setItem<TokenType>(TOKEN, value);
