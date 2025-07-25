import { useState, useMemo, useCallback } from 'react';
import { EXERCISE_DATABASE, CATEGORIES } from '../constants';
import type { Exercise } from '../types';

interface UseExerciseFilteringReturn {
  // Filtered results
  filteredExercises: Exercise[];
  availableExercises: Exercise[];
  
  // Filter state
  searchTerm: string;
  selectedCategory: string;
  showFilters: boolean;
  
  // Filter controls
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  toggleFilters: () => void;
  resetFilters: () => void;
  
  // Computed properties
  totalExercises: number;
  hasActiveFilters: boolean;
}

export const useExerciseFiltering = (
  availableEquipment: string[] = []
): UseExerciseFilteringReturn => {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Equipment-based filtering (most restrictive filter first)
  const availableExercises = useMemo(() => {
    return EXERCISE_DATABASE.filter(exercise => {
      // Bodyweight exercises are always available
      if (exercise.equipment.length === 0) return true;
      
      // If no equipment specified, show all exercises
      if (!availableEquipment || availableEquipment.length === 0) return true;
      
      // Check if at least one required equipment piece is available
      return exercise.equipment.some(eq => availableEquipment.includes(eq));
    });
  }, [availableEquipment]);

  // Search filtering with debouncing
  const searchFilteredExercises = useMemo(() => {
    if (!searchTerm.trim()) return availableExercises;
    
    const term = searchTerm.toLowerCase();
    return availableExercises.filter(exercise => 
      exercise.name.toLowerCase().includes(term) ||
      exercise.description.toLowerCase().includes(term) ||
      exercise.category.toLowerCase().includes(term) ||
      exercise.primaryMuscles.some(muscle => muscle.toLowerCase().includes(term)) ||
      exercise.equipment.some(eq => eq.toLowerCase().includes(term))
    );
  }, [availableExercises, searchTerm]);

  // Category filtering
  const filteredExercises = useMemo(() => {
    if (selectedCategory === 'All') return searchFilteredExercises;
    
    return searchFilteredExercises.filter(exercise => 
      exercise.category === selectedCategory
    );
  }, [searchFilteredExercises, selectedCategory]);

  // Computed properties
  const hasActiveFilters = useMemo(() => {
    return searchTerm.trim() !== '' || selectedCategory !== 'All';
  }, [searchTerm, selectedCategory]);

  // Filter controls
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('All');
  }, []);

  // Optimized search handler with debouncing
  const debouncedSetSearchTerm = useCallback((term: string) => {
    // In a real implementation, you might want to add debouncing here
    // For now, we'll just set it directly
    setSearchTerm(term);
  }, []);

  return {
    // Filtered results
    filteredExercises,
    availableExercises,
    
    // Filter state
    searchTerm,
    selectedCategory,
    showFilters,
    
    // Filter controls
    setSearchTerm: debouncedSetSearchTerm,
    setSelectedCategory,
    toggleFilters,
    resetFilters,
    
    // Computed properties
    totalExercises: EXERCISE_DATABASE.length,
    hasActiveFilters
  };
}; 