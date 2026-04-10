import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between gap-2",
      "rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)]",
      "px-3 text-sm text-[var(--color-text-primary)]",
      "placeholder:text-[var(--color-text-muted)]",
      "transition-colors duration-150",
      "focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      "data-[placeholder]:text-[var(--color-text-muted)]",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      sideOffset={4}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden",
        "rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]",
        "shadow-[0_8px_30px_rgb(0_0_0_/_0.5)]",
        "data-[state=open]:animate-fade-in",
        position === "popper" && "w-[var(--radix-select-trigger-width)]",
        className
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-[var(--color-text-muted)]", className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center",
      "rounded-md py-2 pl-8 pr-3 text-sm",
      "text-[var(--color-text-secondary)]",
      "outline-none transition-colors",
      "focus:bg-[var(--color-surface-3)] focus:text-[var(--color-text-primary)]",
      "data-[state=checked]:text-[var(--color-brand)]",
      "data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed",
      className
    )}
    {...props}
  >
    <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-3.5 w-3.5 text-[var(--color-brand)]" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("my-1 h-px bg-[var(--color-border)]", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator };
