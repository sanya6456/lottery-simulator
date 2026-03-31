import { useState } from "react";
import LotteryNumbersInput from "./LotteryNumbersInput";
import { Typography } from "../common/Typography";

const DEFAULT_VALUES: (number | null)[] = Array(5).fill(null);

type TLotteryNumbersPickerProps = {
  label?: string;
  value?: (number | null)[];
  onChange?: (values: (number | null)[]) => void;
  readonly?: boolean;
  isValid?: boolean;
  errorMessage?: string;
};

export default function LotteryNumbersPicker({
  label,
  value: controlledValue,
  onChange,
  isValid = true,
  ...restProps
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
        <Typography className="my-auto" as="label" htmlFor={label}>
          {label}
        </Typography>
      )}
      <LotteryNumbersInput
        id={label}
        values={values}
        onChange={handleChange}
        isValid={isValid}
        {...restProps}
      />
    </>
  );
}
