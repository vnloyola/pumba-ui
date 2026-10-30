import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { type ComponentProps, type ReactElement, type ReactNode, type Ref, useRef } from "react";

type Render<Tag extends "div" | "button" | "h2" | "p"> =
  | ReactElement
  | ((props: ComponentProps<Tag>) => ReactElement);

export type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};

type ButtonPartProps = ComponentProps<"button"> & {
  nativeButton?: boolean;
  render?: Render<"button">;
};

type DialogTriggerProps = ButtonPartProps;
type DialogContentProps = ComponentProps<"div"> & {
  container?: HTMLElement | null;
  render?: Render<"div">;
};
type DialogTitleProps = ComponentProps<"h2"> & { render?: Render<"h2"> };
type DialogDescriptionProps = ComponentProps<"p"> & { render?: Render<"p"> };
type DialogCloseProps = ButtonPartProps;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const setRefs =
  <T,>(...refs: Array<Ref<T> | undefined>) =>
  (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }
  };

const join = (own: string, className?: string) => (className ? `${own} ${className}` : own);

function DialogRoot({ onOpenChange, ...rest }: DialogProps) {
  return <BaseDialog.Root onOpenChange={(open) => onOpenChange?.(open)} {...rest} />;
}

function DialogTrigger({ className, ...rest }: DialogTriggerProps) {
  return <BaseDialog.Trigger className={join("pumba-dialog-trigger", className)} {...rest} />;
}

function DialogContent({ className, container, children, ref, ...rest }: DialogContentProps) {
  const popup = useRef<HTMLDivElement>(null);
  return (
    <BaseDialog.Portal container={container}>
      <BaseDialog.Backdrop className="pumba-dialog-backdrop" />
      <BaseDialog.Popup
        className={join("pumba-dialog", className)}
        ref={setRefs(ref, popup)}
        initialFocus={() => {
          const first = popup.current?.querySelector<HTMLElement>(FOCUSABLE);
          (first ?? popup.current)?.focus({ preventScroll: true });
          return false;
        }}
        {...rest}
      >
        <div className="pumba-dialog-body">{children}</div>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

function DialogTitle({ className, ...rest }: DialogTitleProps) {
  return <BaseDialog.Title className={join("pumba-dialog-title", className)} {...rest} />;
}

function DialogDescription({ className, ...rest }: DialogDescriptionProps) {
  return (
    <BaseDialog.Description className={join("pumba-dialog-description", className)} {...rest} />
  );
}

function DialogClose({ className, ...rest }: DialogCloseProps) {
  return <BaseDialog.Close className={join("pumba-dialog-close", className)} {...rest} />;
}

export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
};
