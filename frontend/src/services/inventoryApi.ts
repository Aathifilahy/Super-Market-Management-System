import api from './api';
import { Product } from '../types/Product';

export interface InventoryDashboardSummary {
  totalProducts: number;
  totalSuppliers: number;
  lowStockProducts: number;
  totalStockUnits: number;
  totalInventoryValue: number;
  purchasesInLast30Days: number;
}

export const inventoryApi = {
  async getDashboard(): Promise<InventoryDashboardSummary> {
    const response = await api.get<InventoryDashboardSummary>('/inventory/dashboard');
    return response.data;
  },

  async getLowStock(threshold?: number): Promise<Product[]> {
    const response = await api.get<Product[]>('/inventory/low-stock', {
      params: typeof threshold === 'number' ? { threshold } : undefined,
    });
    return response.data;
  },
};

export default inventoryApi;
