// src/data/catalog.ts

export interface CatalogItem {
  id: number;
  name: string;
  imageUrl: string; // URL for the product image
  price: number;
  stock: number;
  sold: number;
  category: string;
}

export const initialCatalog: CatalogItem[] = [
  { id: 1, name: 'Minimalist Wall Clock', imageUrl: 'https://placehold.co/600x400/EAEAEA/333333?text=Wall+Clock', price: 85.00, stock: 25, sold: 10, category: 'Home Decor' },
  { id: 2, name: 'Ceramic Vase Set', imageUrl: 'https://placehold.co/600x400/D2B48C/333333?text=Vase+Set', price: 120.50, stock: 15, sold: 5, category: 'Home Decor' },
  { id: 3, name: 'Abstract Canvas Art', imageUrl: 'https://placehold.co/600x400/A9A9A9/333333?text=Canvas+Art', price: 310.75, stock: 10, sold: 3, category: 'Art' },
  { id: 4, name: 'Handwoven Rug', imageUrl: 'https://placehold.co/600x400/BC8F8F/333333?text=Rug', price: 250.00, stock: 8, sold: 2, category: 'Textiles' },
  { id: 5, name: 'Sculptural Table Lamp', imageUrl: 'https://placehold.co/600x400/F5DEB3/333333?text=Table+Lamp', price: 180.00, stock: 20, sold: 7, category: 'Furniture' },
  { id: 6, name: 'Oak Bookshelf', imageUrl: 'https://placehold.co/600x400/CD853F/333333?text=Bookshelf', price: 450.00, stock: 5, sold: 1, category: 'Furniture' },
];
