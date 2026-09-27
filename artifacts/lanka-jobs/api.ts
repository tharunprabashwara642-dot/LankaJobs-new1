import * as SecureStore from 'expo-secure-store';
import { customFetch, setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
const TOKEN_KEY = 'lankajobs_access_token';

setBaseUrl(API_BASE_URL || null);
setAuthTokenGetter(() => SecureStore.getItemAsync(TOKEN_KEY));

export type ApiUser = {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
};

export type ApiProfile = {
  userId: string;
  location: string;
  interests: string[];
  experience: string;
  education: string;
  skills: string[];
  employmentType: string;
  workPreference: string;
  workMode: string;
  updatedAt: string;
};

export async function apiRequest<T>(path: string, options: RequestInit = {}) {
  return customFetch<T>(`${path}`, { ...options, responseType: 'json' });
}

export async function saveAccessToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearAccessToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function isApiConfigured() {
  return Boolean(API_BASE_URL);
}