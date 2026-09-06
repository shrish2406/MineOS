import * as SecureStore from 'expo-secure-store';
import type { Mine, User } from '../types';

const TOKEN_KEY = 'minsos_token';
const USER_KEY = 'minsos_user';
const SELECTED_MINE_KEY = 'minsos_selected_mine';

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveUser(user: User): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<User | null> {
  const data = await SecureStore.getItemAsync(USER_KEY);
  if (!data) {
    return null;
  }
  return JSON.parse(data) as User;
}

export async function saveSelectedMine(mine: Mine): Promise<void> {
  await SecureStore.setItemAsync(SELECTED_MINE_KEY, JSON.stringify(mine));
}

export async function getSelectedMine(): Promise<Mine | null> {
  const data = await SecureStore.getItemAsync(SELECTED_MINE_KEY);
  if (!data) {
    return null;
  }
  return JSON.parse(data) as Mine;
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
  await SecureStore.deleteItemAsync(SELECTED_MINE_KEY);
}

export async function hasValidSession(): Promise<boolean> {
  const token = await getToken();
  return Boolean(token);
}
