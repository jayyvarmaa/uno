import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', children, disabled, onClick, ...props }, ref) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const buttonRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!buttonRef.current || disabled) return;
        const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - (left + width / 2);
        const y = e.clientY - (top + height / 2);
        setPosition({ x: x * 0.15, y: y * 0.15 });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const variants = {
        default: "bg-primary text-text border border-accent/20 hover:border-accent shadow-[0_0_15px_rgba(203,4,16,0.3)] hover:shadow-[0_0_25px_rgba(254,164,0,0.5)]",
        outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/10",
        ghost: "bg-transparent hover:bg-primary/5 text-text hover:text-accent",
        secondary: "bg-secondary text-text hover:bg-secondary/80",
    };

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-14 rounded-xl px-8 text-lg",
        icon: "h-10 w-10 p-0 flex items-center justify-center",
    };

    return (
        <motion.button
            ref={(node) => {
                buttonRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
            }}
            className={cn(
                "relative inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-sans tracking-wide overflow-hidden cursor-target",
                sizes[size],
                variants[variant],
                className
            )}
            onClick={onClick}
            disabled={disabled}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            whileTap={{ scale: 0.95 }}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>
        </motion.button>
    );
});
Button.displayName = "Button";

export { Button };
