"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)
  
  return (
    <div className="relative inline-block">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { open, setOpen })
        }
        return child
      })}
    </div>
  )
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps & { open?: boolean; setOpen?: (open: boolean) => void }) {
  const { setOpen } = arguments[0] as any
  
  const handleClick = () => {
    setOpen?.((prev: boolean) => !prev)
  }
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick
    })
  }
  
  return (
    <button onClick={handleClick} className="inline-flex items-center">
      {children}
    </button>
  )
}

export function DropdownMenuContent({ 
  children, 
  align = 'end', 
  className,
  open,
  setOpen 
}: DropdownMenuContentProps & { open?: boolean; setOpen?: (open: boolean) => void }) {
  const menuRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen?.(false)
      }
    }
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, setOpen])
  
  if (!open) return null
  
  return (
    <div
      ref={menuRef}
      className={cn(
        "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md",
        align === 'end' && "right-0",
        align === 'start' && "left-0",
        align === 'center' && "left-1/2 -translate-x-1/2",
        className
      )}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { setOpen })
        }
        return child
      })}
    </div>
  )
}

export function DropdownMenuItem({ 
  children, 
  onClick, 
  className,
  setOpen 
}: DropdownMenuItemProps & { setOpen?: (open: boolean) => void }) {
  const handleClick = () => {
    onClick?.()
    setOpen?.(false)
  }
  
  return (
    <button
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

export function DropdownMenuSeparator() {
  return <div className="-mx-1 my-1 h-px bg-gray-100" />
}