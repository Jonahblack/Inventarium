import React, { useId, useState } from "react";
import type { Item, Category, Location } from "../types";
import BarcodeScanner from "./BarcodeScanner";
import { lookupProductByBarcode } from "../barcodeLookup";

interface Props {
  open: boolean;
  initialItem?: Item;
  categories: Category[];
  locations: Location[];
  onClose: () => void;
  onSave: (item: Omit<Item, "id"> | Item) => void;
  existingItemWithBarcode?: (barcode: string) => Item | null;
}

type ModalContentProps = Omit<Props, "open">;

const ItemFormModal: React.FC<Props> = ({
  open,
  initialItem,
  categories,
  locations,
  onClose,
  onSave,
  existingItemWithBarcode,
}) => {
  if (!open) return null;

  const contentKey = initialItem ? `edit-${initialItem.id}` : "new-item";

  return (
    <ModalContent
      key={contentKey}
      initialItem={initialItem}
      categories={categories}
      locations={locations}
      onClose={onClose}
      onSave={onSave}
      existingItemWithBarcode={existingItemWithBarcode}
    />
  );
};

const ModalContent: React.FC<ModalContentProps> = ({
  initialItem,
  categories,
  locations,
  onClose,
  onSave,
  existingItemWithBarcode,
}) => {
  const instanceId = useId();
  const fieldId = (suffix: string) => `${instanceId}-${suffix}`;
  const [name, setName] = useState(() => initialItem?.name ?? "");
  const [categoryId, setCategoryId] = useState<string>(
    () => initialItem?.categoryId ?? categories[0]?.id ?? ""
  );
  const [locationId, setLocationId] = useState<string>(
    () => initialItem?.locationId ?? ""
  );
  const [quantity, setQuantity] = useState(() => initialItem?.quantity ?? 1);
  const [unit, setUnit] = useState(() => initialItem?.unit ?? "");
  const [expirationDate, setExpirationDate] = useState(
    () => initialItem?.expirationDate ?? ""
  );
  const [condition, setCondition] = useState(
    () => initialItem?.condition ?? ""
  );
  const [value, setValue] = useState<string>(() =>
    typeof initialItem?.value === "number" ? initialItem.value.toString() : ""
  );
  const [tags, setTags] = useState(() =>
    initialItem ? initialItem.tags.join(", ") : ""
  );
  const [photoUrl, setPhotoUrl] = useState(() => initialItem?.photoUrl ?? "");
  const [barcode, setBarcode] = useState(() => initialItem?.barcode ?? "");
  const [notes, setNotes] = useState(() => initialItem?.notes ?? "");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");
  const [consumable, setConsumable] = useState(
    () => initialItem?.consumable ?? false
  );
  const [isFood, setIsFood] = useState(() => initialItem?.isFood ?? false);

  const ToggleField = ({
    label,
    description,
    value,
    onChange,
  }: {
    label: string;
    description: string;
    value: boolean;
    onChange: (next: boolean) => void;
  }) => (
    <div className="rounded border border-gray-300 bg-white px-3 py-2 text-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-800">{label}</p>
          <p className="text-[11px] text-slate-600">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
            value ? "bg-blue-600" : "bg-gray-300"
          }`}
          aria-pressed={value}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              value ? "translate-x-5" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId) return;
    const parsedValue = value ? parseFloat(value) : undefined;
    const itemBase: Omit<Item, "id"> = {
      name,
      categoryId,
      locationId: locationId || null,
      quantity: Math.max(0, Number.isNaN(quantity) ? 0 : quantity),
      unit: unit || undefined,
      expirationDate: expirationDate || undefined,
      condition: condition || undefined,
      value: parsedValue,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      photoUrl: photoUrl || undefined,
      barcode: barcode || undefined,
      notes: notes || undefined,
      consumable,
      isFood,
    };

    if (initialItem) {
      onSave({ ...initialItem, ...itemBase });
    } else {
      onSave(itemBase);
    }
  };

  const handleBarcodeDetected = async (code: string) => {
    setBarcode(code);
    setLookupMessage("");
    const duplicate = existingItemWithBarcode?.(code) ?? null;
    // warn about duplicates
    if (duplicate) {
      setLookupMessage(
        `An item with this barcode already exists: "${duplicate.name}". You can reuse its name/category or adjust as needed.`
      );
      if (!name) setName(duplicate.name);
      if (!categoryId) setCategoryId(duplicate.categoryId);
    }

    // call stub lookup (future external API)
    const suggestion = await lookupProductByBarcode(code);
    if (suggestion) {
      if (!name) setName(suggestion.name);
      if (suggestion.categoryName) {
        const existing = categories.find(
          (c) =>
            c.name.toLocaleLowerCase() ===
            suggestion.categoryName!.toLocaleLowerCase()
        );
        if (existing) {
          setCategoryId(existing.id);
        }
      }
      if (suggestion.imageUrl && !photoUrl) {
        setPhotoUrl(suggestion.imageUrl);
      }
      setLookupMessage("Product suggestion loaded from barcode lookup.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-40">
        <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {initialItem ? "Edit item" : "Add item"}
            </h2>
            <button
              onClick={onClose}
              className="text-sm text-slate-600 hover:text-slate-800"
            >
              Close
            </button>
          </div>
          {lookupMessage && (
            <div className="mb-2 rounded bg-blue-50 p-2 text-xs text-blue-700">
              {lookupMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <div>
              <label
                className="block text-xs font-medium text-slate-800"
                htmlFor={fieldId("name")}
              >
                Name*
              </label>
              <input
                id={fieldId("name")}
                className="mt-1 w-full rounded border border-gray-300 bg-white text-gray-900 px-2 py-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  className="block text-xs font-medium text-slate-800"
                  htmlFor={fieldId("category")}
                >
                  Category*
                </label>
                <select
                  id={fieldId("category")}
                  className="mt-1 w-full rounded border border-gray-300 bg-white text-gray-900 px-2 py-1"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-slate-800"
                  htmlFor={fieldId("location")}
                >
                  Location
                </label>
                <select
                  id={fieldId("location")}
                  className="mt-1 w-full rounded border border-gray-300 bg-white text-gray-900 px-2 py-1"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                >
                  <option value="">(none)</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label
                  className="block text-xs font-medium text-slate-800"
                  htmlFor={fieldId("quantity")}
                >
                  Quantity*
                </label>
                <input
                  id={fieldId("quantity")}
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded border border-gray-300 bg-white text-gray-900 px-2 py-1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                  required
                />
              </div>
              <div>
                <label
                  className="block text-xs font-medium text-slate-800"
                  htmlFor={fieldId("unit")}
                >
                  Unit
                </label>
                <input
                  id={fieldId("unit")}
                  className="mt-1 w-full rounded border border-gray-300 bg-white text-gray-900 px-2 py-1"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="pcs, bottles..."
                />
              </div>
              <div>
                <label
                  className="block text-xs font-medium text-slate-800"
                  htmlFor={fieldId("expiration")}
                >
                  Expiration date
                </label>
                <input
                  id={fieldId("expiration")}
                  type="date"
                  className="mt-1 w-full rounded border border-gray-300 bg-white text-gray-900 px-2 py-1"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  className="block text-xs font-medium text-slate-800"
                  htmlFor={fieldId("condition")}
                >
                  Condition
                </label>
                <input
                  id={fieldId("condition")}
                  className="mt-1 w-full rounded border border-gray-300 bg-white text-gray-900 px-2 py-1"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="new, good, worn"
                />
              </div>
              <div>
                <label
                  className="block text-xs font-medium text-slate-800"
                  htmlFor={fieldId("value")}
                >
                  Value (optional)
                </label>
                <input
                  id={fieldId("value")}
                  type="number"
                  step="0.01"
                  className="mt-1 w-full rounded border border-gray-300 bg-white text-gray-900 px-2 py-1"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <ToggleField
                label="Consumable"
                description="Enable the Use button for things that get used up."
                value={consumable}
                onChange={setConsumable}
              />
              <ToggleField
                label="Food item"
                description="Only food items show up in Expiring Soon."
                value={isFood}
                onChange={setIsFood}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-slate-800"
                htmlFor={fieldId("tags")}
              >
                Tags (comma separated)
              </label>
              <input
                id={fieldId("tags")}
                className="mt-1 w-full rounded border border-gray-300 bg-white text-gray-900 px-2 py-1"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-slate-800"
                htmlFor={fieldId("photo")}
              >
                Photo URL
              </label>
              <input
                id={fieldId("photo")}
                className="mt-1 w-full rounded border border-gray-300 bg-white text-gray-900 px-2 py-1"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
            </div>

            {/* Barcode section */}
            <div>
              <label
                className="block text-xs font-medium text-slate-800"
                htmlFor={fieldId("barcode")}
              >
                Barcode
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id={fieldId("barcode")}
                  className="flex-1 rounded border border-gray-300 bg-white text-gray-900 px-2 py-1 font-mono text-xs"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan or type barcode"
                />
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Scan barcode
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-600">
                Works for typical retail barcodes (EAN-13, UPC, Code 128).
              </p>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-slate-800"
                htmlFor={fieldId("notes")}
              >
                Notes
              </label>
              <textarea
                id={fieldId("notes")}
                className="mt-1 w-full rounded border border-gray-300 bg-white text-gray-900 px-2 py-1"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
              >
                {initialItem ? "Save changes" : "Add item"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {scannerOpen && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </>
  );
};

export default ItemFormModal;
