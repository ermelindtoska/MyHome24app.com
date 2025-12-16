// src/state/useSearchState.js
import React, { createContext, useContext, useMemo, useReducer, useCallback } from "react";

const initial = {
  // Filter
  filters: { city: "", type: "", priceMin: "", priceMax: "" },
  sortBy: "",

  // Map
  bounds: null,          // { w, e, s, n }
  searchInArea: true,

  // UI sync
  activeId: null,
  purpose: "all",        // "all" | "buy" | "rent"
  queryText: "",

  // (optional) wenn du später global Listings/Visible halten willst
  listings: [],
  visibleListings: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FILTERS": {
      const patch = action.payload || {};
      const next =
        patch && patch.__replace === true
          ? { ...patch.value }
          : { ...state.filters, ...patch };
      return { ...state, filters: next };
    }

    case "RESET_FILTERS":
      return { ...state, filters: initial.filters, sortBy: "" };

    case "SET_SORT":
      return { ...state, sortBy: action.payload || "" };

    case "SET_BOUNDS":
      return { ...state, bounds: action.payload || null };

    case "SET_INAREA":
      return { ...state, searchInArea: !!action.payload };

    case "SET_ACTIVE":
      return { ...state, activeId: action.payload ?? null };

    case "SET_PURPOSE":
      return { ...state, purpose: action.payload || "all" };

    case "SET_QUERY":
      return { ...state, queryText: action.payload || "" };

    case "SET_LISTINGS":
      return { ...state, listings: Array.isArray(action.payload) ? action.payload : [] };

    case "SET_VISIBLE":
      return { ...state, visibleListings: Array.isArray(action.payload) ? action.payload : [] };

    default:
      return state;
  }
}

const Ctx = createContext(null);

export function SearchStateProvider({ children, initialState }) {
  const [state, dispatch] = useReducer(reducer, { ...initial, ...initialState });

  // tolerant setters (kompatibel me stile të ndryshme thirrjesh)
  const setFilters = useCallback(
    (arg) => {
      if (typeof arg === "function") {
        const next = arg(state.filters) || {};
        dispatch({ type: "SET_FILTERS", payload: { __replace: true, value: next } });
      } else {
        dispatch({ type: "SET_FILTERS", payload: arg });
      }
    },
    [state.filters]
  );

  const api = useMemo(() => {
    const setSort = (v) => dispatch({ type: "SET_SORT", payload: v });
    const setBounds = (b) => dispatch({ type: "SET_BOUNDS", payload: b });
    const setSearchInArea = (v) => dispatch({ type: "SET_INAREA", payload: v });
    const setActiveId = (id) => dispatch({ type: "SET_ACTIVE", payload: id });
    const setPurpose = (p) => dispatch({ type: "SET_PURPOSE", payload: p });
    const setQueryText = (q) => dispatch({ type: "SET_QUERY", payload: q });

    const setListings = (arr) => dispatch({ type: "SET_LISTINGS", payload: arr });
    const setVisibleListings = (arr) => dispatch({ type: "SET_VISIBLE", payload: arr });

    return {
      // reader (për MapWithMarkers / MapPage)
      get: () => state,

      // writers (për komponentët e tu)
      setFilters,
      resetFilters: () => dispatch({ type: "RESET_FILTERS" }),
      setSort,
      setBounds,
      setSearchInArea,
      setActiveId,
      setPurpose,
      setQueryText,

      // optional global lists
      setListings,
      setVisibleListings,

      // values direct
      filters: state.filters,
      sortBy: state.sortBy,
      bounds: state.bounds,
      searchInArea: state.searchInArea,
      activeId: state.activeId,
      purpose: state.purpose,
      queryText: state.queryText,
      listings: state.listings,
      visibleListings: state.visibleListings,

      // aliases (për kompatibilitet me emra të vjetër)
      search: state.queryText,
      setSearch: setQueryText,
      setSortBy: setSort,
    };
  }, [state, setFilters]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useSearchState(selector) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSearchState must be used within <SearchStateProvider>");

  // optional selector pattern: useSearchState(s => ({...}))
  if (typeof selector === "function") return selector(ctx.get());
  return ctx;
}
