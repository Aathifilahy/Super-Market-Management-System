import axios from 'axios';
import api from './api';

export type StaffRole = 'Admin' | 'InventoryManager' | 'Cashier';

export interface CreateStaffUserPayload {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
  address?: string;
  phone?: string;
}

export interface CreatedStaffUserResponse {
  id: number;
  name: string;
  email: string;
  role: StaffRole;
  address?: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  isActive: boolean;
}

export type StaffUserSummary = CreatedStaffUserResponse;

export interface AdminUsersApiError {
  message: string;
  status?: number;
}

function parseApiError(error: unknown): AdminUsersApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (typeof data === 'string' && data.trim().length > 0) {
      return { message: data, status };
    }

    if (data && typeof data === 'object') {
      const message = (data as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim().length > 0) {
        return { message, status };
      }

      const title = (data as { title?: unknown }).title;
      if (typeof title === 'string' && title.trim().length > 0) {
        return { message: title, status };
      }
    }

    if (error.message) {
      return { message: error.message, status };
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return { message: error.message };
  }

  return { message: 'An unexpected error occurred.' };
}

function throwApiError(error: unknown): never {
  throw parseApiError(error);
}

export const adminUsersApi = {
  async getStaffUsers(token: string, search?: string): Promise<StaffUserSummary[]> {
    try {
      const response = await api.get<StaffUserSummary[]>('/admin/users/staff', {
        params: search && search.trim().length > 0 ? { search: search.trim() } : undefined,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  async getStaffUserById(token: string, id: number): Promise<StaffUserSummary> {
    try {
      const response = await api.get<StaffUserSummary>(`/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  async createStaffUser(payload: CreateStaffUserPayload, token: string): Promise<CreatedStaffUserResponse> {
    try {
      const response = await api.post<CreatedStaffUserResponse>(
        '/admin/users',
        {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          confirmPassword: payload.password,
          role: payload.role,
          address: payload.address,
          phone: payload.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },
};

export default adminUsersApi;
