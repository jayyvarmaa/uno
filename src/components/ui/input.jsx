import React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <div className="relative group">
            <input
                type={type}
                className={cn(
                    "flex h-12 w-full rounded-xl border-2 border-secondary/50 bg-canvas/50 px-3 py-2 text-sm ring-offset-canvas file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text/30 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 font-sans text-text",
                    className
                )}
                ref={ref}
                {...props}
            />
            <div className="absolute inset-0 rounded-xl bg-accent/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
        </div>
    )
});
Input.displayName = "Input";

export { Input };
