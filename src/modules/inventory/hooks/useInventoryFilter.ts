import { useState, useMemo } from 'react';
import type { FoodItem, FilterOptions, FoodCategory, InventoryStatus } from '../types';

export const useInventoryFilter = (items: FoodItem[]) => {
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    status: 'all',
    searchQuery: '',
    sortBy: 'expiryDate',
    sortOrder: 'asc'
  });

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Category Filter
    if (filters.category && filters.category !== 'all') {
      result = result.filter(item => item.category === filters.category);
    }

    // Status Filter
    if (filters.status && filters.status !== 'all') {
      const today = new Date();
      const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
      
      result = result.filter(item => {
        const expiry = new Date(item.expiryDate);
        switch (filters.status) {
          case 'expired': return expiry < today;
          case 'expiring-soon': return expiry >= today && expiry <= threeDaysLater;
          case 'low-stock': return item.lowStockAlert && item.quantity <= item.lowStockThreshold;
          case 'normal': return expiry > threeDaysLater && (!item.lowStockAlert || item.quantity > item.lowStockThreshold);
          default: return true;
        }
      });
    }

    // Search Filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.notes?.toLowerCase().includes(query)
      );
    }

    // Sorting
    if (filters.sortBy) {
      result.sort((a, b) => {
        let valA: any = a[filters.sortBy!];
        let valB: any = b[filters.sortBy!];

        if (filters.sortBy === 'expiryDate' || filters.sortBy === 'purchaseDate') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }

        if (valA < valB) return filters.sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [items, filters]);

  const setFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      status: 'all',
      searchQuery: '',
      sortBy: 'expiryDate',
      sortOrder: 'asc'
    });
  };

  return {
    filteredItems,
    filters,
    setFilter,
    clearFilters
  };
};
