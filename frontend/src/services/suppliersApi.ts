import api from './api';

export interface Supplier {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxIdOrVatNumber?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface SupplierPayload {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxIdOrVatNumber?: string;
  isActive?: boolean;
}

export const suppliersApi = {
  async list(search?: string): Promise<Supplier[]> {
    const response = await api.get<Supplier[]>('/suppliers', {
      params: search && search.trim().length > 0 ? { search: search.trim() } : undefined,
    });
    return response.data;
  },

  async create(payload: SupplierPayload): Promise<Supplier> {
    const response = await api.post<Supplier>('/suppliers', payload);
    return response.data;
  },

  async update(id: number, payload: SupplierPayload): Promise<Supplier> {
    const response = await api.put<Supplier>(`/suppliers/${id}`, payload);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/suppliers/${id}`);
  },
};

export default suppliersApi;
