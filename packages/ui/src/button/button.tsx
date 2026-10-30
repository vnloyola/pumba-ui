import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, ReactElement } from "react";

export type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  iconOnly?: boolean;
  render?: ReactElement | ((props: ComponentProps<"button">) => ReactElement);
};

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    loading = false,
    iconOnly = false,
    disabled = false,
    render,
    ref,
    onClick,
    ...rest
  } = props;
  const own = {
    className: "pumba-button",
    "data-variant": variant,
    "data-size": size,
    "data-disabled": disabled ? "" : undefined,
    "data-loading": loading ? "" : undefined,
    "data-icon-only": iconOnly ? "" : undefined,
    "aria-busy": loading || undefined,
    disabled,
    onClick: loading ? undefined : onClick,
  };
  return useRender({
    defaultTagName: "button",
    render,
    ref,
    props: mergeProps<"button">(own, rest),
  });
}
