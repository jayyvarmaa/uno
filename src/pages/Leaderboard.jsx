import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import LeaderboardComponent from '@/components/stats/Leaderboard';
import PlayerStatsCard from '@/components/stats/PlayerStatsCard';

export default function Leaderboard() {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        base44.auth.me().then(setCurrentUser).catch(console.error);
    }, []);

    const { data: allStats = [] } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: () => base44.entities.PlayerStats.list('-wins', 20)
    });

    const { data: myStats } = useQuery({
        queryKey: ['myStats', currentUser?.email],
        queryFn: async () => {
            if (!currentUser?.email) return null;
            const stats = await base44.entities.PlayerStats.filter({ player_email: currentUser.email });
            return stats[0];
        },
        enabled: !!currentUser?.email
    });

    return (
        <div className="min-h-screen bg-canvas relative overflow-hidden">
            <div className="noise-overlay" />

            {/* Background gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <Link to="/">
                        <Button variant="ghost" className="text-text/60">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Award className="w-10 h-10 text-accent" />
                        <h1 className="text-4xl md:text-5xl font-black text-text">
                            Leaderboard
                        </h1>
                    </div>
                    <p className="text-text/50">
                        Top players ranked by wins
                    </p>
                </motion.div>

                <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
                    {/* Main Leaderboard */}
                    <div className="lg:col-span-2">
                        <LeaderboardComponent players={allStats} />
                    </div>

                    {/* Player Stats Sidebar */}
                    <div className="space-y-6">
                        {myStats && <PlayerStatsCard stats={myStats} />}

                        {/* Quick Tips */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card rounded-3xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <TrendingUp className="w-5 h-5 text-accent" />
                                <h3 className="font-bold text-text">Pro Tips</h3>
                            </div>
                            <ul className="space-y-3 text-sm text-text/60">
                                <li className="flex gap-2">
                                    <span className="text-accent">•</span>
                                    Save your Wild cards for crucial moments
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-accent">•</span>
                                    Pay attention to opponents' card counts
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-accent">•</span>
                                    Use Skip and Reverse strategically
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
