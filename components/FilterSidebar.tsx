
import React, { useRef, useState } from 'react';
import { FilterState, SavedSearch } from '../types';
import { CATEGORIES, CONDITIONS, COUNTRIES, CURRENCIES, ITEMS_PER_PAGE_OPTIONS } from '../constants';
import { SearchIcon, UploadIcon, DownloadIcon, ChevronDownIcon, TrashIcon } from './icons';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onSearch: () => void;
  isLoading: boolean;
  savedSearches: SavedSearch[];
  onLoadSearch: (search: SavedSearch) => void;
  onDeleteSearch: (id: string) => void;
}

const FilterInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <input
      {...props}
      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
    />
  </div>
);

const FilterSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, options: (string | number)[] }> = ({ label, options, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <select
      {...props}
      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition bg-white"
    >
      {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
  </div>
);

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange, onSearch, isLoading, savedSearches, onLoadSearch, onDeleteSearch }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSavedSearchesOpen, setIsSavedSearchesOpen] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFilterChange({ 
        ...filters, 
        [name]: name === 'itemsPerPage' ? parseInt(value, 10) : value 
    });
  };
  
  const handleCountryChange = (country: string) => {
    const newCountries = filters.countries.includes(country)
      ? filters.countries.filter(c => c !== country)
      : [...filters.countries, country];
    onFilterChange({ ...filters, countries: newCountries });
  };

  const handleExportSuppliers = () => {
    const blob = new Blob([filters.supplierWebsites], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'supplier_websites.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportSuppliers = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onFilterChange({ ...filters, supplierWebsites: content });
      };
      reader.readAsText(file);
    }
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  }

  return (
    <aside className="w-full md:w-80 lg:w-96 p-4 bg-white rounded-lg shadow-lg self-start">
      <h2 className="text-xl font-bold text-dark mb-4 border-b pb-2">Filter & Search</h2>
      <form onSubmit={handleSearchClick} className="space-y-4">
        <FilterInput label="Keyword" name="keyword" value={filters.keyword} onChange={handleChange} placeholder="e.g., Combi Oven" />
        <div className="grid grid-cols-2 gap-4">
          <FilterInput label="Brand" name="brand" value={filters.brand} onChange={handleChange} placeholder="e.g., Rational" />
          <FilterInput label="Model" name="model" value={filters.model} onChange={handleChange} placeholder="iCombi Pro 10-1/1" />
        </div>
        <FilterSelect label="Category" name="category" value={filters.category} onChange={handleChange} options={CATEGORIES} />
        
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Country</label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-2 border rounded-md p-2">
            {COUNTRIES.map(country => (
              <label key={country} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.countries.includes(country)}
                  onChange={() => handleCountryChange(country)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>{country}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <FilterSelect label="Condition" name="condition" value={filters.condition} onChange={handleChange} options={CONDITIONS} />
            <FilterSelect label="Items" name="itemsPerPage" value={filters.itemsPerPage} onChange={handleChange} options={ITEMS_PER_PAGE_OPTIONS} />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Price Range</label>
          <div className="flex items-center space-x-2">
             <FilterSelect name="currency" value={filters.currency} onChange={handleChange} options={CURRENCIES} label=""/>
            <input type="number" name="priceMin" value={filters.priceMin} onChange={handleChange} placeholder="Min" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition" />
            <span className="text-slate-500">-</span>
            <input type="number" name="priceMax" value={filters.priceMax} onChange={handleChange} placeholder="Max" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition" />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="supplierWebsites" className="block text-sm font-medium text-slate-600">
              Supplier Websites (optional)
            </label>
            <div className="flex space-x-1">
              <button type="button" onClick={handleImportSuppliers} className="p-1 text-slate-500 hover:text-primary" title="Import from file">
                <UploadIcon className="w-4 h-4" />
              </button>
              <button type="button" onClick={handleExportSuppliers} className="p-1 text-slate-500 hover:text-primary" title="Export to file">
                <DownloadIcon className="w-4 h-4" />
              </button>
              <input type="file" ref={fileInputRef} onChange={onFileSelected} accept=".txt" className="hidden" />
            </div>
          </div>
          <textarea
            id="supplierWebsites"
            name="supplierWebsites"
            rows={3}
            value={filters.supplierWebsites}
            onChange={handleChange}
            placeholder="Enter one website per line, e.g.&#10;webrestaurantstore.com&#10;katom.com"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading ? (
             <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
             </>
          ) : (
            <>
              <SearchIcon className="w-5 h-5 mr-2" />
              Search with AI
            </>
          )}
        </button>
      </form>
      
      <div className="border-t pt-4 mt-4">
        <button onClick={() => setIsSavedSearchesOpen(!isSavedSearchesOpen)} className="flex justify-between items-center w-full text-left py-2">
            <h3 className="text-lg font-semibold text-dark">Saved Searches</h3>
            <ChevronDownIcon className={`w-5 h-5 text-slate-500 transform transition-transform ${isSavedSearchesOpen ? '' : '-rotate-90'}`} />
        </button>
        {isSavedSearchesOpen && (
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-2">
                {savedSearches.length > 0 ? (
                    savedSearches.map(search => (
                        <div key={search.id} className="p-3 border rounded-md bg-slate-50 hover:bg-slate-100 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-sm text-slate-800 break-words">{search.name}</p>
                                    <p className="text-xs text-slate-500">{new Date(search.timestamp).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => onDeleteSearch(search.id)} className="text-slate-400 hover:text-red-500 p-1" aria-label="Delete search">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <button onClick={() => onLoadSearch(search)} className="mt-2 text-sm w-full bg-white text-primary font-semibold py-1 px-3 border border-primary/50 rounded-md hover:bg-primary/10 transition-colors">
                                Load Search
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No saved searches yet.</p>
                )}
            </div>
        )}
      </div>
    </aside>
  );
};

export default FilterSidebar;
