import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { base44 } from '@/api/client';
import { useMutation } from '@tanstack/react-query';
import { Gamepad2, Users, Sparkles, Loader2, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function CreateGame({ currentUser, onGameCreated }) {
    const [maxPlayers, setMaxPlayers] = useState(10);
    const [isPublic, setIsPublic] = useState(false);

    const createGameMutation = useMutation({
        mutationFn: async () => {
            const game = await base44.entities.Game.create({
                player_email: currentUser.email,
                player_name: currentUser.name || currentUser.full_name,
                max_players: maxPlayers,
                is_public: isPublic
            });
            return game;
        },
        onSuccess: (game) => {
            if (isPublic) {
                toast.success('Public game created! Players can find it in the room browser.');
            } else {
                toast.success('Private game created! Share the room code with friends.');
            }
            onGameCreated(game);
        },
        onError: (error) => {
            toast.error('Failed to create game');
            console.error(error);
        }
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-8 relative overflow-hidden group"
        >
            {/* Decorative Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
                    <Gamepad2 className="w-7 h-7 text-text" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-text tracking-tight">Create New Game</h2>
                    <p className="text-text/50 text-sm">Set up your game room</p>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                {/* Room Type Toggle */}
                <div className="space-y-3">
                    <Label className="text-text flex items-center gap-2">
                        Room Type
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setIsPublic(false)}
                            className={cn(
                                "cursor-target flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                                !isPublic
                                    ? "border-primary bg-primary/20 text-primary"
                                    : "border-white/10 text-text/50 hover:border-white/20"
                            )}
                        >
                            <Lock className="w-5 h-5" />
                            <span className="font-semibold">Private</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsPublic(true)}
                            className={cn(
                                "cursor-target flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                                isPublic
                                    ? "border-accent bg-accent/20 text-accent"
                                    : "border-white/10 text-text/50 hover:border-white/20"
                            )}
                        >
                            <Globe className="w-5 h-5" />
                            <span className="font-semibold">Public</span>
                        </button>
                    </div>
                    <p className="text-xs text-text/40">
                        {isPublic
                            ? "Anyone can find and join your game from the room browser"
                            : "Share the room code with friends to let them join"}
                    </p>
                </div>

                {/* Max Players Slider */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-text flex items-center gap-2">
                            <Users className="w-4 h-4 text-accent" />
                            Max Players
                        </Label>
                        <span className="text-3xl font-bold text-accent tabular-nums">{maxPlayers}</span>
                    </div>
                    <Slider
                        value={[maxPlayers]}
                        onValueChange={(v) => setMaxPlayers(v[0])}
                        min={3}
                        max={10}
                        step={1}
                        className="py-2"
                    />
                    <p className="text-xs text-text/40">Minimum 3 players required to start</p>
                </div>

                <Button
                    onClick={() => createGameMutation.mutate()}
                    disabled={createGameMutation.isPending}
                    size="lg"
                    className="w-full h-16 text-lg cursor-target"
                >
                    {createGameMutation.isPending ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            <Sparkles className="w-6 h-6 mr-3" />
                            Create {isPublic ? 'Public' : 'Private'} Room
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}
