import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Copy, Play, Loader2, Crown, ArrowLeft, Check, Bot, Send, MessageCircle, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function WaitingRoom({ gameId, currentUser, onGameStart, onLeave }) {
    const queryClient = useQueryClient();
    const [copied, setCopied] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    const { data: game, isLoading } = useQuery({
        queryKey: ['game', gameId],
        queryFn: async () => {
            const games = await base44.entities.Game.filter({ id: gameId });
            return games[0];
        },
        refetchInterval: 2000
    });

    const { data: chatMessages = [] } = useQuery({
        queryKey: ['messages', gameId],
        queryFn: () => base44.entities.Message.filter({ game_id: gameId }, 'created_date', 50),
        refetchInterval: 2000,
        enabled: !game?.is_public // Only fetch messages for private rooms
    });

    useEffect(() => {
        if (chatMessages.length > 0) {
            setMessages(chatMessages);
        }
    }, [chatMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (game?.status === 'playing') {
            onGameStart(game);
        }
    }, [game?.status]);

    const isHost = game?.players?.[0]?.email === currentUser?.email;
    const canStart = (game?.players?.length || 0) >= (game?.min_players || 3);
    const maxPlayers = game?.max_players || 10;
    const currentPlayers = game?.players || [];
    const isPublicRoom = game?.is_public;

    const startGameMutation = useMutation({
        mutationFn: () => base44.entities.Game.update(gameId, { status: 'playing' }),
        onSuccess: () => {
            queryClient.invalidateQueries(['game', gameId]);
        }
    });

    const addAIPlayerMutation = useMutation({
        mutationFn: async () => {
            const aiNumber = currentPlayers.length;
            const aiPlayer = {
                email: `ai-${Date.now()}@bot.uno`,
                name: `AI Player ${aiNumber}`,
                cards: [],
                card_count: 7
            };
            const updatedPlayers = [...currentPlayers, aiPlayer];
            await base44.entities.Game.update(gameId, { players: updatedPlayers });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['game', gameId]);
            toast.success('AI player added!');
        },
        onError: () => {
            toast.error('Failed to add AI player');
        }
    });

    const sendMessageMutation = useMutation({
        mutationFn: async (content) => {
            const newMessage = await base44.entities.Message.create({
                game_id: gameId,
                sender_email: currentUser.email,
                sender_name: currentUser.name || currentUser.full_name,
                content
            });
            return newMessage;
        },
        onSuccess: (newMsg) => {
            setMessages(prev => [...prev, newMsg]);
            setMessage('');
            queryClient.invalidateQueries(['messages', gameId]);
        }
    });

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            sendMessageMutation.mutate(message.trim());
        }
    };

    const copyRoomCode = () => {
        navigator.clipboard.writeText(game?.room_code || '');
        setCopied(true);
        toast.success('Room code copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    const playerColors = ['bg-primary', 'bg-accent', 'bg-emerald-500', 'bg-purple-500', 'bg-blue-500', 'bg-pink-500', 'bg-cyan-500', 'bg-orange-500', 'bg-lime-500', 'bg-rose-500'];
    const emptySlots = maxPlayers - currentPlayers.length;

    return (
        <div className="min-h-screen w-full px-4 md:px-8 lg:px-16 py-8">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                {/* Room Type Badge */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    {isPublicRoom ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent font-medium">
                            <Globe className="w-4 h-4" />
                            Public Room
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary font-medium">
                            <Lock className="w-4 h-4" />
                            Private Room
                        </span>
                    )}
                </div>

                <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={cn(
                        "inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium mb-4",
                        currentPlayers.length >= maxPlayers
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-white/10 text-text/70'
                    )}
                >
                    <div className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        currentPlayers.length >= maxPlayers ? 'bg-emerald-400' : 'bg-accent'
                    )} />
                    {currentPlayers.length >= maxPlayers ? 'Ready to start!' : 'Waiting for players...'}
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-black text-text mb-4">Game Lobby</h1>

                {/* Room Code - Only show prominently for private rooms */}
                {!isPublicRoom && (
                    <div className="mb-6">
                        <p className="text-text/40 text-sm mb-2">Share this code with friends:</p>
                        <button
                            onClick={copyRoomCode}
                            className="cursor-target inline-flex items-center gap-4 px-8 py-4 bg-canvas/50 rounded-2xl border-2 border-accent hover:border-accent/80 transition-all hover:scale-105 group"
                        >
                            <span className="text-4xl md:text-5xl font-mono font-black tracking-[0.3em] text-accent">
                                {game?.room_code}
                            </span>
                            {copied ? (
                                <Check className="w-6 h-6 text-emerald-400" />
                            ) : (
                                <Copy className="w-6 h-6 text-accent/60 group-hover:text-accent transition-colors" />
                            )}
                        </button>
                    </div>
                )}

                {/* Player Count */}
                <div className="flex items-center justify-center gap-2 text-text/50">
                    <Users className="w-5 h-5" />
                    <span className="text-2xl font-bold text-accent">{currentPlayers.length}</span>
                    <span className="text-lg">/</span>
                    <span className="text-lg">{maxPlayers} players</span>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className={cn(
                "max-w-7xl mx-auto",
                !isPublicRoom ? "grid lg:grid-cols-3 gap-8" : ""
            )}>
                {/* Players Grid */}
                <div className={cn(!isPublicRoom ? "lg:col-span-2" : "")}>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                        {/* Current Players */}
                        {currentPlayers.map((player, index) => (
                            <motion.div
                                key={player.email}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "cursor-target flex items-center gap-4 p-4 rounded-2xl transition-all",
                                    player.email === currentUser?.email
                                        ? "bg-primary/20 border-2 border-primary/50"
                                        : "bg-canvas/40 border border-white/5 hover:border-white/10"
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center font-bold text-text text-lg shrink-0",
                                    playerColors[index % playerColors.length]
                                )}>
                                    {player.name?.[0]?.toUpperCase() || 'P'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-text truncate">
                                        {player.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        {index === 0 && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/20 rounded-full text-xs text-accent">
                                                <Crown className="w-3 h-3" /> Host
                                            </span>
                                        )}
                                        {player.email === currentUser?.email && (
                                            <span className="text-primary text-xs">(You)</span>
                                        )}
                                        {(player.email?.includes('bot') || player.email?.startsWith('ai-')) && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 rounded-full text-xs text-blue-400">
                                                <Bot className="w-3 h-3" /> AI
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Empty Slots */}
                        {Array.from({ length: Math.min(emptySlots, 4) }).map((_, i) => (
                            <div
                                key={`empty-${i}`}
                                className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-text/10"
                            >
                                <div className="w-12 h-12 rounded-full bg-canvas/30 flex items-center justify-center shrink-0">
                                    <Users className="w-6 h-6 text-text/20" />
                                </div>
                                <p className="text-text/30">Waiting...</p>
                            </div>
                        ))}
                    </div>

                    {/* Add AI Button - Host only */}
                    {isHost && currentPlayers.length < maxPlayers && (
                        <Button
                            onClick={() => addAIPlayerMutation.mutate()}
                            disabled={addAIPlayerMutation.isPending}
                            variant="secondary"
                            className="cursor-target"
                        >
                            {addAIPlayerMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Bot className="w-4 h-4 mr-2" />
                            )}
                            Add AI Player
                        </Button>
                    )}
                </div>

                {/* Chat Section - Only for Private Rooms */}
                {!isPublicRoom && (
                    <div className="flex flex-col bg-canvas/40 rounded-2xl border border-white/5 overflow-hidden h-[400px]">
                        <div className="flex items-center gap-2 p-4 border-b border-white/5">
                            <MessageCircle className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-text">Lobby Chat</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.length === 0 ? (
                                <p className="text-center text-text/30 text-sm py-8">No messages yet. Say hi!</p>
                            ) : (
                                messages.map((msg, i) => (
                                    <div
                                        key={msg._id || msg.id || i}
                                        className={cn(
                                            "flex flex-col",
                                            msg.sender_email === currentUser.email ? "items-end" : "items-start"
                                        )}
                                    >
                                        <span className="text-xs text-text/40 px-1 mb-1">
                                            {msg.sender_name || msg.sender_email?.split('@')[0]}
                                        </span>
                                        <div className={cn(
                                            "px-4 py-2 rounded-2xl max-w-[85%] text-sm",
                                            msg.sender_email === currentUser.email
                                                ? "bg-primary text-text rounded-br-sm"
                                                : "bg-secondary/30 text-text rounded-bl-sm"
                                        )}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-canvas/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-text placeholder:text-text/30 focus:outline-none focus:border-primary transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() || sendMessageMutation.isPending}
                                    className="cursor-target w-12 h-12 rounded-xl bg-primary flex items-center justify-center disabled:opacity-50 hover:bg-primary/80 transition-colors"
                                >
                                    <Send className="w-5 h-5 text-text" />
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Action Buttons - Fixed at Bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-canvas via-canvas/95 to-transparent">
                <div className="max-w-xl mx-auto flex gap-4">
                    <Button
                        variant="ghost"
                        onClick={onLeave}
                        className="flex-1 cursor-target"
                        size="lg"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Leave
                    </Button>

                    {isHost && (
                        <Button
                            onClick={() => startGameMutation.mutate()}
                            disabled={!canStart || startGameMutation.isPending}
                            className="flex-1 cursor-target"
                            size="lg"
                        >
                            {startGameMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Play className="w-5 h-5 mr-2" />
                                    {canStart ? 'Start Game' : `Need ${(game?.min_players || 3) - currentPlayers.length} more`}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
