"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef(function SelectTrigger(
  props: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
  ref: React.ForwardedRef<React.ElementRef<typeof SelectPrimitive.Trigger>>
) {
  const { className, children, ...otherProps } = props;
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...otherProps}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})

const SelectScrollUpButton = React.forwardRef(function SelectScrollUpButton(
  props: React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>,
  ref: React.ForwardedRef<React.ElementRef<typeof SelectPrimitive.ScrollUpButton>>
) {
  const { className, ...otherProps } = props;
  return (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...otherProps}
    >
      <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
  )
})

const SelectScrollDownButton = React.forwardRef(function SelectScrollDownButton(
  props: React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>,
  ref: React.ForwardedRef<React.ElementRef<typeof SelectPrimitive.ScrollDownButton>>
) {
  const { className, ...otherProps } = props;
  return (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...otherProps}
    >
      <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
  )
})

const SelectContent = React.forwardRef(function SelectContent(
  props: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>,
  ref: React.ForwardedRef<React.ElementRef<typeof SelectPrimitive.Content>>
) {
  const { className, children, position = "popper", ...otherProps } = props;
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-gray-300 bg-white text-gray-900 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...otherProps}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1 bg-white",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})

const SelectLabel = React.forwardRef(function SelectLabel(
  props: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>,
  ref: React.ForwardedRef<React.ElementRef<typeof SelectPrimitive.Label>>
) {
  const { className, ...otherProps } = props;
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold text-gray-900", className)}
      {...otherProps}
    />
  )
})

const SelectItem = React.forwardRef(function SelectItem(
  props: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>,
  ref: React.ForwardedRef<React.ElementRef<typeof SelectPrimitive.Item>>
) {
  const { className, children, ...otherProps } = props;
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-gray-900 outline-none hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...otherProps}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
})

const SelectSeparator = React.forwardRef(function SelectSeparator(
  props: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>,
  ref: React.ForwardedRef<React.ElementRef<typeof SelectPrimitive.Separator>>
) {
  const { className, ...otherProps } = props;
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
      {...otherProps}
    />
  )
})

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}