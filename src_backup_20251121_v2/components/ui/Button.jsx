import React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

const Button = React.forwardRef(
    ({ className, variant = "primary", size = "default", isLoading, children, ...props }, ref) => {
        const variants = {
            primary:
                "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] border-transparent",
            secondary:
                "bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:border-white/20",
            ghost: "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white",
            danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
        };

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-8 px-3 text-xs",
            lg: "h-12 px-8 text-lg",
            icon: "h-10 w-10 p-2 flex items-center justify-center",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button };
