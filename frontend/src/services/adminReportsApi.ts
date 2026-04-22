import api from './api';

export interface ReportFilterSummary {
  startDate: string;
  endDate: string;
  category?: string | null;
  paymentMethod?: string | null;
  customer?: string | null;
}

export interface TopSellingProduct {
  productId: number;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface DailySalesReport {
  date: string;
  startDate: string;
  endDate: string;
  totalSales: number;
  numberOfOrders: number;
  averageOrderValue: number;
  filters: ReportFilterSummary;
  topSellingProducts: TopSellingProduct[];
}

export interface DailyRevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface MonthlyRevenueReport {
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  monthlyTotal: number;
  filters: ReportFilterSummary;
  dailyBreakdown: DailyRevenuePoint[];
}

export interface TopSellingProductsReport {
  startDate: string;
  endDate: string;
  topN: number;
  sortBy: 'quantity' | 'revenue' | string;
  filters: ReportFilterSummary;
  items: TopSellingProduct[];
}

export interface OrderStatusSummaryItem {
  status: string;
  count: number;
  totalValue: number;
}

export interface OrderSummaryReport {
  startDate: string;
  endDate: string;
  filters: ReportFilterSummary;
  items: OrderStatusSummaryItem[];
}

export interface AdminReportsQuery {
  date?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  paymentMethod?: string;
  customer?: string;
  topN?: number;
  sortBy?: 'quantity' | 'revenue';
}

async function downloadCsv(path: string, params: AdminReportsQuery, fallbackFileName: string) {
  const response = await api.get(path, {
    params,
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  const disposition = response.headers['content-disposition'] as string | undefined;
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  link.href = objectUrl;
  link.download = match?.[1] ?? fallbackFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}

const adminReportsApi = {
  async getDailySales(query: AdminReportsQuery): Promise<DailySalesReport> {
    const response = await api.get<DailySalesReport>('/admin/reports/daily-sales', {
      params: query,
    });

    return response.data;
  },

  async getMonthlyRevenue(query: AdminReportsQuery): Promise<MonthlyRevenueReport> {
    const response = await api.get<MonthlyRevenueReport>('/admin/reports/monthly-revenue', {
      params: query,
    });

    return response.data;
  },

  async getTopProducts(query: AdminReportsQuery): Promise<TopSellingProductsReport> {
    const response = await api.get<TopSellingProductsReport>('/admin/reports/top-products', {
      params: query,
    });

    return response.data;
  },

  async getOrderSummary(query: AdminReportsQuery): Promise<OrderSummaryReport> {
    const response = await api.get<OrderSummaryReport>('/admin/reports/order-summary', {
      params: query,
    });

    return response.data;
  },

  async exportDailySalesCsv(query: AdminReportsQuery, fallbackFileName: string) {
    await downloadCsv('/admin/reports/daily-sales/export', query, fallbackFileName);
  },

  async exportMonthlyRevenueCsv(query: AdminReportsQuery, fallbackFileName: string) {
    await downloadCsv('/admin/reports/monthly-revenue/export', query, fallbackFileName);
  },

  async exportTopProductsCsv(query: AdminReportsQuery, fallbackFileName: string) {
    await downloadCsv('/admin/reports/top-products/export', query, fallbackFileName);
  },

  async exportOrderSummaryCsv(query: AdminReportsQuery, fallbackFileName: string) {
    await downloadCsv('/admin/reports/order-summary/export', query, fallbackFileName);
  },
};

export default adminReportsApi;
