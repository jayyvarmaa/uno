import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, X, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatBox({ gameId, currentUser, isMinimized, onToggle }) {
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);
    const queryClient = useQueryClient();

    const { data: messages = [] } = useQuery({
        queryKey: ['messages', gameId],
        queryFn: () => base44.entities.Message.filter({ game_id: gameId }, 'created_date', 50),
        refetchInterval: 2000,
        enabled: !isMinimized
    });

    const sendMessageMutation = useMutation({
        mutationFn: (content) => base44.entities.Message.create({
            game_id: gameId,
            sender_email: currentUser.email,
            sender_name: currentUser.name || currentUser.full_name,
            content
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['messages', gameId]);
            setMessage('');
        }
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            sendMessageMutation.mutate(message.trim());
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <AnimatePresence mode="wait">
                {isMinimized ? (
                    <motion.button
                        key="minimized"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={onToggle}
                        className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform"
                    >
                        <MessageCircle className="w-6 h-6 text-text" />
                    </motion.button>
                ) : (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="w-80 h-96 glass-card rounded-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="font-bold text-text flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-primary" />
                                Chat
                            </h3>
                            <button onClick={onToggle} className="text-text/50 hover:text-text transition-colors">
                                <ChevronUp className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.length === 0 ? (
                                <p className="text-center text-text/30 text-sm mt-8">No messages yet</p>
                            ) : (
                                messages.map((msg, i) => (
                                    <div
                                        key={msg.id || i}
                                        className={cn(
                                            "flex flex-col",
                                            msg.sender_email === currentUser.email ? "items-end" : "items-start"
                                        )}
                                    >
                                        <span className="text-xs text-text/40 px-1 mb-1">{msg.sender_name}</span>
                                        <div className={cn(
                                            "px-3 py-2 rounded-2xl max-w-[80%] text-sm",
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

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-3 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-canvas/50 border border-text/10 rounded-xl px-3 py-2 text-sm text-text placeholder:text-text/30 focus:outline-none focus:border-primary transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center disabled:opacity-50 hover:bg-primary/80 transition-colors"
                                >
                                    <Send className="w-4 h-4 text-text" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
