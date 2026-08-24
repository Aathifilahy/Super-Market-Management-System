import axios from 'axios';
import { Product, CreateProductDto, UpdateProductDto } from '../types/Product';

const configuredApiBaseUrl = process.env.REACT_APP_API_BASE_URL?.trim();
const DEFAULT_DEV_API_BASE_URL = 'http://localhost:5224/api';
const DEFAULT_PROD_API_BASE_URL = '';
const API_BASE_URL =
  configuredApiBaseUrl ||
  (process.env.NODE_ENV === 'development'
    ? DEFAULT_DEV_API_BASE_URL
    : DEFAULT_PROD_API_BASE_URL);

if (!configuredApiBaseUrl && process.env.NODE_ENV === 'production') {
  console.warn(
    'REACT_APP_API_BASE_URL is not set. Configure it with the deployed Render API URL.'
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const productAPI = {
  // Get all products
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  // Get product by ID
  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product
  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  // Update product
  update: async (id: number, data: UpdateProductDto): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // Get products by category
  getByCategory: async (category: string): Promise<Product[]> => {
    const response = await api.get(`/products/category/${category}`);
    return response.data;
  },

  // Get low stock products
  getLowStock: async (threshold: number = 10): Promise<Product[]> => {
    const response = await api.get(`/products/lowstock?threshold=${threshold}`);
    return response.data;
  },
};

export default api;
