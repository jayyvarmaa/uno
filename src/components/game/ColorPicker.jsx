import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const colors = [
    { name: 'red', bg: '#dc2626', ring: 'ring-red-500' },
    { name: 'blue', bg: '#2563eb', ring: 'ring-blue-500' },
    { name: 'green', bg: '#059669', ring: 'ring-emerald-500' },
    { name: 'yellow', bg: '#eab308', ring: 'ring-yellow-500' }
];

export default function ColorPicker({ onColorSelect, isOpen }) {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/80 backdrop-blur-sm"
        >
            <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="glass-card p-8 rounded-3xl text-center"
            >
                <h3 className="text-2xl font-bold text-text mb-6">Choose a Color</h3>

                <div className="grid grid-cols-2 gap-4">
                    {colors.map((color, i) => (
                        <motion.button
                            key={color.name}
                            onClick={() => onColorSelect(color.name)}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                "w-20 h-20 rounded-2xl border-4 border-white/30 shadow-lg transition-all",
                                "hover:border-white/50 hover:shadow-xl"
                            )}
                            style={{ backgroundColor: color.bg }}
                        />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
