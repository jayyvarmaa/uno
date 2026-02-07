import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const cardBackImage = '/Cards/back.jpeg';

// Face-down card component using PNG image - LARGER sizes
function FaceDownCard({ size = 'normal', rotation = 0, style = {} }) {
    const sizeClasses = {
        small: 'w-14 h-20',
        normal: 'w-16 h-24',
        large: 'w-20 h-30'
    };

    return (
        <div
            className={cn(
                sizeClasses[size],
                "rounded-xl overflow-hidden shrink-0"
            )}
            style={{ transform: `rotate(${rotation}deg)`, ...style }}
        >
            <img
                src={cardBackImage}
                alt="UNO Card Back"
                className="w-full h-full object-cover rounded-xl scale-[1.02]"
                draggable={false}
            />
        </div>
    );
}

export default function OpponentCards({ player, isCurrentTurn, position = 'top' }) {
    const cardCount = player.card_count || player.cards?.length || 0;
    const displayCards = Math.min(15, cardCount);

    // Calculate card arrangement based on position
    const isVertical = position === 'left' || position === 'right';

    // Dynamic spacing based on card count to keep it compact
    const spacingClass = isVertical
        ? (displayCards > 8 ? "-space-y-8" : "-space-y-12")
        : (displayCards > 8 ? "-space-x-6" : "-space-x-8");

    const containerClasses = {
        top: 'flex-col items-center',
        left: 'flex-col items-center',
        right: 'flex-col items-center'
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "flex",
                containerClasses[position]
            )}
        >
            {/* Cards - Stacked vertically for side players */}
            <div className={cn(
                isVertical ? "flex flex-col" : "flex",
                spacingClass
            )}>
                {Array.from({ length: displayCards }).map((_, i) => (
                    <FaceDownCard
                        key={i}
                        size="normal"
                        rotation={0}
                        style={{ zIndex: i }}
                    />
                ))}
            </div>

            {/* Player Avatar and Info - Below cards */}
            <div className={cn(
                "flex flex-col items-center mt-3",
                isCurrentTurn && "animate-pulse"
            )}>
                {/* Avatar with glow for current turn */}
                <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center font-bold text-canvas text-xl shadow-lg overflow-hidden border-3",
                    isCurrentTurn
                        ? "bg-gradient-to-br from-accent to-accent/70 border-accent/50"
                        : "bg-gradient-to-br from-secondary to-secondary/70 border-transparent"
                )}>
                    {player.avatar ? (
                        <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                        player.name?.[0]?.toUpperCase() || 'P'
                    )}
                </div>

                {/* Player name */}
                <p className={cn(
                    "font-bold text-sm truncate max-w-[120px] mt-2 drop-shadow-lg",
                    isCurrentTurn ? "text-accent" : "text-text"
                )}>
                    {player.name}
                </p>

                {/* Card count badge */}
                {cardCount > 0 && (
                    <div className={cn(
                        "mt-1 px-3 py-1 rounded-full text-xs font-bold",
                        cardCount <= 2 ? "bg-primary text-text" : "bg-secondary/40 text-text"
                    )}>
                        {cardCount} card{cardCount !== 1 ? 's' : ''}
                    </div>
                )}

                {/* Turn indicator */}
                {isCurrentTurn && (
                    <div className="mt-2 px-3 py-1 bg-accent rounded-full text-xs font-bold text-canvas">
                        Playing...
                    </div>
                )}
            </div>
        </motion.div>
    );
}
