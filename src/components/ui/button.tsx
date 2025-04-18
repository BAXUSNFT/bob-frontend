import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:opacity-50 duration-300 transition-all",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm",
                outline:
                    "border border-input bg-background shadow-sm",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm ",
                ghost: "hover:bg-whiskey-amber hover:text-whiskey-mahogany",
                link: "text-primary underline-offset-4 hover:underline",
                whiskey: "bg-whiskey-caramel text-whiskey-cream border border-whiskey-amber shadow-sm",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
                icon: "size-[30px] rounded-md",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                type="button"
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
