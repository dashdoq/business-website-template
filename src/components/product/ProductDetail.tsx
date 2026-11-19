"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import { QuantityStepper } from "@/components/cart/CartDrawer";
import { ProductImage } from "@/components/ProductImage";
import { cn } from "@/lib/format";
import type { Cents, Color, Size } from "@/lib/types";

type ProductDetailProps = {
  slug: string;
  name: string;
  price: Cents;
  colors: Color[];
  sizes: Size[];
  images: string[];
  soldOut: boolean;
  /** Server-rendered heading, price and stock, shown above the options. */
  children: React.ReactNode;
  /** Shown under the add-to-cart button. */
  footer?: React.ReactNode;
};

export function ProductDetail({ slug, name, price, colors, sizes, images, soldOut, children, footer }: ProductDetailProps) {
  const { add } = useCart();
  const [color, setColor] = useState<Color | undefined>(colors[0]);
  const [size, setSize] = useState<Size | undefined>(sizes.length === 1 ? sizes[0] : undefined);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [sizeMissing, setSizeMissing] = useState(false);

  const addToCart = () => {
    if (!color) return;
    if (!size) {
      setSizeMissing(true);
      document.getElementById("maat-keuze")?.focus();
      return;
    }
    add({ slug, name, price, color: color.slug, colorName: color.name, colorHex: color.hex, size, quantity });
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:gap-14">
      <div className="space-y-3">
        <ProductImage
          src={images[activeImage]}
          alt={`${name} in ${color?.name ?? ""}`}
          placeholderColor={color?.hex ?? "#000"}
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
        />
        {images.length > 1 && (
          <ul className="grid grid-cols-5 gap-2" aria-label="Foto's">
            {images.map((src, index) => (
              <li key={src}>
                <button
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Foto ${index + 1}`}
                  aria-pressed={index === activeImage}
                  className={cn("block w-full border", index === activeImage ? "border-ink" : "border-transparent")}
                >
                  <ProductImage src={src} alt="" placeholderColor={color?.hex ?? "#000"} sizes="10vw" showNote={false} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-7">
        {children}

        <fieldset className="space-y-3">
          <legend className="mb-3 text-sm">
            Kleur: <span className="font-semibold">{color?.name}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((option) => (
              <label
                key={option.slug}
                title={option.name}
                className={cn(
                  "grid size-12 cursor-pointer place-items-center rounded-full border has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
                  color?.slug === option.slug ? "border-ink" : "border-transparent hover:border-line",
                )}
              >
                <input
                  type="radio"
                  name="kleur"
                  value={option.slug}
                  checked={color?.slug === option.slug}
                  onChange={() => setColor(option)}
                  className="sr-only"
                />
                <span className="block size-9 rounded-full border border-ink/15" style={{ backgroundColor: option.hex }} />
                <span className="sr-only">{option.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset aria-describedby={sizeMissing ? "maat-fout" : undefined}>
          <div className="mb-3 flex items-baseline justify-between">
            <legend className="text-sm">
              Maat{size && <>: <span className="font-semibold">{size}</span></>}
            </legend>
            <a href="#maattabel" className="link text-sm">
              Maattabel
            </a>
          </div>
          <div id="maat-keuze" tabIndex={-1} className="grid grid-cols-3 gap-2 outline-none">
            {sizes.map((option) => (
              <label
                key={option}
                className={cn(
                  "grid min-h-12 cursor-pointer place-items-center rounded-sm border text-base tabular-nums has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
                  size === option ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
                  soldOut && "pointer-events-none text-stone",
                )}
              >
                <input
                  type="radio"
                  name="maat"
                  value={option}
                  checked={size === option}
                  disabled={soldOut}
                  onChange={() => {
                    setSize(option);
                    setSizeMissing(false);
                  }}
                  className="sr-only"
                />
                {option}
              </label>
            ))}
          </div>
          {sizeMissing && (
            <p id="maat-fout" role="alert" className="mt-2 text-sm font-semibold">
              Kies eerst je maat.
            </p>
          )}
        </fieldset>

        <div className="flex gap-3">
          {!soldOut && <QuantityStepper value={quantity} label={name} min={1} onChange={setQuantity} />}
          <button type="button" onClick={addToCart} disabled={soldOut} className="btn-primary flex-1">
            {soldOut ? "Uitverkocht" : "In winkelmand"}
          </button>
        </div>
        {soldOut && (
          <p className="text-sm text-stone">
            Deze drop is op. Schrijf je in voor de nieuwsbrief om te horen wanneer {name} terugkomt.
          </p>
        )}
        {footer}
      </div>
    </div>
  );
}
