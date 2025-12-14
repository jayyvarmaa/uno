import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const rankIcons = [Trophy, Medal, Award];
const rankColors = [
    'text-yellow-400 bg-yellow-500/10',
    'text-slate-300 bg-slate-500/10',
    'text-amber-600 bg-amber-500/10'
];

export default function Leaderboard({ players = [] }) {
    const sortedPlayers = [...players].sort((a, b) => (b.wins || 0) - (a.wins || 0));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-3xl p-6"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                    <Trophy className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-text">Leaderboard</h3>
            </div>

            {sortedPlayers.length === 0 ? (
                <div className="text-center py-12">
                    <Star className="w-16 h-16 text-text/10 mx-auto mb-4" />
                    <p className="text-text/40">No games played yet</p>
                    <p className="text-xs text-text/20 mt-1">Start playing to appear on the leaderboard!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedPlayers.slice(0, 10).map((player, index) => {
                        const RankIcon = rankIcons[index] || Star;
                        const winRate = player.games_played > 0
                            ? ((player.wins / player.games_played) * 100).toFixed(0)
                            : 0;

                        return (
                            <motion.div
                                key={player.player_email}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-xl transition-colors",
                                    index < 3 ? rankColors[index] : "bg-canvas/30 hover:bg-canvas/50"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                    index < 3 ? "bg-white/10" : "bg-secondary/30"
                                )}>
                                    {index < 3 ? (
                                        <RankIcon className={cn("w-5 h-5", rankColors[index]?.split(' ')[0])} />
                                    ) : (
                                        <span className="text-sm font-bold text-text/50">{index + 1}</span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-text truncate">
                                        {player.player_name || player.player_email?.split('@')[0]}
                                    </p>
                                    <p className="text-xs text-text/40">
                                        {player.games_played || 0} games • {winRate}% win rate
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-2xl font-bold text-text">{player.wins || 0}</p>
                                    <p className="text-xs text-text/30">wins</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
