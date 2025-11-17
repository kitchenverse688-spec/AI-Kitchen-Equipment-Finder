import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, GroundingChunk } from '../types';
import ProductCard from './ProductCard';
import ProductListItem from './ProductListItem';
import { DownloadIcon, GridIcon, ListIcon, ChevronDownIcon, BookmarkIcon } from './icons';

interface SearchResultsProps {
  products: Product[];
  groundingChunks: GroundingChunk[];
  onCompare: (product: Product) => void;
  onFavorite: (product: Product) => void;
  compareList: Product[];
  favoritesList: Product[];
  localCurrency: string;
  onSaveSearch: (name: string) => void;
}

type SortKey = 'priceLow' | 'priceHigh' | 'brand';
type Layout = 'grid' | 'list';

const SearchResults: React.FC<SearchResultsProps> = ({ products, groundingChunks, onCompare, onFavorite, compareList, favoritesList, localCurrency, onSaveSearch }) => {
  const [sortKey, setSortKey] = useState<SortKey>('priceLow');
  const [layout, setLayout] = useState<Layout>('grid');
  const [isExportOpen, setIsExportOpen] = useState(false);

  // --- Basic Filters ---
  const [keywordFilter, setKeywordFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');
  const [modelFilter, setModelFilter] = useState('All');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [specFilters, setSpecFilters] = useState<Record<string, string>>({});
  
  // --- Advanced Filters ---
  const [countryFilter, setCountryFilter] = useState<string[]>([]);
  const [conditionFilter, setConditionFilter] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 0 });
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });

  // --- State for available filter options ---
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableSuppliers, setAvailableSuppliers] = useState<string[]>([]);
  const [availableSpecFilters, setAvailableSpecFilters] = useState<Record<string, string[]>>({});
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableConditions, setAvailableConditions] = useState<string[]>([]);
  
  // --- UI State ---
  const [isCountryFilterOpen, setIsCountryFilterOpen] = useState(false);
  const [isConditionFilterOpen, setIsConditionFilterOpen] = useState(false);
  const countryFilterRef = useRef<HTMLDivElement>(null);
  const conditionFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset filters and build new ones when products change
    setKeywordFilter('');
    setBrandFilter('All');
    setModelFilter('All');
    setSupplierFilter('All');

    setAvailableBrands(['All', ...new Set(products.map(p => p.brand))].sort());
    setAvailableModels(['All', ...new Set(products.map(p => p.model))].sort());
    setAvailableSuppliers(['All', ...new Set(products.map(p => p.supplier))].sort());
    
    // Derive and set new filter options from products
    const uniqueCountries = [...new Set(products.map(p => p.specs?.['Country of Origin']).filter(Boolean) as string[])].sort();
    setAvailableCountries(uniqueCountries);
    setCountryFilter([]);

    const uniqueConditions = [...new Set(products.map(p => p.condition).filter(Boolean))].sort();
    setAvailableConditions(uniqueConditions);
    setConditionFilter([]);

    const prices = products.map(p => p.price).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices)) : 0;
    const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 0;
    setPriceRange({ min: minPrice, max: maxPrice });
    setPriceFilter({ min: minPrice, max: maxPrice });

    // Derive other spec filters, excluding Country of Origin which has its own filter
    const potentialSpecKeys = ['Capacity', 'Installation', 'Power Source', 'Controls'];
    const discoveredSpecs: Record<string, Set<string>> = {};

    products.forEach(p => {
        potentialSpecKeys.forEach(key => {
            if (p.specs && p.specs[key]) {
                if (!discoveredSpecs[key]) discoveredSpecs[key] = new Set();
                // FIX: Cast spec value to string to handle potential non-string values from API.
                discoveredSpecs[key].add(String(p.specs[key]));
            }
        });
    });

    const newAvailableSpecs: Record<string, string[]> = {};
    const newSpecFilters: Record<string, string> = {};
    for (const key in discoveredSpecs) {
        newAvailableSpecs[key] = ['All', ...Array.from(discoveredSpecs[key]).sort()];
        newSpecFilters[key] = 'All';
    }
    setAvailableSpecFilters(newAvailableSpecs);
    setSpecFilters(newSpecFilters);

  }, [products]);

  // Effect to close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryFilterRef.current && !countryFilterRef.current.contains(event.target as Node)) setIsCountryFilterOpen(false);
      if (conditionFilterRef.current && !conditionFilterRef.current.contains(event.target as Node)) setIsConditionFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let tempProducts = [...products];

    // Apply basic filters
    if (brandFilter !== 'All') tempProducts = tempProducts.filter(p => p.brand === brandFilter);
    if (modelFilter !== 'All') tempProducts = tempProducts.filter(p => p.model === modelFilter);
    if (supplierFilter !== 'All') tempProducts = tempProducts.filter(p => p.supplier === supplierFilter);
    if (keywordFilter.trim() !== '') {
      const lowerCaseKeyword = keywordFilter.toLowerCase();
      tempProducts = tempProducts.filter(p => 
          p.brand.toLowerCase().includes(lowerCaseKeyword) ||
          p.model.toLowerCase().includes(lowerCaseKeyword) ||
          (p.specs && Object.values(p.specs).some(val => String(val).toLowerCase().includes(lowerCaseKeyword)))
      );
    }
    Object.entries(specFilters).forEach(([key, value]) => {
      // FIX: Cast spec value to string for comparison to handle potential non-string values.
      if (value !== 'All') tempProducts = tempProducts.filter(p => p.specs && String(p.specs[key]) === value);
    });

    // Apply advanced filters
    // FIX: Cast spec value to string to ensure it can be used in `includes`.
    if (countryFilter.length > 0) tempProducts = tempProducts.filter(p => p.specs?.['Country of Origin'] && countryFilter.includes(String(p.specs['Country of Origin'])));
    if (conditionFilter.length > 0) tempProducts = tempProducts.filter(p => conditionFilter.includes(p.condition));
    
    // Price filter
    tempProducts = tempProducts.filter(p => {
      if (p.price === 0) return true; // Always include items with no price listed
      return p.price >= priceFilter.min && p.price <= priceFilter.max;
    });
    
    // Apply sorting
    return tempProducts.sort((a, b) => {
      switch (sortKey) {
        case 'priceLow':
          if (a.price === 0 && b.price > 0) return 1; if (b.price === 0 && a.price > 0) return -1;
          return a.price - b.price;
        case 'priceHigh': return b.price - a.price;
        case 'brand': return a.brand.localeCompare(b.brand);
        default: return 0;
      }
    });
  }, [products, sortKey, brandFilter, modelFilter, supplierFilter, keywordFilter, specFilters, countryFilter, conditionFilter, priceFilter]);

  const handleCountryToggle = (country: string) => setCountryFilter(prev => prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]);
  const handleConditionToggle = (condition: string) => setConditionFilter(prev => prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]);
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.min(Number(e.target.value), priceFilter.max - 1);
      setPriceFilter(prev => ({ ...prev, min: value }));
  };
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.max(Number(e.target.value), priceFilter.min + 1);
      setPriceFilter(prev => ({ ...prev, max: value }));
  };

  const handleSaveCurrentSearch = () => {
    const name = prompt("Enter a name for this search:", "My Combi Oven Search");
    if (name && name.trim() !== "") {
      onSaveSearch(name);
    }
  };

  const formatPrice = (price: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
  
  const escapeCSV = (val: any) => `"${String(val).replace(/"/g, '""')}"`;

  const exportData = (format: 'csv' | 'xls') => {
    const dataToExport = filteredAndSortedProducts;
    if (dataToExport.length === 0) return;
    
    const headers = ['Brand', 'Model', 'Price', 'Currency', 'Supplier', 'URL', 'Condition'];
    const allSpecKeys = [...new Set(dataToExport.map(p => Object.keys(p.specs || {})).flat())];
    headers.push(...allSpecKeys);

    const rows = dataToExport.map(p => {
        const row = [p.brand, p.model, p.price, p.currency, p.supplier, p.productUrl, p.condition];
        allSpecKeys.forEach(key => {
            row.push(p.specs?.[key] || '');
        });
        return row;
    });

    let content = headers.map(escapeCSV).join(',') + '\n';
    rows.forEach(row => {
        content += row.map(escapeCSV).join(',') + '\n';
    });
    
    const mimeType = format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel';
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `equipment_export.${format}`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportToPDF = () => {
    const dataToExport = filteredAndSortedProducts;
    if (dataToExport.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write('<html><head><title>Equipment Export</title>');
        printWindow.document.write('<style>body{font-family:sans-serif;margin:2em} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;text-align:left} th{background-color:#f2f2f2} tr:nth-child(even){background-color:#f9f9f9} img{max-width:80px;max-height:80px;vertical-align:middle} h1{font-size:1.5em}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<h1>Search Results (${dataToExport.length} items)</h1>`);
        printWindow.document.write('<table>');
        printWindow.document.write('<tr><th>Image</th><th>Brand & Model</th><th>Price</th><th>Supplier</th></tr>');
        
        dataToExport.forEach(p => {
            printWindow.document.write('<tr>');
            printWindow.document.write(`<td><img src="${p.imageUrl}" alt="${p.model}"></td>`);
            printWindow.document.write(`<td><b>${p.brand}</b><br>${p.model}</td>`);
            printWindow.document.write(`<td>${p.price > 0 ? `${p.price.toLocaleString()} ${p.currency}` : 'N/A'}</td>`);
            printWindow.document.write(`<td>${p.supplier}</td>`);
            printWindow.document.write('</tr>');
        });
        
        printWindow.document.write('</table>');
        printWindow.document.write('<script>window.onload = function() { window.print(); window.close(); }</script>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
    }
  };

  const compareSet = new Set(compareList.map(p => p.id));
  const favoriteSet = new Set(favoritesList.map(p => p.id));

  return (
    <div className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-2xl font-bold text-dark whitespace-nowrap">
                Search Results ({filteredAndSortedProducts.length} / {products.length})
            </h2>
        </div>

        {products.length > 0 && (
          <div className="p-4 bg-white rounded-lg shadow mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
                <input type="text" placeholder="Filter by keyword..." value={keywordFilter} onChange={e => setKeywordFilter(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white">{availableBrands.map(b => <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>)}</select>
                <select value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white">{availableSuppliers.map(s => <option key={s} value={s}>{s === 'All' ? 'All Suppliers' : s}</option>)}</select>
                
                {/* Country Multi-Select */}
                <div className="relative" ref={countryFilterRef}>
                    <button onClick={() => setIsCountryFilterOpen(prev => !prev)} className="w-full flex items-center justify-between text-left px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-white">
                        <span className="truncate pr-1">{countryFilter.length > 0 ? `${countryFilter.length} Countries` : 'All Countries'}</span>
                        <ChevronDownIcon className={`w-5 h-5 text-slate-400 transform transition-transform ${isCountryFilterOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isCountryFilterOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white shadow-lg border rounded-md max-h-60 overflow-auto">
                            {availableCountries.map(c => (
                                <label key={c} className="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer"><input type="checkbox" checked={countryFilter.includes(c)} onChange={() => handleCountryToggle(c)} className="mr-2 rounded text-primary focus:ring-primary" />{c}</label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Condition Multi-Select */}
                <div className="relative" ref={conditionFilterRef}>
                    <button onClick={() => setIsConditionFilterOpen(prev => !prev)} className="w-full flex items-center justify-between text-left px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-white">
                        <span className="truncate pr-1">{conditionFilter.length > 0 ? `${conditionFilter.length} Conditions` : 'All Conditions'}</span>
                        <ChevronDownIcon className={`w-5 h-5 text-slate-400 transform transition-transform ${isConditionFilterOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isConditionFilterOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white shadow-lg border rounded-md max-h-60 overflow-auto">
                            {availableConditions.map(c => (
                                <label key={c} className="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer"><input type="checkbox" checked={conditionFilter.includes(c)} onChange={() => handleConditionToggle(c)} className="mr-2 rounded text-primary focus:ring-primary" />{c}</label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Price Slider */}
                {priceRange.max > priceRange.min && (
                    <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2">
                        <div className="flex justify-between text-sm text-slate-600 mb-1">
                            <span>{formatPrice(priceFilter.min, localCurrency)}</span>
                            <span>{formatPrice(priceFilter.max, localCurrency)}</span>
                        </div>
                        <div className="relative h-2">
                            <input type="range" min={priceRange.min} max={priceRange.max} value={priceFilter.min} onChange={handleMinPriceChange} className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-10 slider-thumb" />
                            <input type="range" min={priceRange.min} max={priceRange.max} value={priceFilter.max} onChange={handleMaxPriceChange} className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-10 slider-thumb" />
                            <div className="relative w-full h-1 bg-slate-200 rounded-full top-0.5">
                                <div className="absolute h-1 bg-primary rounded-full" style={{ left: `${((priceFilter.min - priceRange.min) / (priceRange.max - priceRange.min || 1)) * 100}%`, right: `${100 - ((priceFilter.max - priceRange.min) / (priceRange.max - priceRange.min || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                )}
                
                {Object.entries(availableSpecFilters).map(([key, options]) => (
                    <select key={key} value={specFilters[key] || 'All'} onChange={e => setSpecFilters(prev => ({...prev, [key]: e.target.value}))} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                        {options.map(o => <option key={o} value={o}>{o === 'All' ? `All ${key}s` : o}</option>)}
                    </select>
                ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-4 gap-4">
             <select 
                value={sortKey} 
                onChange={e => setSortKey(e.target.value as SortKey)}
                className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
                <option value="priceLow">Sort by Price: Low to High</option>
                <option value="priceHigh">Sort by Price: High to Low</option>
                <option value="brand">Sort by Brand</option>
            </select>
            <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center bg-slate-200 rounded-md p-1">
                    <button onClick={() => setLayout('grid')} className={`p-1.5 rounded ${layout === 'grid' ? 'bg-white shadow' : 'text-slate-500 hover:bg-white/50'}`} aria-label="Grid view"><GridIcon className="w-5 h-5" /></button>
                    <button onClick={() => setLayout('list')} className={`p-1.5 rounded ${layout === 'list' ? 'bg-white shadow' : 'text-slate-500 hover:bg-white/50'}`} aria-label="List view"><ListIcon className="w-5 h-5" /></button>
                </div>
                <button onClick={handleSaveCurrentSearch} disabled={products.length === 0} className="flex items-center bg-white text-secondary font-semibold py-2 px-4 border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    <BookmarkIcon className="w-5 h-5 mr-0 sm:mr-2" /><span className="hidden sm:inline">Save</span>
                </button>
                <div className="relative">
                    <button onClick={() => setIsExportOpen(prev => !prev)} disabled={filteredAndSortedProducts.length === 0} className="flex items-center bg-white text-secondary font-semibold py-2 px-4 border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                        <DownloadIcon className="w-5 h-5 mr-0 sm:mr-2" /><span className="hidden sm:inline">Export</span><ChevronDownIcon className="w-4 h-4 ml-0 sm:ml-1" />
                    </button>
                    {isExportOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                            <a href="#" onClick={(e) => { e.preventDefault(); exportData('csv'); setIsExportOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Export as CSV</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); exportData('xls'); setIsExportOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Export as Excel</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); exportToPDF(); setIsExportOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Export as PDF</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        <style>{`.slider-thumb::-webkit-slider-thumb { pointer-events: auto; } .slider-thumb::-moz-range-thumb { pointer-events: auto; }`}</style>

      {layout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedProducts.map((product) => (<ProductCard key={product.id} product={product} onCompare={onCompare} onFavorite={onFavorite} isCompared={compareSet.has(product.id)} isFavorited={favoriteSet.has(product.id)} localCurrency={localCurrency} />))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedProducts.map((product) => (<ProductListItem key={product.id} product={product} onCompare={onCompare} onFavorite={onFavorite} isCompared={compareSet.has(product.id)} isFavorited={favoriteSet.has(product.id)} localCurrency={localCurrency} />))}
        </div>
      )}
      {filteredAndSortedProducts.length === 0 && products.length > 0 && <p className="text-center py-8 text-slate-500">No products match your current filters.</p>}

      {/* FIX: Make grounding chunks access safer to prevent runtime errors. */}
      {Array.isArray(groundingChunks) && groundingChunks.length > 0 && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-dark mb-2">Sources</h3>
            <div className="flex flex-wrap gap-2">
                {groundingChunks.map((chunk, index) => chunk.web && (
                    <a href={chunk.web.uri} key={index} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-full transition-colors">
                        {chunk.web.title || new URL(chunk.web.uri).hostname}
                    </a>
                ))}
            </div>
          </div>
      )}
    </div>
  );
};

export default SearchResults;