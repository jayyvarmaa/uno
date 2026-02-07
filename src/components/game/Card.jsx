import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getCardSvgPath, getCardDisplayColor } from '@/lib/cardUtils';

// Card back image path
const cardBackImage = '/Cards/back.jpeg';

export default function Card({
    card,
    onClick,
    disabled = false,
    isPlayable = true,
    isSelected = false,
    size = 'normal',
    faceDown = false
}) {
    // Card sizes
    const sizeConfig = {
        small: {
            container: 'w-16 h-24',
            imgClass: 'w-full h-full'
        },
        normal: {
            container: 'w-24 h-36',
            imgClass: 'w-full h-full'
        },
        large: {
            container: 'w-32 h-48',
            imgClass: 'w-full h-full'
        },
        xlarge: {
            container: 'w-40 h-60',
            imgClass: 'w-full h-full'
        }
    };

    const config = sizeConfig[size];

    // Face down card (back)
    if (faceDown) {
        return (
            <motion.div
                className={cn(
                    config.container,
                    "rounded-xl overflow-hidden shadow-xl cursor-default relative"
                )}
                whileHover={{ scale: 1.02 }}
            >
                <img
                    src={cardBackImage}
                    alt="UNO Card Back"
                    className={cn(config.imgClass, "object-cover rounded-xl")}
                    draggable={false}
                />
            </motion.div>
        );
    }

    // Get SVG path using cardUtils
    const imagePath = getCardSvgPath(card);
    const canClick = !disabled && isPlayable;
    const cardColor = getCardDisplayColor(card?.color);

    return (
        <motion.button
            onClick={canClick ? onClick : undefined}
            disabled={!canClick}
            className={cn(
                config.container,
                "relative rounded-xl shadow-xl transition-all duration-200 overflow-hidden bg-transparent",
                canClick ? "cursor-pointer hover:shadow-2xl" : "cursor-default",
                isSelected && "ring-4 ring-accent ring-offset-2 ring-offset-transparent scale-105"
            )}
            whileHover={{}}
            whileTap={canClick ? { scale: 0.95 } : {}}
            layout
        >
            {/* SVG Card Image */}
            <img
                src={imagePath}
                alt={`${card?.color || 'wild'} ${card?.type || 'card'} ${card?.value || ''}`}
                className={cn(config.imgClass, "object-contain rounded-xl scale-[1.02]")}
                draggable={false}
                onError={(e) => {
                    // Fallback to card back if SVG fails to load
                    e.target.src = cardBackImage;
                }}
            />

            {/* Glow effect for playable cards */}
            {isPlayable && !disabled && (
                <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                        boxShadow: `0 0 8px 2px ${cardColor}40`
                    }}
                    animate={{
                        boxShadow: [
                            `0 0 8px 2px ${cardColor}40`,
                            `0 0 12px 4px ${cardColor}60`,
                            `0 0 8px 2px ${cardColor}40`
                        ]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                />
            )}

            {/* Optional: Score badge for number cards */}
            {card?.score !== undefined && card.type === 'number' && (
                <div className="absolute top-1 right-1 bg-canvas/80 text-text text-xs font-bold px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {card.score}pt
                </div>
            )}
        </motion.button>
    );
}
