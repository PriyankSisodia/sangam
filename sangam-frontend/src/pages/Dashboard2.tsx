// src/components/Dashboard2.tsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrdersDashboard from './OrdersDashboard';
import CatalogDashboard from './CatalogDashboard';
import type { Order } from '../data/orders';
import type { CatalogItem } from '../data/catalog';
// API imports - these connect to the backend
import { getChats, addMessage, updateChat, type Chat as ApiChat } from '../api/chats';
import { createOrder } from '../api/orders';
import { getCatalogItems } from '../api/catalog';
import axiosInstance from '../api/axiosInstance';
import confetti from 'canvas-confetti';

// ===================================================================================
// --- 1. ICON COMPONENTS ---
// ===================================================================================
const AccountIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} viewBox="0 0 32 32"><path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.546-.827-1.219-.827-1.219s-1.011-.99-1.468-1.468c-.459-.479-1.096-1.097-1.519-1.097a.63.63 0 0 0-.315.1c-.843.43-1.525.854-2.115 1.48s-1.141 1.54-1.141 2.49c0 .948 1.141 2.49 1.141 2.49s1.141 1.54 2.631 3.031c1.49 1.49 3.031 2.631 3.031 2.631s1.54 1.141 2.49 1.141c.948 0 2.49-1.141 2.49-1.141s.43-1.272.43-2.115c-.01-.843-.54-1.525-.96-1.964a.426.426 0 0 0-.215-.073z" fill="#25D366" /></svg>;
const FacebookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} viewBox="0 0 24 24"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06c0 5.52 4.5 10.02 10 10.02s10-4.5 10-10.02C22 6.53 17.5 2.04 12 2.04zM13.6 17.58h-2.9v-7.1h-1.6v-2.4h1.6V6.5c0-1.2.5-2.5 2.5-2.5h2.1v2.4h-1.5c-.4 0-.7.3-.7.7v1.5h2.2l-.3 2.4h-1.9v7.1z" fill="#1877F2" /></svg>;
const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} viewBox="0 0 24 24"><defs><radialGradient id="ig-grad" cx="0.3" cy="1.2" r="1.2"><stop offset="0" stopColor="#F58529" /><stop offset="0.5" stopColor="#DD2A7B" /><stop offset="1" stopColor="#8134AF" /></radialGradient></defs><path d="M12 2c-2.7 0-3 .01-4.06.06-1.06.05-1.79.24-2.43.5-.64.27-1.16.6-1.68 1.13-.53.52-.86 1.04-1.13 1.68-.26.64-.45 1.37-.5 2.43C2.01 9 2 9.3 2 12s.01 3 .06 4.06c.05 1.06.24 1.79.5 2.43.27.64.6 1.16 1.13 1.68.52.53 1.04.86 1.68 1.13.64.26 1.37.45 2.43.5C9 21.99 9.3 22 12 22s3-.01 4.06-.06c1.06-.05 1.79-.24 2.43-.5.64-.27 1.16-.6 1.68-1.13.53-.52-.86-1.04-1.13-1.68.26-.64.45-1.37.5-2.43.05-1.06.06-1.37.06-4.06s-.01-3-.06-4.06c-.05-1.06-.24-1.79-.5-2.43-.27-.64-.6-1.16-1.13-1.68C17.7 3.39 17.2 3.06 16.5 2.8c-.64-.26-1.37-.45-2.43-.5C13.01 2.01 12.7 2 12 2z" fill="url(#ig-grad)"/></svg>;
const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const GridIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>;


// ===================================================================================
// --- 2. TYPE DEFINITIONS AND MOCK DATA ---
// ===================================================================================
type Platform = 'WhatsApp' | 'Facebook' | 'Instagram';
type ChatStatus = 'read' | 'unread';
type DateFilter = 'all' | 'today' | 'last7days';

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  platform: Platform;
  date: string;
  status: ChatStatus;
  messages: { text: string; sender: 'me' | 'them' }[];
}

const getISODate = (daysAgo: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Helper function to transform backend Chat format to frontend Chat format
const transformApiChatToFrontendChat = (apiChat: ApiChat): Chat => {
  return {
    id: apiChat.id,
    name: apiChat.customer_name,
    platform: apiChat.platform,
    date: apiChat.last_message_date.split('T')[0], // Extract date part
    status: apiChat.status,
    lastMessage: apiChat.last_message || '',
    messages: apiChat.messages.map(msg => ({
      text: msg.text,
      sender: msg.sender
    }))
  };
};


// ===================================================================================
// --- 3. STYLING OBJECTS ---
// ===================================================================================
const styles: { [key: string]: React.CSSProperties } = {
    wrapper: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#333', width: '100vw', padding: '20px 10px', boxSizing: 'border-box', fontFamily: 'sans-serif', background: 'linear-gradient(175deg, #f4f7f9 0%, #e9edf2 100%)', backgroundImage: `linear-gradient(175deg, #f4f7f9 0%, #e9edf2 100%), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><g fill-rule="evenodd"><g fill="%23d6dee5" fill-opacity="0.2"><path d="M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z"/></g></g></svg>')` },
    header: { width: '100%', maxWidth: '1600px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '0 10px' },
    title: { fontSize: '1.8rem', color: '#005bb5', fontWeight: 'bold' },
    accountWrapper: { position: 'relative' },
    accountIcon: { cursor: 'pointer', color: '#555' },
    dropdown: { position: 'absolute', top: '40px', right: '0', background: 'white', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0', width: '200px', overflow: 'hidden', zIndex: 10 },
    dropdownItem: { padding: '12px 18px', cursor: 'pointer', transition: 'background 0.2s', borderBottom: '1px solid #f0f0f0' },
    dropdownHeader: { padding: '12px 18px', borderBottom: '1px solid #e0e0e0' },
    userEmail: { fontWeight: 600, fontSize: '0.9rem' },
    tabContainer: { width: '100%', maxWidth: '1600px', display: 'flex', justifyContent: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #ddd' },
    tab: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', fontSize: '1rem', cursor: 'pointer', background: 'none', border: 'none', color: '#666', outline: 'none', borderBottom: '3px solid transparent', transition: 'color 0.3s, border-bottom-color 0.3s' },
    activeTab: { color: '#005bb5', borderBottom: '3px solid #005bb5', fontWeight: 600 },
    unreadBadge: { background: '#007bff', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '3px 7px', borderRadius: '8px', lineHeight: 1 },
    content: { width: '100%', maxWidth: '1600px', minHeight: 'calc(100vh - 180px)', overflowY: 'auto' as const }
};

const chatStyles = {
  container: (isMobile: boolean): React.CSSProperties => ({ display: 'flex', flexDirection: (isMobile ? 'column' : 'row') as React.CSSProperties['flexDirection'], height: '100%', background: '#ffffff', borderRadius: '12px', border: '1px solid #e0e0e0', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }),
  leftPanel: (isMobile: boolean): React.CSSProperties => ({ width: isMobile ? '100%' : '30%', maxWidth: isMobile ? 'none' : '480px', borderRight: isMobile ? 'none' : '1px solid #e0e0e0', borderBottom: isMobile ? '1px solid #e0e0e0' : 'none', display: 'flex', flexDirection: 'column' as const, flexShrink: 0 }),
  chatWindow: { flex: 1, height: '100%', display: 'flex', flexDirection: 'column' as const },
  chatListContainer: { flex: 1, overflowY: 'auto' as const },
  chatBox: { padding: '12px 15px', borderBottom: '1px solid #eee', cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'linear-gradient(to bottom, #ffffff, #f7f9fb)', transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out' },
  activeChatBox: { background: 'linear-gradient(to bottom, #e8f4ff, #dce9f5)', transform: 'scale(1.02)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderRadius: '8px', margin: '4px 0' },
  chatIcon: { marginRight: 12, display: 'flex', alignItems: 'center' },
  chatInfo: { flex: 1, overflow: 'hidden' },
  chatName: { fontWeight: 'bold', fontSize: '0.95rem', color: '#333', marginBottom: '4px' },
  lastMessage: { fontSize: '0.85rem', color: '#777', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  unreadDot: { width: 8, height: 8, background: '#007bff', borderRadius: '50%', marginLeft: 10 },
  messages: { flex: 1, padding: '20px', overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' as const, background: '#f4f7f9' },
  message: { padding: '10px 15px', borderRadius: '18px', marginBottom: '10px', maxWidth: '70%', wordWrap: 'break-word' as const },
  myMessage: { background: 'linear-gradient(45deg, #007bff, #0056b3)', color: 'white', alignSelf: 'flex-end', boxShadow: '0 2px 5px rgba(0, 123, 255, 0.2)' },
  theirMessage: { background: '#e9ecef', color: '#333', alignSelf: 'flex-start' },
  replyInputContainer: { display: 'flex', padding: '15px', borderTop: '1px solid #e0e0e0', background: '#fff' },
  replyInput: { flex: 1, padding: '12px 18px', borderRadius: '22px', border: '1px solid #ccc', background: '#f0f0f0', color: '#333', outline: 'none', fontSize: '1rem' },
  sendButton: { marginLeft: '10px', padding: '10px 20px', borderRadius: '22px', border: 'none', background: '#007bff', color: 'white', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' },
  noChatSelected: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '1.2rem', color: '#aaa' }
};

const filterBarStyles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', alignItems: 'center', padding: '12px 15px', borderBottom: '1px solid #e0e0e0', background: '#fff', gap: '24px', flexWrap: 'wrap' },
    statusFilter: { display: 'flex', padding: '5px', background: '#e9ecef', borderRadius: '8px', flexShrink: 0 },
    statusButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', fontSize: '0.9rem', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#495057', fontWeight: 500, transition: 'background 0.2s, color 0.2s, transform 0.2s', whiteSpace: 'nowrap', outline: 'none' },
    activeStatusButton: { background: '#fff', color: '#007bff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transform: 'scale(1.03)' },
    unreadCountBadge: { background: '#007bff', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '3px 7px', borderRadius: '7px', lineHeight: 1 },
    filterDropdown: { position: 'relative' },
    dropdownButton: { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#495057', fontWeight: 500, padding: '6px', borderRadius: '6px' },
    dropdownMenu: { position: 'absolute', top: '35px', left: 0, background: 'white', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0', zIndex: 10, minWidth: '160px', overflow: 'hidden' },
    dropdownMenuItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', cursor: 'pointer', fontSize: '0.9rem', color: '#333', transition: 'background 0.2s' }
};

const sidebarStyles: { [key: string]: React.CSSProperties } = {
  container: { 
    width: '30%', 
    maxWidth: '400px', 
    borderLeft: '1px solid #e0e0e0', 
    display: 'flex', 
    flexDirection: 'column', 
    padding: '24px', 
    background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)', 
    flexShrink: 0,
    boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.05)',
    overflowY: 'auto',
    maxHeight: '100%'
  },
  header: { 
    fontSize: '1.3rem', 
    fontWeight: 700, 
    color: '#005bb5', 
    borderBottom: '2px solid #005bb5', 
    paddingBottom: '12px', 
    marginBottom: '24px',
    background: 'linear-gradient(135deg, #005bb5 0%, #007bff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '18px', flex: 1, overflowY: 'auto' },
  label: { fontSize: '0.9rem', fontWeight: 600, color: '#495057', marginBottom: '6px', display: 'block' },
  input: { 
    width: '100%', 
    padding: '12px 14px', 
    borderRadius: '8px', 
    border: '2px solid #e0e0e0', 
    fontSize: '0.95rem', 
    boxSizing: 'border-box', 
    color: '#333',
    background: '#ffffff',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  textarea: { 
    width: '100%', 
    padding: '12px 14px', 
    borderRadius: '8px', 
    border: '2px solid #e0e0e0', 
    fontSize: '0.95rem', 
    minHeight: '100px', 
    resize: 'vertical', 
    boxSizing: 'border-box', 
    color: '#333',
    background: '#ffffff',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  submitButton: { 
    padding: '14px 20px', 
    borderRadius: '10px', 
    border: 'none', 
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', 
    color: 'white', 
    cursor: 'pointer', 
    fontSize: '1rem', 
    fontWeight: 600, 
    marginTop: 'auto',
    boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  addButton: {
    padding: '12px 18px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 600,
    boxShadow: '0 3px 10px rgba(23, 162, 184, 0.3)',
    transition: 'all 0.3s ease',
    width: '100%'
  },
  selectedItemsContainer: {
    marginBottom: '18px',
    padding: '16px',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
    borderRadius: '12px',
    border: '2px solid #e9ecef',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
  },
  itemCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    marginBottom: '8px',
    background: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease'
  },
  removeButton: {
    padding: '6px 12px',
    background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 600,
    boxShadow: '0 2px 6px rgba(220, 53, 69, 0.3)',
    transition: 'all 0.2s ease'
  }
};


// ===================================================================================
// --- 4. HELPER COMPONENTS AND HOOKS ---
// ===================================================================================
const useDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) { setIsOpen(false); } };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return { isOpen, setIsOpen, ref };
};

const PlatformFilterIcon: React.FC<{ platform: Platform | 'all' }> = ({ platform }) => {
    const iconProps = { width: 20, height: 20 };
    switch (platform) {
        case 'WhatsApp': return <WhatsAppIcon {...iconProps} />;
        case 'Facebook': return <FacebookIcon {...iconProps} />;
        case 'Instagram': return <InstagramIcon {...iconProps} />;
        default: return <GridIcon {...iconProps} style={{ color: '#495057' }} />;
    }
};

const PlatformIcon: React.FC<{ platform: Platform }> = ({ platform }) => {
    const iconProps = { width: 20, height: 20 };
    const icon = { WhatsApp: <WhatsAppIcon {...iconProps} />, Facebook: <FacebookIcon {...iconProps} />, Instagram: <InstagramIcon {...iconProps} /> };
    return <div style={chatStyles.chatIcon}>{icon[platform]}</div>;
};


// ===================================================================================
// --- 5. SUB-COMPONENTS ---
// ===================================================================================
interface SelectedItem {
    catalogItem: CatalogItem;
    quantity: number;
    notes?: string;
}

interface OrderFormData { 
    customerName: string; 
    orderDate: string; 
    product: string; 
    address: string; 
    amount: number; 
    paymentMethod: 'Credit Card' | 'PayPal' | 'COD'; 
    paymentStatus: 'Unpaid' | 'Paid';
    category: 'Home Decor' | 'Art' | 'Furniture' | 'Textiles'; 
    source: Platform;
    selectedItems: SelectedItem[];
}

interface OrderCreationSidebarProps { activeChat: Chat; onAddOrder: (newOrder: OrderFormData) => void; }

const OrderCreationSidebar: React.FC<OrderCreationSidebarProps> = ({ activeChat, onAddOrder }) => {
    const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [selectedCatalogId, setSelectedCatalogId] = useState<number | ''>('');
    const [quantity, setQuantity] = useState(1);
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<'Unpaid' | 'Paid'>('Unpaid');
    const [loading, setLoading] = useState(true);

    // Fetch catalog items
    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                console.log('Fetching catalog items...');
                const items = await getCatalogItems();
                console.log('Catalog items loaded:', items.length);
                setCatalogItems(items);
                if (items.length === 0) {
                    console.warn('No catalog items found. Add items in the Catalog tab first.');
                }
            } catch (error) {
                console.error('Error fetching catalog:', error);
                alert('Failed to load catalog items. Please check if you have items in your catalog.');
            } finally {
                setLoading(false);
            }
        };
        fetchCatalog();
    }, []);

    // Reset form when chat changes
    useEffect(() => {
        if (activeChat) {
            setSelectedItems([]);
            setAddress('');
            setNotes('');
            setQuantity(1);
            setSelectedCatalogId('');
        }
    }, [activeChat]);

    // Calculate total amount
    const totalAmount = useMemo(() => {
        return selectedItems.reduce((sum, item) => sum + (item.catalogItem.price * item.quantity), 0);
    }, [selectedItems]);

    // Get primary category from selected items
    const primaryCategory = useMemo(() => {
        if (selectedItems.length === 0) return 'Art';
        // Get the most common category
        const categories = selectedItems.map(item => item.catalogItem.category);
        const categoryCounts = categories.reduce((acc, cat) => {
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Art';
    }, [selectedItems]);

    const handleAddItem = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        console.log('Add Item clicked', { selectedCatalogId, quantity, notes });
        
        if (!selectedCatalogId) {
            alert('Please select a catalog item');
            return;
        }
        const catalogItem = catalogItems.find(item => item.id === Number(selectedCatalogId));
        if (!catalogItem) {
            console.error('Catalog item not found:', selectedCatalogId);
            return;
        }

        if (quantity <= 0) {
            alert('Quantity must be greater than 0');
            return;
        }

        if (catalogItem.stock < quantity) {
            alert(`Only ${catalogItem.stock} items available in stock`);
            return;
        }

        // Check if item already added
        const existingIndex = selectedItems.findIndex(item => item.catalogItem.id === catalogItem.id);
        if (existingIndex >= 0) {
            // Update quantity
            const updated = [...selectedItems];
            updated[existingIndex].quantity += quantity;
            if (updated[existingIndex].quantity > catalogItem.stock) {
                alert(`Only ${catalogItem.stock} items available in stock`);
                return;
            }
            setSelectedItems(updated);
            console.log('Updated existing item quantity');
        } else {
            // Add new item
            setSelectedItems([...selectedItems, { catalogItem, quantity, notes: notes || undefined }]);
            console.log('Added new item:', catalogItem.name);
        }

        // Reset selection
        setSelectedCatalogId('');
        setQuantity(1);
        setNotes('');
    };

    const handleRemoveItem = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const handleUpdateQuantity = (index: number, newQuantity: number) => {
        if (newQuantity <= 0) return;
        const item = selectedItems[index];
        if (newQuantity > item.catalogItem.stock) {
            alert(`Only ${item.catalogItem.stock} items available in stock`);
            return;
        }
        const updated = [...selectedItems];
        updated[index].quantity = newQuantity;
        setSelectedItems(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('📝 Form submitted', { 
            selectedItemsCount: selectedItems.length, 
            address: address ? 'provided' : 'missing',
            totalAmount 
        });
        
        if (selectedItems.length === 0) {
            alert('⚠️ Please add at least one item from catalog');
            return;
        }
        if (!address.trim()) {
            alert('⚠️ Please enter shipping address');
            return;
        }

        // Format product description for display (better formatting for multiple items)
        const productDescription = selectedItems
            .map(item => `${item.quantity}x ${item.catalogItem.name}${item.notes ? ` (${item.notes})` : ''}`)
            .join(' | ');

        const orderData = {
            customerName: activeChat.name,
            orderDate: getISODate(0),
            product: productDescription,
            address: address,
            amount: totalAmount,
            paymentMethod: 'COD' as const,
            paymentStatus: paymentStatus,
            category: primaryCategory as 'Home Decor' | 'Art' | 'Furniture' | 'Textiles',
            source: activeChat.platform,
            selectedItems: selectedItems,
        };

        console.log('📦 Order data prepared:', orderData);

        try {
            await onAddOrder(orderData);
            
            // Reset form after successful order creation
            console.log('🔄 Resetting form...');
            setSelectedItems([]);
            setAddress('');
            setNotes('');
            setQuantity(1);
            setSelectedCatalogId('');
            setPaymentStatus('Unpaid');
            console.log('✅ Form reset complete');
        } catch (error: any) {
            console.error('❌ Error in handleSubmit:', error);
            // Error is already handled in handleAddOrder, so we don't need to show another alert
        }
    };

    if (loading) {
        return (
            <div style={sidebarStyles.container}>
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: '10px' }}>⏳ Loading catalog...</div>
                    <div style={{ fontSize: '0.85rem' }}>Please wait</div>
                </div>
            </div>
        );
    }

    if (catalogItems.length === 0) {
        return (
            <div style={sidebarStyles.container}>
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#dc3545' }}>⚠️ No Catalog Items</div>
                    <div style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
                        You need to add items to your catalog first.
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                        Go to the <strong>Catalog</strong> tab to add products.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={sidebarStyles.container}>
            <h3 style={sidebarStyles.header}>Create Order for {activeChat.name}</h3>
            <form style={sidebarStyles.form} onSubmit={handleSubmit}>
                <div>
                    <label style={sidebarStyles.label} htmlFor="customerName">👤 Customer Name</label>
                    <input 
                        id="customerName" 
                        type="text" 
                        value={activeChat.name} 
                        readOnly 
                        style={{ 
                            ...sidebarStyles.input, 
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            cursor: 'not-allowed',
                            fontWeight: 600
                        }} 
                    />
                </div>

                <div>
                    <label style={sidebarStyles.label} htmlFor="catalogItem">Select Item from Catalog</label>
                    <select 
                        id="catalogItem"
                        value={selectedCatalogId} 
                        onChange={e => setSelectedCatalogId(e.target.value ? Number(e.target.value) : '')}
                        style={{
                            ...sidebarStyles.input,
                            cursor: 'pointer',
                            background: '#ffffff'
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#005bb5';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 91, 181, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#e0e0e0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <option value="">-- Select an item --</option>
                        {catalogItems.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.name} - ${item.price.toFixed(2)} (Stock: {item.stock})
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={sidebarStyles.label} htmlFor="quantity">🔢 Quantity</label>
                        <input 
                            id="quantity" 
                            type="number" 
                            min="1" 
                            value={quantity} 
                            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                            style={sidebarStyles.input}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#005bb5';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 91, 181, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#e0e0e0';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={sidebarStyles.label} htmlFor="itemNotes">📝 Notes (optional)</label>
                        <input 
                            id="itemNotes" 
                            type="text" 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                            style={sidebarStyles.input} 
                            placeholder="e.g., Color preference"
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#005bb5';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 91, 181, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#e0e0e0';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                </div>

                <button 
                    type="button" 
                    onClick={handleAddItem}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(23, 162, 184, 0.4)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 3px 10px rgba(23, 162, 184, 0.3)';
                    }}
                    style={sidebarStyles.addButton}
                >
                    ➕ Add Item
                </button>

                {selectedItems.length > 0 && (
                    <div style={sidebarStyles.selectedItemsContainer}>
                        <div style={{ fontWeight: 700, marginBottom: '12px', fontSize: '1rem', color: '#005bb5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🛒</span>
                            <span>Selected Items ({selectedItems.length})</span>
                        </div>
                        {selectedItems.map((item, index) => (
                            <div 
                                key={index} 
                                style={sidebarStyles.itemCard}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                    e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                                        {item.quantity}x {item.catalogItem.name}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '4px' }}>
                                        ${item.catalogItem.price.toFixed(2)} each = <strong style={{ color: '#28a745' }}>${(item.catalogItem.price * item.quantity).toFixed(2)}</strong>
                                    </div>
                                    {item.notes && (
                                        <div style={{ fontSize: '0.75rem', color: '#17a2b8', fontStyle: 'italic', marginTop: '4px' }}>
                                            📝 {item.notes}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max={item.catalogItem.stock}
                                        value={item.quantity} 
                                        onChange={e => handleUpdateQuantity(index, Math.max(1, parseInt(e.target.value) || 1))}
                                        style={{ 
                                            width: '60px', 
                                            padding: '6px', 
                                            fontSize: '0.85rem',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '6px',
                                            textAlign: 'center',
                                            fontWeight: 600
                                        }}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                        style={sidebarStyles.removeButton}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div style={{ 
                            marginTop: '16px', 
                            paddingTop: '16px', 
                            borderTop: '3px solid #005bb5', 
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            color: '#005bb5',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span>Total Amount:</span>
                            <span style={{ fontSize: '1.3rem', color: '#28a745' }}>${totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                <div>
                    <label style={sidebarStyles.label} htmlFor="address">📍 Shipping Address</label>
                    <textarea 
                        id="address" 
                        value={address} 
                        onChange={e => setAddress(e.target.value)} 
                        style={sidebarStyles.textarea} 
                        placeholder="e.g., 123 Main St, Anytown, USA" 
                        required
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#005bb5';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 91, 181, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#e0e0e0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                </div>


                <button 
                    type="submit" 
                    style={{
                        ...sidebarStyles.submitButton,
                        opacity: selectedItems.length === 0 ? 0.5 : 1,
                        cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer'
                    }}
                    disabled={selectedItems.length === 0}
                    onMouseOver={(e) => {
                        if (selectedItems.length > 0) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                        }
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
                    }}
                >
                    Create Order
                </button>
            </form>
        </div>
    );
};

interface FilterBarProps { statusFilter: ChatStatus | 'all'; setStatusFilter: (status: ChatStatus | 'all') => void; platformFilter: Platform | 'all'; setPlatformFilter: (platform: Platform | 'all') => void; dateFilter: DateFilter; setDateFilter: (date: DateFilter) => void; unreadCount: number; }
const FilterBar: React.FC<FilterBarProps> = ({ statusFilter, setStatusFilter, platformFilter, setPlatformFilter, dateFilter, setDateFilter, unreadCount }) => {
    const platformDropdown = useDropdown();
    const dateDropdown = useDropdown();
    const platformMenuLabels: Record<Platform | 'all', string> = { all: 'All Platforms', WhatsApp: 'WhatsApp', Facebook: 'Facebook', Instagram: 'Instagram' };
    const dateLabels: Record<DateFilter, string> = { all: 'All Time', today: 'Today', 'last7days': 'Last 7 Days' };
    return (
        <div style={filterBarStyles.container}>
            <div style={filterBarStyles.statusFilter}><button onClick={() => setStatusFilter('all')} style={{ ...filterBarStyles.statusButton, ...(statusFilter === 'all' ? filterBarStyles.activeStatusButton : {}) }}>All</button><button onClick={() => setStatusFilter('unread')} style={{ ...filterBarStyles.statusButton, ...(statusFilter === 'unread' ? filterBarStyles.activeStatusButton : {}) }}><span>Unread</span>{unreadCount > 0 && <span style={filterBarStyles.unreadCountBadge}>{unreadCount}</span>}</button><button onClick={() => setStatusFilter('read')} style={{ ...filterBarStyles.statusButton, ...(statusFilter === 'read' ? filterBarStyles.activeStatusButton : {}) }}>Read</button></div>
            <div style={filterBarStyles.filterDropdown} ref={platformDropdown.ref}><button style={filterBarStyles.dropdownButton} onClick={() => platformDropdown.setIsOpen(!platformDropdown.isOpen)}><PlatformFilterIcon platform={platformFilter} /><ChevronDownIcon style={{ width: 16, height: 16 }} /></button>{platformDropdown.isOpen && (<div style={filterBarStyles.dropdownMenu}>{(Object.keys(platformMenuLabels) as Array<Platform | 'all'>).map(p => (<div key={p} style={filterBarStyles.dropdownMenuItem} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f0f0'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'} onClick={() => { setPlatformFilter(p); platformDropdown.setIsOpen(false); }}><PlatformFilterIcon platform={p} /><span>{platformMenuLabels[p]}</span></div>))}</div>)}</div>
            <div style={filterBarStyles.filterDropdown} ref={dateDropdown.ref}><button style={filterBarStyles.dropdownButton} onClick={() => dateDropdown.setIsOpen(!dateDropdown.isOpen)}><span>{dateLabels[dateFilter]}</span><ChevronDownIcon style={{ width: 16, height: 16 }}/></button>{dateDropdown.isOpen && (<div style={filterBarStyles.dropdownMenu}>{(Object.keys(dateLabels) as DateFilter[]).map(d => (<div key={d} style={filterBarStyles.dropdownMenuItem} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f0f0'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'} onClick={() => { setDateFilter(d); dateDropdown.setIsOpen(false); }}>{dateLabels[d]}</div>))}</div>)}</div>
        </div>
    );
};

interface ChatsComponentProps { chats: Chat[]; setChats: React.Dispatch<React.SetStateAction<Chat[]>>; setOrders: React.Dispatch<React.SetStateAction<Order[]>>; isMobile: boolean; }
const ChatsComponent: React.FC<ChatsComponentProps> = ({ chats, setChats, setOrders, isMobile }) => {
    const [activeChatId, setActiveChatId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [statusFilter, setStatusFilter] = useState<ChatStatus | 'all'>('unread');
    const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const filteredChats = useMemo(() => {
        const today = new Date(); const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(today.getDate() - 7);
        return chats.filter(chat => {
            if (statusFilter !== 'all' && chat.status !== statusFilter) return false;
            if (platformFilter !== 'all' && chat.platform !== platformFilter) return false;
            const chatDate = new Date(chat.date);
            if (dateFilter === 'today' && chatDate.toDateString() !== today.toDateString()) return false;
            if (dateFilter === 'last7days' && chatDate < sevenDaysAgo) return false;
            return true;
        });
    }, [chats, statusFilter, platformFilter, dateFilter]);
    const unreadCount = useMemo(() => chats.filter(c => c.status === 'unread').length, [chats]);
    const activeChat = chats.find(c => c.id === activeChatId);

    useEffect(() => { if (!isMobile && filteredChats.length > 0 && !activeChatId) { setActiveChatId(filteredChats[0].id); } if (isMobile) { setActiveChatId(null) } }, [isMobile, filteredChats, activeChatId]);

    const handleSendReply = async () => {
        if (!replyText.trim() || !activeChatId) return;
        try {
            // Send message to backend
            await addMessage(activeChatId, {
                text: replyText,
                sender: 'me'
            });
            
            // Update chat status to read
            await updateChat(activeChatId, { status: 'read' });
            
            // Refresh chats to get updated data
            const updatedChats = await getChats();
            setChats(updatedChats.map(transformApiChatToFrontendChat));
        setReplyText('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    const handleAddOrder = async (newOrderData: OrderFormData) => {
        try {
            console.log('🛒 Creating order with data:', {
                customerName: newOrderData.customerName,
                product: newOrderData.product,
                amount: newOrderData.amount,
                category: newOrderData.category,
                selectedItems: newOrderData.selectedItems.length
            });

            // Format note - only shipping address and custom notes (no item details)
            const note = newOrderData.address ? `Shipping to: ${newOrderData.address}` : '';

            const orderPayload = {
                customer_name: newOrderData.customerName,
                customer_contact: '',
                product: newOrderData.product,
                category: newOrderData.category,
                amount: newOrderData.amount,
                payment_method: newOrderData.paymentMethod,
                payment_status: newOrderData.paymentStatus || 'Unpaid',
                payment_date: newOrderData.paymentStatus === 'Paid' ? new Date().toISOString() : null,
                delivery_status: 'Pending',
                source: newOrderData.source,
                process_status: 'production',
                tracking_id: null,
                note: note,
                rating: null
            };

            console.log('📤 Sending order payload:', orderPayload);

            // Create order via API
            const createdOrder = await createOrder(orderPayload);
            
            console.log('✅ Order created successfully:', createdOrder);
            
            // Add to local state (will be replaced when we fetch from API)
            setOrders(prevOrders => [...prevOrders, createdOrder]);
            
            // Trigger confetti animation
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            
            // Show success message with order details (no emojis in UI)
            const itemsList = newOrderData.selectedItems.map(item => `  • ${item.quantity}x ${item.catalogItem.name}`).join('\n');
            alert(`Order created successfully!\n\nOrder ID: ${createdOrder.id}\nTotal: $${newOrderData.amount.toFixed(2)}\n\nItems:\n${itemsList}`);
            
        } catch (error: any) {
            console.error('❌ Error creating order:', error);
            console.error('   Error response:', error.response?.data);
            console.error('   Error status:', error.response?.status);
            
            // Show detailed error message (no emojis in UI)
            const errorMessage = error.response?.data?.detail || error.message || 'Unknown error occurred';
            alert(`Failed to create order:\n\n${errorMessage}\n\nCheck browser console (F12) for details.`);
        }
    };

    if (isMobile && activeChatId) {
        return (
            <div style={chatStyles.container(isMobile)}>
                <div style={chatStyles.chatWindow}>{activeChat ? (<>
                        <button onClick={() => setActiveChatId(null)} style={{ padding: '10px', border: 'none', background: '#f0f0f0', borderBottom: '1px solid #ddd' }}>← Back to Chats</button>
                        <div style={chatStyles.messages}>{activeChat.messages.map((msg, index) => <div key={index} style={{ ...chatStyles.message, ...(msg.sender === 'me' ? chatStyles.myMessage : chatStyles.theirMessage) }}>{msg.text}</div>)}</div>
                        <div style={chatStyles.replyInputContainer}><input type="text" style={chatStyles.replyInput} placeholder="Type a message..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendReply()} /><button style={chatStyles.sendButton} onClick={handleSendReply}>Send</button></div>
                    </>) : null}
                </div>
            </div>
        );
    }

    return (
        <div style={chatStyles.container(isMobile)}>
            <div style={chatStyles.leftPanel(isMobile)}>
                <FilterBar statusFilter={statusFilter} setStatusFilter={setStatusFilter} platformFilter={platformFilter} setPlatformFilter={setPlatformFilter} dateFilter={dateFilter} setDateFilter={setDateFilter} unreadCount={unreadCount} />
                <div style={chatStyles.chatListContainer}>{filteredChats.map(chat => (<div key={chat.id} style={{ ...chatStyles.chatBox, ...(chat.id === activeChatId ? chatStyles.activeChatBox : {}) }} onClick={async () => { 
                    setActiveChatId(chat.id); 
                    if (chat.status === 'unread') { 
                        try {
                            await updateChat(chat.id, { status: 'read' });
                            const updatedChats = await getChats();
                            setChats(updatedChats.map(transformApiChatToFrontendChat));
                        } catch (error) {
                            console.error('Error updating chat status:', error);
                        }
                    } 
                }}><PlatformIcon platform={chat.platform} /><div style={chatStyles.chatInfo}><div style={chatStyles.chatName}>{chat.name}</div><div style={chatStyles.lastMessage}>{chat.lastMessage}</div></div>{chat.status === 'unread' && <div style={chatStyles.unreadDot} />}</div>))}</div>
            </div>
            <div style={chatStyles.chatWindow}>{activeChat ? (<><div style={chatStyles.messages}>{activeChat.messages.map((msg, index) => <div key={index} style={{ ...chatStyles.message, ...(msg.sender === 'me' ? { ...chatStyles.myMessage } : { ...chatStyles.theirMessage }) }}>{msg.text}</div>)}</div><div style={chatStyles.replyInputContainer}><input type="text" style={chatStyles.replyInput} placeholder="Type a message..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendReply()} /><button style={chatStyles.sendButton} onClick={handleSendReply}>Send</button></div></>) : (!isMobile && <div style={chatStyles.noChatSelected}>Select a conversation to begin</div>)}</div>
            {!isMobile && activeChat && (<OrderCreationSidebar activeChat={activeChat} onAddOrder={handleAddOrder} />)}
        </div>
    );
};


// ===================================================================================
// --- 6. MAIN DASHBOARD COMPONENT ---
// ===================================================================================
const Dashboard2: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'chats' | 'orders' | 'graphs' | 'social' | 'catalog' | 'finances'>('chats');
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const [chats, setChats] = useState<Chat[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
    const unreadChatsCount = useMemo(() => chats.filter(c => c.status === 'unread').length, [chats]);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1200);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch current user info
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await axiosInstance.get('/users/me');
                setCurrentUserEmail(response.data.username || '');
            } catch (err) {
                console.error('Error fetching current user:', err);
                // Don't show error, just leave email empty
            }
        };
        fetchCurrentUser();
    }, []);

    // Fetch data from API when component mounts
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch all data in parallel
                const [chatsData, ordersData, catalogData] = await Promise.all([
                    getChats().catch(err => {
                        console.error('❌ Error fetching chats:', err);
                        console.error('   Response:', err.response?.data);
                        console.error('   Status:', err.response?.status);
                        if (err.response?.status === 401) {
                            alert('Session expired. Please login again.');
                            localStorage.removeItem('token');
                            navigate('/login');
                        }
                        return []; // Return empty array on error
                    }),
                    import('../api/orders').then(m => m.getOrders()).catch(err => {
                        console.error('❌ Error fetching orders:', err);
                        console.error('   Response:', err.response?.data);
                        return [];
                    }),
                    getCatalogItems().catch(err => {
                        console.error('❌ Error fetching catalog:', err);
                        console.error('   Response:', err.response?.data);
                        return [];
                    })
                ]);

                // Transform and set data
                console.log('✅ Fetched data:', {
                    chats: chatsData.length,
                    orders: ordersData.length,
                    catalog: catalogData.length
                });
                
                // Debug: Log actual API responses
                if (chatsData.length === 0) {
                    console.warn('⚠️ No chats found. This could mean:');
                    console.warn('   1. No data exists for your user account');
                    console.warn('   2. You logged in with a different account than the test data');
                    console.warn('   3. Run seed script: cd sangam-backend && python seed_test_data.py');
                }
                if (ordersData.length === 0) {
                    console.warn('⚠️ No orders found. Check if test data was created for your user.');
                }
                if (catalogData.length === 0) {
                    console.warn('⚠️ No catalog items found. Check if test data was created for your user.');
                }
                
                setChats(chatsData.map(transformApiChatToFrontendChat));
                setOrders(ordersData);
                setCatalogItems(catalogData);
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Empty dependency array = run once on mount

    const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };

    const renderContent = () => {
        if (loading) {
            return (
                <div style={{ textAlign: 'center', marginTop: 50, fontSize: '1.2rem', color: '#666' }}>
                    <div>Loading...</div>
                    <div style={{ fontSize: '0.9rem', marginTop: '10px', color: '#999' }}>
                        Checking: Backend connection, Authentication, Data fetching...
                    </div>
                </div>
            );
        }
        
        if (error) {
            return (
                <div style={{ textAlign: 'center', marginTop: 50, padding: '20px' }}>
                    <div style={{ color: 'red', fontSize: '1.2rem', marginBottom: '10px' }}>❌ Error: {error}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                        <div>Check browser console (F12) for details</div>
                        <div style={{ marginTop: '10px' }}>
                            <button 
                                onClick={() => window.location.reload()} 
                                style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        
        // Debug info (remove in production)
        if (chats.length === 0 && orders.length === 0 && catalogItems.length === 0) {
            const token = localStorage.getItem('token');
            const hasToken = !!token;
            
            return (
                <div style={{ textAlign: 'center', marginTop: 50, padding: '20px' }}>
                    <div style={{ fontSize: '1.2rem', color: '#666', marginBottom: '20px' }}>
                        No data found
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#999', textAlign: 'left', maxWidth: '600px', margin: '0 auto', background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
                        <div style={{ marginBottom: '10px' }}><strong>Debug Info:</strong></div>
                        <div>• Chats: {chats.length}</div>
                        <div>• Orders: {orders.length}</div>
                        <div>• Catalog: {catalogItems.length}</div>
                        <div style={{ marginTop: '10px', padding: '10px', background: hasToken ? '#d4edda' : '#f8d7da', borderRadius: '5px' }}>
                            <strong>Authentication:</strong> {hasToken ? '✅ Token found' : '❌ No token - Please login'}
                        </div>
                        <div style={{ marginTop: '15px', padding: '10px', background: '#fff3cd', borderRadius: '5px', border: '1px solid #ffc107' }}>
                            <strong>💡 Most Likely Issue:</strong>
                            <div style={{ marginTop: '5px' }}>
                                Test data exists for <code>priyank@example.com</code>
                            </div>
                            <div style={{ marginTop: '5px' }}>
                                You might be logged in with a different account!
                            </div>
                        </div>
                        <div style={{ marginTop: '15px' }}><strong>Quick Fixes:</strong></div>
                        {!hasToken ? (
                            <div>
                                <div>1. <strong>You need to login first!</strong></div>
                                <div style={{ marginTop: '10px' }}>
                                    <button 
                                        onClick={() => navigate('/login')} 
                                        style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' }}
                                    >
                                        Go to Login
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div><strong>Option 1: Login with the test account</strong></div>
                                <div style={{ marginTop: '5px', fontSize: '0.85rem', color: '#666' }}>
                                    Email: <code>priyank@example.com</code><br/>
                                    (Use your password, or create a new account with this email)
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    <strong>Option 2: Create test data for your current account</strong>
                                </div>
                                <div style={{ marginTop: '5px', fontSize: '0.85rem', color: '#666' }}>
                                    Run: <code>cd sangam-backend && python seed_test_data.py</code>
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    <button 
                                        onClick={() => {
                                            console.log('🔍 Debug Info:');
                                            console.log('Token exists:', hasToken);
                                            console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');
                                            console.log('Chats:', chats);
                                            console.log('Orders:', orders);
                                            console.log('Catalog:', catalogItems);
                                            // Test API call
                                            fetch('http://127.0.0.1:8000/chats/', {
                                                headers: {
                                                    'Authorization': `Bearer ${token}`
                                                }
                                            })
                                            .then(r => {
                                                console.log('API Status:', r.status);
                                                return r.json();
                                            })
                                            .then(data => {
                                                console.log('API Response:', data);
                                                console.log('Response length:', Array.isArray(data) ? data.length : 'Not an array');
                                            })
                                            .catch(err => console.error('API Error:', err));
                                        }} 
                                        style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px', marginTop: '10px' }}
                                    >
                                        Debug in Console
                                    </button>
                                    <button 
                                        onClick={() => {
                                            localStorage.removeItem('token');
                                            navigate('/login');
                                        }} 
                                        style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
                                    >
                                        Logout & Login Again
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case 'chats': return <ChatsComponent chats={chats} setChats={setChats} setOrders={setOrders} isMobile={isMobile} />;
            case 'orders': return <OrdersDashboard />;
            case 'graphs': return <div style={{ textAlign: 'center', marginTop: 50 }}>Graphs Coming Soon</div>;
            case 'social': return <div style={{ textAlign: 'center', marginTop: 50 }}>Social Coming Soon</div>;
            case 'catalog': return <CatalogDashboard />;
            case 'finances': return <div style={{ textAlign: 'center', marginTop: 50 }}>Finances Coming Soon</div>;
            default: return null;
        }
    };

    return (
        <div style={styles.wrapper}>
            <header style={styles.header}>
                <h1 style={styles.title}>Sangam AI</h1>
                <div style={styles.accountWrapper}>
                    <AccountIcon style={styles.accountIcon} onClick={() => setDropdownOpen(!isDropdownOpen)} />
                    {isDropdownOpen && (
                        <div style={styles.dropdown}>
                            <div style={styles.dropdownHeader}>
                                <div style={styles.userEmail}>{currentUserEmail || 'Loading...'}</div>
                            </div>
                            <div style={styles.dropdownItem} onClick={handleLogout} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f0f0'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>Logout</div>
                        </div>
                    )}
                </div>
            </header>

            <nav style={styles.tabContainer}>
                <button style={{ ...styles.tab, ...(activeTab === 'chats' ? styles.activeTab : {}) }} onClick={() => setActiveTab('chats')}><span>Chats</span>{unreadChatsCount > 0 && <span style={styles.unreadBadge}>{unreadChatsCount}</span>}</button>
                <button style={{ ...styles.tab, ...(activeTab === 'orders' ? styles.activeTab : {}) }} onClick={() => setActiveTab('orders')}>Orders</button>
                <button style={{ ...styles.tab, ...(activeTab === 'graphs' ? styles.activeTab : {}) }} onClick={() => setActiveTab('graphs')}>Graphs</button>
                <button style={{ ...styles.tab, ...(activeTab === 'social' ? styles.activeTab : {}) }} onClick={() => setActiveTab('social')}>Social</button>
                <button style={{ ...styles.tab, ...(activeTab === 'catalog' ? styles.activeTab : {}) }} onClick={() => setActiveTab('catalog')}>Catalog</button>
                <button style={{ ...styles.tab, ...(activeTab === 'finances' ? styles.activeTab : {}) }} onClick={() => setActiveTab('finances')}>Finances</button>
            </nav>

            <main style={styles.content}>{renderContent()}</main>
        </div>
    );
};

export default Dashboard2;
