import axios from 'axios';
import api from './api';
import { AddToCartRequest, Cart, UpdateCartItemRequest } from '../types/cart';

export interface CartApiError {
  message: string;
  status?: number;
}

class CartApiException extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'CartApiException';
    this.status = status;
  }
}

function getErrorMessage(error: unknown): CartApiError {
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
    }

    if (error.message) {
      return { message: error.message, status };
    }
  }

  if (error instanceof CartApiException) {
    return { message: error.message, status: error.status };
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return { message: error.message };
  }

  return { message: 'An unexpected error occurred.' };
}

function throwCartApiError(error: unknown): never {
  throw getErrorMessage(error);
}

export const cartApi = {
  async getCart(): Promise<Cart> {
    try {
      const response = await api.get<Cart>('/cart');
      return response.data;
    } catch (error) {
      throwCartApiError(error);
    }
  },

  async addToCart(productId: number, quantity: number): Promise<Cart> {
    const payload: AddToCartRequest = { productId, quantity };

    try {
      const response = await api.post<Cart>('/cart/items', payload);
      return response.data;
    } catch (error) {
      throwCartApiError(error);
    }
  },

  async updateCartItem(itemId: number, quantity: number): Promise<Cart> {
    try {
      const currentCart = await cartApi.getCart();
      const existingItem = currentCart.items.find((item) => item.id === itemId);

      if (!existingItem) {
        throw new CartApiException('Cart item not found.', 404);
      }

      const payload: UpdateCartItemRequest = {
        productId: existingItem.productId,
        quantity,
      };

      const response = await api.put<Cart>(`/cart/items/${itemId}`, payload);
      return response.data;
    } catch (error) {
      throwCartApiError(error);
    }
  },

  async removeFromCart(itemId: number): Promise<Cart> {
    try {
      const response = await api.delete<Cart>(`/cart/items/${itemId}`);
      return response.data;
    } catch (error) {
      throwCartApiError(error);
    }
  },

  async clearCart(): Promise<Cart> {
    try {
      const response = await api.delete<Cart>('/cart/clear');
      return response.data;
    } catch (error) {
      throwCartApiError(error);
    }
  },
};

export default cartApi;