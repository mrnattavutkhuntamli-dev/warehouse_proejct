import { useState, useCallback } from "react";
import { useDebounce } from "./useDebounce";

/**
 * useTableParams — shared state for paginated tables
 *
 * Returns params object ready to spread into query hooks:
 *   { page, limit, search, filters, sort, ...handlers }
 *
 * @param {object} defaults
 */
export function useTableParams(defaults = {}) {
  const [page, setPage]       = useState(defaults.page  ?? 1);
  const [limit, setLimit]     = useState(defaults.limit ?? 20);
  const [search, setSearch]   = useState(defaults.search ?? "");
  const [filters, setFilters] = useState(defaults.filters ?? {});
  const [sort, setSort]       = useState(defaults.sort ?? {});

  const debouncedSearch = useDebounce(search, 400);

  // When search changes, reset to page 1
  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value === "" || value === null || value === undefined) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
    setPage(1);
  }, []);

  const handleSort = useCallback((field, direction = "asc") => {
    setSort({ field, direction });
  }, []);

  const resetParams = useCallback(() => {
    setPage(defaults.page ?? 1);
    setSearch(defaults.search ?? "");
    setFilters(defaults.filters ?? {});
    setSort(defaults.sort ?? {});
  }, [defaults]);

  // Build query params object
  const queryParams = {
    page,
    limit,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...filters,
    ...(sort.field ? { sortBy: sort.field, sortDir: sort.direction } : {}),
  };

  return {
    // State
    page, limit, search, filters, sort,
    debouncedSearch,
    queryParams,
    // Setters
    setPage, setLimit,
    handleSearch,
    handleFilter,
    handleSort,
    resetParams,
  };
}
