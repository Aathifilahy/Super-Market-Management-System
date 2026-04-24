import api from './api';

export interface AdminOrderPaymentItem {
  id: number;
  userId: number;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalItems: number;
}

export interface AdminMarkOrderPaidResponse {
  id: number;
  status: string;
  paymentStatus: string;
  updatedAtUtc: string;
}

const adminOrdersApi = {
  async getPendingPaymentOrders(): Promise<AdminOrderPaymentItem[]> {
    const response = await api.get<AdminOrderPaymentItem[]>('/admin/orders/pending-payment');
    return response.data;
  },

  async markOrderAsPaid(orderId: number): Promise<AdminMarkOrderPaidResponse> {
    const response = await api.patch<AdminMarkOrderPaidResponse>(`/admin/orders/${orderId}/mark-paid`);
    return response.data;
  },
};

export default adminOrdersApi;
