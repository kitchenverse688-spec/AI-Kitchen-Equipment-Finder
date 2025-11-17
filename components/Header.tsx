
import React from 'react';
import { Tab } from '../types';
import { SearchIcon, CompareIcon, HeartIcon } from './icons';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  compareCount: number;
  favoritesCount: number;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, compareCount, favoritesCount }) => {
  const tabs = [
    { id: Tab.Search, label: 'Search', icon: <SearchIcon className="w-5 h-5" /> },
    { id: Tab.Compare, label: 'Compare', icon: <CompareIcon className="w-5 h-5" />, count: compareCount },
    { id: Tab.Favorites, label: 'Favorites', icon: <HeartIcon className="w-5 h-5" />, count: favoritesCount },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H4a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9l-7-7z"/><path d="M13 3.5V9h5.5L13 3.5z"/><path fill-rule="evenodd" d="M8 11a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1zm1 4a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9z" clip-rule="evenodd"/></svg>
            <h1 className="text-xl sm:text-2xl font-bold text-dark">AI Equipment Finder</h1>
          </div>
          <nav className="flex space-x-2 sm:space-x-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 relative
                  ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-slate-200/50'}
                `}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-accent rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
