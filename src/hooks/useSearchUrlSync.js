// src/hooks/useSearchUrlSync.js
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSearchState } from "../state/useSearchState";

export default function useSearchUrlSync() {
  const { filters, setFilters, sortBy, setSortBy, search, setSearch } = useSearchState();
  const location = useLocation();
  const navigate = useNavigate();

  // URL -> State (bei erster Ladung / wenn die URL sich ändert)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const next = {
      city: params.get("city") || "",
      type: params.get("type") || "",
      priceMin: params.get("min") || "",
      priceMax: params.get("max") || "",
    };
    const nextSort = params.get("sort") || "";
    const nextSearch = params.get("q") || "";

    // Nur setzen, wenn sich was ändert (vermeidet Render-Loops)
    const changed =
      next.city !== filters.city ||
      next.type !== filters.type ||
      next.priceMin !== filters.priceMin ||
      next.priceMax !== filters.priceMax;

    if (changed) setFilters(next);
    if (nextSort !== sortBy) setSortBy(nextSort);
    if (nextSearch !== search) setSearch(nextSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // State -> URL (wenn User was ändert)
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const setOrDelete = (key, val) => {
      if (val && String(val).trim() !== "") params.set(key, val);
      else params.delete(key);
    };

    setOrDelete("city", filters.city);
    setOrDelete("type", filters.type);
    setOrDelete("min", filters.priceMin);
    setOrDelete("max", filters.priceMax);
    setOrDelete("sort", sortBy);
    setOrDelete("q", search);

    const next = `${location.pathname}?${params.toString()}`;
    const current = `${location.pathname}${location.search}`;
    if (next !== current) navigate(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortBy, search]);
}
