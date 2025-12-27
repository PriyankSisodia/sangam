// api/catalog.ts
/**
 * Catalog API Service
 * 
 * Functions to interact with the catalog API.
 * Handles product catalog items.
 */

import axiosInstance from './axiosInstance';
import type { CatalogItem } from '../data/catalog';

// Type for creating a new catalog item
export interface CreateCatalogItemData {
  name: string;
  image_url: string;
  price: number;
  category: string;
  stock: number;
  sold?: number;
}

// Type for updating a catalog item
export interface UpdateCatalogItemData {
  name?: string;
  image_url?: string;
  price?: number;
  category?: string;
  stock?: number;
  sold?: number;
}

/**
 * Get all catalog items for the current user
 * GET /catalog/
 */
export const getCatalogItems = async (): Promise<CatalogItem[]> => {
  try {
    const response = await axiosInstance.get('/catalog/');
    // Transform backend response to match frontend CatalogItem type
    return response.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      imageUrl: item.image_url, // Backend uses snake_case, frontend uses camelCase
      price: item.price,
      stock: item.stock,
      sold: item.sold,
      category: item.category,
    }));
  } catch (error: any) {
    console.error('Error fetching catalog items:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch catalog items');
  }
};

/**
 * Get a single catalog item by ID
 * GET /catalog/{item_id}
 */
export const getCatalogItem = async (itemId: number): Promise<CatalogItem> => {
  try {
    const response = await axiosInstance.get(`/catalog/${itemId}`);
    const item = response.data;
    return {
      id: item.id,
      name: item.name,
      imageUrl: item.image_url,
      price: item.price,
      stock: item.stock,
      sold: item.sold,
      category: item.category,
    };
  } catch (error: any) {
    console.error('Error fetching catalog item:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch catalog item');
  }
};

/**
 * Create a new catalog item
 * POST /catalog/
 */
export const createCatalogItem = async (itemData: CreateCatalogItemData): Promise<CatalogItem> => {
  try {
    const response = await axiosInstance.post('/catalog/', itemData);
    const item = response.data;
    return {
      id: item.id,
      name: item.name,
      imageUrl: item.image_url,
      price: item.price,
      stock: item.stock,
      sold: item.sold,
      category: item.category,
    };
  } catch (error: any) {
    console.error('Error creating catalog item:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create catalog item');
  }
};

/**
 * Update a catalog item
 * PUT /catalog/{item_id}
 */
export const updateCatalogItem = async (itemId: number, itemData: UpdateCatalogItemData): Promise<CatalogItem> => {
  try {
    const response = await axiosInstance.put(`/catalog/${itemId}`, itemData);
    const item = response.data;
    return {
      id: item.id,
      name: item.name,
      imageUrl: item.image_url,
      price: item.price,
      stock: item.stock,
      sold: item.sold,
      category: item.category,
    };
  } catch (error: any) {
    console.error('Error updating catalog item:', error);
    throw new Error(error.response?.data?.detail || 'Failed to update catalog item');
  }
};

/**
 * Delete a catalog item
 * DELETE /catalog/{item_id}
 */
export const deleteCatalogItem = async (itemId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/catalog/${itemId}`);
  } catch (error: any) {
    console.error('Error deleting catalog item:', error);
    throw new Error(error.response?.data?.detail || 'Failed to delete catalog item');
  }
};

