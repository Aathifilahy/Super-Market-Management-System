export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  lowStockThreshold?: number | null;
  expiryDate: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  isLowStock: boolean;
  isExpired: boolean;
}

export interface CreateProductDto {
  name: string;
  category: string;
  price: number;
  quantity: number;
  lowStockThreshold?: number;
  expiryDate: string;
  imageUrl?: string;
}

export interface UpdateProductDto extends CreateProductDto {
  id?: number;
}
