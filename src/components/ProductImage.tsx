import Image from "next/image";
import { SockMark } from "@/components/Logo";
import { cn } from "@/lib/format";

type ProductImageProps = {
  src?: string;
  alt: string;
  /** Colour of the sock drawn in the placeholder while there is no photo. */
  placeholderColor: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Hide the "Foto volgt" note on very small thumbnails. */
  showNote?: boolean;
};

/**
 * Square product tile. Shows the photo when one exists; otherwise the woolup
 * sock in the product's colour, so the grid keeps its rhythm until the real
 * photos arrive in /public/images/products/<slug>/.
 */
export function ProductImage({
  src,
  alt,
  placeholderColor,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority,
  className,
  showNote = true,
}: ProductImageProps) {
  return (
    <div className={cn("relative aspect-square overflow-hidden bg-tile", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center" role="img" aria-label={alt}>
          <SockMark
            className="h-[46%] w-auto"
            style={{
              color: placeholderColor,
              filter: isLight(placeholderColor) ? "drop-shadow(0 0 1px #8b847a)" : undefined,
            }}
          />
          {showNote && (
            <span className="absolute bottom-3 left-3 text-xs text-stone">Foto volgt</span>
          )}
        </div>
      )}
    </div>
  );
}

function isLight(hex: string): boolean {
  const value = hex.replace("#", "");
  if (value.length !== 6) return false;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0) > 0.7;
}
