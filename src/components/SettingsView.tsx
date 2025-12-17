import React, { useState } from "react";
import type { Category, Location } from "../types";

interface Props {
  expiringSoonDays: number;
  categories: Category[];
  locations: Location[];
  onUpdateSettings: (patch: {
    expiringSoonDays?: number;
  }) => void;
  onAddCategory: (name: string) => void;
  onRenameCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddLocation: (name: string) => void;
  onRenameLocation: (id: string, name: string) => void;
  onDeleteLocation: (id: string) => void;
  onResetAll: () => void;
}

const SettingsView: React.FC<Props> = ({
  expiringSoonDays,
  categories,
  locations,
  onUpdateSettings,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onAddLocation,
  onRenameLocation,
  onDeleteLocation,
  onResetAll,
}) => {
  const [newCategory, setNewCategory] = useState("");
  const [newLocation, setNewLocation] = useState("");

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-white p-4 text-slate-900 shadow">
        <h2 className="text-base font-semibold text-slate-900">General</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 text-sm">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-800">
              "Expiring soon" window (days)
            </span>
            <input
              type="number"
              min={1}
              className="rounded border border-gray-300 bg-white px-2 py-1 text-slate-900"
              value={expiringSoonDays}
              onChange={(e) =>
                onUpdateSettings({
                  expiringSoonDays: parseInt(e.target.value),
                })
              }
            />
          </label>
        </div>
      </section>

      <section className="rounded-lg bg-white p-4 text-slate-900 shadow">
        <h2 className="text-base font-semibold text-slate-900">Categories</h2>
        <div className="mt-2 space-y-2 text-sm">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <input
                className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-slate-900"
                value={c.name}
                onChange={(e) => onRenameCategory(c.id, e.target.value)}
              />
              <button
                className="text-xs text-red-600 hover:underline"
                onClick={() => onDeleteCategory(c.id)}
              >
                Delete
              </button>
            </div>
          ))}
          <div className="mt-2 flex gap-2">
            <input
              className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm text-slate-900"
              placeholder="Add category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button
              className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
              onClick={() => {
                if (!newCategory.trim()) return;
                onAddCategory(newCategory.trim());
                setNewCategory("");
              }}
            >
              Add
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-lg bg-white p-4 text-slate-900 shadow">
        <h2 className="text-base font-semibold text-slate-900">Locations</h2>
        <div className="mt-2 space-y-2 text-sm">
          {locations.map((l) => (
            <div key={l.id} className="flex items-center gap-2">
              <input
                className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-slate-900"
                value={l.name}
                onChange={(e) => onRenameLocation(l.id, e.target.value)}
              />
              <button
                className="text-xs text-red-600 hover:underline"
                onClick={() => onDeleteLocation(l.id)}
              >
                Delete
              </button>
            </div>
          ))}
          <div className="mt-2 flex gap-2">
            <input
              className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm text-slate-900"
              placeholder="Add location"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
            <button
              className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
              onClick={() => {
                if (!newLocation.trim()) return;
                onAddLocation(newLocation.trim());
                setNewLocation("");
              }}
            >
              Add
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-lg bg-white p-4 text-slate-900 shadow">
        <h2 className="text-base font-semibold text-slate-900">Danger zone</h2>
        <p className="mt-1 text-sm text-slate-700">
          Clear all inventory data from this browser (categories, locations,
          items, and settings).
        </p>
        <button
          className="mt-2 rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to reset all data? This cannot be undone."
              )
            ) {
              onResetAll();
            }
          }}
        >
          Reset data
        </button>
      </section>
    </div>
  );
};

export default SettingsView;
