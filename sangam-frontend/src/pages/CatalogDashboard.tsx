// src/components/CatalogDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import type { CatalogItem } from '../data/catalog';
import { getCatalogItems, createCatalogItem, updateCatalogItem, deleteCatalogItem } from '../api/catalog';

// Icon Components
const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
    </svg>
);

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

// Use Unsplash with real, relevant product images for each category
const getUnsplashImage = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
        // Home Decor - Wall clocks, vases, decorative items (matches: Minimalist Wall Clock, Ceramic Vase Set)
        'Home Decor': 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&h=600&fit=crop',
        // Art - Canvas paintings, artwork (matches: Abstract Canvas Art)
        'Art': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=600&fit=crop',
        // Furniture - Tables, lamps, bookshelves (matches: Sculptural Table Lamp, Oak Bookshelf)
        'Furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop',
        // Textiles - Rugs, cushions, fabric items (matches: Handwoven Rug)
        'Textiles': 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&h=600&fit=crop',
        // Electronics - Modern tech products
        'Electronics': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=90',
        // Clothing - Fashion items
        'Clothing': 'https://images.unsplash.com/photo-1445205170230-053b73816037?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=90',
        // Books - Book products
        'Books': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=90',
        // Sports - Sports equipment
        'Sports': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=90',
        // Jewelry - Jewelry items
        'Jewelry': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=90',
        // Toys - Toy products
        'Toys': 'https://images.unsplash.com/photo-1553456558-5c8ce5e0e0b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=90',
        // Food - Food products
        'Food': 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=90',
        // Beauty - Beauty and cosmetics
        'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=90',
        // Accessories - Fashion accessories
        'Accessories': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=90',
        // Kitchen - Kitchen items
        'Kitchen': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=90',
        // Garden - Garden products
        'Garden': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=90',
        // Automotive - Car accessories
        'Automotive': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=90',
    };
    
    // Default: Generic product image
    const defaultImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop';
    return categoryMap[category] || defaultImage;
};

// --- Styling Objects ---
const styles: { [key: string]: React.CSSProperties } = {
    container: { 
        padding: '24px', 
        background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)', 
        borderRadius: '16px', 
        minHeight: 'calc(100vh - 180px)',
        overflowY: 'auto' as const
    },
    header: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        flexWrap: 'wrap' as const,
        gap: '16px'
    },
    title: { 
        fontSize: '2rem', 
        fontWeight: 700, 
        color: '#1e293b',
        background: 'linear-gradient(135deg, #005bb5 0%, #007bff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: 0
    },
    controls: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        flexWrap: 'wrap' as const
    },
    searchContainer: {
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center'
    },
    searchInput: {
        padding: '12px 16px 12px 44px',
        fontSize: '0.95rem',
        borderRadius: '12px',
        border: '2px solid #e2e8f0',
        background: '#ffffff',
        color: '#1e293b',
        outline: 'none',
        transition: 'all 0.2s',
        width: '280px',
        boxSizing: 'border-box' as const
    },
    searchIcon: {
        position: 'absolute' as const,
        left: '14px',
        color: '#94a3b8',
        pointerEvents: 'none' as const
    },
    categoryFilter: {
        padding: '10px 16px',
        fontSize: '0.9rem',
        borderRadius: '10px',
        border: '2px solid #e2e8f0',
        background: '#ffffff',
        color: '#475569',
        cursor: 'pointer',
        outline: 'none',
        transition: 'all 0.2s'
    },
    sliderContainer: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        color: '#64748b',
        fontSize: '0.9rem'
    },
    slider: { 
        cursor: 'pointer', 
        width: '100px',
        accentColor: '#005bb5'
    },
    addButton: { 
        padding: '12px 24px', 
        background: 'linear-gradient(135deg, #005bb5 0%, #007bff 100%)', 
        color: 'white', 
        border: 'none', 
        borderRadius: '12px', 
        cursor: 'pointer', 
        fontSize: '0.95rem', 
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0, 91, 181, 0.3)',
        transition: 'all 0.2s'
    },
    itemCard: { 
        border: '1px solid #e2e8f0', 
        borderRadius: '16px', 
        overflow: 'hidden', 
        background: 'white', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative' as const,
        width: '280px',
        height: '280px',
        aspectRatio: '1 / 1'
    },
    itemImageContainer: {
        position: 'relative' as const,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
    },
    itemImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
        backgroundColor: '#f1f5f9',
        transition: 'transform 0.3s ease'
    },
    imageOverlay: {
        position: 'absolute' as const,
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)',
        padding: '20px 16px 16px',
        color: 'white',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px'
    },
    overlayName: {
        fontSize: '1rem',
        fontWeight: 700,
        color: 'white',
        margin: 0,
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },
    overlayPrice: {
        fontSize: '1.1rem',
        fontWeight: 700,
        color: '#ffffff',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },
    editButtonOverlay: {
        position: 'absolute' as const,
        top: '12px',
        right: '12px',
        background: 'rgba(0, 91, 181, 0.95)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 16px',
        cursor: 'pointer',
        zIndex: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.85rem',
        fontWeight: 600,
        opacity: 0,
        transform: 'translateY(-10px)',
        pointerEvents: 'none' as const
    },
    editButtonOverlayVisible: {
        opacity: 1,
        transform: 'translateY(0)',
        pointerEvents: 'auto' as const
    },
    itemContentHover: {
        background: 'linear-gradient(135deg, #005bb5 0%, #007bff 100%)',
        color: 'white'
    },
    itemName: { 
        fontSize: '1rem', 
        fontWeight: 700, 
        color: '#1e293b', 
        margin: '8px 0 0 0',
        lineHeight: '1.4',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical' as const
    },
    itemCategory: {
        fontSize: '0.7rem',
        color: '#64748b',
        fontWeight: 600,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
        marginBottom: '4px'
    },
    itemDetails: { 
        display: 'flex', 
        flexDirection: 'column' as const,
        gap: '6px', 
        fontSize: '0.75rem',
        marginTop: 'auto',
        flex: 1,
        justifyContent: 'flex-end'
    },
    detailRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    detailLabel: { 
        color: '#94a3b8',
        fontSize: '0.7rem',
        fontWeight: 500
    },
    detailValue: { 
        fontWeight: 700, 
        color: '#1e293b',
        fontSize: '0.75rem'
    },
    priceValue: {
        fontWeight: 700,
        color: '#005bb5',
        fontSize: '0.9rem'
    },
    hoverOverlay: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0, 91, 181, 0.95) 0%, rgba(0, 123, 255, 0.95) 100%)',
        color: 'white',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        opacity: 0,
        transition: 'opacity 0.3s ease',
        borderRadius: '0 16px 16px 0',
        fontSize: '0.8rem',
        textAlign: 'center' as const
    },
    hoverOverlayVisible: {
        opacity: 1
    },
    stockBadge: {
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 600,
        marginTop: '4px'
    },
    stockInStock: {
        background: 'rgba(16, 185, 129, 0.1)',
        color: '#059669'
    },
    stockLow: {
        background: 'rgba(245, 158, 11, 0.1)',
        color: '#d97706'
    },
    stockOut: {
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#dc2626'
    },
    cardActions: { 
        marginTop: 'auto', 
        paddingTop: '16px', 
        borderTop: '1px solid #f1f5f9', 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '10px' 
    },
    editButton: { 
        padding: '8px 16px', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontWeight: 500,
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s'
    },
    // Modal & Form Styles
    modalBackdrop: { 
        position: 'fixed' as const, 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        background: 'rgba(0, 0, 0, 0.5)', 
        backdropFilter: 'blur(4px)',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease-out'
    },
    modalContent: { 
        background: 'white', 
        padding: '32px', 
        borderRadius: '20px', 
        width: '90%', 
        maxWidth: '520px', 
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'slideUp 0.3s ease-out',
        maxHeight: '90vh',
        overflowY: 'auto' as const,
        overflowX: 'hidden' as const,
        boxSizing: 'border-box' as const
    },
    modalHeader: { 
        fontSize: '1.75rem', 
        fontWeight: 700, 
        marginBottom: '24px',
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    modalCloseButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#94a3b8',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '8px',
        transition: 'all 0.2s'
    },
    form: { 
        display: 'flex', 
        flexDirection: 'column' as const, 
        gap: '20px',
        width: '100%',
        boxSizing: 'border-box' as const,
        overflowX: 'hidden' as const
    },
    formGroup: { 
        display: 'flex', 
        flexDirection: 'column' as const, 
        gap: '8px',
        width: '100%',
        boxSizing: 'border-box' as const,
        minWidth: 0
    },
    formLabel: { 
        fontSize: '0.9rem', 
        color: '#475569',
        fontWeight: 600
    },
    formInput: { 
        padding: '12px 16px', 
        fontSize: '0.95rem', 
        border: '2px solid #e2e8f0', 
        borderRadius: '12px',
        background: '#ffffff',
        color: '#1e293b',
        outline: 'none',
        transition: 'all 0.2s',
        boxSizing: 'border-box' as const
    },
    formActions: { 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '12px', 
        marginTop: '8px' 
    },
    formButton: { 
        padding: '12px 24px', 
        border: 'none', 
        borderRadius: '12px', 
        cursor: 'pointer', 
        fontSize: '0.95rem',
        fontWeight: 600,
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    confirmModal: {
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '420px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        zIndex: 1001,
        position: 'relative' as const,
        animation: 'slideUp 0.3s ease-out'
    },
    confirmHeader: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        marginBottom: '20px'
    },
    confirmIcon: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#dc2626',
        marginBottom: '16px'
    },
    confirmTitle: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#1e293b',
        margin: 0
    },
    confirmMessage: {
        fontSize: '1rem',
        color: '#64748b',
        textAlign: 'center' as const,
        lineHeight: '1.6',
        marginBottom: '28px'
    },
    confirmActions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
    },
    confirmButton: {
        padding: '12px 24px',
        fontSize: '0.95rem',
        fontWeight: 600,
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s'
    },
    confirmButtonCancel: {
        background: '#f1f5f9',
        color: '#64748b'
    },
    confirmButtonDelete: {
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        color: 'white',
        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
    },
    emptyState: {
        textAlign: 'center' as const,
        padding: '80px 20px',
        color: '#94a3b8'
    },
    emptyStateIcon: {
        fontSize: '4rem',
        marginBottom: '16px',
        opacity: 0.5
    },
    statsContainer: {
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap' as const
    },
    statCard: {
        flex: 1,
        minWidth: '150px',
        padding: '16px 20px',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    },
    statLabel: {
        fontSize: '0.85rem',
        color: '#64748b',
        marginBottom: '4px'
    },
    statValue: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#1e293b'
    },
    imagePreviewContainer: {
        marginTop: '12px',
        width: '100%',
        maxWidth: '200px',
        height: '200px',
        borderRadius: '12px',
        overflow: 'hidden' as const,
        border: '2px solid #e2e8f0',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
        borderRadius: '10px'
    },
    imagePreviewPlaceholder: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: '0.85rem',
        textAlign: 'center' as const,
        padding: '16px'
    }
};


// --- Individual Editable Catalog Item Card ---
interface CatalogItemCardProps {
    item: CatalogItem;
    onUpdateItem: (updatedItem: CatalogItem) => void;
    onDeleteItem: (itemId: number) => void;
}
const CatalogItemCard: React.FC<CatalogItemCardProps> = ({ item, onUpdateItem, onDeleteItem }) => {
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    
    // Check if image URL is a placeholder and replace with Unsplash
    const getImageUrl = (): string => {
        if (!item.imageUrl || item.imageUrl.trim() === '') {
            return getUnsplashImage(item.category);
        }
        // Replace placehold.co URLs with Unsplash images
        if (item.imageUrl.includes('placehold.co')) {
            return getUnsplashImage(item.category);
        }
        return item.imageUrl;
    };
    
    const [currentImage, setCurrentImage] = useState<string>(getImageUrl());

    // Update image when item changes
    useEffect(() => {
        const newImage = getImageUrl();
        setCurrentImage(newImage);
        setImageError(false);
    }, [item.imageUrl, item.category]);

    return (
        <>
            <div
                style={{
                    ...styles.itemCard,
                    transform: isHovered ? 'translateY(-4px)' : 'none',
                    boxShadow: isHovered ? '0 8px 24px rgba(0, 91, 181, 0.2)' : '0 2px 8px rgba(0,0,0,0.08)'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Full Square Image */}
                <div style={styles.itemImageContainer}>
                    <img 
                        src={currentImage} 
                        alt={item.name} 
                        style={{
                            ...styles.itemImage,
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', currentImage);
                            if (!imageError) {
                                setImageError(true);
                                // Try fallback to category image
                                const fallback = getUnsplashImage(item.category);
                                if (e.currentTarget.src !== fallback) {
                                    setCurrentImage(fallback);
                                }
                            }
                        }}
                        onLoad={() => {
                            setImageError(false);
                        }}
                        loading="lazy"
                    />
                    
                    {/* Bottom Gradient Overlay with Name and Price */}
                    <div style={styles.imageOverlay}>
                        <h3 style={styles.overlayName}>{item.name}</h3>
                        <div style={styles.overlayPrice}>${item.price.toFixed(2)}</div>
                    </div>

                    {/* Edit Button - appears on hover */}
                    <button
                        style={{
                            ...styles.editButtonOverlay,
                            ...(isHovered ? styles.editButtonOverlayVisible : {})
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowEditModal(true);
                        }}
                    >
                        <EditIcon width={16} height={16} />
                        Edit
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <EditItemModal
                    item={item}
                    onClose={() => setShowEditModal(false)}
                    onUpdateItem={(updatedItem) => {
                        onUpdateItem(updatedItem);
                        setShowEditModal(false);
                    }}
                    onDeleteItem={(itemId: number) => {
                        onDeleteItem(itemId);
                        setShowEditModal(false);
                    }}
                />
            )}
        </>
    );
}

// --- Edit Item Modal Component ---
interface EditItemModalProps {
  item: CatalogItem;
  onClose: () => void;
  onUpdateItem: (item: CatalogItem) => void;
  onDeleteItem: (itemId: number) => void;
}
const EditItemModal: React.FC<EditItemModalProps> = ({ item, onClose, onUpdateItem, onDeleteItem }) => {
    const [editData, setEditData] = useState(item);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    // Replace placehold.co URLs with Unsplash images
    const getInitialImageUrl = (): string => {
        if (!item.imageUrl || item.imageUrl.trim() === '' || item.imageUrl.includes('placehold.co')) {
            return getUnsplashImage(item.category);
        }
        return item.imageUrl;
    };
    const [imagePreview, setImagePreview] = useState<string>(getInitialImageUrl());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({ 
            ...prev, 
            [name]: name === 'price' || name === 'stock' || name === 'sold' ? parseFloat(value) || 0 : value 
        }));
        
        if (name === 'imageUrl') {
            setImagePreview(value || getUnsplashImage(editData.category));
        }
        
        if (name === 'category' && !editData.imageUrl) {
            setImagePreview(getUnsplashImage(value));
        }
    };

    useEffect(() => {
        // Replace placehold.co URLs with Unsplash images
        if (!editData.imageUrl || editData.imageUrl.trim() === '' || editData.imageUrl.includes('placehold.co')) {
            if (editData.category) {
                setImagePreview(getUnsplashImage(editData.category));
            }
        } else {
            setImagePreview(editData.imageUrl);
        }
    }, [editData.category, editData.imageUrl]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editData.name || !editData.category || editData.price <= 0 || editData.stock < 0) {
            alert('Please fill all fields with valid values.'); 
            return;
        }
        const imageUrl = editData.imageUrl.trim() || getUnsplashImage(editData.category);
        onUpdateItem({ ...editData, imageUrl });
        onClose();
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        onDeleteItem(item.id);
        onClose();
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    return (
        <>
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={{...styles.modalBackdrop, zIndex: 2000}} onClick={cancelDelete}>
                    <div style={{...styles.confirmModal, zIndex: 2001}} onClick={e => e.stopPropagation()}>
                        <div style={styles.confirmHeader}>
                            <div style={styles.confirmIcon}>
                                <TrashIcon width={24} height={24} />
                            </div>
                            <h3 style={styles.confirmTitle}>Delete Product</h3>
                        </div>
                        <p style={styles.confirmMessage}>
                            Are you sure you want to delete <strong>"{item.name}"</strong>? 
                            <br />
                            This action cannot be undone.
                        </p>
                        <div style={styles.confirmActions}>
                            <button 
                                style={{ ...styles.confirmButton, ...styles.confirmButtonCancel }} 
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>
                            <button 
                                style={{ ...styles.confirmButton, ...styles.confirmButtonDelete }} 
                                onClick={confirmDelete}
                            >
                                <TrashIcon width={18} height={18} />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <div style={styles.modalBackdrop} onClick={onClose}>
                <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                    <div style={styles.modalHeader}>
                        <h3 style={{ margin: 0 }}>Edit Product</h3>
                        <button style={styles.modalCloseButton} onClick={onClose}>
                            <XIcon width={24} height={24} />
                        </button>
                    </div>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Product Name *</label>
                        <input 
                            style={styles.formInput} 
                            name="name" 
                            value={editData.name} 
                            onChange={handleChange}
                            placeholder="Enter product name"
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Category *</label>
                        <input 
                            style={styles.formInput} 
                            name="category" 
                            value={editData.category} 
                            onChange={handleChange}
                            placeholder="e.g., Electronics, Clothing, Home Decor"
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>
                            Image URL
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400, marginLeft: '8px' }}>
                                (Leave empty for auto-generated image)
                            </span>
                        </label>
                        <input 
                            style={styles.formInput} 
                            name="imageUrl" 
                            value={editData.imageUrl} 
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg or leave empty"
                        />
                        {imagePreview && (
                            <div style={styles.imagePreviewContainer}>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    style={styles.imagePreview}
                                    onError={() => {
                                        if (editData.category) {
                                            setImagePreview(getUnsplashImage(editData.category));
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{...styles.formGroup, flex: 1}}>
                            <label style={styles.formLabel}>Price ($) *</label>
                            <input 
                                style={styles.formInput} 
                                type="number" 
                                step="0.01"
                                name="price" 
                                value={editData.price} 
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>
                        <div style={{...styles.formGroup, flex: 1}}>
                            <label style={styles.formLabel}>Stock *</label>
                            <input 
                                style={styles.formInput} 
                                type="number" 
                                name="stock" 
                                value={editData.stock} 
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>
                        <div style={{...styles.formGroup, flex: 1}}>
                            <label style={styles.formLabel}>Sold</label>
                            <input 
                                style={styles.formInput} 
                                type="number" 
                                name="sold" 
                                value={editData.sold} 
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>
                    <div style={styles.formActions}>
                        <button 
                            type="button" 
                            style={{ ...styles.formButton, background: '#dc2626', color: 'white' }} 
                            onClick={handleDelete}
                        >
                            <TrashIcon width={18} height={18} />
                            Delete
                        </button>
                        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
                            <button 
                                type="button" 
                                style={{ ...styles.formButton, background: '#f1f5f9', color: '#64748b' }} 
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                style={{ ...styles.formButton, background: 'linear-gradient(135deg, #005bb5 0%, #007bff 100%)', color: 'white' }}
                            >
                                <CheckIcon width={18} height={18} />
                                Update Product
                            </button>
                        </div>
                </div>
                </form>
            </div>
        </div>
        </>
    );
};

// --- Add Item Modal Component ---
interface AddItemModalProps {
  onClose: () => void;
  onAddItem: (item: Omit<CatalogItem, 'id' | 'sold'>) => void;
}
const AddItemModal: React.FC<AddItemModalProps> = ({ onClose, onAddItem }) => {
    const [newItem, setNewItem] = useState({ 
        name: '', 
        imageUrl: '', 
        price: 0, 
        stock: 0, 
        category: '' 
    });
    const [imagePreview, setImagePreview] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ 
            ...prev, 
            [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value 
        }));
        
        // Update preview when image URL changes
        if (name === 'imageUrl') {
            if (value.trim()) {
                setImagePreview(value);
            } else {
                // If URL is cleared, show Unsplash image based on category
                if (newItem.category) {
                    setImagePreview(getUnsplashImage(newItem.category));
                } else {
                    setImagePreview('');
                }
            }
        }
        
        // Update preview when category changes (if no image URL)
        if (name === 'category') {
            if (!newItem.imageUrl || newItem.imageUrl.trim() === '') {
                if (value) {
                    setImagePreview(getUnsplashImage(value));
                } else {
                    setImagePreview('');
                }
            }
        }
    };

    useEffect(() => {
        // Set initial preview based on category if no image URL
        if (!newItem.imageUrl && newItem.category) {
            setImagePreview(getUnsplashImage(newItem.category));
        } else if (newItem.imageUrl) {
            setImagePreview(newItem.imageUrl);
        } else {
            setImagePreview('');
        }
    }, [newItem.category, newItem.imageUrl]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name || !newItem.category || newItem.price <= 0 || newItem.stock < 0) {
            alert('Please fill all fields with valid values.'); 
            return;
        }
        // Use Unsplash image if no URL provided or if it's a placeholder
        let imageUrl = newItem.imageUrl.trim();
        if (!imageUrl || imageUrl.includes('placehold.co')) {
            imageUrl = getUnsplashImage(newItem.category);
        }
        onAddItem({ ...newItem, imageUrl });
        onClose();
    };

    return (
        <div style={styles.modalBackdrop} onClick={onClose}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h3 style={{ margin: 0 }}>Add New Product</h3>
                    <button style={styles.modalCloseButton} onClick={onClose}>
                        <XIcon width={24} height={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Product Name *</label>
                        <input 
                            style={styles.formInput} 
                            name="name" 
                            value={newItem.name} 
                            onChange={handleChange}
                            placeholder="Enter product name"
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Category *</label>
                        <input 
                            style={styles.formInput} 
                            name="category" 
                            value={newItem.category} 
                            onChange={handleChange}
                            placeholder="e.g., Electronics, Clothing, Home Decor"
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>
                            Image URL *
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400, marginLeft: '8px' }}>
                                (Leave empty for auto-generated image)
                            </span>
                        </label>
                        <input 
                            style={styles.formInput} 
                            name="imageUrl" 
                            value={newItem.imageUrl} 
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg or leave empty"
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#005bb5';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 91, 181, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                        {/* Image Preview */}
                        {(imagePreview || newItem.category) && (
                            <div style={styles.imagePreviewContainer}>
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={styles.imagePreview}
                                        onError={() => {
                                            if (newItem.category) {
                                                setImagePreview(getUnsplashImage(newItem.category));
                                            }
                                        }}
                                    />
                                ) : (
                                    <div style={styles.imagePreviewPlaceholder}>
                                        {newItem.category 
                                            ? `Preview will show ${newItem.category} image`
                                            : 'Enter image URL or select category to see preview'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{...styles.formGroup, flex: 1}}>
                            <label style={styles.formLabel}>Price ($) *</label>
                            <input 
                                style={styles.formInput} 
                                type="number" 
                                step="0.01"
                                name="price" 
                                value={newItem.price} 
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>
                        <div style={{...styles.formGroup, flex: 1}}>
                            <label style={styles.formLabel}>Stock *</label>
                            <input 
                                style={styles.formInput} 
                                type="number" 
                                name="stock" 
                                value={newItem.stock} 
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>
                    </div>
                    <div style={styles.formActions}>
                        <button 
                            type="button" 
                            style={{ ...styles.formButton, background: '#f1f5f9', color: '#64748b' }} 
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            style={{ ...styles.formButton, background: 'linear-gradient(135deg, #005bb5 0%, #007bff 100%)', color: 'white' }}
                        >
                            <PlusIcon width={18} height={18} />
                            Add Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main CatalogDashboard Component ---
const CatalogDashboard: React.FC = () => {
    const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    // Add CSS animations
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(styleSheet);
        return () => {
            if (document.head.contains(styleSheet)) {
                document.head.removeChild(styleSheet);
            }
        };
    }, []);

    // Fetch catalog items from API on component mount
    useEffect(() => {
        const fetchCatalog = async () => {
            setLoading(true);
            try {
                const items = await getCatalogItems();
                setCatalogItems(items);
            } catch (error) {
                console.error('Error fetching catalog:', error);
                alert('Failed to load catalog. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };
        fetchCatalog();
    }, []);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = Array.from(new Set(catalogItems.map(item => item.category)));
        return cats.sort();
    }, [catalogItems]);

    // Filter items based on search and category
    const filteredItems = useMemo(() => {
        return catalogItems.filter(item => {
            const matchesSearch = !searchQuery || 
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [catalogItems, searchQuery, categoryFilter]);

    // Calculate statistics
    const stats = useMemo(() => {
        const total = catalogItems.length;
        const totalValue = catalogItems.reduce((sum, item) => sum + (item.price * item.stock), 0);
        const lowStock = catalogItems.filter(item => item.stock > 0 && item.stock < 10).length;
        const outOfStock = catalogItems.filter(item => item.stock === 0).length;
        return { total, totalValue, lowStock, outOfStock };
    }, [catalogItems]);

    const handleAddItem = async (item: Omit<CatalogItem, 'id' | 'sold'>) => {
        try {
            const newItem = await createCatalogItem({
                name: item.name,
                image_url: item.imageUrl,
                price: item.price,
                category: item.category,
                stock: item.stock,
                sold: 0
            });
            setCatalogItems(prev => [...prev, newItem]);
        } catch (error) {
            console.error('Error creating catalog item:', error);
            alert('Failed to create catalog item. Please try again.');
        }
    };

    const handleUpdateItem = async (updatedItem: CatalogItem) => {
        try {
            const updated = await updateCatalogItem(updatedItem.id, {
                name: updatedItem.name,
                image_url: updatedItem.imageUrl,
                price: updatedItem.price,
                category: updatedItem.category,
                stock: updatedItem.stock,
                sold: updatedItem.sold
            });
            setCatalogItems(prev => prev.map(item => item.id === updated.id ? updated : item));
        } catch (error) {
            console.error('Error updating catalog item:', error);
            alert('Failed to update catalog item. Please try again.');
        }
    };

    const handleDeleteItem = async (itemId: number) => {
        try {
            await deleteCatalogItem(itemId);
            setCatalogItems(prev => prev.filter(item => item.id !== itemId));
        } catch (error: any) {
            console.error('Error deleting catalog item:', error);
            alert(`Failed to delete product: ${error.message || 'Please try again.'}`);
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '80px', fontSize: '1.2rem', color: '#64748b' }}>
                    Loading catalog...
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Product Catalog</h2>
                <div style={styles.controls}>
                    <div style={styles.searchContainer}>
                        <SearchIcon style={styles.searchIcon} width={18} height={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#005bb5';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 91, 181, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={styles.categoryFilter}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#005bb5';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 91, 181, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button 
                        style={styles.addButton} 
                        onClick={() => setModalOpen(true)}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 91, 181, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 91, 181, 0.3)';
                        }}
                    >
                        <PlusIcon width={18} height={18} />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Statistics */}
            <div style={styles.statsContainer}>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Total Products</div>
                    <div style={styles.statValue}>{stats.total}</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Total Inventory Value</div>
                    <div style={styles.statValue}>${stats.totalValue.toFixed(2)}</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Low Stock Items</div>
                    <div style={{...styles.statValue, color: '#d97706'}}>{stats.lowStock}</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Out of Stock</div>
                    <div style={{...styles.statValue, color: '#dc2626'}}>{stats.outOfStock}</div>
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyStateIcon}>📦</div>
                    <div style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#64748b' }}>
                        {searchQuery || categoryFilter !== 'all' 
                            ? 'No products match your filters' 
                            : 'No products in catalog'}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                        {searchQuery || categoryFilter !== 'all' 
                            ? 'Try adjusting your search or filters' 
                            : 'Add your first product to get started'}
                    </div>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fill, minmax(280px, 1fr))`,
                    gap: '20px',
                    justifyContent: 'center'
                }}>
                    {filteredItems.map(item => (
                    <CatalogItemCard 
                        key={item.id} 
                        item={item} 
                        onUpdateItem={handleUpdateItem} 
                        onDeleteItem={handleDeleteItem} 
                    />
                ))}
            </div>
            )}
            {isModalOpen && <AddItemModal onClose={() => setModalOpen(false)} onAddItem={handleAddItem} />}
        </div>
    );
};

export default CatalogDashboard;
