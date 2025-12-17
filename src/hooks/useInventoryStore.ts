import { useEffect, useState, useCallback } from "react";
import type { InventoryState, Item, Category, Location } from "../types";
import { loadState, saveState, clearState } from "../storage";
import { DEFAULT_STATE } from "../constants";
import { v4 as uuid } from "uuid";

export type View = "all" | "expiringSoon" | "importExport" | "settings";

interface Store extends InventoryState {
  loading: boolean;
  error: string | null;

  // Items
  addItem(item: Omit<Item, "id">): void;
  updateItem(item: Item): void;
  deleteItem(id: string): void;
  useOne(id: string): void;

  // Categories
  addCategory(name: string): Category;
  renameCategory(id: string, name: string): void;
  deleteCategory(id: string): void;

  // Locations
  addLocation(name: string): Location;
  renameLocation(id: string, name: string): void;
  deleteLocation(id: string): void;

  // Settings
  updateSettings(patch: Partial<InventoryState["settings"]>): void;

  // Reset
  resetAll(): void;
}

export function useInventoryStore(): Store {
  const [state, setState] = useState<InventoryState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // load
  useEffect(() => {
    (async () => {
      try {
        const loaded = await loadState();
        setState(loaded);
      } catch (e) {
        console.error(e);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // persist
  useEffect(() => {
    if (loading) return;
    saveState(state).catch((e) => console.error("save failed", e));
  }, [state, loading]);

  const updateState = useCallback(
    (updater: (prev: InventoryState) => InventoryState) => {
      setState((prev) => updater(prev));
    },
    []
  );

  // Items
  const addItem = (item: Omit<Item, "id">) => {
    updateState((prev) => ({
      ...prev,
      items: [...prev.items, { ...item, id: uuid() }],
    }));
  };

  const updateItem = (item: Item) => {
    updateState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === item.id ? item : i)),
    }));
  };

  const deleteItem = (id: string) => {
    updateState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  };

  const useOne = (id: string) => {
    updateState((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === id && i.consumable
          ? { ...i, quantity: Math.max(0, (i.quantity ?? 0) - 1) }
          : i
      ),
    }));
  };

  // Categories
  const addCategory = (name: string): Category => {
    const cat: Category = { id: uuid(), name };
    updateState((prev) => ({ ...prev, categories: [...prev.categories, cat] }));
    return cat;
  };

  const renameCategory = (id: string, name: string) => {
    updateState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === id ? { ...c, name } : c
      ),
    }));
  };

  const deleteCategory = (id: string) => {
    // move items into "Misc" or first category
    updateState((prev) => {
      const remaining = prev.categories.filter((c) => c.id !== id);
      const fallback = remaining[0] ?? { id, name: "Misc" };
      return {
        ...prev,
        categories: remaining,
        items: prev.items.map((i) =>
          i.categoryId === id ? { ...i, categoryId: fallback.id } : i
        ),
      };
    });
  };

  // Locations
  const addLocation = (name: string): Location => {
    const loc: Location = { id: uuid(), name };
    updateState((prev) => ({ ...prev, locations: [...prev.locations, loc] }));
    return loc;
  };

  const renameLocation = (id: string, name: string) => {
    updateState((prev) => ({
      ...prev,
      locations: prev.locations.map((l) =>
        l.id === id ? { ...l, name } : l
      ),
    }));
  };

  const deleteLocation = (id: string) => {
    updateState((prev) => ({
      ...prev,
      locations: prev.locations.filter((l) => l.id !== id),
      items: prev.items.map((i) =>
        i.locationId === id ? { ...i, locationId: null } : i
      ),
    }));
  };

  // Settings
  const updateSettings = (patch: Partial<InventoryState["settings"]>) => {
    updateState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  };

  // Reset
  const resetAll = () => {
    setState(DEFAULT_STATE);
    clearState().catch(() => {});
  };

  return {
    ...state,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    useOne,
    addCategory,
    renameCategory,
    deleteCategory,
    addLocation,
    renameLocation,
    deleteLocation,
    updateSettings,
    resetAll,
  };
}
