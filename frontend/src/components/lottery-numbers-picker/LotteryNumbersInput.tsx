import { useRef } from "react";
import { cn } from "../../lib/utils/cn";

const LOTTERY_COUNT = 5;
const MIN_NUMBER = 1;
const MAX_NUMBER = 90;
const MAX_DIGITS = String(MAX_NUMBER).length; // 2

type TLotteryNumbersInputProps = {
  values: (number | null)[];
  onChange: (values: (number | null)[]) => void;
  readonly?: boolean;
};

function getDuplicateIndices(values: (number | null)[]): Set<number> {
  const seen = new Map<number, number>();
  const duplicates = new Set<number>();
  values.forEach((v, i) => {
    if (v === null) return;
    if (seen.has(v)) {
      duplicates.add(seen.get(v)!);
      duplicates.add(i);
    } else {
      seen.set(v, i);
    }
  });
  return duplicates;
}

export default function LotteryNumbersInput({
  values,
  onChange,
  readonly,
}: TLotteryNumbersInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const duplicateIndices = getDuplicateIndices(values);
  const hasDuplicates = duplicateIndices.size > 0;

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, MAX_DIGITS);
    const next = [...values];

    if (digits === "") {
      next[index] = null;
    } else {
      const parsed = parseInt(digits, 10);
      next[index] = Math.min(MAX_NUMBER, Math.max(MIN_NUMBER, parsed));
    }

    onChange(next);

    if (digits.length >= MAX_DIGITS && !getDuplicateIndices(next).has(index)) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="relative flex flex-col gap-1">
      <div className="flex gap-2 lg:gap-4">
        {Array.from({ length: LOTTERY_COUNT }, (_, index) => (
          <input
            readOnly={readonly}
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={values[index] ?? ""}
            onChange={(e) => handleChange(index, e.target.value)}
            className={cn(
              "drop-shadow-md w-5.5 h-6.25 text-center font-semibold text-sm rounded-[5px] focus:outline-none border lg:w-8.5 lg:h-9.5 lg:rounded-[10px]",
              duplicateIndices.has(index)
                ? "border-red-500 text-red-500 focus:border-red-500"
                : "border-[#CDEBF2]",
              readonly && "cursor-default",
            )}
          />
        ))}
      </div>
      {hasDuplicates && (
        <p className="text-red-500 text-xs font-semibold absolute -bottom-6">
          Each number must be unique.
        </p>
      )}
    </div>
  );
}
