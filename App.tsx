
import React, { useState, useEffect } from 'react';
import { Product, FilterState, Tab, GroundingChunk, SavedSearch } from './types';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import SearchResults from './components/SearchResults';
import ComparisonView from './components/ComparisonView';
import FavoritesView from './components/FavoritesView';
import ChatAssistant from './components/ChatAssistant';
import Loader from './components/Loader';
import { searchEquipment } from './services/geminiService';

const initialFilters: FilterState = {
  keyword: 'Combi Oven', brand: '', model: '', category: 'Cooking',
  countries: ['Saudi Arabia', 'UAE'], priceMin: '', priceMax: '', condition: 'New',
  currency: 'USD',
  supplierWebsites: '',
  itemsPerPage: 20,
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Search);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [products, setProducts] = useState<Product[]>([]);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [favoritesList, setFavoritesList] = useState<Product[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const executeSearch = async (filtersToUse: FilterState) => {
    setIsLoading(true);
    setError(null);
    setProducts([]);
    setGroundingChunks([]);
    try {
      const { products: newProducts, groundingChunks: newChunks } = await searchEquipment(filtersToUse);
      setProducts(newProducts);
      setGroundingChunks(newChunks);
      if (newProducts.length === 0) {
          setError("No products found matching your criteria. Try broadening your search.");
      }
    } catch (err) {
      setError('An error occurred during the search. Please try again.');
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('equipment_favorites');
      if (savedFavorites) setFavoritesList(JSON.parse(savedFavorites));
      
      const savedSearchesData = localStorage.getItem('equipment_saved_searches');
      if (savedSearchesData) setSavedSearches(JSON.parse(savedSearchesData));
    } catch (e) {
      console.error("Failed to parse data from localStorage", e);
    }
    executeSearch(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('equipment_favorites', JSON.stringify(favoritesList));
  }, [favoritesList]);
  
  useEffect(() => {
    localStorage.setItem('equipment_saved_searches', JSON.stringify(savedSearches));
  }, [savedSearches]);

  const handleSearch = () => {
    executeSearch(filters);
  };

  const handleSaveSearch = (name: string) => {
    const newSearch: SavedSearch = {
      id: `search_${Date.now()}`,
      name,
      filters,
      timestamp: Date.now(),
    };
    setSavedSearches(prev => [newSearch, ...prev]);
  };
  
  const handleLoadSearch = (searchToLoad: SavedSearch) => {
    setActiveTab(Tab.Search);
    setFilters(searchToLoad.filters);
    executeSearch(searchToLoad.filters);
  };

  const handleDeleteSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id));
  };

  const handleToggleCompare = (product: Product) => {
    setCompareList(prev =>
      prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  };

  const handleToggleFavorite = (product: Product) => {
    setFavoritesList(prev =>
      prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Compare:
        return <ComparisonView products={compareList} onRemove={handleToggleCompare} />;
      case Tab.Favorites:
        return <FavoritesView favorites={favoritesList} onFavorite={handleToggleFavorite} onCompare={handleToggleCompare} compareList={compareList} />;
      case Tab.Search:
      default:
        return (
          <div className="flex flex-col md:flex-row gap-8">
            <FilterSidebar 
                filters={filters} 
                onFilterChange={setFilters} 
                onSearch={handleSearch} 
                isLoading={isLoading}
                savedSearches={savedSearches}
                onLoadSearch={handleLoadSearch}
                onDeleteSearch={handleDeleteSearch}
            />
            <main className="flex-1 min-w-0">
              {isLoading && <div className="flex justify-center items-center h-96"><Loader /></div>}
              {error && !isLoading && <div className="text-center p-8 bg-white rounded-lg shadow-md text-red-600">{error}</div>}
              {!isLoading && !error && (
                <SearchResults
                  products={products}
                  groundingChunks={groundingChunks}
                  onCompare={handleToggleCompare}
                  onFavorite={handleToggleFavorite}
                  compareList={compareList}
                  favoritesList={favoritesList}
                  localCurrency={filters.currency}
                  onSaveSearch={handleSaveSearch}
                />
              )}
            </main>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        compareCount={compareList.length}
        favoritesCount={favoritesList.length}
      />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </div>
      <ChatAssistant />
    </div>
  );
};

export default App;
