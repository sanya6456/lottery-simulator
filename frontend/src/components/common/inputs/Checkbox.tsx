import { cn } from "../../../lib/utils/cn";

type TCheckboxSize = "md";

type TCheckboxProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: TCheckboxSize;
};

const sizeStyles: Record<TCheckboxSize, { box: string; icon: string }> = {
  md: {
    box: "w-5 h-5 rounded-[5px] lg:w-8 lg:h-8",
    icon: "w-3 h-3 lg:w-5 lg:h-5",
  },
};

export default function Checkbox({
  checked = false,
  onChange,
  size = "md",
}: TCheckboxProps) {
  const { box, icon } = sizeStyles[size];

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "cursor-pointer flex items-center justify-center border focus:outline-none disabled:cursor-not-allowed",
        box,
      )}
    >
      {checked && (
        <img
          src="/assets/thick.png"
          alt=""
          aria-hidden="true"
          className={icon}
        />
      )}
    </button>
  );
}
