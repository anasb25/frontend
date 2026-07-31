import { AuthUser, UserRole } from '@/lib/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : Array.isArray(data.message)
          ? data.message[0]
          : 'Something went wrong';
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface UserProfile extends AuthUser {}

export interface Role {
  id: string;
  name: UserRole;
  label: string;
  description: string;
}

export interface UserWithRole {
  id: string;
  username: string;
  fullName: string;
  isActive: boolean;
  role: {
    id: string;
    name: UserRole;
    label: string;
  } | null;
  createdAt: string;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export interface CreateUserPayload {
  username: string;
  password: string;
  fullName?: string;
  roleName?: string;
}

export interface CreateRolePayload {
  name: string;
  label: string;
  description?: string;
}

export const api = {
  login: (username: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getProfile: (token: string) =>
    request<UserProfile>('/auth/profile', {
      headers: authHeaders(token),
    }),

  getRoles: (token: string) =>
    request<Role[]>('/roles', {
      headers: authHeaders(token),
    }),

  createRole: (token: string, payload: CreateRolePayload) =>
    request<Role>('/roles', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  getUsers: (token: string) =>
    request<UserWithRole[]>('/users', {
      headers: authHeaders(token),
    }),

  createUser: (token: string, payload: CreateUserPayload) =>
    request<UserWithRole>('/users', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  assignUserRole: (token: string, userId: string, roleName: string) =>
    request<UserWithRole>(`/users/${userId}/role`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ roleName }),
    }),
};
