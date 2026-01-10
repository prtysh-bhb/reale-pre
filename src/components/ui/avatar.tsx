import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg"
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "default", children, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 w-8",
      default: "h-10 w-10",
      lg: "h-12 w-12",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false)
    const [loaded, setLoaded] = React.useState(false)

    React.useEffect(() => {
      setHasError(false)
      setLoaded(false)
    }, [src])

    if (!src || hasError) {
      return null
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        onLoad={() => setLoaded(true)}
        className={cn(
          "aspect-square h-full w-full object-cover",
          !loaded && "invisible",
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
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold text-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
