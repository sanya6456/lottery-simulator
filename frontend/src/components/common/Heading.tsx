import { type HTMLAttributes, type PropsWithChildren } from "react";

type THeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type THeadingProps = {
  as?: THeadingLevel;
} & HTMLAttributes<HTMLHeadingElement>;

export default function Heading({
  as: Tag = "h1",
  children,
  className,
  ...restProps
}: PropsWithChildren<THeadingProps>) {
  return (
    <Tag
      className={`text-xl font-bold lg:text-[40px] ${className}`}
      {...restProps}
    >
      {children}
    </Tag>
  );
}
