"use client";

/**
 * Saved items (wishlist). Stores only product ids, newest first, in
 * localStorage ("saved-v1"). Like the cart, the server and the first client
 * render see an empty list; the stored list loads after mount. Changes made in
 * another tab are picked up through the "storage" event.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { LISTING_PRODUCTS } from "../listing";

const STORAGE_KEY = "saved-v1";

const KNOWN_IDS = new Set(LISTING_PRODUCTS.map((p) => p.id));

/** Keep known product ids only, once each, in stored order. */
function sanitize(stored: unknown): string[] {
  if (!Array.isArray(stored)) return [];
  const ids: string[] = [];
  for (const id of stored) {
    if (typeof id === "string" && KNOWN_IDS.has(id) && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

function readStored(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return sanitize(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

type State = { ids: string[]; loaded: boolean };

type Action =
  | { type: "hydrate"; ids: string[] }
  | { type: "sync"; ids: string[] }
  | { type: "toggle"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate": {
      // Load once only (React may run the mount effect twice in development).
      if (state.loaded) return state;
      // Anything saved before the stored list loaded is kept.
      const early = state.ids.filter((id) => !action.ids.includes(id));
      return { ids: [...early, ...action.ids], loaded: true };
    }
    case "sync":
      return { ...state, ids: action.ids };
    case "toggle": {
      if (!KNOWN_IDS.has(action.id)) return state;
      const saved = state.ids.includes(action.id);
      return {
        ...state,
        ids: saved ? state.ids.filter((id) => id !== action.id) : [action.id, ...state.ids],
      };
    }
  }
}

type SavedContextValue = {
  /** Saved product ids, newest first. */
  ids: string[];
  /** False until the stored list has loaded (count is 0 until then). */
  loaded: boolean;
  count: number;
  isSaved: (id: string) => boolean;
  /** Saves the product, or removes it if it is already saved. Returns true when now saved. */
  toggle: (id: string) => boolean;
};

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { ids: [], loaded: false });

  useEffect(() => {
    dispatch({ type: "hydrate", ids: readStored() });
    // Another tab changed the list.
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) dispatch({ type: "sync", ids: readStored() });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Write on every change, only after loading (never overwrite the stored list with the empty one).
  useEffect(() => {
    if (!state.loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.ids));
    } catch {
      // Storage unavailable or full: the list still works for this visit.
    }
  }, [state.ids, state.loaded]);

  const isSaved = useCallback((id: string) => state.ids.includes(id), [state.ids]);

  const toggle = useCallback(
    (id: string) => {
      dispatch({ type: "toggle", id });
      return !state.ids.includes(id);
    },
    [state.ids],
  );

  const value = useMemo<SavedContextValue>(
    () => ({
      ids: state.ids,
      loaded: state.loaded,
      count: state.loaded ? state.ids.length : 0,
      isSaved,
      toggle,
    }),
    [state.ids, state.loaded, isSaved, toggle],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used inside <SavedProvider>");
  return ctx;
}
