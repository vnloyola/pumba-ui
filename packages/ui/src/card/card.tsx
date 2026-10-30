import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, ReactElement } from "react";

export type CardProps = ComponentProps<"div"> & {
  render?: ReactElement | ((props: ComponentProps<"div">) => ReactElement);
};

function usePart(className: string, props: CardProps) {
  const { render, ref, ...rest } = props;
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: mergeProps<"div">({ className }, rest),
  });
}

function CardRoot(props: CardProps) {
  return usePart("pumba-card", props);
}

function CardHeader(props: CardProps) {
  return usePart("pumba-card-header", props);
}

function CardContent(props: CardProps) {
  return usePart("pumba-card-content", props);
}

function CardFooter(props: CardProps) {
  return usePart("pumba-card-footer", props);
}

export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
};
