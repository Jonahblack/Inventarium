import type { Category, Location, InventoryState } from "./types";
import { v4 as uuid } from "uuid";

export const DEFAULT_CATEGORIES: Category[] = [
  "Clothes",
  "Kitchen",
  "Outdoors",
  "Food",
  "Misc",
  "Cleaning",
  "Tools",
  "Electronics",
  "Bathroom",
].map((name) => ({ id: uuid(), name }));

export const DEFAULT_LOCATIONS: Location[] = [
  "Pantry – top shelf",
  "Garage – cabinet",
  "Bedroom closet",
].map((name) => ({ id: uuid(), name }));

export const DEFAULT_STATE: InventoryState = {
  items: [],
  categories: DEFAULT_CATEGORIES,
  locations: DEFAULT_LOCATIONS,
  settings: {
    lowStockThreshold: 1,
    expiringSoonDays: 7,
  },
};
