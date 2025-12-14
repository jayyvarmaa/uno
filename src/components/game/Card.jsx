import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Import card back image
const cardBackImage = '/Cards/UNO Cards (Community)/uno-back 1.png';

// Map card data to image filename
const getCardImagePath = (card) => {
    const basePath = '/Cards/UNO Cards (Community)/';

    if (!card || !card.color) return cardBackImage;

    const color = card.color.charAt(0).toUpperCase() + card.color.slice(1);

    // Wild cards
    if (card.type === 'wild') {
        return `${basePath}Wild-1.png`;
    }

    // Wild Draw 4
    if (card.type === 'wild_draw4') {
        return `${basePath}Draw4- 1.png`;
    }

    // Skip cards
    if (card.type === 'skip') {
        return `${basePath}${color} Skip- 1.png`;
    }

    // Reverse cards
    if (card.type === 'reverse') {
        return `${basePath}${color} Reverse- 1.png`;
    }

    // Draw Two cards
    if (card.type === 'draw2') {
        return `${basePath}${color} Draw2- 1.png`;
    }

    // Number cards - Blue is missing 2,3 so use 12,13 as substitutes
    if (card.type === 'number') {
        let value = card.value;
        if (card.color === 'blue') {
            if (value === 2) value = 12;
            if (value === 3) value = 13;
        }
        return `${basePath}${color}- ${value}.png`;
    }

    return cardBackImage;
};

export default function Card({
    card,
    onClick,
    disabled = false,
    isPlayable = true,
    isSelected = false,
    size = 'normal',
    faceDown = false
}) {
    // LARGER card sizes to match Figma design
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

    const imagePath = getCardImagePath(card);
    const canClick = !disabled && isPlayable;

    return (
        <motion.button
            onClick={canClick ? onClick : undefined}
            disabled={!canClick}
            className={cn(
                config.container,
                "relative rounded-xl shadow-xl transition-all duration-200 overflow-hidden",
                // NO opacity or grayscale - keep all cards fully visible
                canClick ? "cursor-pointer hover:shadow-2xl" : "cursor-default",
                isSelected && "ring-4 ring-yellow-400 ring-offset-2 ring-offset-transparent scale-105"
            )}
            whileHover={canClick ? {
                y: -20,
                scale: 1.1,
                zIndex: 50,
                transition: { type: 'spring', stiffness: 400 }
            } : {}}
            whileTap={canClick ? { scale: 0.95 } : {}}
            layout
        >
            <img
                src={imagePath}
                alt={`${card?.color || 'unknown'} ${card?.type || 'card'} ${card?.value || ''}`}
                className={cn(config.imgClass, "object-cover rounded-xl")}
                draggable={false}
                onError={(e) => {
                    // Fallback to card back if image fails to load
                    e.target.src = cardBackImage;
                }}
            />

            {/* Subtle highlight for playable cards - white glow border */}
            {isPlayable && !disabled && (
                <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    initial={{ boxShadow: '0 0 0 2px rgba(255,255,255,0.3)' }}
                    animate={{
                        boxShadow: ['0 0 0 2px rgba(255,255,255,0.3)', '0 0 0 3px rgba(255,255,255,0.5)', '0 0 0 2px rgba(255,255,255,0.3)']
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                />
            )}
        </motion.button>
    );
}
