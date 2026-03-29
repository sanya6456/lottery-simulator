const SpacingEnum = {
  none: "0",
  xs: "pb-1 lg:pb-2",
  sm: "pb-2 lg:pb-4",
  md: "pb-4 lg:pb-6",
  lg: "pb-6 lg:pb-8",
} as const;

type TSpacingProps = {
  size?: keyof typeof SpacingEnum;
};

export default function Spacing({ size = "none" }: TSpacingProps) {
  return <div className={SpacingEnum[size]} />;
}
