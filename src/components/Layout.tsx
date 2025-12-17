import React, { useCallback, useMemo, useState } from "react";
import type { Category } from "../types";
import { type View } from "../hooks/useInventoryStore";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

interface LayoutProps {
  categories: Category[];
  currentCategoryId: string | "all";
  view: View;
  onCategoryChange: (id: string | "all") => void;
  onViewChange: (view: View) => void;
  children: React.ReactNode;
}

const filterButtonClasses = (
  active: boolean,
  activeClass: string
): string =>
  [
    "mb-1 w-full rounded-2xl px-3 py-2 text-left text-sm font-medium transition-colors duration-200",
    active ? activeClass : "text-slate-200/80 hover:bg-white/5 hover:text-white",
  ].join(" ");

const Layout: React.FC<LayoutProps> = ({
  categories,
  currentCategoryId,
  view,
  onCategoryChange,
  onViewChange,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelectCategory = useCallback(
    (id: string | "all") => {
      onViewChange("all");
      onCategoryChange(id);
      setMobileOpen(false);
    },
    [onCategoryChange, onViewChange]
  );

  const menu = useMemo(
    () => (
      <>
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Browse
        </h2>
        <button
          onClick={() => handleSelectCategory("all")}
          className={filterButtonClasses(
            view === "all" && currentCategoryId === "all",
            "bg-blue-500/20 text-white"
          )}
        >
          All items
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => handleSelectCategory(c.id)}
            className={filterButtonClasses(
              view === "all" && currentCategoryId === c.id,
              "bg-blue-500/20 text-white"
            )}
          >
            {c.name}
          </button>
        ))}

        <h2 className="mt-5 mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
          Highlights
        </h2>
        <button
          onClick={() => {
            onViewChange("expiringSoon");
            setMobileOpen(false);
          }}
          className={filterButtonClasses(
            view === "expiringSoon",
            "bg-amber-500/20 text-amber-200"
          )}
        >
          Expiring soon
        </button>

        <h2 className="mt-5 mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
          Management
        </h2>
        <button
          onClick={() => {
            onViewChange("importExport");
            setMobileOpen(false);
          }}
          className={filterButtonClasses(
            view === "importExport",
            "bg-slate-100/10 text-white"
          )}
        >
          Import / Export
        </button>
        <button
          onClick={() => {
            onViewChange("settings");
            setMobileOpen(false);
          }}
          className={filterButtonClasses(
            view === "settings",
            "bg-slate-100/10 text-white"
          )}
        >
          Settings
        </button>
      </>
    ),
    [categories, currentCategoryId, handleSelectCategory, onViewChange, view]
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Sidebar desktop */}
      <aside className="hidden w-72 flex-shrink-0 border-r border-white/5 bg-white/5 px-5 py-6 backdrop-blur lg:block">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
            Inventory
          </p>
          <h1 className="text-2xl font-semibold text-white">Home Vault</h1>
        </div>
        {menu}
      </aside>

      {/* Sidebar mobile */}
      <div className="lg:hidden">
        {mobileOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="flex w-72 flex-col border-r border-white/5 bg-slate-950/90 px-4 py-5 backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Inventory
                  </p>
                  <h2 className="text-xl font-semibold">Home Vault</h2>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-white/10 p-2 text-slate-200 hover:bg-white/10"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2">{menu}</div>
            </div>
            <div
              className="flex-1 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/5 bg-slate-950/70 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              className="rounded-full border border-white/10 p-2 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Bars3Icon className="h-5 w-5 text-slate-200" />
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Dashboard
              </p>
              <h2 className="text-lg font-semibold text-white">Inventory</h2>
            </div>
          </div>
          <div className="text-right text-xs text-slate-200/80">
            Stay organized ?
          </div>
        </header>
        <main className="flex-1 overflow-auto px-4 py-4 md:px-8 md:py-6">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
