import { formatCount } from "@/lib/format";
import { cn } from "@/lib/format";

type DropMeterProps = {
  remaining: number;
  edition: number;
  /** What one row counts, e.g. "paren in deze drop". */
  unit?: string;
  stitches?: number;
  className?: string;
};

/**
 * Stock shown as a row of knitted stitches: dark stitches are pairs still
 * available, light ones are already sold.
 */
export function DropMeter({
  remaining,
  edition,
  unit = "paren",
  stitches = 30,
  className,
}: DropMeterProps) {
  const ratio = edition > 0 ? Math.max(0, Math.min(1, remaining / edition)) : 0;
  const available = remaining > 0 ? Math.max(1, Math.round(ratio * stitches)) : 0;
  const width = stitches * 12;

  return (
    <div className={cn("space-y-2", className)}>
      <svg
        viewBox={`-2 -2 ${width + 4} 16`}
        className="h-4 w-full max-w-[22rem]"
        aria-hidden="true"
        preserveAspectRatio="xMinYMid meet"
      >
        {Array.from({ length: stitches }, (_, i) => (
          <path
            key={i}
            d={`M${i * 12 + 1} 1 Q${i * 12 + 3} 8 ${i * 12 + 6} 11 Q${i * 12 + 9} 8 ${i * 12 + 11} 1`}
            fill="none"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={i < available ? "stroke-current" : "stroke-line"}
          />
        ))}
      </svg>
      <p className="text-sm">
        {remaining > 0 ? (
          <>
            Nog <strong className="font-semibold tabular-nums">{formatCount(remaining)}</strong> van{" "}
            <span className="tabular-nums">{formatCount(edition)}</span> {unit}
          </>
        ) : (
          <>Uitverkocht. Alle {formatCount(edition)} {unit} zijn weg.</>
        )}
      </p>
    </div>
  );
}
