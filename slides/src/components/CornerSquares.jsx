import { cn } from "@/utils"

export function CornerSquares({ className, size = "sm", color }) {
  const sizeClass = size === "sm" ? "size-2" : "size-3.5"
  const style = color ? { backgroundColor: color } : undefined
  return (
    <>
      <div className={cn("absolute -top-px -left-px bg-border-100", sizeClass, className)} style={style} />
      <div className={cn("absolute -top-px -right-px bg-border-100", sizeClass, className)} style={style} />
      <div className={cn("absolute -bottom-px -left-px bg-border-100", sizeClass, className)} style={style} />
      <div className={cn("absolute -bottom-px -right-px bg-border-100", sizeClass, className)} style={style} />
    </>
  )
}
