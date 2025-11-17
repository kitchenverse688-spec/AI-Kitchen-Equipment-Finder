
import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface FavoritesViewProps {
  favorites: Product[];
  onFavorite: (product: Product) => void;
  onCompare: (product: Product) => void;
  compareList: Product[];
}

const FavoritesView: React.FC<FavoritesViewProps> = ({ favorites, onFavorite, onCompare, compareList }) => {
  if (favorites.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-dark">Your Favorites</h2>
        <p className="mt-2 text-slate-600">You haven't saved any items yet. Click the heart icon on a product to add it to your favorites.</p>
      </div>
    );
  }

  const compareSet = new Set(compareList.map(p => p.id));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-3xl font-bold text-dark mb-6">Your Favorites ({favorites.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onCompare={onCompare}
            onFavorite={onFavorite}
            isCompared={compareSet.has(product.id)}
            isFavorited={true}
          />
        ))}
      </div>
    </div>
  );
};

export default FavoritesView;
