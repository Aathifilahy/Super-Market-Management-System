import api from './api';

export interface TopSellingProduct {
  productId: number;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface DailySalesReport {
  date: string;
  totalSales: number;
  numberOfOrders: number;
  averageOrderValue: number;
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
  monthlyTotal: number;
  dailyBreakdown: DailyRevenuePoint[];
}

export interface TopSellingProductsReport {
  startDate: string;
  endDate: string;
  topN: number;
  sortBy: 'quantity' | 'revenue' | string;
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
  items: OrderStatusSummaryItem[];
}

const adminReportsApi = {
  async getDailySales(date?: string): Promise<DailySalesReport> {
    const response = await api.get<DailySalesReport>('/admin/reports/daily-sales', {
      params: date ? { date } : undefined,
    });

    return response.data;
  },

  async getMonthlyRevenue(year?: number, month?: number): Promise<MonthlyRevenueReport> {
    const params: Record<string, number> = {};
    if (typeof year === 'number') {
      params.year = year;
    }
    if (typeof month === 'number') {
      params.month = month;
    }

    const response = await api.get<MonthlyRevenueReport>('/admin/reports/monthly-revenue', {
      params: Object.keys(params).length > 0 ? params : undefined,
    });

    return response.data;
  },

  async getTopProducts(query: {
    startDate?: string;
    endDate?: string;
    topN?: number;
    sortBy?: 'quantity' | 'revenue';
  }): Promise<TopSellingProductsReport> {
    const response = await api.get<TopSellingProductsReport>('/admin/reports/top-products', {
      params: query,
    });

    return response.data;
  },

  async getOrderSummary(query: { startDate?: string; endDate?: string }): Promise<OrderSummaryReport> {
    const response = await api.get<OrderSummaryReport>('/admin/reports/order-summary', {
      params: query,
    });

    return response.data;
  },
};

export default adminReportsApi;
