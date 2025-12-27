// src/components/CatalogDashboard.tsx
import React, { useState, useEffect } from 'react';
import type { CatalogItem } from '../data/catalog';
import { getCatalogItems, createCatalogItem, updateCatalogItem } from '../api/catalog';

// --- Styling Objects ---
const styles = {
    container: { padding: '20px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)', height: '100%', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '1.5rem', fontWeight: 600, color: '#111827' },
    controls: { display: 'flex', alignItems: 'center', gap: '20px' },
    sliderContainer: { display: 'flex', alignItems: 'center', gap: '10px', color: '#555' },
    slider: { cursor: 'pointer', width: '120px' },
    addButton: { padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' },
    grid: (columns: number) => ({
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '20px'
    }),
    itemCard: { border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' },
    // --- UPDATED: Image styles for true dynamic sizing ---
    itemImage: {
        width: '100%',
        objectFit: 'cover',
        aspectRatio: '4 / 3', // This is the key for dynamic height
        backgroundColor: '#f0f0f0', // Fallback color
    },
    itemContent: { padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' },
    itemName: { fontSize: '1.2rem', fontWeight: 600, color: '#333', marginBottom: '10px' },
    itemDetails: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' },
    detailLabel: { color: '#666' },
    detailValue: { fontWeight: 600, textAlign: 'right' },
    cardActions: { marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    editButton: { padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 },
    // Modal & Form Styles
    modalBackdrop: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    modalContent: { background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
    modalHeader: { fontSize: '1.5rem', fontWeight: 600, marginBottom: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    formLabel: { fontSize: '0.9rem', color: '#555' },
    formInput: { padding: '12px', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '8px' },
    formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    formButton: { padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }
};

// --- Individual Editable Catalog Item Card ---
interface CatalogItemCardProps {
    item: CatalogItem;
    onUpdateItem: (updatedItem: CatalogItem) => void;
}
const CatalogItemCard: React.FC<CatalogItemCardProps> = ({ item, onUpdateItem }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(item);

    const handleSave = () => {
        onUpdateItem(editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData(item);
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' || name === 'sold' ? parseFloat(value) || 0 : value }));
    };

    return (
        <div
            style={styles.itemCard}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
        >
            <img src={item.imageUrl} alt={item.name} style={styles.itemImage} referrerPolicy="no-referrer" />
            <div style={styles.itemContent}>
                {isEditing ? <input style={{...styles.itemName, border: '1px solid #ccc', padding: '5px'}} name="name" value={editData.name} onChange={handleChange} /> : <h3 style={styles.itemName}>{item.name}</h3>}
                <div style={styles.itemDetails}>
                    <span style={styles.detailLabel}>Price </span>
                    {isEditing ? <input type="number" name="price" value={editData.price} onChange={handleChange} style={{...styles.detailValue, padding: '5px', border: '1px solid #ccc' }} /> : <span style={styles.detailValue}>${item.price.toFixed(2)}</span>}
                    <span style={styles.detailLabel}>Instock </span>
                    {isEditing ? <input type="number" name="stock" value={editData.stock} onChange={handleChange} style={{...styles.detailValue, padding: '5px', border: '1px solid #ccc' }}/> : <span style={styles.detailValue}>{item.stock}</span>}
                    <span style={styles.detailLabel}>Sold </span>
                     {isEditing ? <input type="number" name="sold" value={editData.sold} onChange={handleChange} style={{...styles.detailValue, padding: '5px', border: '1px solid #ccc' }}/> : <span style={styles.detailValue}>{item.sold}</span>}
                    <span style={styles.detailLabel}>Category </span>
                    {isEditing ? <input name="category" value={editData.category} onChange={handleChange} style={{...styles.detailValue, padding: '5px', border: '1px solid #ccc' }} /> : <span style={styles.detailValue}>{item.category}</span>}
                </div>
                <div style={styles.cardActions}>
                    {isEditing ? (
                        <>
                            <button style={{...styles.editButton, background: '#6c757d', color: 'white'}} onClick={handleCancel}>Cancel</button>
                            <button style={{...styles.editButton, background: '#28a745', color: 'white'}} onClick={handleSave}>Save</button>
                        </>
                    ) : <button style={{...styles.editButton, background: '#ADD8E6', color: '#333'}} onClick={() => setIsEditing(true)}>Edit</button>}
                </div>
            </div>
        </div>
    );
}

// --- Add Item Modal Component ---
interface AddItemModalProps {
  onClose: () => void;
  onAddItem: (item: Omit<CatalogItem, 'id' | 'sold'>) => void;
}
const AddItemModal: React.FC<AddItemModalProps> = ({ onClose, onAddItem }) => {
    const [newItem, setNewItem] = useState({ name: '', imageUrl: 'https://placehold.co/600x400', price: 0, stock: 0, category: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name || !newItem.imageUrl || newItem.price <= 0 || newItem.stock < 0 || !newItem.category) {
            alert('Please fill all fields with valid values.'); return;
        }
        onAddItem(newItem);
        onClose();
    };

    return (
        <div style={styles.modalBackdrop} onClick={onClose}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h3 style={styles.modalHeader}>Add New Catalog Item</h3>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}><label style={styles.formLabel}>Product Name</label><input style={styles.formInput} name="name" value={newItem.name} onChange={handleChange} /></div>
                    <div style={styles.formGroup}><label style={styles.formLabel}>Image URL</label><input style={styles.formInput} name="imageUrl" value={newItem.imageUrl} onChange={handleChange} /></div>
                    <div style={styles.formGroup}><label style={styles.formLabel}>Price ($)</label><input style={styles.formInput} type="number" name="price" value={newItem.price} onChange={handleChange} /></div>
                    <div style={styles.formGroup}><label style={styles.formLabel}>Stock Left</label><input style={styles.formInput} type="number" name="stock" value={newItem.stock} onChange={handleChange} /></div>
                    <div style={styles.formGroup}><label style={styles.formLabel}>Category</label><input style={styles.formInput} name="category" value={newItem.category} onChange={handleChange} /></div>
                    <div style={styles.formActions}>
                        <button type="button" style={{ ...styles.formButton, background: '#6c757d', color: 'white' }} onClick={onClose}>Cancel</button>
                        <button type="submit" style={{ ...styles.formButton, background: '#28a745', color: 'white' }}>Add Item</button>
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
    const [gridColumns, setGridColumns] = useState(4);

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

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#666' }}>Loading catalog...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Product Catalog</h2>
                <div style={styles.controls}>
                    <div style={styles.sliderContainer}>
                        <label htmlFor="size-slider">Item Size:</label>
                        <input
                            id="size-slider"
                            type="range"
                            min="1"
                            max="8"
                            value={gridColumns}
                            onChange={(e) => setGridColumns(Number(e.target.value))}
                            style={styles.slider}
                        />
                    </div>
                    <button style={styles.addButton} onClick={() => setModalOpen(true)}>+ Add New Item</button>
                </div>
            </div>
            <div style={styles.grid(gridColumns)}>
                {catalogItems.map(item => (
                    <CatalogItemCard key={item.id} item={item} onUpdateItem={handleUpdateItem} />
                ))}
            </div>
            {isModalOpen && <AddItemModal onClose={() => setModalOpen(false)} onAddItem={handleAddItem} />}
        </div>
    );
};

export default CatalogDashboard;
