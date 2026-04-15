import { cn } from "@/utils"

export function Dots({ color = "#2a2a35", className, size = 16 }) {
  return (
    <svg
      className={cn("absolute inset-0 h-full w-full", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="dots-pattern"
          x="0"
          y="0"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={size / 2} cy={size / 2} r="1" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots-pattern)" />
    </svg>
  )
}
