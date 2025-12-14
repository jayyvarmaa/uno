import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';

export default function DiscardPile({ cards = [], currentColor }) {
    const topCard = cards[cards.length - 1];

    if (!topCard) return null;

    return (
        <div className="relative flex flex-col items-center">
            <span className="text-text/40 text-sm mb-2 uppercase tracking-wider">Discard</span>

            <div className="relative w-24 h-36">
                {/* Shadow cards underneath */}
                {cards.slice(-3, -1).map((card, i) => (
                    <div
                        key={card.id || i}
                        className="absolute inset-0"
                        style={{
                            transform: `rotate(${(i - 1) * 5}deg) translate(${i * 2}px, ${i * 2}px)`,
                            zIndex: i
                        }}
                    >
                        <Card card={card} size="large" disabled />
                    </div>
                ))}

                {/* Top card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={topCard.id}
                        initial={{ scale: 0.5, rotateZ: -180, opacity: 0 }}
                        animate={{ scale: 1, rotateZ: 0, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="absolute inset-0"
                        style={{ zIndex: 10 }}
                    >
                        <Card card={topCard} size="large" disabled />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Current color indicator (for wild cards) */}
            {(topCard.color === 'wild') && currentColor && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-3 flex items-center gap-2"
                >
                    <span className="text-text/50 text-xs">Current:</span>
                    <div
                        className="w-6 h-6 rounded-full border-2 border-white/30"
                        style={{
                            backgroundColor:
                                currentColor === 'red' ? '#dc2626' :
                                    currentColor === 'blue' ? '#2563eb' :
                                        currentColor === 'green' ? '#059669' :
                                            '#eab308'
                        }}
                    />
                </motion.div>
            )}
        </div>
    );
}
