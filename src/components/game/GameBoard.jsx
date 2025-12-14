import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Loader2, RotateCw, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import PlayerHand from './PlayerHand';
import Card from './Card';
import OpponentCards from './OpponentCards';
import ColorPicker from './ColorPicker';
import GameOverModal from './GameOverModal';
import AIPlayer from './AIPlayer';

export default function GameBoard({ gameId, currentUser, onLeave }) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [pendingCard, setPendingCard] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [hasCalledUno, setHasCalledUno] = useState(false);
    const queryClient = useQueryClient();

    const { data: game, isLoading } = useQuery({
        queryKey: ['game', gameId],
        queryFn: async () => {
            const games = await base44.entities.Game.filter({ id: gameId });
            return games[0];
        },
        refetchInterval: 1000
    });

    const currentPlayerIndex = game?.players?.findIndex(p => p.email === currentUser?.email) ?? -1;
    const currentPlayer = game?.players?.[currentPlayerIndex];
    const isMyTurn = game?.current_player_index === currentPlayerIndex;

    // Get opponents positioned around the table
    const opponents = game?.players?.filter((_, i) => i !== currentPlayerIndex) || [];

    // Position opponents based on count
    const getOpponentPosition = (index, total) => {
        if (total === 1) return 'top';
        if (total === 2) {
            return index === 0 ? 'left' : 'right';
        }
        if (total === 3) {
            if (index === 0) return 'left';
            if (index === 1) return 'top';
            return 'right';
        }
        // 4+ opponents
        if (index === 0) return 'left';
        if (index === total - 1) return 'right';
        return 'top';
    };

    // Check if current turn is AI
    const currentTurnPlayer = game?.players?.[game?.current_player_index];
    const isAITurn = currentTurnPlayer?.email?.includes('bot') || currentTurnPlayer?.email?.startsWith('ai-');

    // Check if player should call UNO (has exactly 2 cards before playing)
    const shouldShowUnoButton = isMyTurn && currentPlayer?.cards?.length === 2 && !hasCalledUno;

    const getPlayableCards = useCallback((playerCards, discardPile, currentColor) => {
        if (!playerCards?.length || !discardPile?.length) return [];
        const topCard = discardPile[discardPile.length - 1];
        const checkColor = currentColor || topCard.color;

        return playerCards.filter(card => {
            if (card.color === 'wild') return true;
            if (card.color === checkColor) return true;
            if (card.type === topCard.type && card.value === topCard.value) return true;
            return false;
        });
    }, []);

    const playCardMutation = useMutation({
        mutationFn: async ({ card, chosenColor, playerIndex = currentPlayerIndex }) => {
            const targetPlayer = game.players[playerIndex];
            const newPlayerCards = targetPlayer.cards.filter(c => c.id !== card.id);
            const newDiscardPile = [...game.discard_pile, card];

            let nextColor = card.color === 'wild' ? chosenColor : card.color;
            let nextPlayerIndex = game.current_player_index;
            let newDirection = game.direction;
            let updatedPlayers = [...game.players];
            let newDeck = [...game.deck];

            // Handle special cards
            if (card.type === 'reverse') {
                newDirection = -newDirection;
            }

            // Calculate next player
            nextPlayerIndex = (nextPlayerIndex + newDirection + game.players.length) % game.players.length;

            if (card.type === 'skip') {
                nextPlayerIndex = (nextPlayerIndex + newDirection + game.players.length) % game.players.length;
            }

            // Draw 2/4 for next player
            if (card.type === 'draw2' || card.type === 'wild_draw4') {
                const drawCount = card.type === 'draw2' ? 2 : 4;
                const targetNextPlayer = updatedPlayers[nextPlayerIndex];
                const drawnCards = newDeck.slice(0, drawCount);
                targetNextPlayer.cards = [...(targetNextPlayer.cards || []), ...drawnCards];
                targetNextPlayer.card_count = targetNextPlayer.cards.length;
                newDeck = newDeck.slice(drawCount);
                nextPlayerIndex = (nextPlayerIndex + newDirection + game.players.length) % game.players.length;
            }

            // Update player's cards
            updatedPlayers[playerIndex].cards = newPlayerCards;
            updatedPlayers[playerIndex].card_count = newPlayerCards.length;

            // Check for winner
            const status = newPlayerCards.length === 0 ? 'finished' : 'playing';

            await base44.entities.Game.update(gameId, {
                players: updatedPlayers,
                discard_pile: newDiscardPile,
                current_player_index: nextPlayerIndex,
                current_color: nextColor,
                direction: newDirection,
                deck: newDeck,
                status,
                winner_email: status === 'finished' ? targetPlayer.email : undefined
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['game', gameId]);
            setHasCalledUno(false); // Reset UNO call status
        },
        onError: (err) => {
            toast.error('Failed to play card');
            console.error(err);
        }
    });

    const drawCardMutation = useMutation({
        mutationFn: async (playerIndex = currentPlayerIndex) => {
            let newDeck = [...game.deck];
            let newDiscardPile = [...game.discard_pile];

            if (!newDeck.length) {
                // Reshuffle discard pile into deck
                const reshuffled = newDiscardPile.slice(0, -1).sort(() => Math.random() - 0.5);
                newDeck = reshuffled;
                newDiscardPile = [newDiscardPile[newDiscardPile.length - 1]];
            }

            const drawnCard = newDeck[0];
            newDeck = newDeck.slice(1);
            const updatedPlayers = [...game.players];
            updatedPlayers[playerIndex].cards.push(drawnCard);
            updatedPlayers[playerIndex].card_count++;

            // Move to next player
            const nextPlayerIndex = (game.current_player_index + game.direction + game.players.length) % game.players.length;

            await base44.entities.Game.update(gameId, {
                players: updatedPlayers,
                deck: newDeck,
                discard_pile: newDiscardPile,
                current_player_index: nextPlayerIndex
            });

            return drawnCard;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['game', gameId]);
        }
    });

    // AI Player instance with medium difficulty
    const aiPlayerLogic = useMemo(() => new AIPlayer('medium'), []);

    // AI Turn Logic - using smarter AIPlayer class
    useEffect(() => {
        if (!game || game.status !== 'playing' || !isAITurn) return;

        const runAITurn = async () => {
            const aiPlayerIndex = game.current_player_index;
            const aiPlayer = game.players[aiPlayerIndex];

            if (!aiPlayer?.cards) return;

            // Simulate AI thinking for realism
            await aiPlayerLogic.simulateThinking();

            const topCard = game.discard_pile[game.discard_pile.length - 1];

            // Get AI decision
            const decision = await aiPlayerLogic.makeMove(
                aiPlayer.cards,
                topCard,
                game.current_color,
                game
            );

            if (decision.action === 'play') {
                playCardMutation.mutate({
                    card: decision.card,
                    chosenColor: decision.chosenColor,
                    playerIndex: aiPlayerIndex
                });
            } else {
                // AI draws a card
                drawCardMutation.mutate(aiPlayerIndex);
            }
        };

        const aiTimeout = setTimeout(runAITurn, 500);
        return () => clearTimeout(aiTimeout);
    }, [game?.current_player_index, game?.status, isAITurn, aiPlayerLogic]);

    const handleCardClick = (card) => {
        if (!isMyTurn) return;

        if (card.color === 'wild') {
            setPendingCard(card);
            setShowColorPicker(true);
        } else {
            playCardMutation.mutate({ card });
        }
    };

    const handleColorSelect = (color) => {
        if (pendingCard) {
            playCardMutation.mutate({ card: pendingCard, chosenColor: color });
        }
        setShowColorPicker(false);
        setPendingCard(null);
    };

    const handleCallUno = () => {
        setHasCalledUno(true);
        toast.success('UNO! 🎉');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#4A9FD4] via-[#2B7BB9] to-[#1A5C8E] flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-white" />
            </div>
        );
    }

    const winner = game?.status === 'finished'
        ? game.players.find(p => p.email === game.winner_email)
        : null;

    const topCard = game?.discard_pile?.[game.discard_pile.length - 1];

    // Separate opponents by position
    const leftOpponents = opponents.filter((_, i) => getOpponentPosition(i, opponents.length) === 'left');
    const topOpponents = opponents.filter((_, i) => getOpponentPosition(i, opponents.length) === 'top');
    const rightOpponents = opponents.filter((_, i) => getOpponentPosition(i, opponents.length) === 'right');

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#4A9FD4] via-[#2B7BB9] to-[#1A5C8E] relative overflow-hidden">
            {/* Settings Button - Top Right */}
            <button
                onClick={() => setShowSettings(!showSettings)}
                className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-colors"
            >
                <Settings className="w-5 h-5 text-white" />
            </button>

            {/* Settings Menu */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-16 right-4 z-50 bg-white rounded-xl shadow-xl p-4 min-w-[150px]"
                    >
                        <button
                            onClick={onLeave}
                            className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg font-medium"
                        >
                            Leave Game
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Game Layout Container */}
            <div className="h-screen flex flex-col p-4 md:p-8">

                {/* Top Opponents */}
                <div className="flex justify-center gap-8 mb-4">
                    {topOpponents.map((opponent, i) => (
                        <OpponentCards
                            key={opponent.email}
                            player={opponent}
                            isCurrentTurn={game?.current_player_index === game?.players?.findIndex(p => p.email === opponent.email)}
                            position="top"
                        />
                    ))}
                </div>

                {/* Middle Section - Left Opponent, Center (Discard + Draw), Right Opponent */}
                <div className="flex-1 flex items-center justify-between px-4">

                    {/* Left Opponent */}
                    <div className="flex flex-col items-center">
                        {leftOpponents.map((opponent, i) => (
                            <OpponentCards
                                key={opponent.email}
                                player={opponent}
                                isCurrentTurn={game?.current_player_index === game?.players?.findIndex(p => p.email === opponent.email)}
                                position="left"
                            />
                        ))}
                    </div>

                    {/* Center - Discard Pile with Turn Indicator */}
                    <div className="flex-1 flex items-center justify-center relative">
                        {/* Turn Direction Indicator - Circular arrows */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <motion.div
                                animate={{ rotate: game?.direction === 1 ? 360 : -360 }}
                                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                                className="w-48 h-48 md:w-64 md:h-64"
                            >
                                <svg viewBox="0 0 200 200" className="w-full h-full">
                                    <defs>
                                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                                            <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255,255,255,0.3)" />
                                        </marker>
                                    </defs>
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="85"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.15)"
                                        strokeWidth="3"
                                        strokeDasharray="20 10"
                                        markerEnd="url(#arrowhead)"
                                    />
                                </svg>
                            </motion.div>
                        </div>

                        {/* Discard Pile */}
                        <div className="relative z-10">
                            {topCard && (
                                <motion.div
                                    key={topCard.id}
                                    initial={{ scale: 0.8, rotate: -10 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="shadow-2xl"
                                >
                                    <Card card={topCard} size="xlarge" disabled />
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Right Opponent */}
                    <div className="flex flex-col items-center">
                        {rightOpponents.map((opponent, i) => (
                            <OpponentCards
                                key={opponent.email}
                                player={opponent}
                                isCurrentTurn={game?.current_player_index === game?.players?.findIndex(p => p.email === opponent.email)}
                                position="right"
                            />
                        ))}
                    </div>
                </div>

                {/* Bottom Section - Draw Pile, Player Hand, UNO Button */}
                <div className="relative mt-auto">
                    {/* Player Avatar - Above hand */}
                    <div className="flex justify-center mb-2">
                        <div className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-full",
                            isMyTurn ? "bg-yellow-400/30" : "bg-white/10"
                        )}>
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg",
                                isMyTurn ? "bg-yellow-500" : "bg-purple-500"
                            )}>
                                {currentPlayer?.name?.[0]?.toUpperCase() || 'P'}
                            </div>
                            <span className={cn(
                                "font-semibold",
                                isMyTurn ? "text-yellow-300" : "text-white"
                            )}>
                                {currentPlayer?.name} {isMyTurn && "- Your Turn!"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                        {/* Draw Pile - Bottom Left */}
                        <motion.button
                            onClick={() => isMyTurn && drawCardMutation.mutate()}
                            disabled={!isMyTurn || drawCardMutation.isPending}
                            className={cn(
                                "relative flex flex-col items-center",
                                isMyTurn ? "cursor-pointer" : "cursor-default"
                            )}
                            whileHover={isMyTurn ? { scale: 1.05 } : {}}
                            whileTap={isMyTurn ? { scale: 0.95 } : {}}
                        >
                            {/* Stack of cards - larger */}
                            <div className="relative">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute"
                                        style={{
                                            top: -i * 3,
                                            left: -i * 1.5,
                                            zIndex: 4 - i
                                        }}
                                    >
                                        <Card card={{}} size="large" faceDown />
                                    </div>
                                ))}
                                <Card card={{}} size="large" faceDown />
                            </div>
                            <span className="mt-3 text-white text-base font-bold">
                                {game?.deck?.length || 0} cards
                            </span>
                            {drawCardMutation.isPending && (
                                <Loader2 className="absolute inset-0 m-auto w-10 h-10 animate-spin text-white" />
                            )}
                        </motion.button>

                        {/* Player's Hand - Center */}
                        <div className="flex-1 flex justify-center">
                            <PlayerHand
                                cards={currentPlayer?.cards || []}
                                onCardClick={handleCardClick}
                                isCurrentPlayer={isMyTurn}
                                playableCards={isMyTurn ? getPlayableCards(currentPlayer?.cards, game?.discard_pile, game?.current_color) : []}
                                currentColor={game?.current_color}
                            />
                        </div>

                        {/* UNO Button - Bottom Right - Always visible */}
                        <motion.button
                            onClick={handleCallUno}
                            disabled={!shouldShowUnoButton}
                            className={cn(
                                "w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center font-black text-2xl md:text-3xl shadow-xl",
                                "bg-gradient-to-br from-[#E53935] to-[#C62828] text-white",
                                shouldShowUnoButton ? "cursor-pointer animate-pulse" : "cursor-default"
                            )}
                            whileHover={shouldShowUnoButton ? { scale: 1.1 } : {}}
                            whileTap={shouldShowUnoButton ? { scale: 0.9 } : {}}
                            style={{
                                boxShadow: shouldShowUnoButton
                                    ? '0 0 30px rgba(229, 57, 53, 0.8), 0 0 60px rgba(229, 57, 53, 0.4)'
                                    : '0 8px 20px rgba(0,0,0,0.3)'
                            }}
                        >
                            UNO
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Color Picker Modal */}
            <AnimatePresence>
                {showColorPicker && (
                    <ColorPicker
                        isOpen={showColorPicker}
                        onColorSelect={handleColorSelect}
                    />
                )}
            </AnimatePresence>

            {/* Game Over Modal */}
            {winner && (
                <GameOverModal
                    winner={winner}
                    currentUser={currentUser}
                    onPlayAgain={() => onLeave()}
                    onLeave={onLeave}
                />
            )}
        </div>
    );
}
