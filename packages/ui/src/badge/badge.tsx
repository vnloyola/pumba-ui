import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, ReactElement } from "react";

export type BadgeProps = ComponentProps<"span"> & {
  variant?: "neutral" | "accent" | "success" | "error" | "warning";
  size?: "sm" | "md";
  render?: ReactElement | ((props: ComponentProps<"span">) => ReactElement);
};

export function Badge(props: BadgeProps) {
  const { variant = "neutral", size = "md", render, ref, ...rest } = props;
  const own = {
    className: "pumba-badge",
    "data-variant": variant,
    "data-size": size,
  };
  return useRender({
    defaultTagName: "span",
    render,
    ref,
    props: mergeProps<"span">(own, rest),
  });
}
