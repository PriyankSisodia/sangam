// instagram.ts - Instagram integration API calls

import axiosInstance from './axiosInstance';

export interface InstagramStatus {
  connected: boolean;
  instagram_username?: string;
  instagram_name?: string;
  connected_at?: string;
  last_sync_at?: string;
  token_expired?: boolean;
  message?: string;
}

export interface InstagramOAuthUrl {
  oauth_url: string;
  message: string;
}

export interface SyncResponse {
  success: boolean;
  message: string;
  conversations_synced: number;
}

/**
 * Get Instagram OAuth URL for connecting account
 */
export const getInstagramOAuthUrl = async (): Promise<InstagramOAuthUrl> => {
  try {
    const response = await axiosInstance.get('/instagram/connect');
    return response.data;
  } catch (error: any) {
    console.error('Error getting Instagram OAuth URL:', error);
    throw new Error(error.response?.data?.detail || 'Failed to get Instagram OAuth URL');
  }
};

/**
 * Check Instagram connection status
 */
export const getInstagramStatus = async (): Promise<InstagramStatus> => {
  try {
    const response = await axiosInstance.get('/instagram/status');
    return response.data;
  } catch (error: any) {
    console.error('Error getting Instagram status:', error);
    throw new Error(error.response?.data?.detail || 'Failed to get Instagram status');
  }
};

/**
 * Sync Instagram messages manually
 */
export const syncInstagramMessages = async (): Promise<SyncResponse> => {
  try {
    const response = await axiosInstance.post('/instagram/sync');
    return response.data;
  } catch (error: any) {
    console.error('Error syncing Instagram messages:', error);
    throw new Error(error.response?.data?.detail || 'Failed to sync Instagram messages');
  }
};

/**
 * Disconnect Instagram account
 */
export const disconnectInstagram = async (): Promise<void> => {
  try {
    await axiosInstance.delete('/instagram/disconnect');
  } catch (error: any) {
    console.error('Error disconnecting Instagram:', error);
    throw new Error(error.response?.data?.detail || 'Failed to disconnect Instagram');
  }
};

