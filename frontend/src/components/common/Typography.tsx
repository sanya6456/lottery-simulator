import React from "react";
import { cn } from "../../lib/utils/cn";

type ElementType = React.ElementType;

type PolymorphicProps<C extends ElementType, Props = unknown> = Props & {
  as?: C;
} & Omit<React.ComponentPropsWithoutRef<C>, keyof Props | "as">;

type TypographyProps<C extends ElementType> = PolymorphicProps<
  C,
  {
    variant?: "p";
    className?: string;
  }
>;

const VARIANT_CLASSES = {
  p: "font-semibold text-xs lg:text-sm lg:font-normal",
};

export const Typography = <C extends ElementType = "p">(
  props: TypographyProps<C>,
) => {
  const { as, variant = "p", className, ...rest } = props;

  const Tag = as || "p";

  return <Tag className={cn(VARIANT_CLASSES[variant], className)} {...rest} />;
};
