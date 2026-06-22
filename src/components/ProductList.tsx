import React, { useState } from 'react';
import { Product, Category } from '../types';
import { Search, Plus, Sparkles, Filter, Edit2, AlertCircle, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function ProductPatternImage({ product }: { product: Product }) {
  const name = product.name;
  const imageKey = product.imageUrl || product.id || 'default';

  // Generate unique visual backgrounds with CSS repeating gradients, radial gradients, mesh, grids or stripes
  let patternStyle: React.CSSProperties = {};

  if (imageKey.includes('espresso') || imageKey.includes('waves')) {
    patternStyle = {
      background: 'radial-gradient(circle at 100% 150%, #451a03 24%, #78350f 25%, #78350f 28%, #92400e 29%, #92400e 36%, #b45309 36%, #b45309 40%, rgba(0,0,0,0) 41%), radial-gradient(circle at 0% 150%, #451a03 24%, #78350f 25%, #78350f 28%, #92400e 29%, #92400e 36%, #b45309 36%, #b45309 40%, rgba(0,0,0,0) 41%), linear-gradient(135deg, #1e1b4b 0%, #451a03 100%)',
    };
  } else if (imageKey.includes('oat-latte') || imageKey.includes('stripes')) {
    patternStyle = {
      backgroundImage: 'repeating-linear-gradient(45deg, #fef3c7 0px, #fef3c7 10px, #f59e0b 10px, #f59e0b 11px, #d97706 11px, #d97706 15px, #fef3c7 15px, #fef3c7 25px)',
      backgroundSize: '40px 40px',
    };
  } else if (imageKey.includes('bubbles') || imageKey.includes('tonic')) {
    patternStyle = {
      background: 'radial-gradient(circle, #f59e0b 10%, transparent 11%), radial-gradient(circle at 50% 50%, #d97706 5%, transparent 6%), radial-gradient(circle at 20% 80%, #78350f 8%, transparent 9%), radial-gradient(circle at 80% 20%, #b45309 6%, transparent 7%), linear-gradient(to top, #78350f, #fef3c7)',
      backgroundSize: '20px 20px, 40px 40px, 40px 40px, 40px 40px, 100% 100%',
    };
  } else if (imageKey.includes('matcha') || imageKey.includes('grid')) {
    patternStyle = {
      backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.15) 1px, transparent 1px)',
      backgroundSize: '8px 8px',
      backgroundColor: '#d1fae5',
    };
  } else if (imageKey.includes('jasmine') || imageKey.includes('spiral')) {
    patternStyle = {
      background: 'radial-gradient(ellipse at center, rgba(236,253,245,0.8) 0%, rgba(52,211,153,0.3) 100%), repeating-radial-gradient(circle, #a7f3d0, #a7f3d0 10px, #34d399 10px, #34d399 20px)',
    };
  } else if (imageKey.includes('hibiscus') || imageKey.includes('blossom')) {
    patternStyle = {
      background: 'radial-gradient(circle at 50% 50%, #f43f5e 20%, transparent 20%, transparent 40%, #f43f5e 40%, #f43f5e 60%, transparent 60%), #ffe4e6',
      backgroundSize: '24px 24px',
    };
  } else if (imageKey.includes('croissant') || imageKey.includes('swirl')) {
    patternStyle = {
      background: 'repeating-conic-gradient(from 45deg, #ffedd5 0deg 30deg, #f97316 30deg 60deg, #ea580c 60deg 90deg)',
      backgroundSize: '30px 30px',
    };
  } else if (imageKey.includes('bagel') || imageKey.includes('seeds')) {
    patternStyle = {
      background: 'radial-gradient(circle at 50% 50%, transparent 25%, #ffedd5 26%, #ffedd5 40%, transparent 41%), radial-gradient(circle at 30% 30%, #7c2d12 4%, transparent 5%), radial-gradient(circle at 70% 70%, #1e293b 4%, transparent 5%), radial-gradient(circle at 80% 20%, #7c2d12 3%, transparent 4%), #ffedd5',
      backgroundSize: '100% 100%, 15px 15px, 15px 15px, 15px 15px, 100% 100%',
    };
  } else if (imageKey.includes('frangipane') || imageKey.includes('tart')) {
    patternStyle = {
      background: 'linear-gradient(45deg, #fed7aa 25%, transparent 25%), linear-gradient(-45deg, #fed7aa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ffedd5 75%), linear-gradient(-45deg, transparent 75%, #ffedd5 75%)',
      backgroundSize: '20px 20px',
      backgroundColor: '#f97316',
    };
  } else if (imageKey.includes('avocado')) {
    patternStyle = {
      backgroundImage: 'radial-gradient(circle at 0% 50%, rgba(101, 163, 13, 0.2) 9px, transparent 10px), radial-gradient(circle at 100% 50%, rgba(101, 163, 13, 0.2) 9px, transparent 10px)',
      backgroundSize: '12px 24px',
      backgroundColor: '#ecfccb',
    };
  } else if (imageKey.includes('salmon') || imageKey.includes('mesh')) {
    patternStyle = {
      background: 'linear-gradient(45deg, #fbcfe8 25%, transparent 25%), linear-gradient(-45deg, #fbcfe8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f472b6 75%), linear-gradient(-45deg, transparent 75%, #f472b6 75%)',
      backgroundSize: '16px 16px',
      backgroundColor: '#fce7f3',
    };
  } else if (imageKey.includes('beet') || imageKey.includes('salad') || imageKey.includes('polka')) {
    patternStyle = {
      background: 'radial-gradient(#be123c 15%, transparent 16%), radial-gradient(#be123c 15%, transparent 16%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 10px',
      backgroundColor: '#fecdd3',
    };
  } else if (imageKey.includes('cookie') || imageKey.includes('sparks')) {
    patternStyle = {
      background: 'radial-gradient(circle at 50% 50%, #451a03 15%, transparent 16%), radial-gradient(circle at 20% 30%, #451a03 10%, transparent 11%), radial-gradient(circle at 80% 70%, #451a03 12%, transparent 13%), #faf5ff',
      backgroundSize: '30px 30px, 30px 30px, 30px 30px, 100% 100%',
    };
  } else if (imageKey.includes('keepcup') || imageKey.includes('circles')) {
    patternStyle = {
      backgroundImage: 'radial-gradient(circle, #c084fc 20%, transparent 21%), radial-gradient(circle, #818cf8 20%, transparent 21%)',
      backgroundSize: '16px 16px',
      backgroundPosition: '0 0, 8px 8px',
      backgroundColor: '#f3e8ff',
    };
  } else if (imageKey.includes('roaster') || imageKey.includes('stripes')) {
    patternStyle = {
      backgroundImage: 'linear-gradient(45deg, #c084fc 25%, #f3e8ff 25%, #f3e8ff 50%, #c084fc 50%, #c084fc 75%, #f3e8ff 75%, #f3e8ff 100%)',
      backgroundSize: '20px 20px',
    };
  } else {
    // Elegant fallback based on charCode
    const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const colorA = colors[charSum % colors.length];
    const colorB = colors[(charSum + 7) % colors.length];
    patternStyle = {
      background: `linear-gradient(135deg, ${colorA}40 0%, ${colorB}90 100%)`,
    };
  }

  return (
    <div 
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
      style={patternStyle}
    >
      <div className="absolute inset-0 opacity-15 mix-blend-overlay bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
    </div>
  );
}

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
                    {/* Small placeholder image with dynamic CSS generated pattern */}
                    <div className="relative h-11 w-11 rounded-xl border border-slate-200/50 flex items-center justify-center shadow-2xs overflow-hidden shrink-0 select-none bg-slate-50">
                      <ProductPatternImage product={prod} />
                      <div className="relative text-xl filter drop-shadow-xs transition-all duration-300 group-hover:scale-110">
                        {prod.icon}
                      </div>
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
