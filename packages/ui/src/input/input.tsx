import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, ReactElement } from "react";

export type InputProps = Omit<ComponentProps<"input">, "size"> & {
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  render?: ReactElement | ((props: ComponentProps<"input">) => ReactElement);
};

export function Input(props: InputProps) {
  const { size = "md", invalid = false, render, ref, disabled, readOnly, ...rest } = props;
  const own = {
    className: "pumba-input",
    "data-size": size,
    "data-invalid": invalid ? "" : undefined,
    "data-disabled": disabled ? "" : undefined,
    "data-readonly": readOnly ? "" : undefined,
    "aria-invalid": invalid || undefined,
    disabled,
    readOnly,
  };
  return useRender({
    defaultTagName: "input",
    render,
    ref,
    props: mergeProps<"input">(own, rest),
  });
}
