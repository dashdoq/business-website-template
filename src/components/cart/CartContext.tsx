"use client";

// Client-side basket, kept in localStorage until checkout and payments are
// connected to the Hostinger backend.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Cents, ColorSlug, Size } from "@/lib/types";

export type CartLine = {
  slug: string;
  name: string;
  price: Cents;
  color: ColorSlug;
  colorName: string;
  colorHex: string;
  size: Size;
  quantity: number;
};

type AddInput = Omit<CartLine, "quantity"> & { quantity?: number };

type CartState = {
  lines: CartLine[];
  count: number;
  subtotal: Cents;
  isOpen: boolean;
};

type CartActions = {
  add: (line: AddInput) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  open: () => void;
  close: () => void;
};

const STORAGE_KEY = "woolup.cart.v1";
const MAX_PER_LINE = 10;

export const lineKey = (line: Pick<CartLine, "slug" | "color" | "size">) =>
  `${line.slug}|${line.color}|${line.size}`;

const CartContext = createContext<(CartState & CartActions) | null>(null);

function readStoredLines(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isCartLine) : [];
  } catch {
    return [];
  }
}

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.slug === "string" &&
    typeof v.name === "string" &&
    typeof v.price === "number" &&
    typeof v.size === "string" &&
    typeof v.color === "string" &&
    typeof v.colorName === "string" &&
    typeof v.colorHex === "string" &&
    typeof v.quantity === "number"
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(readStoredLines());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage can be unavailable (private mode); the basket still works for this visit.
    }
  }, [lines, hydrated]);

  const add = useCallback((input: AddInput) => {
    const quantity = input.quantity ?? 1;
    setLines((current) => {
      const key = lineKey(input);
      const existing = current.find((l) => lineKey(l) === key);
      if (existing) {
        return current.map((l) =>
          lineKey(l) === key
            ? { ...l, quantity: Math.min(MAX_PER_LINE, l.quantity + quantity) }
            : l,
        );
      }
      return [...current, { ...input, quantity: Math.min(MAX_PER_LINE, quantity) }];
    });
    setIsOpen(true);
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((l) => lineKey(l) !== key)
        : current.map((l) =>
            lineKey(l) === key ? { ...l, quantity: Math.min(MAX_PER_LINE, quantity) } : l,
          ),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setLines((current) => current.filter((l) => lineKey(l) !== key));
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      isOpen,
      add,
      setQuantity,
      remove,
      open,
      close,
    }),
    [lines, isOpen, add, setQuantity, remove, open, close],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart moet binnen <CartProvider> gebruikt worden");
  return context;
}

export const CART_MAX_PER_LINE = MAX_PER_LINE;
