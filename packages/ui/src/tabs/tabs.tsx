"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import {
  type ComponentProps,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type Render<Tag extends "div" | "button"> =
  | ReactElement
  | ((props: ComponentProps<Tag>) => ReactElement);

export type TabsProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  render?: Render<"div">;
};

type TabsListProps = ComponentProps<"div"> & { render?: Render<"div"> };
type TabsTabProps = ComponentProps<"button"> & {
  value: string;
  nativeButton?: boolean;
  render?: Render<"button">;
};
type TabsPanelProps = ComponentProps<"div"> & {
  value: string;
  keepMounted?: boolean;
  render?: Render<"div">;
};

const join = (own: string, className?: string) => (className ? `${own} ${className}` : own);

const setRefs =
  <T,>(...refs: Array<Ref<T> | undefined>) =>
  (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }
  };

function TabsRoot({ className, onValueChange, ...rest }: TabsProps) {
  return (
    <BaseTabs.Root
      className={join("pumba-tabs", className)}
      onValueChange={(value) => {
        if (typeof value === "string") onValueChange?.(value);
      }}
      {...rest}
    />
  );
}

function TabsList({ className, children, ref, render, ...rest }: TabsListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");

  useLayoutEffect(() => {
    const list = listRef.current;
    const nextDirection = list && getComputedStyle(list).direction === "rtl" ? "rtl" : "ltr";
    if (nextDirection !== direction) setDirection(nextDirection);
  });

  const indicator = <BaseTabs.Indicator className="pumba-tabs-indicator" />;
  const listRender =
    isValidElement<{ children?: ReactNode }>(render) && Object.hasOwn(render.props, "children")
      ? cloneElement(render, {}, render.props.children, indicator)
      : render;

  return (
    <DirectionProvider direction={direction}>
      <BaseTabs.List
        className={join("pumba-tabs-list", className)}
        ref={setRefs(listRef, ref)}
        render={listRender}
        {...rest}
        data-pumba-dir={direction === "rtl" ? direction : undefined}
      >
        {children}
        {indicator}
      </BaseTabs.List>
    </DirectionProvider>
  );
}

function TabsTab({ className, ...rest }: TabsTabProps) {
  return <BaseTabs.Tab className={join("pumba-tabs-tab", className)} {...rest} />;
}

function TabsPanel({ className, ...rest }: TabsPanelProps) {
  return <BaseTabs.Panel className={join("pumba-tabs-panel", className)} {...rest} />;
}

export { TabsList, TabsPanel, TabsRoot, TabsTab };
