import { useState } from "react";
import LotteryNumbersInput from "./LotteryNumbersInput";

const DEFAULT_VALUES: (number | null)[] = Array(5).fill(null);

type TLotteryNumbersPickerProps = {
  label?: string;
  value?: (number | null)[];
  onChange?: (values: (number | null)[]) => void;
  readonly?: boolean;
};

export default function LotteryNumbersPicker({
  label,
  value: controlledValue,
  onChange,
  readonly = false,
}: TLotteryNumbersPickerProps) {
  const [internalValues, setInternalValues] =
    useState<(number | null)[]>(DEFAULT_VALUES);

  const isControlled = controlledValue !== undefined;
  const values = isControlled ? controlledValue : internalValues;

  const handleChange = (newValues: (number | null)[]) => {
    if (!isControlled) setInternalValues(newValues);
    onChange?.(newValues);
  };

  return (
    <>
      {label && (
        <p className="my-auto font-bold text-xs lg:text-sm lg:font-normal">
          {label}
        </p>
      )}
      <LotteryNumbersInput
        values={values}
        onChange={handleChange}
        readonly={readonly}
      />
    </>
  );
}
