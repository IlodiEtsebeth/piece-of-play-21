import { Minus, Plus } from "lucide-react";
import { CART_MAX_QTY } from "@/lib/cart";

export function QuantityPicker({
  value,
  onChange,
  label = "Quantity",
}: {
  value: number;
  onChange: (n: number) => void;
  label?: string;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-background" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-blush disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(CART_MAX_QTY, value + 1))}
        disabled={value >= CART_MAX_QTY}
        className="h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-blush disabled:opacity-40"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
