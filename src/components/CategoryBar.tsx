import React from 'react';
import { Category } from '../types';
import { 
  Car, 
  GraduationCap, 
  Heart, 
  Bike, 
  Shield, 
  Baby, 
  Dices, 
  Sparkles,
  Layers
} from 'lucide-react';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Car: <Car className="w-4 h-4" />,
  GraduationCap: <GraduationCap className="w-4 h-4" />,
  Heart: <Heart className="w-4 h-4" />,
  Bike: <Bike className="w-4 h-4" />,
  Shield: <Shield className="w-4 h-4" />,
  Baby: <Baby className="w-4 h-4" />,
  Dices: <Dices className="w-4 h-4" />
};

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 my-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          <span>Browse By Category</span>
        </h3>
        {selectedCategory !== 'all' && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs text-rose-600 font-bold hover:underline"
          >
            Reset to All Toys
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {/* All Categories Pill */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>All Toys & Games</span>
        </button>

        {/* Dynamic Category Pills */}
        {categories.map(cat => {
          const isSelected = selectedCategory === cat.id;
          const icon = ICON_MAP[cat.icon] || <Sparkles className="w-3.5 h-3.5" />;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50'
              }`}
            >
              <span className={isSelected ? 'text-white' : 'text-rose-500'}>
                {icon}
              </span>
              <span>{cat.name}</span>
              {cat.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                }`}>
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
