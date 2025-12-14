import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Gamepad2, Target, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PlayerStatsCard({ stats }) {
    const winRate = stats?.games_played > 0
        ? ((stats.wins / stats.games_played) * 100).toFixed(1)
        : 0;

    const statItems = [
        {
            label: 'Games Played',
            value: stats?.games_played || 0,
            icon: Gamepad2,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10'
        },
        {
            label: 'Wins',
            value: stats?.wins || 0,
            icon: Trophy,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10'
        },
        {
            label: 'Win Rate',
            value: `${winRate}%`,
            icon: Target,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10'
        },
        {
            label: 'Special Cards',
            value: stats?.special_cards_played || 0,
            icon: Zap,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-6"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-text">Your Statistics</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {statItems.map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                            "p-4 rounded-xl",
                            item.bgColor
                        )}
                    >
                        <item.icon className={cn("w-5 h-5 mb-2", item.color)} />
                        <p className="text-3xl font-bold text-text">{item.value}</p>
                        <p className="text-xs text-text/40">{item.label}</p>
                    </motion.div>
                ))}
            </div>

            {stats?.learning_tips?.length > 0 && (
                <div className="mt-6 p-4 bg-canvas/30 rounded-xl">
                    <h4 className="text-sm font-medium text-text/60 mb-2">💡 Tips to Improve</h4>
                    <ul className="space-y-1">
                        {stats.learning_tips.slice(0, 2).map((tip, i) => (
                            <li key={i} className="text-xs text-text/40">• {tip}</li>
                        ))}
                    </ul>
                </div>
            )}
        </motion.div>
    );
}
