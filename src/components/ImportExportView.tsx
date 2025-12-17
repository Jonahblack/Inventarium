import React, { useState } from "react";
import type { Item, Category, Location } from "../types";

interface Props {
  items: Item[];
  categories: Category[];
  locations: Location[];
  onReplaceAll: (
    items: Item[],
    categories: Category[],
    locations: Location[]
  ) => void;
  onMerge: (
    items: Item[],
    categories: Category[],
    locations: Location[]
  ) => void;
}

const escapeCsv = (value: string) => {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

// Simple CSV parser with quoted field support (good enough here)
const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let cur = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(cur);
        cur = "";
      } else if (ch === "\n" || ch === "\r") {
        if (cur || row.length) {
          row.push(cur);
          rows.push(row);
          row = [];
          cur = "";
        }
      } else {
        cur += ch;
      }
    }
  }
  if (cur || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
};

const ImportExportView: React.FC<Props> = ({
  items,
  categories,
  locations,
  onMerge,
  onReplaceAll,
}) => {
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const exportCsv = () => {
    const header = [
      "id",
      "name",
      "category",
      "location",
      "quantity",
      "unit",
      "expirationDate",
      "condition",
      "value",
      "tags",
      "photoUrl",
      "barcode",
      "notes",
      "consumable",
      "isFood",
    ];
    const categoryById = new Map(categories.map((c) => [c.id, c.name]));
    const locationById = new Map(locations.map((l) => [l.id, l.name]));
    const rows = items.map((item) => {
      return [
        item.id,
        item.name,
        categoryById.get(item.categoryId) ?? "",
        item.locationId ? locationById.get(item.locationId) ?? "" : "",
        item.quantity.toString(),
        item.unit ?? "",
        item.expirationDate ?? "",
        item.condition ?? "",
        item.value != null ? item.value.toString() : "",
        item.tags.join(";"),
        item.photoUrl ?? "",
        item.barcode ?? "",
        item.notes ?? "",
        item.consumable ? "true" : "",
        item.isFood ? "true" : "",
      ].map((v) => escapeCsv(v));
    });
    const csv =
      header.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: "merge" | "replace"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) return;

    const header = rows[0].map((h) => h.trim());
    const dataRows = rows.slice(1);

    const colIndex = (name: string) => header.indexOf(name);

    const idx = {
      id: colIndex("id"),
      name: colIndex("name"),
      category: colIndex("category"),
      location: colIndex("location"),
      quantity: colIndex("quantity"),
      unit: colIndex("unit"),
      expirationDate: colIndex("expirationDate"),
      condition: colIndex("condition"),
      value: colIndex("value"),
      tags: colIndex("tags"),
      photoUrl: colIndex("photoUrl"),
      barcode: colIndex("barcode"),
      notes: colIndex("notes"),
      consumable: colIndex("consumable"),
      isFood: colIndex("isFood"),
    };

    const catMap = new Map(categories.map((c) => [c.name, c.id]));
    const locMap = new Map(locations.map((l) => [l.name, l.id]));
    const newCats: Category[] = [];
    const newLocs: Location[] = [];

    const newItems: Item[] = [];
    let added = 0;
    let updated = 0;
    let ignored = 0;

    for (const row of dataRows) {
      if (!row.some((v) => v.trim())) {
        continue;
      }
      try {
        const id = idx.id >= 0 ? row[idx.id] : "";
        const name = idx.name >= 0 ? row[idx.name] : "";
        if (!id || !name) {
          ignored++;
          continue;
        }
        const categoryName = idx.category >= 0 ? row[idx.category] : "";
        let categoryId = "";
        if (categoryName) {
          if (!catMap.has(categoryName)) {
            const newCat: Category = {
              id: crypto.randomUUID(),
              name: categoryName,
            };
            newCats.push(newCat);
            catMap.set(categoryName, newCat.id);
          }
          categoryId = catMap.get(categoryName)!;
        } else {
          categoryId = categories[0]?.id ?? "";
        }

        const locationName = idx.location >= 0 ? row[idx.location] : "";
        let locationId: string | null = null;
        if (locationName) {
          if (!locMap.has(locationName)) {
            const newLoc: Location = {
              id: crypto.randomUUID(),
              name: locationName,
            };
            newLocs.push(newLoc);
            locMap.set(locationName, newLoc.id);
          }
          locationId = locMap.get(locationName)!;
        }

        const quantity =
          idx.quantity >= 0 ? parseInt(row[idx.quantity] || "0", 10) : 0;
        const unit = idx.unit >= 0 ? row[idx.unit] || "" : "";
        const expirationDate =
          idx.expirationDate >= 0 ? row[idx.expirationDate] || "" : "";
        const condition =
          idx.condition >= 0 ? row[idx.condition] || "" : "";
        const valueStr = idx.value >= 0 ? row[idx.value] || "" : "";
        const value = valueStr ? parseFloat(valueStr) : undefined;
        const tags = idx.tags >= 0 ? row[idx.tags].split(";").filter(Boolean) : [];
        const photoUrl = idx.photoUrl >= 0 ? row[idx.photoUrl] || "" : "";
        const barcode = idx.barcode >= 0 ? row[idx.barcode] || "" : "";
        const notes = idx.notes >= 0 ? row[idx.notes] || "" : "";
        const consumable =
          idx.consumable >= 0 ? row[idx.consumable].toLowerCase() === "true" : false;
        const isFood =
          idx.isFood >= 0 ? row[idx.isFood].toLowerCase() === "true" : undefined;

        const existing = items.find((i) => i.id === id);
        if (existing && mode === "merge") {
          updated++;
        } else if (!existing && mode === "merge") {
          added++;
        } else if (mode === "replace") {
          added++;
        }

        newItems.push({
          id,
          name,
          categoryId,
          locationId,
          quantity,
          unit: unit || undefined,
          expirationDate: expirationDate || undefined,
          condition: condition || undefined,
          value,
          tags,
          photoUrl: photoUrl || undefined,
          barcode: barcode || undefined,
          notes: notes || undefined,
          consumable,
          isFood,
        });
      } catch (err) {
        console.error("Row parse error", err);
        ignored++;
      }
    }

    const mergedCats = [
      ...categories,
      ...newCats.filter(
        (c) => !categories.some((existing) => existing.id === c.id)
      ),
    ];
    const mergedLocs = [
      ...locations,
      ...newLocs.filter(
        (l) => !locations.some((existing) => existing.id === l.id)
      ),
    ];

    if (mode === "replace") {
      onReplaceAll(newItems, mergedCats, mergedLocs);
    } else {
      // merge by id
      const map = new Map(items.map((i) => [i.id, i]));
      for (const i of newItems) {
        map.set(i.id, i);
      }
      onMerge(Array.from(map.values()), mergedCats, mergedLocs);
    }

    setImportSummary(
      `Import completed. Added: ${added}, updated: ${updated}, ignored: ${ignored}`
    );

    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-white p-4 text-slate-900 shadow">
        <h2 className="text-base font-semibold text-slate-900">Export</h2>
        <p className="mt-1 text-sm text-slate-700">
          Export all items into a CSV file.
        </p>
        <button
          onClick={exportCsv}
          className="mt-2 rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
        >
          Download CSV
        </button>
      </section>

      <section className="rounded-lg bg-white p-4 text-slate-900 shadow">
        <h2 className="text-base font-semibold text-slate-900">Import</h2>
        <p className="mt-1 text-sm text-slate-700">
          Import items from a CSV file with columns:
          <br />
          <code className="text-[11px] text-slate-900">
            id, name, category, location, quantity, unit, expirationDate,
            condition, value, tags, photoUrl, barcode, notes
          </code>
        </p>

        <div className="mt-2 flex flex-col gap-2 text-sm">
          <label className="flex flex-col gap-1">
            <span className="font-medium">Merge into existing data</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handleImport(e, "merge")}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-medium text-red-600">
              Replace all data with this CSV
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handleImport(e, "replace")}
            />
          </label>
        </div>

        {importSummary && (
          <p className="mt-2 text-xs text-slate-600">{importSummary}</p>
        )}
      </section>
    </div>
  );
};

export default ImportExportView;
