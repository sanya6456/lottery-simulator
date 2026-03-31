import "./range-input.css";

type TRangeInputProps = {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  onChangeCommitted?: (value: number) => void;
  id?: string;
};

export default function RangeInput({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  onChangeCommitted,
  id,
}: TRangeInputProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative flex items-center">
      <div className="absolute inset-0 flex items-center pointer-events-none">
        <div className="absolute w-full h-1 rounded-full bg-[#E9F5F1]" />
        <div
          className="absolute h-2.25 rounded-full bg-primary lg:h-2.5"
          style={{ width: `${percent}%` }}
        />
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-input w-full relative appearance-none h-2.25 bg-transparent outline-none cursor-pointer lg:h-2.5"
        onPointerUp={(e) =>
          onChangeCommitted?.(Number((e.target as HTMLInputElement).value))
        }
        onTouchEnd={(e) =>
          onChangeCommitted?.(Number((e.target as HTMLInputElement).value))
        }
      />
    </div>
  );
}
