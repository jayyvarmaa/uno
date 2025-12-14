import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const cardBackImage = '/Cards/UNO Cards (Community)/uno-back 1.png';

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
                "rounded-xl overflow-hidden shadow-lg shrink-0"
            )}
            style={{ transform: `rotate(${rotation}deg)`, ...style }}
        >
            <img
                src={cardBackImage}
                alt="UNO Card Back"
                className="w-full h-full object-cover rounded-xl"
                draggable={false}
            />
        </div>
    );
}

export default function OpponentCards({ player, isCurrentTurn, position = 'top' }) {
    const cardCount = player.card_count || player.cards?.length || 0;
    const displayCards = Math.min(5, cardCount);

    // Calculate card arrangement based on position
    const isVertical = position === 'left' || position === 'right';

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
                isVertical ? "flex flex-col -space-y-12" : "flex -space-x-8"
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
                    "w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg overflow-hidden border-3",
                    isCurrentTurn
                        ? "bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300"
                        : "bg-gradient-to-br from-purple-500 to-pink-500 border-transparent"
                )}>
                    {player.avatar ? (
                        <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                        player.name?.[0]?.toUpperCase() || 'P'
                    )}
                </div>

                {/* Player name */}
                <p className={cn(
                    "font-bold text-sm truncate max-w-[120px] mt-2 text-white drop-shadow-lg",
                    isCurrentTurn && "text-yellow-300"
                )}>
                    {player.name}
                </p>

                {/* Card count badge */}
                {cardCount > 0 && (
                    <div className={cn(
                        "mt-1 px-3 py-1 rounded-full text-xs font-bold",
                        cardCount <= 2 ? "bg-red-500 text-white" : "bg-black/40 text-white"
                    )}>
                        {cardCount} card{cardCount !== 1 ? 's' : ''}
                    </div>
                )}

                {/* Turn indicator */}
                {isCurrentTurn && (
                    <div className="mt-2 px-3 py-1 bg-yellow-400 rounded-full text-xs font-bold text-black">
                        Playing...
                    </div>
                )}
            </div>
        </motion.div>
    );
}
