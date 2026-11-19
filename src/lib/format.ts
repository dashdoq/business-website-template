import type { Cents } from "@/lib/types";

const euro = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

const wholeEuro = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const count = new Intl.NumberFormat("nl-NL");

/** €19,95 stays €19,95; round amounts drop the cents, so €50 not €50,00. */
export function formatPrice(cents: Cents): string {
  return cents % 100 === 0 ? wholeEuro.format(cents / 100) : euro.format(cents / 100);
}

export function formatCount(n: number): string {
  return count.format(n);
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
