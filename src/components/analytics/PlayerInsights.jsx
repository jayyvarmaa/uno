import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Zap, Target, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PlayerInsights({ stats }) {
    if (!stats) return null;

    const colorData = stats.color_usage ? Object.entries(stats.color_usage) : [];
    const totalColorPlays = colorData.reduce((sum, [, count]) => sum + count, 0);

    const colorMap = {
        red: '#dc2626',
        blue: '#2563eb',
        green: '#059669',
        yellow: '#eab308'
    };

    const insights = [
        {
            icon: Target,
            label: 'Favorite Color',
            value: stats.favorite_color || 'N/A',
            color: colorMap[stats.favorite_color] || '#9333ea'
        },
        {
            icon: Zap,
            label: 'Wild Card Usage',
            value: stats.wild_cards_played || 0,
            sublabel: 'total wild cards played'
        },
        {
            icon: Clock,
            label: 'Strategy',
            value: stats.early_wild_usage > stats.late_wild_usage ? 'Aggressive' : 'Strategic',
            sublabel: stats.early_wild_usage > stats.late_wild_usage
                ? 'Tends to play wilds early'
                : 'Saves wilds for endgame'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-6"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-text">Play Insights</h3>
            </div>

            {/* Color Usage Distribution */}
            {colorData.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm text-text/50 mb-3 flex items-center gap-2">
                        <PieChart className="w-4 h-4" />
                        Color Distribution
                    </h4>
                    <div className="flex h-4 rounded-full overflow-hidden">
                        {colorData.map(([color, count]) => (
                            <div
                                key={color}
                                style={{
                                    width: `${(count / totalColorPlays) * 100}%`,
                                    backgroundColor: colorMap[color] || '#6b7280'
                                }}
                                className="transition-all duration-300"
                                title={`${color}: ${count} plays`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-text/40">
                        {colorData.map(([color, count]) => (
                            <span key={color} className="flex items-center gap-1">
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: colorMap[color] }}
                                />
                                {((count / totalColorPlays) * 100).toFixed(0)}%
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Insight Cards */}
            <div className="space-y-3">
                {insights.map((insight, i) => (
                    <motion.div
                        key={insight.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4 p-3 rounded-xl bg-canvas/30"
                    >
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: (insight.color || '#6366f1') + '20' }}
                        >
                            <insight.icon
                                className="w-5 h-5"
                                style={{ color: insight.color || '#6366f1' }}
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-text/40">{insight.label}</p>
                            <p className="font-bold text-text">{insight.value}</p>
                            {insight.sublabel && (
                                <p className="text-xs text-text/30">{insight.sublabel}</p>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
