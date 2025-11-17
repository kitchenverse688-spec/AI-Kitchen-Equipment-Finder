
import React from 'react';
import { Product } from '../types';
import { HeartIcon, CompareIcon, ExternalLinkIcon } from './icons';
import { CURRENCY_RATES_TO_USD } from '../constants';

interface ProductListItemProps {
  product: Product;
  onCompare: (product: Product) => void;
  onFavorite: (product: Product) => void;
  isCompared: boolean;
  isFavorited: boolean;
  localCurrency: string;
}

const ProductListItem: React.FC<ProductListItemProps> = ({ product, onCompare, onFavorite, isCompared, isFavorited, localCurrency }) => {
  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return "Price not available";
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
    } catch (e) {
      return `${currency} ${price.toLocaleString()}`;
    }
  };

  const getConvertedPrice = () => {
    if (product.price === 0 || product.currency === localCurrency) return null;

    const rateFrom = CURRENCY_RATES_TO_USD[product.currency.toUpperCase()];
    const rateTo = CURRENCY_RATES_TO_USD[localCurrency.toUpperCase()];

    if (!rateFrom || !rateTo) return null;

    const priceInUsd = product.price / rateFrom;
    const convertedPrice = priceInUsd * rateTo;

    return `~ ${formatPrice(convertedPrice, localCurrency)}`;
  };

  const convertedPrice = getConvertedPrice();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary border border-transparent flex flex-col sm:flex-row">
      <img
        src={product.imageUrl || 'https://picsum.photos/400/300'}
        alt={`${product.brand} ${product.model}`}
        className="w-full sm:w-48 h-48 sm:h-auto object-cover"
        onError={(e) => { e.currentTarget.src = 'https://picsum.photos/400/300'; }}
      />
      <div className="p-4 flex flex-col flex-grow justify-between sm:flex-row w-full gap-4">
        {/* Main Details */}
        <div className="flex-grow">
          <span className="text-xs font-semibold text-secondary uppercase">{product.brand}</span>
          <h3 className="text-lg font-bold text-dark" title={`${product.brand} ${product.model}`}>{product.model}</h3>
          <p className="text-sm text-slate-500 mt-1">Supplier: <span className="font-semibold text-slate-700">{product.supplier}</span></p>
          <div className="text-sm text-slate-600 space-y-1 mt-3 border-t pt-2">
            {Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex">
                <span className="font-semibold w-24 shrink-0">{key}:</span>
                <span className="truncate ml-2" title={String(value)}>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Price and Actions */}
        <div className="flex flex-col justify-between items-start sm:items-end w-full sm:w-56 shrink-0">
          <div className="text-right w-full">
            <p className="text-xl font-extrabold text-primary my-2">{formatPrice(product.price, product.currency)}</p>
            {convertedPrice && <p className="text-sm text-slate-500">{convertedPrice}</p>}
          </div>
          <div className="flex sm:flex-col items-center sm:items-stretch gap-2 w-full mt-2">
            <a 
              href={product.productUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full inline-flex items-center justify-center bg-slate-100 text-secondary font-bold py-2 px-4 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition text-sm"
            >
              Visit Site <ExternalLinkIcon className="w-4 h-4 ml-2" />
            </a>
            <div className="flex gap-2 w-full">
              <button 
                  onClick={() => onCompare(product)}
                  className={`w-full flex justify-center p-2 rounded-md transition-colors ${isCompared ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-slate-200 text-secondary'}`}
                  title={isCompared ? "Remove from Compare" : "Add to Compare"}
              >
                  <CompareIcon className="w-5 h-5" />
              </button>
              <button 
                  onClick={() => onFavorite(product)}
                  className={`w-full flex justify-center p-2 rounded-md transition-colors ${isFavorited ? 'bg-accent text-white' : 'bg-slate-100 hover:bg-slate-200 text-secondary'}`}
                  title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
              >
                  <HeartIcon className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListItem;
