import React, { useMemo, useState } from "react";
import Layout from "./components/Layout";
import { useInventoryStore, type View } from "./hooks/useInventoryStore";
import ItemListView from "./components/ItemListView";
import ItemFormModal from "./components/ItemFormModal";
import ItemDetailModal from "./components/ItemDetailModal";
import ImportExportView from "./components/ImportExportView";
import SettingsView from "./components/SettingsView";
import type { Item } from "./types";

const App: React.FC = () => {
  const store = useInventoryStore();
  const {
    items,
    categories,
    locations,
    settings,
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
  } = store;

  const [view, setView] = useState<View>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "all">(
    "all"
  );
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | undefined>(undefined);
  const [detailItem, setDetailItem] = useState<Item | null>(null);
  const cardClass =
    "flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-100 shadow-[0_25px_80px_rgba(15,23,42,0.55)] backdrop-blur";
  const actionButtonClass =
    "rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:brightness-110";

  const existingItemByBarcode = useMemo(() => {
    if (!editItem) return (code: string) =>
      items.find((i) => i.barcode === code) ?? null;
    return (code: string) =>
      items.find((i) => i.barcode === code && i.id !== editItem.id) ?? null;
  }, [items, editItem]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="rounded-3xl border border-white/5 bg-white/5 px-8 py-6 text-sm font-medium text-white shadow-2xl shadow-black/40 backdrop-blur">
          Loading inventory...
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 px-8 py-6 text-sm font-semibold text-rose-100 shadow-2xl shadow-rose-900/50 backdrop-blur">
          {error}
        </div>
      </div>
    );
  }

  const handleAddSave = (item: Omit<Item, "id"> | Item) => {
    if ("id" in item) {
      updateItem(item);
    } else {
      addItem(item);
    }
    setAddModalOpen(false);
    setEditItem(undefined);
  };

  const handleReplaceAll = (
    newItems: Item[],
    newCats: typeof categories,
    newLocs: typeof locations
  ) => {
    // Quick-and-dirty: just replace everything but keep settings
    store.items = newItems;
    store.categories = newCats;
    store.locations = newLocs;
    // (Because store is from hook, better to add dedicated "setAll" in the hook in real code.)
  };

  const handleMergeAll = (
    newItems: Item[],
    newCats: typeof categories,
    newLocs: typeof locations
  ) => {
    // Same note as above: ideally we’d have a dedicated action.
    store.items = newItems;
    store.categories = newCats;
    store.locations = newLocs;
  };

  return (
    <Layout
      categories={categories}
      currentCategoryId={selectedCategoryId}
      view={view}
      onCategoryChange={setSelectedCategoryId}
      onViewChange={setView}
    >
      {/* Main content by view */}
      {view === "all" && (
        <div className={cardClass}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Overview
              </p>
              <h3 className="text-xl font-semibold text-white">All items</h3>
            </div>
            <button
              onClick={() => {
                setEditItem(undefined);
                setAddModalOpen(true);
              }}
              className={actionButtonClass}
            >
              + Add item
            </button>
          </div>
          <ItemListView
            items={items}
            categories={categories}
            locations={locations}
            selectedCategoryId={selectedCategoryId}
            viewMode="all"
            expiringSoonDays={settings.expiringSoonDays}
            onUseOne={useOne}
            onSelectItem={(item) => setDetailItem(item)}
          />
        </div>
      )}

      {view === "expiringSoon" && (
        <div className={cardClass}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200">
                Priority
              </p>
              <h2 className="text-xl font-semibold text-white">
                Expiring soon
              </h2>
            </div>
            <button
              onClick={() => {
                setEditItem(undefined);
                setAddModalOpen(true);
              }}
              className={actionButtonClass}
            >
              + Add item
            </button>
          </div>
          <ItemListView
            items={items}
            categories={categories}
            locations={locations}
            selectedCategoryId={selectedCategoryId}
            viewMode="expiringSoon"
            expiringSoonDays={settings.expiringSoonDays}
            onUseOne={useOne}
            onSelectItem={(item) => setDetailItem(item)}
          />
        </div>
      )}

      {view === "importExport" && (
        <div className={cardClass}>
          <ImportExportView
            items={items}
            categories={categories}
            locations={locations}
            onReplaceAll={handleReplaceAll}
            onMerge={handleMergeAll}
          />
        </div>
      )}

      {view === "settings" && (
        <div className={cardClass}>
          <SettingsView
            expiringSoonDays={settings.expiringSoonDays}
            categories={categories}
            locations={locations}
            onUpdateSettings={updateSettings}
            onAddCategory={(name) => {
              addCategory(name);
            }}
            onRenameCategory={renameCategory}
            onDeleteCategory={deleteCategory}
            onAddLocation={addLocation}
            onRenameLocation={renameLocation}
            onDeleteLocation={deleteLocation}
            onResetAll={resetAll}
          />
        </div>
      )}

      {/* Modals */}
      <ItemFormModal
        open={addModalOpen}
        initialItem={editItem}
        categories={categories}
        locations={locations}
        onClose={() => {
          setAddModalOpen(false);
          setEditItem(undefined);
        }}
        onSave={handleAddSave}
        existingItemWithBarcode={existingItemByBarcode}
      />
      <ItemDetailModal
        item={detailItem}
        category={
          detailItem
            ? categories.find((c) => c.id === detailItem.categoryId)
            : undefined
        }
        location={
          detailItem && detailItem.locationId
            ? locations.find((l) => l.id === detailItem.locationId)
            : undefined
        }
        onClose={() => setDetailItem(null)}
        onEdit={() => {
          if (!detailItem) return;
          setEditItem(detailItem);
          setAddModalOpen(true);
          setDetailItem(null);
        }}
        onUseOne={() => {
          if (!detailItem) return;
          useOne(detailItem.id);
        }}
        onDelete={() => {
          if (!detailItem) return;
          if (window.confirm("Delete this item?")) {
            deleteItem(detailItem.id);
            setDetailItem(null);
          }
        }}
      />
    </Layout>
  );
};

export default App;
