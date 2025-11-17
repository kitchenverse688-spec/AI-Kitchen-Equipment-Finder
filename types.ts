
export interface Product {
  id: string;
  brand: string;
  model: string;
  price: number;
  currency: string;
  imageUrl: string;
  supplier: string;
  productUrl: string;
  specs: { [key: string]: string };
  condition: string;
  description?: string;
}

export interface FilterState {
  keyword: string;
  brand: string;
  model: string;
  category: string;
  countries: string[];
  priceMin: string;
  priceMax: string;
  condition: string;
  currency: string;
  supplierWebsites: string;
  itemsPerPage: number;
}

export enum Tab {
  Search = 'Search',
  Compare = 'Compare',
  Favorites = 'Favorites',
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: FilterState;
  timestamp: number;
}
