import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/client';
import { useMutation } from '@tanstack/react-query';
import { LogIn, Loader2, Hash, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import RoomBrowser from './RoomBrowser';

export default function JoinGame({ currentUser, onGameJoined }) {
    const [roomCode, setRoomCode] = useState('');
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'code'

    const joinGameMutation = useMutation({
        mutationFn: async (gameToJoin) => {
            let game = gameToJoin;

            // If joining by room code
            if (!game && roomCode) {
                const games = await base44.entities.Game.filter({
                    room_code: roomCode.toUpperCase().trim()
                });

                if (!games || games.length === 0) {
                    throw new Error('Game not found');
                }

                game = games[0];
            }

            if (!game) throw new Error('No game specified');

            if (game.status !== 'waiting') {
                throw new Error('Game has already started');
            }

            if (game.players?.some(p => p.email === currentUser.email)) {
                return game;
            }

            if (game.players?.length >= (game.max_players || 10)) {
                throw new Error('Game is full');
            }

            // Join via API
            const response = await fetch(`http://localhost:5000/api/games/${game._id}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player_email: currentUser.email,
                    player_name: currentUser.name || currentUser.full_name
                })
            });

            if (!response.ok) throw new Error('Failed to join');
            return await response.json();
        },
        onSuccess: (game) => {
            toast.success('Joined game successfully!');
            onGameJoined(game);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to join game');
        }
    });

    const handleJoinPublicRoom = (room) => {
        joinGameMutation.mutate(room);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-3xl p-8 relative overflow-hidden group"
        >
            {/* Decorative Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/30">
                    <LogIn className="w-7 h-7 text-canvas" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-text tracking-tight">Join Game</h2>
                    <p className="text-text/50 text-sm">Find or enter a room</p>
                </div>
            </div>

            <div className="relative z-10">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={cn(
                            "cursor-target flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all",
                            activeTab === 'browse'
                                ? "bg-accent text-canvas"
                                : "bg-canvas/30 text-text/60 hover:bg-canvas/50"
                        )}
                    >
                        <Globe className="w-4 h-4" />
                        Browse Rooms
                    </button>
                    <button
                        onClick={() => setActiveTab('code')}
                        className={cn(
                            "cursor-target flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all",
                            activeTab === 'code'
                                ? "bg-primary text-text"
                                : "bg-canvas/30 text-text/60 hover:bg-canvas/50"
                        )}
                    >
                        <Lock className="w-4 h-4" />
                        Enter Code
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'browse' ? (
                    <RoomBrowser onJoinRoom={handleJoinPublicRoom} />
                ) : (
                    <div className="space-y-6">
                        <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                            <Input
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                placeholder="ROOM CODE"
                                maxLength={6}
                                className="h-16 pl-12 text-2xl font-mono tracking-[0.3em] text-center placeholder:tracking-normal placeholder:text-base"
                            />
                        </div>

                        <Button
                            onClick={() => joinGameMutation.mutate(null)}
                            disabled={roomCode.length < 4 || joinGameMutation.isPending}
                            variant="secondary"
                            size="lg"
                            className="w-full h-16 text-lg bg-primary text-text hover:bg-primary/90 cursor-target"
                        >
                            {joinGameMutation.isPending ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-6 h-6 mr-3" />
                                    Join Private Room
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
