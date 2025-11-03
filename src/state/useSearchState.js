// src/state/useSearchState.js
import React, { createContext, useContext, useMemo, useReducer } from "react";

const initial = {
  // filtra bazë
  filters: { city: "", type: "", priceMin: "", priceMax: "" },
  sortBy: "",
  // gjendje harte
  bounds: null,          // {w,e,s,n}
  searchInArea: true,    // si Zillow: kur ndizet filtrojmë sipas bounds
  // sinkronizim liste/hartë
  activeId: null,        // listing i theksuar
  purpose: "all",        // "all" | "buy" | "rent" (opsionale)
  queryText: "",         // teksti i kërkimit (alias: "search")
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FILTERS": {
      // payload mund të jetë patch ose filters të plota
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

    default:
      return state;
  }
}

const Ctx = createContext(null);

export function SearchStateProvider({ children, initialState }) {
  const [state, dispatch] = useReducer(reducer, { ...initial, ...initialState });

  // --- setter-e tolerantë ndaj mënyrave të ndryshme të thirrjes ---
  const setFilters = (arg) => {
    if (typeof arg === "function") {
      // MapFilters: setFilters(prev => ({ ...prev, ...patch }))
      const next = arg(state.filters) || {};
      dispatch({ type: "SET_FILTERS", payload: { __replace: true, value: next } });
    } else {
      // MapWithMarkers: setFilters(patchObj)
      dispatch({ type: "SET_FILTERS", payload: arg });
    }
  };

  const setSort = (v) => dispatch({ type: "SET_SORT", payload: v });
  const setBounds = (b) => dispatch({ type: "SET_BOUNDS", payload: b });
  const setSearchInArea = (v) => dispatch({ type: "SET_INAREA", payload: v });
  const setActiveId = (id) => dispatch({ type: "SET_ACTIVE", payload: id });
  const setPurpose = (p) => dispatch({ type: "SET_PURPOSE", payload: p });
  const setQueryText = (q) => dispatch({ type: "SET_QUERY", payload: q });

  // --- API i plotë + aliase për kompatibilitet ---
  const api = useMemo(() => {
    return {
      // lexues (për MapWithMarkers):
      get: () => state,

      // shkrues (emrat e përdorur nga MapWithMarkers):
      setFilters,
      resetFilters: () => dispatch({ type: "RESET_FILTERS" }),
      setSort,
      setBounds,
      setSearchInArea,
      setActiveId,
      setPurpose,
      setQueryText,

      // vlera direkte + ALIASE (për MapFilters-in tënd ekzistues):
      filters: state.filters,
      sortBy: state.sortBy,
      bounds: state.bounds,
      searchInArea: state.searchInArea,
      activeId: state.activeId,
      purpose: state.purpose,
      queryText: state.queryText,

      // aliase “Zillow-friendly” që pret komponenti yt:
      search: state.queryText,
      setSearch: setQueryText,
      setSortBy: setSort,
    };
  }, [state]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

/** Hook: const store = useSearchState();  store.get().filters ... ose direkt store.filters */
export function useSearchState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSearchState must be used within <SearchStateProvider>");
  return ctx;
}
