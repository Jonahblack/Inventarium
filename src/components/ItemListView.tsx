import React, { useMemo, useState } from "react";
import type { Item, Category, Location } from "../types";
import ItemCard from "./ItemCard";

type SortBy = "name" | "quantity" | "expiration";

interface Props {
  items: Item[];
  categories: Category[];
  locations: Location[];
  selectedCategoryId: string | "all";
  viewMode: "all" | "expiringSoon";
  expiringSoonDays: number;
  onUseOne: (id: string) => void;
  onSelectItem: (item: Item) => void;
}

const ItemListView: React.FC<Props> = ({
  items,
  categories,
  locations,
  selectedCategoryId,
  viewMode,
  expiringSoonDays,
  onUseOne,
  onSelectItem,
}) => {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState<string | "">("");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [tagFilter, setTagFilter] = useState("");

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );
  const locationById = useMemo(
    () => new Map(locations.map((l) => [l.id, l])),
    [locations]
  );

  const filtered = useMemo(() => {
    const today = new Date();
    const normalizedTag = tagFilter.trim().toLowerCase();

    const itemIsFood = (target: Item) => {
      if (typeof target.isFood === "boolean") return target.isFood;
      const cat = categoryById.get(target.categoryId);
      return cat ? cat.name.toLowerCase().includes("food") : false;
    };

    const matchesView = (item: Item): boolean => {
      if (viewMode === "expiringSoon") {
        if (!itemIsFood(item)) return false;
        if (!item.expirationDate) return false;
        const exp = new Date(item.expirationDate);
        const diff =
          (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= expiringSoonDays;
      }
      return true;
    };

    return items
      .filter((item) => matchesView(item))
      .filter((item) => {
        if (selectedCategoryId !== "all") {
          return item.categoryId === selectedCategoryId;
        }
        return true;
      })
      .filter((item) => {
        if (locationFilter) {
          return item.locationId === locationFilter;
        }
        return true;
      })
      .filter((item) => {
        if (!tagFilter) return true;
        return item.tags.map((t) => t.toLowerCase()).includes(tagFilter.toLowerCase());
      })
      .filter((item) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const category = categoryById.get(item.categoryId);
        const location = item.locationId
          ? locationById.get(item.locationId)
          : undefined;

        const fields = [
          item.name,
          item.notes ?? "",
          (item.barcode ?? "").toString(),
          item.tags.join(" "),
          category?.name ?? "",
          location?.name ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return fields.includes(q);
      })
      .filter((item) => {
        if (!normalizedTag) return true;
        return item.tags.some((tag) => tag.toLowerCase() === normalizedTag);
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "quantity") {
          return b.quantity - a.quantity;
        }
        if (sortBy === "expiration") {
          const da = a.expirationDate ? new Date(a.expirationDate).getTime() : Infinity;
          const db = b.expirationDate ? new Date(b.expirationDate).getTime() : Infinity;
          return da - db;
        }
        return 0;
      });
  }, [
    items,
    selectedCategoryId,
    locationFilter,
    search,
    sortBy,
    categoryById,
    locationById,
    viewMode,
    expiringSoonDays,
    tagFilter,
  ]);

  return (
    <div className="flex h-full flex-col text-slate-100">
      {/* Search + filters */}
      <div className="mb-3 flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-300">
            Search
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-400 focus:outline-none"
            placeholder="Search name, tags, notes, barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-300">
            Location
          </label>
          <select
            className="mt-1 w-40 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-blue-400 focus:outline-none"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {tagFilter && (
          <div>
            <button
              type="button"
              onClick={() => setTagFilter("")}
              className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-100 hover:bg-white/10"
            >
              Clear tag filter: #{tagFilter}
            </button>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-300">
            Sort by
          </label>
          <select
            className="mt-1 w-32 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-blue-400 focus:outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
          >
            <option value="name">Name</option>
            <option value="quantity">Quantity</option>
            <option value="expiration">Expiration</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            category={categoryById.get(item.categoryId)}
            location={
              item.locationId ? locationById.get(item.locationId) : undefined
            }
            onClick={() => onSelectItem(item)}
            onUseOne={() => onUseOne(item.id)}
            onTagClick={(tag) => setTagFilter(tag)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-slate-400">
            No items match your filters.
          </p>
        )}
      </div>
    </div>
  );
};

export default ItemListView;
