import React, { useState } from 'react';
import { Product, Category } from '../types';
import { Search, Plus, Sparkles, Filter, Edit2, AlertCircle, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductListProps {
  products: Product[];
  categories: Category[];
  onProductClick: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onAddNewProduct: () => void;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
}

export default function ProductList({
  products,
  categories,
  onProductClick,
  onEditProduct,
  onAddNewProduct,
  selectedCategory,
  onSelectCategory,
}: ProductListProps) {
  const [search, setSearch] = useState('');

  // Filtering products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5" id="product-list-panel">
      {/* Search & Action Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            placeholder="Search catalog by name or PLU/barcode code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:border-slate-400 focus:outline-hidden transition-all"
            id="catalog-search"
          />
        </div>

        {/* Add Product Button */}
        <button
          onClick={onAddNewProduct}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 active:bg-slate-950 flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer transition-colors"
          id="add-new-product-btn"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Product
        </button>
      </div>

      {/* Category Quick Filter Rail */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar select-none" id="categories-rail">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap border cursor-pointer transition-all ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
              }`}
              id={`cat-filter-${cat.id}`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" id="products-grid-view">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-100 p-8 space-y-3 cursor-default">
            <div className="text-3xl">☕</div>
            <p className="text-sm font-semibold text-slate-500">No products matching filters found</p>
            <p className="text-xs text-slate-400">Clear search query or create a custom catalog item above</p>
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const isOutOfStock = prod.stock <= 0;
            const isLowStock = prod.stock > 0 && prod.stock <= 5;

            return (
              <motion.div
                key={prod.id}
                layout
                className={`group relative rounded-2xl border p-4 flex flex-col justify-between h-[12.5rem] bg-white transition-all overflow-hidden ${
                  isOutOfStock
                    ? 'border-slate-100 opacity-60'
                    : isLowStock
                    ? 'border-amber-300 bg-amber-50/15 hover:border-amber-400 hover:shadow-md cursor-pointer'
                    : 'border-slate-150/80 hover:border-slate-350 hover:shadow-md cursor-pointer'
                }`}
                onClick={() => {
                  if (!isOutOfStock) onProductClick(prod);
                }}
                id={`product-card-${prod.id}`}
              >
                {/* Upper Details & Quick edit */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    {/* Emoji badge */}
                    <div className={`p-2.5 h-10 w-10 text-xl rounded-xl border flex items-center justify-center transition-all ${prod.color}`}>
                      {prod.icon}
                    </div>

                    {isLowStock && !isOutOfStock && (
                      <div className="bg-amber-500 text-white border border-amber-400 text-[9px] font-extrabold px-2 py-1 rounded-lg uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-xs shrink-0 select-none">
                        <AlertCircle className="h-2.5 w-2.5" />
                        Low Stock
                      </div>
                    )}

                    {/* Quick Adjust */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProduct(prod);
                      }}
                      className="opacity-90 group-hover:opacity-100 hover:scale-110 h-7 w-7 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 text-indigo-600 hover:text-indigo-850 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      title="Quick Adjust Stock & Catalog details"
                      id={`quick-adjust-icon-${prod.id}`}
                    >
                      <Sliders className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Name and Price */}
                  <div className="pt-2">
                    <h3 className="font-sans font-bold text-xs text-slate-800 leading-tight truncate">
                      {prod.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold font-mono">PLU: {prod.code}</p>
                  </div>
                </div>

                {/* Bottom Details (Price and Stock Indicator) */}
                <div className="pt-3 border-t border-slate-100 flex items-end justify-between">
                  {/* Retail Price */}
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Price</span>
                    <span className="text-sm font-extrabold font-mono text-slate-900">
                      ${prod.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Stock level indicators */}
                  <div>
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 rounded-sm bg-red-50 px-2 py-0.5 text-[9px] font-bold text-red-700 uppercase tracking-wide border border-red-200/50">
                        Sold Out
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center gap-1 rounded-sm bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 uppercase tracking-wide border border-amber-200/50 animate-pulse">
                        <AlertCircle className="h-2 w-2" />
                        {prod.stock} left
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold font-mono text-slate-400">
                        {prod.stock} in stock
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
