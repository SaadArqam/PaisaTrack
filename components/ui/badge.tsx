import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border-2 border-black px-2 py-1 text-xs font-bold whitespace-nowrap uppercase tracking-wide transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#FF3000] [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-black text-white",
        secondary: "bg-[#F2F2F2] text-black",
        destructive: "bg-[#FF3000] text-white border-[#FF3000]",
        outline: "border-black text-black bg-white",
        ghost: "border-transparent bg-transparent text-black",
        link: "border-transparent text-[#FF3000] underline-offset-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
