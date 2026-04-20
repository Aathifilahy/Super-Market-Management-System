import axios from 'axios';
import api from './api';

export interface PosSearchProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  availableStock: number;
  simulatedBarcode: string;
  isOutOfStock: boolean;
  isExpired: boolean;
}

export interface PosSearchResponse {
  query?: string;
  category?: string;
  barcode?: string;
  includeOutOfStock: boolean;
  totalResults: number;
  categories: string[];
  items: PosSearchProduct[];
}

export interface PosCheckoutItem {
  productId: number;
  quantity: number;
}

export interface PosReceiptItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PosReceipt {
  orderId: number;
  receiptNumber: string;
  transactionDateUtc: string;
  storeName: string;
  cashierName: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  total: number;
  amountTendered?: number | null;
  changeGiven?: number | null;
  cardAuthorizationCode?: string | null;
  items: PosReceiptItem[];
}

export interface PosTransactionHistoryItem {
  orderId: number;
  receiptNumber: string;
  transactionDateUtc: string;
  cashierName: string;
  paymentMethod: string;
  total: number;
  totalItems: number;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === 'string' && data.trim().length > 0) {
      return data;
    }

    if (data && typeof data === 'object') {
      const message = (data as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim().length > 0) {
        return message;
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Failed to search POS products.';
}

const posApi = {
  async searchProducts(params: {
    q?: string;
    category?: string;
    barcode?: string;
    includeOutOfStock?: boolean;
  }): Promise<PosSearchResponse> {
    try {
      const response = await api.get<PosSearchResponse>('/pos/products/search', {
        params,
      });

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async checkout(payload: {
    items: PosCheckoutItem[];
    paymentMethod: 'Cash' | 'Card';
    amountTendered?: number;
    simulateCardApproval?: boolean;
  }): Promise<PosReceipt> {
    try {
      const response = await api.post<PosReceipt>('/pos/checkout', payload);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getReceipt(orderId: number): Promise<PosReceipt> {
    try {
      const response = await api.get<PosReceipt>(`/pos/receipts/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getRecentTransactions(limit: number = 10): Promise<PosTransactionHistoryItem[]> {
    try {
      const response = await api.get<PosTransactionHistoryItem[]>('/pos/transactions/recent', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export default posApi;
