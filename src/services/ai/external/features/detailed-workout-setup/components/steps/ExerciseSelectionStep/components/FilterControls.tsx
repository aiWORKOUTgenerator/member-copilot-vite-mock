import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { CATEGORIES, DIFFICULTIES } from '../constants';

interface FilterControlsProps {
  searchTerm: string;
  selectedCategory: string;
  selectedDifficulty: string;
  showFilters: boolean;
  onSearchChange: (term: string) => void;
  onCategoryChange: (category: string) => void;
  onDifficultyChange: (difficulty: string) => void;
  onToggleFilters: () => void;
  onClearAll: () => void;
  disabled?: boolean;
  resultCount: number;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  searchTerm,
  selectedCategory,
  selectedDifficulty,
  showFilters,
  onSearchChange,
  onCategoryChange,
  onDifficultyChange,
  onToggleFilters,
  onClearAll,
  disabled = false,
  resultCount
}) => {
  return (
    <div className="space-y-4">
      {/* Search and Filter Controls Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={disabled}
          />
        </div>

        {/* Filter Controls */}
        <div className="flex gap-2">
          <button
            onClick={onToggleFilters}
            className={`
              px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 transition-colors
              ${showFilters ? 'bg-purple-50 border-purple-200' : 'hover:bg-gray-50'}
            `}
            disabled={disabled}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={onClearAll}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={disabled}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {resultCount} exercise{resultCount !== 1 ? 's' : ''} found
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              disabled={disabled}
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => onDifficultyChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              disabled={disabled}
            >
              {DIFFICULTIES.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty === 'All' ? 'All Difficulties' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters Summary */}
          {(selectedCategory !== 'All' || selectedDifficulty !== 'All') && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Category: {selectedCategory}
                  <button
                    onClick={() => onCategoryChange('All')}
                    className="ml-1 hover:text-purple-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedDifficulty !== 'All' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Difficulty: {selectedDifficulty}
                  <button
                    onClick={() => onDifficultyChange('All')}
                    className="ml-1 hover:text-purple-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterControls; 