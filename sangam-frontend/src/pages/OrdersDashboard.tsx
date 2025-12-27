// src/components/OrdersDashboard.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Order, DeliveryStatus, PaymentStatus, ProcessStatus } from '../data/orders';
import { getOrders, updateOrder } from '../api/orders';

// --- Reusable Icons ---
const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
);
const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const DollarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);
const PackageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);
const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
);
const TruckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
);
const FilterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);

// --- Text Highlighting Component ---
const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <span key={i} style={{ backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '3px' }}>{part}</span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
};

// --- Helper Functions for Badges ---
const getStatusColor = (status: DeliveryStatus | string | null | undefined) => {
  if (!status) return { background: '#e5e7eb', color: '#374151', icon: '' };
  switch (status) {
    case 'Delivered': return { background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#065f46', icon: '✓' };
    case 'Shipped': return { background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#1e40af', icon: '🚚' };
    case 'Pending': return { background: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#92400e', icon: '⏳' };
    case 'Cancelled': return { background: 'linear-gradient(135deg, #fee2e2, #fecaca)', color: '#991b1b', icon: '✕' };
    default: return { background: '#e5e7eb', color: '#374151', icon: '' };
  }
};
const getPaymentStatusColor = (status: PaymentStatus | string | null | undefined) => {
    if (!status) return { background: '#e5e7eb', color: '#374151', icon: '' };
    return status === 'Paid' 
      ? { background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#065f46', icon: '✓' }
      : { background: 'linear-gradient(135deg, #fee2e2, #fecaca)', color: '#991b1b', icon: '⚠' };
}

// --- Custom Dropdown Hook ---
const useDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return { isOpen, setIsOpen, ref };
};

// --- Main OrdersDashboard Component ---
const OrdersDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Partial<Record<keyof Order, string>>>({});
  const [sortConfig, setSortConfig] = useState<{ key: keyof Order; direction: 'ascending' | 'descending' } | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [frozenColumns, setFrozenColumns] = useState<string[]>(['id']);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [quickFilter, setQuickFilter] = useState<string | null>(null);

  // Fetch orders from API on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const ordersData = await getOrders();
        setOrders(ordersData);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
        
        // Show more detailed error message
        const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
        alert(`Failed to load orders:\n\n${errorMessage}\n\nPlease check:\n1. Backend is running (http://localhost:8000)\n2. You are logged in\n3. Check browser console (F12) for details`);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const { isOpen: isFilterMenuOpen, setIsOpen: setFilterMenuOpen, ref: filterMenuRef } = useDropdown();
  const { isOpen: isFreezeMenuOpen, setIsOpen: setFreezeMenuOpen, ref: freezeMenuRef } = useDropdown();

  const [activeFilterColumn, setActiveFilterColumn] = useState<keyof Order | null>(null);
  const [filterMenuPosition, setFilterMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const baseColumnHeaders: { key: keyof Order | 'actions'; label: string, width: number }[] = [
    { key: 'id', label: 'Order ID', width: 120 }, { key: 'trackingId', label: 'Tracking #', width: 180 }, { key: 'customerName', label: 'Customer', width: 150 },
    { key: 'customerContact', label: 'Contact', width: 120 }, { key: 'category', label: 'Category', width: 120 }, { key: 'product', label: 'Product', width: 200 },
    { key: 'amount', label: 'Amount', width: 100 }, { key: 'paymentMethod', label: 'Pay Method', width: 120 }, { key: 'paymentStatus', label: 'Pay Status', width: 120 },
    { key: 'paymentDate', label: 'Pay Date', width: 120 }, { key: 'processStatus', label: 'Process', width: 120 }, { key: 'deliveryStatus', label: 'Delivery', width: 120 }, { key: 'source', label: 'Source', width: 120 },
    { key: 'note', label: 'Note', width: 200 }, { key: 'rating', label: 'Rating', width: 100 }, { key: 'actions', label: 'Actions', width: 150 },
  ];

  // --- NEW: Reorder columns to show frozen first ---
  const dynamicColumnHeaders = useMemo(() => {
      const frozen = baseColumnHeaders.filter(c => frozenColumns.includes(c.key as string));
      const nonFrozen = baseColumnHeaders.filter(c => !frozenColumns.includes(c.key as string));
      return [...frozen, ...nonFrozen];
  }, [frozenColumns]);

  const sortableColumns: (keyof Order)[] = ['id', 'customerName', 'customerContact', 'trackingId', 'product', 'amount', 'paymentDate', 'orderDate'];
  const filterableColumns: Partial<Record<keyof Order, string[]>> = {
    deliveryStatus: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
    paymentMethod: ['Credit Card', 'PayPal', 'COD'],
    paymentStatus: ['Paid', 'Unpaid'],
    processStatus: ['production', 'in_transit', 'delay'],
    source: ['Instagram', 'Facebook', 'WhatsApp', 'Website'],
    category: ['Home Decor', 'Art', 'Furniture', 'Textiles'],
    rating: ['1', '2', '3', '4', '5'],
  };

  // Helper to check if order is new (created in last 24 hours) - defined before use
  const isNewOrder = (orderDate: string | null | undefined): boolean => {
    if (!orderDate) return false;
    try {
      const orderTime = new Date(orderDate).getTime();
      if (isNaN(orderTime)) return false;
      const now = Date.now();
      const hoursDiff = (now - orderTime) / (1000 * 60 * 60);
      return hoursDiff < 24 && hoursDiff >= 0;
    } catch (e) {
      return false;
    }
  };

  // Calculate summary statistics
  const stats = useMemo(() => {
    try {
      const total = orders.length;
      const unpaid = orders.filter(o => o.paymentStatus === 'Unpaid').length;
      const pendingDelivery = orders.filter(o => o.deliveryStatus === 'Pending').length;
      const newOrders = orders.filter(o => {
        try {
          return isNewOrder(o.orderDate);
        } catch (e) {
          return false;
        }
      }).length;
      const totalRevenue = orders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + (o.amount || 0), 0);
      return { total, unpaid, pendingDelivery, newOrders, totalRevenue };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return { total: 0, unpaid: 0, pendingDelivery: 0, newOrders: 0, totalRevenue: 0 };
    }
  }, [orders]);

  const filteredAndSortedOrders = useMemo(() => {
    let filteredOrders = [...orders];

    // Quick filters
    if (quickFilter === 'unpaid') {
      filteredOrders = filteredOrders.filter(o => o.paymentStatus === 'Unpaid');
    } else if (quickFilter === 'pending') {
      filteredOrders = filteredOrders.filter(o => o.deliveryStatus === 'Pending');
    } else if (quickFilter === 'new') {
      filteredOrders = filteredOrders.filter(o => isNewOrder(o.orderDate));
    } else if (quickFilter === 'paid') {
      filteredOrders = filteredOrders.filter(o => o.paymentStatus === 'Paid');
    }

    // --- NEW: Date Range Filter ---
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        filteredOrders = filteredOrders.filter(order => {
            if (!order.paymentDate) return false;
            const orderDate = new Date(order.paymentDate);
            return orderDate >= start && orderDate <= end;
        });
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) filteredOrders = filteredOrders.filter(order => order[key as keyof Order]?.toString().toLowerCase().includes(value.toLowerCase()));
    });
    if (globalSearch) {
        const lowercasedSearch = globalSearch.toLowerCase();
        filteredOrders = filteredOrders.filter(order => Object.values(order).some(val => val?.toString().toLowerCase().includes(lowercasedSearch)));
    }
    
    // Default sort: newest first (by orderDate)
    if (!sortConfig) {
      filteredOrders.sort((a, b) => {
        const aDate = new Date(a.orderDate).getTime();
        const bDate = new Date(b.orderDate).getTime();
        return bDate - aDate; // Descending (newest first)
      });
    } else {
      filteredOrders.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? '';
        const bValue = b[sortConfig.key] ?? '';
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return filteredOrders;
  }, [orders, filters, sortConfig, globalSearch, startDate, endDate, quickFilter]);
  
  // Helper to get process status color
  const getProcessStatusColor = (status?: ProcessStatus) => {
    switch (status) {
      case 'in_transit': return { background: '#dbeafe', color: '#1e40af' };
      case 'production': return { background: '#fef3c7', color: '#92400e' };
      case 'delay': return { background: '#fee2e2', color: '#991b1b' };
      default: return { background: '#f3f4f6', color: '#6b7280' };
    }
  };
  
  // Handle process status update
  const handleProcessStatusChange = async (orderId: string, newStatus: ProcessStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      // Extract numeric ID from order_id (e.g., "ORD-001" -> 1)
      const numericId = parseInt(orderId.split('-')[1]);
      if (isNaN(numericId)) return;
      
      await updateOrder(numericId, { process_status: newStatus });
      
      // Refresh orders
      const updatedOrders = await getOrders();
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error updating process status:', error);
      alert('Failed to update process status. Please try again.');
    }
  };

  // Quick action handlers
  const handleQuickAction = async (orderId: string, action: 'markPaid' | 'markShipped' | 'markDelivered') => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      const numericId = parseInt(orderId.split('-')[1]);
      if (isNaN(numericId)) return;
      
      const updates: any = {};
      if (action === 'markPaid') {
        updates.payment_status = 'Paid';
        updates.payment_date = new Date().toISOString();
      } else if (action === 'markShipped') {
        updates.delivery_status = 'Shipped';
      } else if (action === 'markDelivered') {
        updates.delivery_status = 'Delivered';
      }
      
      await updateOrder(numericId, updates);
      
      // Refresh orders
      const updatedOrders = await getOrders();
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    }
  };

  const paginatedOrders = useMemo(() => {
      const startIndex = currentPage * rowsPerPage;
      return filteredAndSortedOrders.slice(startIndex, startIndex + rowsPerPage);
  }, [currentPage, rowsPerPage, filteredAndSortedOrders]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / rowsPerPage);

  const handleFilterChange = (key: keyof Order, value: string) => { setCurrentPage(0); setFilters(prev => ({ ...prev, [key]: value })); };
  const clearFilter = (key: keyof Order) => { setCurrentPage(0); setFilters(prev => { const newFilters = { ...prev }; delete newFilters[key]; return newFilters; }); };
  const requestSort = (key: keyof Order) => {
    if (!sortableColumns.includes(key)) return;
    const isAsc = sortConfig?.key === key && sortConfig.direction === 'ascending';
    setSortConfig({ key, direction: isAsc ? 'descending' : 'ascending' });
  };
  const handleFilterIconClick = (event: React.MouseEvent, key: keyof Order) => {
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      setFilterMenuPosition({ top: rect.bottom + window.scrollY + 5, left: rect.left + window.scrollX });
      setActiveFilterColumn(key);
      setFilterMenuOpen(true);
  };
  const handleGlobalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentPage(0);
      setGlobalSearch(e.target.value);
  }
  const handleFreezeColumnChange = (key: string) => {
    setFrozenColumns(prev => {
        const newFrozen = prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key];
        if (newFrozen.length > 3) return prev;
        return newFrozen;
    });
  };

  const getStickyLeftOffset = (key: string | keyof Order | 'actions'): number => {
    const frozenIndex = frozenColumns.indexOf(key);
    return frozenColumns.slice(0, frozenIndex)
        .reduce((acc, currKey) => acc + (baseColumnHeaders.find(h => h.key === currKey)?.width ?? 0), 0);
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: '24px', background: '#f4f7f9', borderRadius: '12px', width: '100%', boxSizing: 'border-box' as const, minHeight: 'calc(100vh - 180px)', paddingBottom: '40px' },
    statsContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
    statCard: { background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', transition: 'transform 0.2s, box-shadow 0.2s' },
    statCardHover: { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    statIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' },
    statValue: { fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' },
    statLabel: { fontSize: '0.875rem', color: '#64748b', fontWeight: 500 },
    quickFiltersContainer: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
    quickFilterPill: { padding: '8px 16px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' },
    quickFilterPillActive: { background: 'linear-gradient(135deg, #005bb5, #007bff)', color: '#ffffff', borderColor: '#005bb5', boxShadow: '0 2px 8px rgba(0, 91, 181, 0.2)' },
    toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' },
    dashboardTitle: { fontSize: '1.75rem', fontWeight: 700, color: '#005bb5', margin: 0, letterSpacing: '-0.02em' },
    controlsContainer: { display: 'flex', gap: '16px', alignItems: 'center' },
    dateFilterContainer: { display: 'flex', gap: '8px', alignItems: 'center' },
    dateInput: { padding: '8px 12px', border: 'none', backgroundColor: '#f3f4f6', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', color: '#1f2937', width: '140px' },
    rowsPerPageSelector: { padding: '8px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: '#f9fafb', color: '#1f2937' },
    searchContainer: { position: 'relative', display: 'flex', alignItems: 'center' },
    searchInput: { padding: '8px 12px 8px 36px', border: 'none', backgroundColor: '#f3f4f6', borderRadius: '8px', width: '250px', fontSize: '0.9rem', outline: 'none', color: '#1f2937' },
    searchIcon: { position: 'absolute', left: '12px', color: '#9ca3af' },
    tableContainer: { overflowX: 'auto', overflowY: 'auto', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: '#ffffff', border: '1px solid #e2e8f0', position: 'relative' as const, maxHeight: '70vh' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.875rem', tableLayout: 'fixed', background: '#ffffff', borderRadius: '12px' },
    th: { textAlign: 'left', fontWeight: 500, position: 'sticky', top: 0, zIndex: 1, background: 'linear-gradient(to bottom, #ffffff, #f8fafc)', borderBottom: '1px solid #e2e8f0', padding: '14px 16px' },
    thContent: { display: 'flex', alignItems: 'center', gap: '8px' },
    thClickable: { cursor: 'pointer', userSelect: 'none', transition: 'color 0.2s' },
    filterIconWrapper: { cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', transition: 'color 0.2s' },
    filterMenu: { position: 'absolute', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 10, padding: '4px', width: '150px' },
    filterMenuItem: { padding: '8px 12px', cursor: 'pointer', borderRadius: '6px', fontSize: '0.85rem', transition: 'background 0.2s' },
    activeFilterPill: { background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', color: '#4338ca', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' },
    clearFilterIcon: { cursor: 'pointer', fontWeight: 'bold', opacity: 0.7, transition: 'opacity 0.2s' },
    td: { padding: '14px 16px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff', whiteSpace: 'nowrap', transition: 'background 0.2s' },
    productCell: { padding: '14px 16px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.5', transition: 'background 0.2s' },
    newOrderRow: { backgroundColor: '#fef3c7', borderLeft: '3px solid #f59e0b' },
    rowActions: { display: 'flex', gap: '6px', opacity: 0, transition: 'opacity 0.2s' },
    rowHover: { backgroundColor: '#f8fafc' },
    actionButton: { padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px' },
    actionButtonPaid: { background: '#d1fae5', color: '#065f46' },
    actionButtonShipped: { background: '#dbeafe', color: '#1e40af' },
    actionButtonDelivered: { background: '#d1fae5', color: '#065f46' },
    statusBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block' },
    ratingStars: { display: 'flex', color: '#f59e0b', letterSpacing: '2px' },
    paginationContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px' },
    paginationButtons: { display: 'flex', gap: '4px' },
    pageButton: { padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff', cursor: 'pointer', color: '#475569', fontWeight: 500, transition: 'all 0.2s' },
    activePageButton: { background: 'linear-gradient(135deg, #005bb5, #007bff)', color: 'white', borderColor: '#005bb5', boxShadow: '0 2px 8px rgba(0, 91, 181, 0.2)' },
    paginationInfo: { fontSize: '0.9rem', color: '#6c757d' },
    freezeColumnMenu: { position: 'relative' },
    freezeButton: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#f9fafb', cursor: 'pointer', color: '#1f2937' },
    freezeDropdown: { position: 'absolute', top: '100%', right: 0, background: 'white', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', zIndex: 20, marginTop: '5px', padding: '8px', maxHeight: '300px', overflowY: 'auto' },
    freezeOption: { display: 'block', padding: '8px 12px', whiteSpace: 'nowrap', color: '#1f2937' },
  };

  const getSortIndicator = (key: keyof Order) => {
    if (!sortableColumns.includes(key)) return '';
    if (sortConfig?.key !== key) return ' ↕';
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#666' }}>Loading orders...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Summary Statistics */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #005bb5, #007bff)', color: '#ffffff'}}>
            <PackageIcon width={24} height={24} />
          </div>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total Orders</div>
        </div>
        <div style={styles.statCard} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#ffffff'}}>
            <XCircleIcon width={24} height={24} />
          </div>
          <div style={styles.statValue}>{stats.unpaid}</div>
          <div style={styles.statLabel}>Unpaid Orders</div>
        </div>
        <div style={styles.statCard} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#92400e'}}>
            <ClockIcon width={24} height={24} />
          </div>
          <div style={styles.statValue}>{stats.pendingDelivery}</div>
          <div style={styles.statLabel}>Pending Delivery</div>
        </div>
        <div style={styles.statCard} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff'}}>
            <DollarIcon width={24} height={24} />
          </div>
          <div style={styles.statValue}>${stats.totalRevenue.toFixed(2)}</div>
          <div style={styles.statLabel}>Total Revenue</div>
        </div>
        <div style={styles.statCard} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#92400e'}}>
            <CheckCircleIcon width={24} height={24} />
          </div>
          <div style={styles.statValue}>{stats.newOrders}</div>
          <div style={styles.statLabel}>New (24h)</div>
        </div>
      </div>

      {/* Quick Filter Pills */}
      <div style={styles.quickFiltersContainer}>
        <button
          style={{...styles.quickFilterPill, ...(quickFilter === null ? styles.quickFilterPillActive : {})}}
          onClick={() => setQuickFilter(null)}
        >
          <FilterIcon width={14} height={14} />
          All Orders
        </button>
        <button
          style={{...styles.quickFilterPill, ...(quickFilter === 'new' ? styles.quickFilterPillActive : {})}}
          onClick={() => setQuickFilter('new')}
        >
          <ClockIcon width={14} height={14} />
          New Orders
        </button>
        <button
          style={{...styles.quickFilterPill, ...(quickFilter === 'unpaid' ? styles.quickFilterPillActive : {})}}
          onClick={() => setQuickFilter('unpaid')}
        >
          <XCircleIcon width={14} height={14} />
          Unpaid ({stats.unpaid})
        </button>
        <button
          style={{...styles.quickFilterPill, ...(quickFilter === 'pending' ? styles.quickFilterPillActive : {})}}
          onClick={() => setQuickFilter('pending')}
        >
          <TruckIcon width={14} height={14} />
          Pending Delivery ({stats.pendingDelivery})
        </button>
        <button
          style={{...styles.quickFilterPill, ...(quickFilter === 'paid' ? styles.quickFilterPillActive : {})}}
          onClick={() => setQuickFilter('paid')}
        >
          <CheckCircleIcon width={14} height={14} />
          Paid Orders
        </button>
      </div>

      <div style={styles.toolbar}>
          <h2 style={styles.dashboardTitle}>Orders Overview</h2>
          <div style={styles.controlsContainer}>
            <div style={styles.dateFilterContainer}>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.dateInput} />
                <span style={{color: '#94a3b8', fontSize: '0.9rem'}}>-</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.dateInput} />
            </div>
            <div style={styles.freezeColumnMenu} ref={freezeMenuRef}>
                <button style={styles.freezeButton} onClick={() => setFreezeMenuOpen(prev => !prev)}>Freeze Columns</button>
                {isFreezeMenuOpen && (
                    <div style={styles.freezeDropdown}>
                        {baseColumnHeaders.map(({key, label}) => (
                            <label key={key} style={styles.freezeOption}>
                                <input type="checkbox" checked={frozenColumns.includes(key)} onChange={() => handleFreezeColumnChange(key)} disabled={!frozenColumns.includes(key) && frozenColumns.length >= 3} /> {label}
                            </label>
                        ))}
                    </div>
                )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 500 }}>Rows:</span>
                <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(0); }} style={styles.rowsPerPageSelector}>
                    {[10, 20, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
                </select>
            </div>
            <div style={styles.searchContainer}>
                <SearchIcon style={styles.searchIcon} />
                <input type="text" placeholder="Search all orders..." value={globalSearch} onChange={handleGlobalSearchChange} style={styles.searchInput} />
            </div>
          </div>
      </div>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
            <thead><tr>{dynamicColumnHeaders.map(({ key, label, width }) => {
                const isFrozen = frozenColumns.includes(key);
                const stickyStyles: React.CSSProperties = isFrozen ? { position: 'sticky', left: getStickyLeftOffset(key), zIndex: 3 } : {};
                const isSortable = key !== 'actions' && sortableColumns.includes(key as keyof Order);
                return (<th key={key} style={{...styles.th, width: `${width}px`, ...stickyStyles}}><div onClick={() => isSortable && requestSort(key as keyof Order)} style={{...styles.thContent, ...(isSortable ? styles.thClickable : {})}}><span>{label}</span>{isSortable && <span style={{color: '#007bff'}}>{getSortIndicator(key as keyof Order)}</span>}{key !== 'actions' && filterableColumns[key as keyof Order] && (<span onClick={(e) => handleFilterIconClick(e, key as keyof Order)} style={styles.filterIconWrapper}><ChevronDownIcon /></span>)}{key !== 'actions' && filters[key as keyof Order] && (<span style={styles.activeFilterPill}>{filters[key as keyof Order]}<span style={styles.clearFilterIcon} onClick={(e) => { e.stopPropagation(); clearFilter(key as keyof Order); }}>×</span></span>)}</div></th>);
            })}</tr></thead>
            <tbody>
            {paginatedOrders.map((order: Order) => {
                const isNew = isNewOrder(order.orderDate);
                const rowStyle: React.CSSProperties = isNew ? { ...styles.newOrderRow } : {};
                return (
                <tr 
                    key={order.id} 
                    style={rowStyle}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isNew ? '#fef3c7' : '#ffffff'}
                >
                    {dynamicColumnHeaders.map(({ key }) => {
                const isFrozen = frozenColumns.includes(key);
                    const stickyStyles: React.CSSProperties = isFrozen ? { 
                        position: 'sticky', 
                        left: getStickyLeftOffset(key), 
                        zIndex: 1, 
                        backgroundColor: isNew ? '#fef3c7' : '#fff', 
                        borderRight: '1px solid #f1f5f9' 
                    } : {};
                    const cellStyle = key === 'product' ? styles.productCell : key === 'actions' ? {...styles.td, whiteSpace: 'normal'} : styles.td;
                    return (<td key={`${order.id}-${key}`} style={{...cellStyle, ...stickyStyles}}>
                        {key === 'actions' ? (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {order.paymentStatus === 'Unpaid' && (
                                    <button
                                        onClick={() => handleQuickAction(order.id, 'markPaid')}
                                        style={{...styles.actionButton, ...styles.actionButtonPaid}}
                                        title="Mark as Paid"
                                    >
                                        <CheckCircleIcon width={12} height={12} />
                                        Paid
                                    </button>
                                )}
                                {order.deliveryStatus === 'Pending' && (
                                    <button
                                        onClick={() => handleQuickAction(order.id, 'markShipped')}
                                        style={{...styles.actionButton, ...styles.actionButtonShipped}}
                                        title="Mark as Shipped"
                                    >
                                        <TruckIcon width={12} height={12} />
                                        Ship
                                    </button>
                                )}
                                {order.deliveryStatus === 'Shipped' && (
                                    <button
                                        onClick={() => handleQuickAction(order.id, 'markDelivered')}
                                        style={{...styles.actionButton, ...styles.actionButtonDelivered}}
                                        title="Mark as Delivered"
                                    >
                                        <CheckCircleIcon width={12} height={12} />
                                        Deliver
                                    </button>
                                )}
                            </div>
                        )
                        : key === 'deliveryStatus' ? (
                            <span style={{...styles.statusBadge, ...getStatusColor(order.deliveryStatus), display: 'flex', alignItems: 'center', gap: '4px'}}>
                                <span>{getStatusColor(order.deliveryStatus).icon}</span>
                                <span>{order.deliveryStatus}</span>
                            </span>
                        )
                        : key === 'paymentStatus' ? (
                            <span style={{...styles.statusBadge, ...getPaymentStatusColor(order.paymentStatus), display: 'flex', alignItems: 'center', gap: '4px'}}>
                                <span>{getPaymentStatusColor(order.paymentStatus).icon}</span>
                                <span>{order.paymentStatus}</span>
                            </span>
                        )
                        : key === 'processStatus' ? (
                            <select 
                                value={order.processStatus || 'production'} 
                                onChange={(e) => handleProcessStatusChange(order.id, e.target.value as ProcessStatus)}
                                style={{
                                    ...styles.statusBadge,
                                    ...getProcessStatusColor(order.processStatus),
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    outline: 'none'
                                }}
                            >
                                <option value="production">Production</option>
                                <option value="in_transit">In Transit</option>
                                <option value="delay">Delay</option>
                            </select>
                        )
                    : key === 'rating' ? <div style={styles.ratingStars}>{order.rating ? '★'.repeat(order.rating) + '☆'.repeat(5 - order.rating) : 'N/A'}</div>
                        : key === 'amount' ? <span style={{ fontWeight: 600, color: '#059669', fontSize: '0.95rem' }}>${order.amount.toFixed(2)}</span>
                        : key === 'product' ? (
                            <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.6', maxWidth: '200px' }}>
                                {String(order[key] ?? '').split(' | ').map((item, idx, arr) => (
                                    <div key={idx} style={{ marginBottom: idx < arr.length - 1 ? '6px' : '0', fontSize: '0.875rem' }}>
                                        • {item}
                                    </div>
                                ))}
                            </div>
                        )
                        : (key as string) === 'actions' ? null
                        : <HighlightedText text={String(order[key as keyof Order] ?? '')} highlight={globalSearch} />}
                </td>);
                })}</tr>
                );
            })}</tbody>
        </table>
      </div>
      <div style={styles.paginationContainer}>
        <span style={styles.paginationInfo}>Page {currentPage + 1} of {totalPages} (Total: {filteredAndSortedOrders.length} orders)</span>
        <div style={styles.paginationButtons}>
            <button onClick={() => setCurrentPage(0)} disabled={currentPage === 0} style={styles.pageButton}>&laquo;</button>
            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0} style={styles.pageButton}>&lsaquo;</button>
            {[...Array(totalPages).keys()].map(num => (<button key={num} onClick={() => setCurrentPage(num)} style={{...styles.pageButton, ...(currentPage === num ? styles.activePageButton : {})}}>{num + 1}</button>))}
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1} style={styles.pageButton}>&rsaquo;</button>
            <button onClick={() => setCurrentPage(totalPages - 1)} disabled={currentPage >= totalPages - 1} style={styles.pageButton}>&raquo;</button>
        </div>
      </div>
      {isFilterMenuOpen && activeFilterColumn && filterableColumns[activeFilterColumn] && (<div ref={filterMenuRef} style={{...styles.filterMenu, top: filterMenuPosition?.top, left: filterMenuPosition?.left}}>
          {filterableColumns[activeFilterColumn]?.map(option => (<div key={option} style={styles.filterMenuItem} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f0f0'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'} onClick={() => { handleFilterChange(activeFilterColumn, option); setFilterMenuOpen(false); }}>{option}</div>))}
      </div>)}
    </div>
  );
};

export default OrdersDashboard;
