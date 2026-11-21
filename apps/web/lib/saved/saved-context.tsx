"use client";

/**
 * Saved items (spec 014). The list lives in the database (SavedItem). The root
 * layout loads the user's saved product ids on the server and passes them in;
 * toggles update the screen at once and are saved by a server action. Logged-out
 * users who press a heart go to /login?next=<the product page>.
 */
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { productPageHref } from "../catalog/format";
import { setProductSaved } from "./actions";

type SavedContextValue = {
  /** Saved product ids, newest first. */
  ids: string[];
  /** Always true: the list comes with the page. Kept for the header badge. */
  loaded: boolean;
  count: number;
  isSaved: (id: string) => boolean;
  /** Saves the product, or removes it if it is already saved. Returns true when now saved. */
  toggle: (id: string) => boolean;
  /** Saves (never un-saves) the product. Used by the cart's "Save" button. */
  save: (id: string) => Promise<boolean>;
};

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({
  initialIds,
  loggedIn,
  children,
}: {
  initialIds: string[];
  loggedIn: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [ids, setIds] = useState(initialIds);
  // Follow the server's list when it changes (login, logout, another tab after navigation).
  const [seen, setSeen] = useState(initialIds);
  if (seen !== initialIds) {
    setSeen(initialIds);
    setIds(initialIds);
  }
  const [, startTransition] = useTransition();

  const goToLogin = useCallback(
    (id: string) => router.push(`/login?next=${encodeURIComponent(productPageHref(id))}`),
    [router],
  );

  const persist = useCallback(
    async (id: string, saved: boolean): Promise<boolean> => {
      const result = await setProductSaved(id, saved).catch(() => null);
      if (!result || !result.ok) {
        // Put the heart back the way it was.
        setIds((list) => (saved ? list.filter((x) => x !== id) : list.includes(id) ? list : [id, ...list]));
        if (result && !result.ok && result.reason === "login") goToLogin(id);
        return false;
      }
      return result.saved;
    },
    [goToLogin],
  );

  const toggle = useCallback(
    (id: string) => {
      if (!loggedIn) {
        goToLogin(id);
        return false;
      }
      const saved = !ids.includes(id);
      setIds((list) => (saved ? [id, ...list.filter((x) => x !== id)] : list.filter((x) => x !== id)));
      startTransition(async () => {
        await persist(id, saved);
      });
      return saved;
    },
    [ids, loggedIn, goToLogin, persist],
  );

  const save = useCallback(
    async (id: string) => {
      if (!loggedIn) {
        goToLogin(id);
        return false;
      }
      setIds((list) => [id, ...list.filter((x) => x !== id)]);
      return persist(id, true);
    },
    [loggedIn, goToLogin, persist],
  );

  const value = useMemo<SavedContextValue>(
    () => ({
      ids,
      loaded: true,
      count: ids.length,
      isSaved: (id) => ids.includes(id),
      toggle,
      save,
    }),
    [ids, toggle, save],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used inside <SavedProvider>");
  return ctx;
}
