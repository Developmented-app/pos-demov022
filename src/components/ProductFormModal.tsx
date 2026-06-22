import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Tag, DollarSign, Database, Hash, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> & { id?: string }) => void;
  editingProduct: Product | null;
  categories: { id: string; name: string; icon: string }[];
}

const PRESET_EMOJIS = ['☕', '🥛', '🥤', '🍵', '🍃', '🌺', '🥐', '🥯', '🥧', '🥑', '🥪', '🥗', '🍪', '🎒', '🍰', '🧁', '🍎', '🍕', '🍟', '🍔'];
const PRESET_COLORS = [
  { class: 'bg-amber-50 border-amber-200 text-amber-900', label: 'Warm Caramel' },
  { class: 'bg-emerald-50 border-emerald-200 text-emerald-900', label: 'Matcha Sage' },
  { class: 'bg-orange-50 border-orange-200 text-orange-900', label: 'Pastry Ginger' },
  { class: 'bg-lime-50 border-lime-200 text-lime-900', label: 'Avocado Lime' },
  { class: 'bg-purple-50 border-purple-200 text-purple-900', label: 'Berry Plum' },
  { class: 'bg-blue-50 border-blue-200 text-blue-900', label: 'Blue Ice' },
];

export default function ProductFormModal({
  isOpen,
  onClose,
  onSave,
  editingProduct,
  categories,
}: ProductFormModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [maxStock, setMaxStock] = useState('');
  const [icon, setIcon] = useState('☕');
  const [color, setColor] = useState(PRESET_COLORS[0].class);
  const [code, setCode] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // When editingProduct changes, load values
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setPrice(editingProduct.price.toString());
      setCategory(editingProduct.category);
      setStock(editingProduct.stock.toString());
      setMaxStock(editingProduct.maxStock.toString());
      setIcon(editingProduct.icon);
      setColor(editingProduct.color);
      setCode(editingProduct.code);
      setImageUrl(editingProduct.imageUrl || '');
    } else {
      setName('');
      setPrice('');
      setCategory(categories[1]?.id || 'coffee');
      setStock('20');
      setMaxStock('20');
      setIcon('☕');
      setColor(PRESET_COLORS[0].class);
      // Generate a random PLU if new
      setCode((Math.floor(1000 + Math.random() * 9000)).toString());
      setImageUrl('');
    }
  }, [editingProduct, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category || !stock) return;

    onSave({
      id: editingProduct?.id,
      name,
      price: parseFloat(price) || 0,
      category,
      stock: parseInt(stock, 10) || 0,
      maxStock: parseInt(maxStock, 10) || parseInt(stock, 10) || 0,
      icon,
      color,
      code: code || Math.floor(1000 + Math.random() * 9000).toString(),
      imageUrl: imageUrl || undefined,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
          id="product-form-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{editingProduct ? '✏️' : '✨'}</span>
              <h2 className="font-sans text-lg font-semibold text-slate-800">
                {editingProduct ? 'Edit Inventory Item' : 'New Inventory Item'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              id="close-prod-modal-btn"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Product Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Tag className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lavender Matcha Latte"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-slate-400 focus:bg-white focus:outline-hidden"
                  id="prod-name-input"
                />
              </div>
            </div>

            {/* Price & PLU Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Retail Price ($)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-slate-400 focus:bg-white focus:outline-hidden"
                    id="prod-price-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  PLU / Code
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Hash className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="PLU code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-mono text-slate-800 placeholder-slate-400 transition-all focus:border-slate-400 focus:bg-white focus:outline-hidden"
                    id="prod-code-input"
                  />
                </div>
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 transition-all focus:border-slate-400 focus:bg-white focus:outline-hidden"
                id="prod-category-select"
              >
                {categories
                  .filter((cat) => cat.id !== 'all')
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Image Pattern / URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Image Pattern or URL Keyword</span>
                <span className="text-[10px] text-indigo-500 font-mono normal-case">e.g. matcha-grid, croissant-swirl</span>
              </label>
              <input
                type="text"
                placeholder="e.g. matcha-grid, espresso-waves, or image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-slate-400 focus:bg-white focus:outline-hidden"
                id="prod-imageurl-input"
              />
            </div>

            {/* Stock Level & Limit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Current Stock
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Database className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-slate-400 focus:bg-white focus:outline-hidden"
                    id="prod-stock-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Max Stock Capacity
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Database className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Capacity limit"
                    value={maxStock}
                    onChange={(e) => setMaxStock(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-slate-400 focus:bg-white focus:outline-hidden"
                    id="prod-maxstock-input"
                  />
                </div>
              </div>
            </div>

            {/* Emoji and Card Background Selector */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Select Visual Emoji
                </label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
                  {PRESET_EMOJIS.map((emojiChar) => (
                    <button
                      key={emojiChar}
                      type="button"
                      onClick={() => setIcon(emojiChar)}
                      className={`h-9 w-9 text-lg rounded-lg flex items-center justify-center transition-all ${
                        icon === emojiChar
                          ? 'bg-slate-800 text-white shadow-xs scale-110'
                          : 'hover:bg-slate-200'
                      }`}
                    >
                      {emojiChar}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Card Theme Vibe
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.class}
                      type="button"
                      onClick={() => setColor(preset.class)}
                      className={`text-xs py-2 px-3 rounded-lg border text-left transition-all ${preset.class} ${
                        color === preset.class
                          ? 'ring-2 ring-slate-800 scale-[1.02]'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-150">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all cursor-pointer"
                id="cancel-prod-modal-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-medium text-white hover:bg-slate-800 active:bg-slate-950 transition-all shadow-xs cursor-pointer"
                id="save-prod-modal-btn"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {editingProduct ? 'Update Product' : 'Add to Inventory'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
