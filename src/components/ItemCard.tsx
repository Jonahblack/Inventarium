import React from "react";
import type { Item, Category, Location } from "../types";

interface Props {
  item: Item;
  category: Category | undefined;
  location: Location | undefined;
  onClick: () => void;
  onUseOne: () => void;
  onTagClick?: (tag: string) => void;
}

const isExpired = (item: Item) => {
  if (!item.expirationDate) return false;
  return new Date(item.expirationDate) < new Date();
};

const isExpiringSoon = (item: Item, days: number) => {
  if (!item.expirationDate) return false;
  const today = new Date();
  const exp = new Date(item.expirationDate);
  const diff = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
};

const ItemCard: React.FC<Props> = ({
  item,
  category,
  location,
  onClick,
  onUseOne,
  onTagClick,
}) => {
  const expired = isExpired(item);
  const expSoon = isExpiringSoon(item, 7); // default for badge
  const foodItem =
    typeof item.isFood === "boolean"
      ? item.isFood
      : (category?.name?.toLowerCase().includes("food") ?? false);
  const showUseAction = !!item.consumable;

  const outOfStock = item.quantity <= 0;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-100 shadow-sm shadow-black/40 transition hover:shadow-lg hover:shadow-black/50">
      <div className="cursor-pointer" onClick={onClick}>
        <div className="mb-1 flex items-center justify-between">
          <h3 className="truncate text-sm font-semibold text-white">{item.name}</h3>
          {item.barcode && (
            <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-200">
              barcode
            </span>
          )}
        </div>
        <p className="text-xs text-slate-300">
          {category?.name ?? "Uncategorized"} -{" "}
          {location?.name ?? "No location"}
        </p>
        <p className="mt-1 text-xs text-slate-200">
          Qty: <span className="font-semibold text-white">{item.quantity}</span>{" "}
          {item.unit ?? ""}
        </p>
        {item.expirationDate && (
          <p className="mt-1 text-xs text-slate-200">
            Exp:{" "}
            <span className={expired ? "text-rose-400 font-semibold" : "text-slate-100"}>
              {item.expirationDate}
            </span>
          </p>
        )}
        <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
          {expired && (
            <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-rose-200">
              Expired
            </span>
          )}
          {!expired && expSoon && (
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-amber-200">
              Expiring soon
            </span>
          )}
          {foodItem && (
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-200">
              Food
            </span>
          )}
          {outOfStock && (
            <span className="rounded bg-slate-200/20 px-1.5 py-0.5 text-slate-200">
              Out of stock
            </span>
          )}
        </div>
        {item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-slate-100 hover:bg-white/20"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>
      {showUseAction ? (
        <button
          onClick={onUseOne}
          className="mt-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-blue-500/30 hover:brightness-110 disabled:from-slate-600 disabled:to-slate-600 disabled:opacity-50"
          disabled={item.quantity <= 0}
        >
          Use 1
        </button>
      ) : (
        <p className="mt-3 text-[11px] text-slate-400">Not consumable</p>
      )}
    </div>
  );
};

export default ItemCard;

