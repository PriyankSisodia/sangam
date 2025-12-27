// api/orders.ts
/**
 * Orders API Service
 * 
 * This file contains all functions to interact with the orders API.
 * Each function makes an HTTP request to the backend and returns the data.
 * 
 * How it works:
 * 1. We use axiosInstance which automatically adds the auth token
 * 2. Each function calls a specific backend endpoint
 * 3. Returns the data or throws an error
 */

import axiosInstance from './axiosInstance';
import type { Order } from '../data/orders';

// Type for creating a new order (matches backend OrderCreate schema)
export interface CreateOrderData {
  customer_name: string;
  customer_contact?: string;
  product: string;
  category: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  payment_date?: string | null;
  delivery_status: string;
  source: string;
  process_status?: string;
  tracking_id?: string | null;
  note?: string | null;
  rating?: number | null;
}

// Type for updating an order (all fields optional)
export interface UpdateOrderData {
  customer_name?: string;
  customer_contact?: string;
  product?: string;
  category?: string;
  amount?: number;
  payment_method?: string;
  payment_status?: string;
  payment_date?: string | null;
  delivery_status?: string;
  source?: string;
  process_status?: string;
  tracking_id?: string | null;
  note?: string | null;
  rating?: number | null;
}

/**
 * Get all orders for the current user
 * GET /orders/
 */
export const getOrders = async (): Promise<Order[]> => {
  try {
    const response = await axiosInstance.get('/orders/');
    // Transform backend response to match frontend Order type
    return response.data.map((order: any) => ({
      id: order.order_id, // Backend uses order_id, frontend expects id
      orderDate: order.order_date,
      customerName: order.customer_name,
      customerContact: order.customer_contact || '',
      trackingId: order.tracking_id || 'N/A',
      category: order.category,
      product: order.product,
      amount: order.amount,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      paymentDate: order.payment_date,
      deliveryStatus: order.delivery_status,
      source: order.source,
      processStatus: order.process_status || 'production',
      note: order.note,
      rating: order.rating,
    }));
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch orders');
  }
};

/**
 * Get a single order by ID
 * GET /orders/{order_id}
 */
export const getOrder = async (orderId: number): Promise<Order> => {
  try {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    const order = response.data;
    return {
      id: order.order_id,
      orderDate: order.order_date,
      customerName: order.customer_name,
      customerContact: order.customer_contact || '',
      trackingId: order.tracking_id || 'N/A',
      category: order.category,
      product: order.product,
      amount: order.amount,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      paymentDate: order.payment_date,
      deliveryStatus: order.delivery_status,
      source: order.source,
      processStatus: order.process_status || 'production',
      note: order.note,
      rating: order.rating,
    };
  } catch (error: any) {
    console.error('Error fetching order:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch order');
  }
};

/**
 * Create a new order
 * POST /orders/
 */
export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  try {
    console.log('📤 API: Creating order with payload:', orderData);
    const response = await axiosInstance.post('/orders/', orderData);
    console.log('✅ API: Order created, response:', response.data);
    const order = response.data;
    return {
      id: order.order_id,
      orderDate: order.order_date,
      customerName: order.customer_name,
      customerContact: order.customer_contact || '',
      trackingId: order.tracking_id || 'N/A',
      category: order.category,
      product: order.product,
      amount: order.amount,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      paymentDate: order.payment_date,
      deliveryStatus: order.delivery_status,
      source: order.source,
      processStatus: order.process_status || 'production',
      note: order.note,
      rating: order.rating,
    };
  } catch (error: any) {
    console.error('❌ API Error creating order:', error);
    console.error('   Status:', error.response?.status);
    console.error('   Response data:', error.response?.data);
    console.error('   Full error:', error);
    
    // Provide more detailed error message
    let errorMessage = 'Failed to create order';
    if (error.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        errorMessage = error.response.data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
      } else {
        errorMessage = error.response.data.detail;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Update an existing order
 * PUT /orders/{order_id}
 */
export const updateOrder = async (orderId: number, orderData: UpdateOrderData): Promise<Order> => {
  try {
    const response = await axiosInstance.put(`/orders/${orderId}`, orderData);
    const order = response.data;
    return {
      id: order.order_id,
      orderDate: order.order_date,
      customerName: order.customer_name,
      customerContact: order.customer_contact || '',
      trackingId: order.tracking_id || 'N/A',
      category: order.category,
      product: order.product,
      amount: order.amount,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      paymentDate: order.payment_date,
      deliveryStatus: order.delivery_status,
      source: order.source,
      processStatus: order.process_status || 'production',
      note: order.note,
      rating: order.rating,
    };
  } catch (error: any) {
    console.error('Error updating order:', error);
    throw new Error(error.response?.data?.detail || 'Failed to update order');
  }
};

/**
 * Delete an order
 * DELETE /orders/{order_id}
 */
export const deleteOrder = async (orderId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/orders/${orderId}`);
  } catch (error: any) {
    console.error('Error deleting order:', error);
    throw new Error(error.response?.data?.detail || 'Failed to delete order');
  }
};

