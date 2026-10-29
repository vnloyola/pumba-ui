import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, ReactElement } from "react";

export type __Name__Props = ComponentProps<"div"> & {
  variant?: "default";
  size?: "sm" | "md" | "lg";
  render?: ReactElement | ((props: ComponentProps<"div">) => ReactElement);
};

// TODO: replace the native element, the variants and the default size.
export function __Name__(props: __Name__Props) {
  const { variant = "default", size = "md", render, ref, ...rest } = props;
  const own = {
    className: "pumba-__name__",
    "data-variant": variant,
    "data-size": size,
  };
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: mergeProps<"div">(own, rest),
  });
}
