import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { ComponentProps, ReactElement } from "react";

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
type TabsTabProps = ComponentProps<"button"> & { value: string; render?: Render<"button"> };
type TabsPanelProps = ComponentProps<"div"> & { value: string; render?: Render<"div"> };

const join = (own: string, className?: string) => (className ? `${own} ${className}` : own);

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

function TabsList({ className, children, ...rest }: TabsListProps) {
  return (
    <BaseTabs.List className={join("pumba-tabs-list", className)} {...rest}>
      {children}
      <BaseTabs.Indicator className="pumba-tabs-indicator" />
    </BaseTabs.List>
  );
}

function TabsTab({ className, render, ...rest }: TabsTabProps) {
  return (
    <BaseTabs.Tab
      className={join("pumba-tabs-tab", className)}
      nativeButton={!render}
      render={render}
      {...rest}
    />
  );
}

function TabsPanel({ className, ...rest }: TabsPanelProps) {
  return <BaseTabs.Panel className={join("pumba-tabs-panel", className)} {...rest} />;
}

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Tab: TabsTab,
  Panel: TabsPanel,
};
