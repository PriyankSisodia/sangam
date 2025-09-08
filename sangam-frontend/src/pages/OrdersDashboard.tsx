// src/components/OrdersDashboard.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { initialOrders } from '../data/orders';
import type { Order, DeliveryStatus, PaymentStatus, Source, Category } from '../data/orders';

// --- Reusable Icons ---
const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
);
const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
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
const getStatusColor = (status: DeliveryStatus) => {
  switch (status) {
    case 'Delivered': return { background: '#d1fae5', color: '#065f46' };
    case 'Shipped': return { background: '#dbeafe', color: '#1e40af' };
    case 'Pending': return { background: '#fef3c7', color: '#92400e' };
    case 'Cancelled': return { background: '#fee2e2', color: '#991b1b' };
    default: return { background: '#e5e7eb', color: '#374151' };
  }
};
const getPaymentStatusColor = (status: PaymentStatus) => {
    return status === 'Paid' ? { background: '#d1fae5', color: '#065f46' } : { background: '#fee2e2', color: '#991b1b' };
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
  const [filters, setFilters] = useState<Partial<Record<keyof Order, string>>>({});
  const [sortConfig, setSortConfig] = useState<{ key: keyof Order; direction: 'ascending' | 'descending' } | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [frozenColumns, setFrozenColumns] = useState<string[]>(['id']);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { isOpen: isFilterMenuOpen, setIsOpen: setFilterMenuOpen, ref: filterMenuRef } = useDropdown();
  const { isOpen: isFreezeMenuOpen, setIsOpen: setFreezeMenuOpen, ref: freezeMenuRef } = useDropdown();

  const [activeFilterColumn, setActiveFilterColumn] = useState<keyof Order | null>(null);
  const [filterMenuPosition, setFilterMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const baseColumnHeaders: { key: keyof Order; label: string, width: number }[] = [
    { key: 'id', label: 'Order ID', width: 120 }, { key: 'trackingId', label: 'Tracking #', width: 180 }, { key: 'customerName', label: 'Customer', width: 150 },
    { key: 'customerContact', label: 'Contact', width: 120 }, { key: 'category', label: 'Category', width: 120 }, { key: 'product', label: 'Product', width: 200 },
    { key: 'amount', label: 'Amount', width: 100 }, { key: 'paymentMethod', label: 'Pay Method', width: 120 }, { key: 'paymentStatus', label: 'Pay Status', width: 120 },
    { key: 'paymentDate', label: 'Pay Date', width: 120 }, { key: 'deliveryStatus', label: 'Delivery', width: 120 }, { key: 'source', label: 'Source', width: 120 },
    { key: 'note', label: 'Note', width: 250 }, { key: 'rating', label: 'Rating', width: 100 },
  ];

  // --- NEW: Reorder columns to show frozen first ---
  const dynamicColumnHeaders = useMemo(() => {
      const frozen = baseColumnHeaders.filter(c => frozenColumns.includes(c.key));
      const nonFrozen = baseColumnHeaders.filter(c => !frozenColumns.includes(c.key));
      return [...frozen, ...nonFrozen];
  }, [frozenColumns]);

  const sortableColumns: (keyof Order)[] = ['id', 'customerName', 'customerContact', 'trackingId', 'product', 'amount', 'paymentDate'];
  const filterableColumns: Partial<Record<keyof Order, string[]>> = {
    deliveryStatus: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
    paymentMethod: ['Credit Card', 'PayPal', 'COD'],
    paymentStatus: ['Paid', 'Unpaid'],
    source: ['Instagram', 'Facebook', 'WhatsApp', 'Website'],
    category: ['Home Decor', 'Art', 'Furniture', 'Textiles'],
    rating: ['1', '2', '3', '4', '5'],
  };

  const filteredAndSortedOrders = useMemo(() => {
    let orders = [...initialOrders];

    // --- NEW: Date Range Filter ---
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        orders = orders.filter(order => {
            if (!order.paymentDate) return false;
            const orderDate = new Date(order.paymentDate);
            return orderDate >= start && orderDate <= end;
        });
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) orders = orders.filter(order => order[key as keyof Order]?.toString().toLowerCase().includes(value.toLowerCase()));
    });
    if (globalSearch) {
        const lowercasedSearch = globalSearch.toLowerCase();
        orders = orders.filter(order => Object.values(order).some(val => val?.toString().toLowerCase().includes(lowercasedSearch)));
    }
    if (sortConfig) {
      orders.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? '';
        const bValue = b[sortConfig.key] ?? '';
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return orders;
  }, [filters, sortConfig, globalSearch, startDate, endDate]);

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

  const getStickyLeftOffset = (key: string): number => {
    const frozenIndex = frozenColumns.indexOf(key);
    return frozenColumns.slice(0, frozenIndex)
        .reduce((acc, currKey) => acc + (baseColumnHeaders.find(h => h.key === currKey)?.width ?? 0), 0);
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: '20px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)' },
    toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    dashboardTitle: { fontSize: '1.5rem', fontWeight: 600, color: '#111827' },
    controlsContainer: { display: 'flex', gap: '16px', alignItems: 'center' },
    dateFilterContainer: { display: 'flex', gap: '8px', alignItems: 'center' },
    dateInput: { padding: '8px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', color: '#1f2937' },
    rowsPerPageSelector: { padding: '8px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: '#f9fafb', color: '#1f2937' },
    searchContainer: { position: 'relative', display: 'flex', alignItems: 'center' },
    searchInput: { padding: '8px 12px 8px 36px', border: 'none', backgroundColor: '#f3f4f6', borderRadius: '8px', width: '250px', fontSize: '0.9rem', outline: 'none', color: '#1f2937' },
    searchIcon: { position: 'absolute', left: '12px', color: '#9ca3af' },
    tableContainer: { overflowX: 'auto', maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', tableLayout: 'fixed' },
    th: { textAlign: 'left', fontWeight: 600, position: 'sticky', top: 0, zIndex: 1, background: '#f8f9fa', borderBottom: '2px solid #dee2e6' },
    thContent: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 15px' },
    thClickable: { cursor: 'pointer', userSelect: 'none' },
    filterIconWrapper: { cursor: 'pointer', color: '#6c757d', display: 'flex', alignItems: 'center' },
    filterMenu: { position: 'absolute', background: 'white', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', zIndex: 10, padding: '4px', width: '150px' },
    filterMenuItem: { padding: '6px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '0.85rem' },
    activeFilterPill: { background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' },
    clearFilterIcon: { cursor: 'pointer', fontWeight: 'bold' },
    td: { padding: '12px 15px', borderBottom: '1px solid #f1f1f1', backgroundColor: '#fff', whiteSpace: 'nowrap' },
    statusBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block' },
    ratingStars: { display: 'flex', color: '#f59e0b', letterSpacing: '2px' },
    paginationContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px' },
    paginationButtons: { display: 'flex', gap: '4px' },
    pageButton: { padding: '6px 12px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', cursor: 'pointer' },
    activePageButton: { background: '#007bff', color: 'white', borderColor: '#007bff' },
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

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
          <h2 style={styles.dashboardTitle}>Orders Overview</h2>
          <div style={styles.controlsContainer}>
            <div style={styles.dateFilterContainer}>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.dateInput} />
                <span style={{color: '#6c757d'}}>-</span>
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
                return (<th key={key} style={{...styles.th, width: `${width}px`, ...stickyStyles}}><div onClick={() => requestSort(key)} style={{...styles.thContent, ...(sortableColumns.includes(key) ? styles.thClickable : {})}}><span>{label}</span><span style={{color: '#007bff'}}>{getSortIndicator(key)}</span>{filterableColumns[key] && (<span onClick={(e) => handleFilterIconClick(e, key)} style={styles.filterIconWrapper}><ChevronDownIcon /></span>)}{filters[key] && (<span style={styles.activeFilterPill}>{filters[key]}<span style={styles.clearFilterIcon} onClick={(e) => { e.stopPropagation(); clearFilter(key); }}>×</span></span>)}</div></th>);
            })}</tr></thead>
            <tbody>
            {paginatedOrders.map((order: Order) => (<tr key={order.id}>{dynamicColumnHeaders.map(({ key }) => {
                const isFrozen = frozenColumns.includes(key);
                const stickyStyles: React.CSSProperties = isFrozen ? { position: 'sticky', left: getStickyLeftOffset(key), zIndex: 1, backgroundColor: '#fff', borderRight: '1px solid #f1f1f1' } : {};
                return (<td key={`${order.id}-${key}`} style={{...styles.td, ...stickyStyles}}>
                    {key === 'deliveryStatus' ? <span style={{...styles.statusBadge, ...getStatusColor(order.deliveryStatus)}}>{order.deliveryStatus}</span>
                    : key === 'paymentStatus' ? <span style={{...styles.statusBadge, ...getPaymentStatusColor(order.paymentStatus)}}>{order.paymentStatus}</span>
                    : key === 'rating' ? <div style={styles.ratingStars}>{order.rating ? '★'.repeat(order.rating) + '☆'.repeat(5 - order.rating) : 'N/A'}</div>
                    : key === 'amount' ? `$${order.amount.toFixed(2)}`
                    : <HighlightedText text={String(order[key] ?? '')} highlight={globalSearch} />}
                </td>);
            })}</tr>))}</tbody>
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
