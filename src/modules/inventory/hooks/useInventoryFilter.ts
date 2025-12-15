import { useState, useMemo } from 'react';
import type { FoodItem, FilterOptions } from '../types';

export const useInventoryFilter = (items: FoodItem[]) => {
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    status: 'all',
    searchQuery: '',
    sortBy: 'expiryDate',
    sortOrder: 'asc',
    attributes: [],
  });

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Category Filter
    if (filters.category && filters.category !== 'all') {
      result = result.filter((item) => item.category === filters.category);
    }

    // Status Filter
    if (filters.status && filters.status !== 'all') {
      const today = new Date();
      const threeDaysLater = new Date(
        today.getTime() + 3 * 24 * 60 * 60 * 1000,
      );

      const statusArray = Array.isArray(filters.status)
        ? filters.status
        : [filters.status];

      if (statusArray.length > 0) {
        result = result.filter((item) => {
          const expiry = new Date(item.expiryDate);

          return statusArray.some((status) => {
            switch (status) {
              case 'expired':
                return expiry < today;
              case 'expiring-soon':
                return expiry >= today && expiry <= threeDaysLater;
              case 'low-stock':
                return (
                  item.lowStockAlert && item.quantity <= item.lowStockThreshold
                );
              case 'normal':
                return (
                  expiry > threeDaysLater &&
                  (!item.lowStockAlert || item.quantity > item.lowStockThreshold)
                );
              default:
                return true;
            }
          });
        });
      }
    }

    // Search Filter
    // Attributes Filter
    if (filters.attributes && filters.attributes.length > 0) {
      result = result.filter((item) => {
        if (!item.attributes) return false;
        return filters.attributes!.some((attr) => item.attributes!.includes(attr));
      });
    }

    // Search Filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query),
      );
    }

    // Sorting
    if (filters.sortBy) {
      result.sort((a, b) => {
        let valA: string | number | boolean = a[
          filters.sortBy as keyof FoodItem
        ] as string | number | boolean;
        let valB: string | number | boolean = b[
          filters.sortBy as keyof FoodItem
        ] as string | number | boolean;

        if (
          filters.sortBy === 'expiryDate' ||
          filters.sortBy === 'purchaseDate'
        ) {
          valA = new Date(valA as string | number).getTime();
          valB = new Date(valB as string | number).getTime();
        }

        if (valA < valB) return filters.sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [items, filters]);

  const setFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      status: 'all',
      searchQuery: '',
      sortBy: 'expiryDate',
      sortOrder: 'asc',
      attributes: [],
    });
  };

  return {
    filteredItems,
    filters,
    setFilter,
    clearFilters,
  };
};
