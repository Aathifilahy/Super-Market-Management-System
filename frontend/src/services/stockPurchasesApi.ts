import api from './api';

export interface CreateStockPurchasePayload {
  supplierId: number;
  productId: number;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  expiryDate: string;
}

export interface StockPurchase {
  id: number;
  supplierId: number;
  supplierCompanyName: string;
  productId: number;
  productName: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  expiryDate: string;
  createdAt: string;
  totalCost: number;
}

export const stockPurchasesApi = {
  async create(payload: CreateStockPurchasePayload): Promise<StockPurchase> {
    const response = await api.post<StockPurchase>('/stockpurchases', payload);
    return response.data;
  },

  async list(filters?: { supplierId?: number; productId?: number }): Promise<StockPurchase[]> {
    const response = await api.get<StockPurchase[]>('/stockpurchases', { params: filters });
    return response.data;
  },
};

export default stockPurchasesApi;
