export interface Item {
  id: string;
  name: string;
  categoryId: string;
  locationId: string | null;
  quantity: number;
  unit?: string;
  expirationDate?: string; // ISO
  condition?: "new" | "good" | "worn" | "broken" | string;
  value?: number;
  tags: string[];
  photoUrl?: string;
  barcode?: string;
  notes?: string;
  consumable?: boolean;
  isFood?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Location {
  id: string;
  name: string;
}

export interface Settings {
  lowStockThreshold: number; // default 1
  expiringSoonDays: number;  // default 7
}

export interface InventoryState {
  items: Item[];
  categories: Category[];
  locations: Location[];
  settings: Settings;
}
