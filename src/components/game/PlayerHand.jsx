import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';

export default function PlayerHand({
    cards = [],
    onCardClick,
    isCurrentPlayer = false,
    playableCards = [],
    currentColor
}) {
    const isPlayable = (card) => {
        return playableCards.some(pc => pc.id === card.id);
    };

    // Calculate fan spread for cards - wider spread for better visibility
    const getCardTransform = (index, total) => {
        if (total <= 1) return { rotation: 0, translateY: 0 };

        // Wider spread for larger hands
        const maxSpread = Math.min(total * 4, 40);
        const spreadAngle = maxSpread / (total - 1);
        const rotation = -maxSpread / 2 + (index * spreadAngle);

        // Slight arc curve
        const normalizedPos = (index / (total - 1)) - 0.5;
        const translateY = Math.abs(normalizedPos) * 15;

        return { rotation, translateY };
    };

    return (
        <div className="relative">
            <div className="flex justify-center items-end">
                <AnimatePresence mode="popLayout">
                    {cards.map((card, index) => {
                        const { rotation, translateY } = getCardTransform(index, cards.length);
                        const playable = isPlayable(card);

                        return (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, y: 80, rotateZ: -15 }}
                                animate={{
                                    opacity: 1,
                                    y: playable ? translateY - 10 : translateY,
                                    rotateZ: rotation,
                                    zIndex: playable ? 100 + index : index
                                }}
                                exit={{ opacity: 0, y: 80, scale: 0.8 }}
                                transition={{
                                    delay: index * 0.03,
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 25
                                }}
                                style={{
                                    marginLeft: index === 0 ? 0 : '-1.5rem',
                                    transformOrigin: 'bottom center'
                                }}
                                className="relative"
                            >
                                <Card
                                    card={card}
                                    onClick={() => onCardClick?.(card)}
                                    isPlayable={playable}
                                    disabled={!isCurrentPlayer}
                                    size="normal"
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {isCurrentPlayer && cards.length === 0 && (
                <div className="text-center py-8 text-white/50 text-lg font-medium">
                    No cards in hand - You won! 🎉
                </div>
            )}
        </div>
    );
}
