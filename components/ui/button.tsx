import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border bg-clip-padding text-sm font-bold whitespace-nowrap uppercase tracking-widest transition-all duration-150 ease-out outline-none select-none focus-visible:outline-2 focus-visible:outline-[#FF3000] disabled:pointer-events-none disabled:opacity-50 aria-invalid:outline-[#FF3000] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "swiss-btn-primary",
        outline: "swiss-btn-secondary",
        secondary: "swiss-btn-secondary",
        ghost:
          "border-transparent bg-transparent text-black hover:bg-black hover:text-white uppercase tracking-widest font-bold",
        destructive:
          "bg-[#FF3000] text-white border-2 border-[#FF3000] hover:bg-black hover:border-black",
        link: "border-transparent bg-transparent text-[#FF3000] underline-offset-4 hover:underline uppercase tracking-widest",
      },
      size: {
        default: "h-11 gap-1.5 px-4 min-h-[44px]",
        xs: "h-8 gap-1 px-2 text-xs min-h-[44px]",
        sm: "h-9 gap-1 px-3 text-xs min-h-[44px]",
        lg: "h-14 gap-1.5 px-4 text-sm min-h-[44px]",
        icon: "size-11 min-h-[44px] min-w-[44px]",
        "icon-xs": "size-11 min-h-[44px] min-w-[44px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-11 min-h-[44px] min-w-[44px]",
        "icon-lg": "size-14 min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
