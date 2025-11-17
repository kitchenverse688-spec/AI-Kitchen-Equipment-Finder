
import React from 'react';
import { Product } from '../types';
import { HeartIcon, CompareIcon, ExternalLinkIcon } from './icons';
import { CURRENCY_RATES_TO_USD } from '../constants';

interface ProductCardProps {
  product: Product;
  onCompare: (product: Product) => void;
  onFavorite: (product: Product) => void;
  isCompared: boolean;
  isFavorited: boolean;
  localCurrency: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onCompare, onFavorite, isCompared, isFavorited, localCurrency }) => {
  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return "Price not available";
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
    } catch (e) {
      // Fallback for unknown currency codes from AI
      return `${currency} ${price.toLocaleString()}`;
    }
  };

  const getConvertedPrice = () => {
    if (product.price === 0 || product.currency === localCurrency) return null;

    const rateFrom = CURRENCY_RATES_TO_USD[product.currency.toUpperCase()];
    const rateTo = CURRENCY_RATES_TO_USD[localCurrency.toUpperCase()];

    if (!rateFrom || !rateTo) return null; // Cannot convert if a rate is unknown

    const priceInUsd = product.price / rateFrom;
    const convertedPrice = priceInUsd * rateTo;

    return `~ ${formatPrice(convertedPrice, localCurrency)}`;
  };

  const convertedPrice = getConvertedPrice();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col">
      <div className="relative">
        <img
          src={product.imageUrl || 'https://picsum.photos/400/300'}
          alt={`${product.brand} ${product.model}`}
          className="w-full h-48 object-cover"
          onError={(e) => { e.currentTarget.src = 'https://picsum.photos/400/300'; }}
        />
        <div className="absolute top-2 right-2 flex space-x-2">
            <button 
                onClick={() => onCompare(product)}
                className={`p-2 rounded-full transition-colors ${isCompared ? 'bg-primary text-white' : 'bg-white/70 hover:bg-white text-secondary'}`}
                title={isCompared ? "Remove from Compare" : "Add to Compare"}
            >
                <CompareIcon className="w-5 h-5" />
            </button>
            <button 
                onClick={() => onFavorite(product)}
                className={`p-2 rounded-full transition-colors ${isFavorited ? 'bg-accent text-white' : 'bg-white/70 hover:bg-white text-secondary'}`}
                title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
            >
                <HeartIcon className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs font-semibold text-secondary uppercase">{product.brand}</span>
        <h3 className="text-lg font-bold text-dark truncate" title={`${product.brand} ${product.model}`}>{product.model}</h3>
        
        <div className="my-2">
            <p className="text-xl font-extrabold text-primary">{formatPrice(product.price, product.currency)}</p>
            {convertedPrice && <p className="text-sm text-slate-500">{convertedPrice}</p>}
        </div>
        
        <div className="text-sm text-slate-600 space-y-1 mt-2 flex-grow">
          {Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-semibold">{key}:</span>
              <span className="text-right truncate ml-2" title={value}>{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">Supplier: <span className="font-semibold text-slate-700">{product.supplier}</span></p>
            <a 
                href={product.productUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-2 w-full inline-flex items-center justify-center bg-slate-100 text-secondary font-bold py-2 px-4 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
            >
                Visit Site <ExternalLinkIcon className="w-4 h-4 ml-2" />
            </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
