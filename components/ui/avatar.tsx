"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
Avatar.displayName = "Avatar"

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, ...props }, ref) => {
    const [error, setError] = React.useState(false)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
      setError(false)
      setLoading(true)
    }, [src])

    if (error || !src) {
      return null
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        className={cn(
          "aspect-square h-full w-full object-cover",
          loading && "animate-pulse bg-muted",
          className
        )}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = "AvatarImage"

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => {
    const avatarContext = React.useContext(AvatarContext)
    const showFallback = avatarContext?.showFallback ?? true

    if (!showFallback) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-muted",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AvatarFallback.displayName = "AvatarFallback"

// Context to handle image loading state
interface AvatarContextType {
  showFallback: boolean
}

const AvatarContext = React.createContext<AvatarContextType | null>(null)

// Updated Avatar component with context
const AvatarWithContext = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, children, ...props }, ref) => {
    const [showFallback, setShowFallback] = React.useState(false)

    // Check if AvatarImage exists and handle its state
    React.useEffect(() => {
      const avatarImage = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === AvatarImage
      )
      
      if (avatarImage && React.isValidElement(avatarImage)) {
        const imgElement = document.createElement('img')
        imgElement.src = avatarImage.props.src || ''
        imgElement.onerror = () => setShowFallback(true)
        imgElement.onload = () => setShowFallback(false)
      } else {
        setShowFallback(true)
      }
    }, [children])

    return (
      <AvatarContext.Provider value={{ showFallback }}>
        <div
          ref={ref}
          className={cn(
            "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </AvatarContext.Provider>
    )
  }
)

// Simple version without complex state management
const SimpleAvatar = Avatar
const SimpleAvatarImage = AvatarImage
const SimpleAvatarFallback = AvatarFallback

export { SimpleAvatar as Avatar, SimpleAvatarImage as AvatarImage, SimpleAvatarFallback as AvatarFallback }