import { useState, useEffect } from "react";

/**
 * Debounce a value — useful for search inputs
 * @param {*} value
 * @param {number} delay - ms (default 400)
 * @returns debounced value
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
