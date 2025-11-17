import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { summarizeDifferences } from '../services/geminiService';
import { SparklesIcon, TrashIcon } from './icons';
import Loader from './Loader';

interface ComparisonViewProps {
  products: Product[];
  onRemove: (product: Product) => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ products, onRemove }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    if (products.length < 2) return;
    setIsLoading(true);
    const result = await summarizeDifferences(products);
    setSummary(result);
    setIsLoading(false);
  };

  useEffect(() => {
    // Reset summary if products change
    setSummary('');
  }, [products]);
  
  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return "N/A";
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
    } catch {
        return `${currency} ${price.toLocaleString()}`;
    }
  };

  if (products.length === 0) {
    return (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-dark">Compare Products</h2>
            <p className="mt-2 text-slate-600">Select products from the search results to compare them side-by-side.</p>
        </div>
    )
  }

  // FIX: Replaced `flatMap` with `map().flat()` to resolve a TypeScript type inference issue.
  // Also added `|| {}` to safely handle cases where product.specs might be missing from the API response.
  // FIX: Replaced map().flat() with a more robust reduce() to avoid type inference issues with .flat() in some environments.
  // FIX: Explicitly set generic type for reduce to prevent incorrect type inference.
  const allSpecKeys: string[] = [...new Set(products.reduce<string[]>((acc, p) => acc.concat(Object.keys(p.specs || {})), []))];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-dark mb-6">Product Comparison</h2>

      {products.length >= 2 && (
        <div className="mb-6 p-4 border border-primary/20 bg-primary/5 rounded-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <h3 className="text-xl font-semibold text-dark mb-2 sm:mb-0">AI Summary</h3>
            <button 
              onClick={handleSummarize} 
              disabled={isLoading}
              className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:scale-105 disabled:bg-slate-400"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              {isLoading ? "Generating..." : "Summarize Differences"}
            </button>
          </div>
          {isLoading && <Loader text="Analyzing..." />}
          {summary && !isLoading && (
            <div className="mt-4 prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }} />
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-3 font-semibold text-left text-slate-600 border-b-2 border-slate-200 w-1/5">Feature</th>
              {products.map(product => (
                <th key={product.id} className="p-3 font-semibold text-left text-slate-600 border-b-2 border-slate-200 w-1/5">
                  <div className="flex justify-between items-start">
                    <div>
                        <span className="text-xs text-secondary">{product.brand}</span>
                        <p className="text-dark">{product.model}</p>
                    </div>
                    <button onClick={() => onRemove(product)} className="text-slate-400 hover:text-red-500 transition-colors p-1 -mr-1">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="p-3 font-semibold text-slate-700">Image</td>
              {products.map(p => <td key={p.id} className="p-3"><img src={p.imageUrl} alt={p.model} className="w-32 h-32 object-contain mx-auto rounded-md" /></td>)}
            </tr>
            <tr className="border-b border-slate-200 bg-slate-50">
              <td className="p-3 font-semibold text-slate-700">Price</td>
              {products.map(p => <td key={p.id} className="p-3 text-lg font-bold text-primary">{formatPrice(p.price, p.currency)}</td>)}
            </tr>
            {allSpecKeys.map(key => (
              <tr key={key} className="border-b border-slate-200 even:bg-slate-50">
                <td className="p-3 font-semibold text-slate-700">{key}</td>
                {products.map(p => (
                  <td key={p.id} className="p-3 text-slate-600">{p.specs?.[key] || '-'}</td>
                ))}
              </tr>
            ))}
            <tr className="border-b border-slate-200">
              <td className="p-3 font-semibold text-slate-700">Supplier</td>
              {products.map(p => <td key={p.id} className="p-3 text-slate-600">{p.supplier}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonView;