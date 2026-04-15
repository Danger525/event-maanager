import type {
  AnalyticsData,
  ApiEvent,
  ApiNotification,
  AuthCredentials,
  AuthUserResponse,
  EventPayload,
  ProfileUpdatePayload,
  RegisterPayload,
} from '@/types/api';

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const getAuthHeader = () => {
  const token = localStorage.getItem('campus_hub_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const requestJson = async <T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
  const res = await fetch(input, init);
  if (!res.ok) {
    let message = 'Request failed';
    try {
      const error = await res.json() as { message?: string };
      message = error.message || message;
    } catch {
      // Keep the default message if the server does not return JSON.
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
};

const buildSearchParams = (params: Record<string, string | number | boolean | undefined | null>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  return searchParams.toString();
};

export const api = {
  auth: {
    login: async (credentials: AuthCredentials) => {
      return requestJson<AuthUserResponse>(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
    },
    register: async (userData: RegisterPayload) => {
      return requestJson<AuthUserResponse>(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
    },
  },
  events: {
    getAll: async (params: Record<string, string | number | boolean | undefined | null> = {}) => {
      const query = buildSearchParams(params);
      return requestJson<ApiEvent[]>(`${API_URL}/events${query ? `?${query}` : ''}`);
    },
    getOne: async (id: string) => {
      return requestJson<ApiEvent>(`${API_URL}/events/${id}`);
    },
    register: async (id: string) => {
      return requestJson<{ message: string }>(`${API_URL}/events/${id}/register`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      });
    },
    save: async (id: string) => {
      return requestJson<{ message: string; isSaved: boolean }>(`${API_URL}/events/${id}/save`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      });
    },
    create: async (eventData: EventPayload) => {
      return requestJson<ApiEvent>(`${API_URL}/events`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader() 
        },
        body: JSON.stringify(eventData),
      });
    },
    update: async (id: string, eventData: EventPayload) => {
      return requestJson<ApiEvent>(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader() 
        },
        body: JSON.stringify(eventData),
      });
    },
    delete: async (id: string) => {
      return requestJson<{ message: string }>(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
    },
    getRegistered: async () => {
      return requestJson<ApiEvent[]>(`${API_URL}/events/my/registered`, {
        headers: { ...getAuthHeader() },
      });
    },
    getAnalytics: async () => {
      return requestJson<AnalyticsData>(`${API_URL}/events/analytics`, {
        headers: { ...getAuthHeader() },
      });
    },
  },
  profile: {
    get: async () => {
      return requestJson<AuthUserResponse>(`${API_URL}/auth/profile`, {
        headers: { ...getAuthHeader() },
      });
    },
    update: async (profileData: ProfileUpdatePayload) => {
      return requestJson<AuthUserResponse>(`${API_URL}/auth/profile`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader() 
        },
        body: JSON.stringify(profileData),
      });
    },
  },
  notifications: {
    getAll: async () => {
      return requestJson<ApiNotification[]>(`${API_URL}/auth/notifications`, {
        headers: { ...getAuthHeader() },
      });
    },
    markRead: async (id: string) => {
      return requestJson<{ message: string }>(`${API_URL}/auth/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { ...getAuthHeader() },
      });
    },
  },
};
