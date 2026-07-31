export type UserRole = string;

export const USER_ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  accounts: 'Accounts',
  basicUser: 'Basic User',
};

export function getRoleLabel(role: string | null | undefined, fallbackLabel?: string): string {
  if (!role) return 'Unassigned';
  return fallbackLabel ?? USER_ROLE_LABELS[role] ?? role;
}

export const AUTH_TOKEN_KEY = 'althara_auth_token';
export const AUTH_USER_KEY = 'althara_auth_user';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthSession(token: string, user: AuthUser): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin';
}
