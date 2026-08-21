import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 font-medium transition-[color,transform,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onred/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        slab: "isolate overflow-hidden rounded-none bg-onred text-white before:absolute before:inset-y-0 before:left-0 before:-z-10 before:w-full before:origin-left before:scale-x-0 before:bg-white/20 before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.22,1,0.36,1)] hover:before:scale-x-100",
        ghostline:
          "rounded-none bg-transparent text-ink after:absolute after:bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-onred after:transition-transform after:duration-400 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-onred hover:after:scale-x-100",
        line: "rounded-none border border-line bg-transparent text-ink hover:border-ink",
      },
      size: {
        default: "h-12 px-7 text-sm",
        lg: "h-14 px-8 text-base",
        inline: "h-auto px-0 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "slab",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
