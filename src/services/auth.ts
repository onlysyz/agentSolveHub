import { apiRequest, setToken, removeToken, getToken } from './api';
import type { User } from '../types';

export async function sendVerificationCode(email: string): Promise<{ message: string; expiresAt: string }> {
  return apiRequest<{ message: string; expiresAt: string }>('/auth/send-code', {
    method: 'POST',
    body: { email },
  });
}

export async function verifyCode(email: string, code: string): Promise<{ token: string; user: User }> {
  const result = await apiRequest<{ token: string; user: User }>('/auth/verify', {
    method: 'POST',
    body: { email, code },
  });
  setToken(result.token);
  return result;
}

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>('/auth/me');
}

export function logout(): void {
  removeToken();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
