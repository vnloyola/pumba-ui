import type { ComponentProps } from "react";
import { CheckIcon } from "../icons.js";

export type PlaceholderProps = ComponentProps<"span">;

// TODO: delete when the first real component lands.
export function Placeholder({ className, children, ...rest }: PlaceholderProps) {
  return (
    <span className={className ? `pumba-placeholder ${className}` : "pumba-placeholder"} {...rest}>
      <CheckIcon aria-hidden="true" size={16} />
      {children}
    </span>
  );
}
