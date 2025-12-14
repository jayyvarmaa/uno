import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Home, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GameOverModal({ winner, currentUser, onPlayAgain, onLeave }) {
    const isWinner = winner?.email === currentUser?.email;

    React.useEffect(() => {
        if (isWinner) {
            // Celebration confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 }
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 }
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [isWinner]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/90 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="glass-card rounded-3xl p-10 text-center max-w-md mx-4"
            >
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="mb-6"
                >
                    {isWinner ? (
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                            <Trophy className="w-12 h-12 text-white" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                            <Star className="w-12 h-12 text-slate-400" />
                        </div>
                    )}
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-black text-text mb-2"
                >
                    {isWinner ? 'Victory!' : 'Game Over'}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-text/60 mb-8"
                >
                    {isWinner
                        ? 'Congratulations! You won the game!'
                        : `${winner?.name || 'Someone'} won the game`
                    }
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-4"
                >
                    <Button
                        onClick={onLeave}
                        variant="ghost"
                        className="flex-1"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Home
                    </Button>
                    <Button
                        onClick={onPlayAgain}
                        className="flex-1"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Play Again
                    </Button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
