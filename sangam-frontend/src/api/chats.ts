// api/chats.ts
/**
 * Chats API Service
 * 
 * Functions to interact with the chats API.
 * Handles conversations and messages from different platforms.
 */

import axiosInstance from './axiosInstance';

// Chat type matching backend response
export interface Chat {
  id: number;
  customer_name: string;
  platform: 'WhatsApp' | 'Facebook' | 'Instagram';
  status: 'read' | 'unread';
  last_message: string | null;
  last_message_date: string;
  messages: Message[];
}

// Message type matching backend response
export interface Message {
  id: number;
  chat_id: number;
  text: string;
  sender: 'me' | 'them';
  created_at: string;
}

// Type for creating a new chat
export interface CreateChatData {
  customer_name: string;
  platform: 'WhatsApp' | 'Facebook' | 'Instagram';
  status?: 'read' | 'unread';
}

// Type for creating a new message
export interface CreateMessageData {
  text: string;
  sender: 'me' | 'them';
}

/**
 * Get all chats for the current user
 * GET /chats/
 */
export const getChats = async (): Promise<Chat[]> => {
  try {
    const response = await axiosInstance.get('/chats/');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching chats:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch chats');
  }
};

/**
 * Get a single chat with all its messages
 * GET /chats/{chat_id}
 */
export const getChat = async (chatId: number): Promise<Chat> => {
  try {
    const response = await axiosInstance.get(`/chats/${chatId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching chat:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch chat');
  }
};

/**
 * Create a new chat
 * POST /chats/
 */
export const createChat = async (chatData: CreateChatData): Promise<Chat> => {
  try {
    const response = await axiosInstance.post('/chats/', chatData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating chat:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create chat');
  }
};

/**
 * Update a chat (e.g., mark as read)
 * PUT /chats/{chat_id}
 */
export const updateChat = async (chatId: number, updates: { status?: 'read' | 'unread'; last_message?: string }): Promise<Chat> => {
  try {
    const response = await axiosInstance.put(`/chats/${chatId}`, updates);
    return response.data;
  } catch (error: any) {
    console.error('Error updating chat:', error);
    throw new Error(error.response?.data?.detail || 'Failed to update chat');
  }
};

/**
 * Delete a chat
 * DELETE /chats/{chat_id}
 */
export const deleteChat = async (chatId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/chats/${chatId}`);
  } catch (error: any) {
    console.error('Error deleting chat:', error);
    throw new Error(error.response?.data?.detail || 'Failed to delete chat');
  }
};

/**
 * Add a message to a chat
 * POST /chats/{chat_id}/messages
 */
export const addMessage = async (chatId: number, messageData: CreateMessageData): Promise<Message> => {
    try {
        const response = await axiosInstance.post(`/chats/${chatId}/messages`, messageData);
        return response.data;
    } catch (error: any) {
        console.error('Error adding message:', error);
        throw new Error(error.response?.data?.detail || 'Failed to add message');
    }
};

/**
 * Create a chat with initial messages (useful for importing)
 * POST /chats/create-with-messages
 */
export interface CreateChatWithMessagesData {
    customer_name: string;
    platform: 'WhatsApp' | 'Facebook' | 'Instagram';
    status?: 'read' | 'unread';
    messages: Array<{ text: string; sender: 'me' | 'them' }>;
}

export const createChatWithMessages = async (data: CreateChatWithMessagesData): Promise<Chat> => {
    try {
        const response = await axiosInstance.post('/chats/create-with-messages', data);
        return response.data;
    } catch (error: any) {
        console.error('Error creating chat with messages:', error);
        throw new Error(error.response?.data?.detail || 'Failed to create chat');
    }
};

