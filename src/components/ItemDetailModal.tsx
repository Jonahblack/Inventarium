import React from "react";
import type { Item, Category, Location } from "../types";

interface Props {
  item: Item | null;
  category?: Category;
  location?: Location;
  onClose: () => void;
  onEdit: () => void;
  onUseOne: () => void;
  onDelete: () => void;
}

const ItemDetailModal: React.FC<Props> = ({
  item,
  category,
  location,
  onClose,
  onEdit,
  onUseOne,
  onDelete,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
          <button onClick={onClose} className="text-sm text-slate-600 hover:text-slate-800">
            Close
          </button>
        </div>
        {item.photoUrl && (
          <img
            src={item.photoUrl}
            alt={item.name}
            className="mb-3 max-h-40 w-full rounded object-cover"
          />
        )}
        <dl className="space-y-1 text-sm text-slate-800">
          <div>
            <dt className="font-medium text-slate-700">Category</dt>
            <dd>{category?.name ?? "Uncategorized"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">Location</dt>
            <dd>{location?.name ?? "No location"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">Quantity</dt>
            <dd>
              {item.quantity} {item.unit ?? ""}
            </dd>
          </div>
          {item.expirationDate && (
            <div>
              <dt className="font-medium text-slate-700">Expiration</dt>
              <dd>{item.expirationDate}</dd>
            </div>
          )}
          {item.condition && (
            <div>
              <dt className="font-medium text-slate-700">Condition</dt>
              <dd>{item.condition}</dd>
            </div>
          )}
          {typeof item.value === "number" && (
            <div>
              <dt className="font-medium text-slate-700">Value</dt>
              <dd>${item.value.toFixed(2)}</dd>
            </div>
          )}
          {item.barcode && (
            <div>
              <dt className="font-medium text-slate-700">Barcode</dt>
              <dd className="font-mono text-xs">{item.barcode}</dd>
            </div>
          )}
          {item.tags.length > 0 && (
            <div>
              <dt className="font-medium text-slate-700">Tags</dt>
              <dd className="flex flex-wrap gap-1">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-800"
                  >
                    {t}
                  </span>
                ))}
              </dd>
            </div>
          )}
          {item.notes && (
            <div>
              <dt className="font-medium text-slate-700">Notes</dt>
              <dd className="whitespace-pre-wrap">{item.notes}</dd>
            </div>
          )}
        </dl>
        <div className="mt-4 flex justify-end gap-2">
          {item.consumable && (
            <button
              onClick={onUseOne}
              className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:bg-gray-300"
              disabled={item.quantity <= 0}
            >
              Use 1
            </button>
          )}
          <button
            onClick={onEdit}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
