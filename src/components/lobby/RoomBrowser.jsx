import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RoomBrowser({ onJoinRoom }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFullRooms, setShowFullRooms] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const roomsPerPage = 12;

    const { data: publicRooms = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['publicGames'],
        queryFn: async () => {
            const response = await fetch('http://localhost:5000/api/games/public');
            if (!response.ok) throw new Error('Failed to fetch rooms');
            return response.json();
        },
        refetchInterval: 5000 // Auto-refresh every 5 seconds
    });

    // Filter rooms
    const filteredRooms = publicRooms.filter(room => {
        const matchesSearch = !searchQuery ||
            room.host_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.room_code?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFullFilter = showFullRooms || room.player_count < room.max_players;
        return matchesSearch && matchesFullFilter;
    });

    // Pagination
    const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
    const paginatedRooms = filteredRooms.slice(
        (currentPage - 1) * roomsPerPage,
        currentPage * roomsPerPage
    );

    const getRoomStatus = (room) => {
        if (room.player_count >= room.max_players) return 'full';
        if (room.player_count >= room.max_players - 1) return 'almost-full';
        return 'available';
    };

    const statusColors = {
        'full': 'bg-red-500',
        'almost-full': 'bg-yellow-500',
        'available': 'bg-green-500'
    };

    return (
        <div className="space-y-4">
            {/* Header with Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search rooms..."
                        className="w-full pl-10 pr-4 py-2.5 bg-canvas/50 border border-white/10 rounded-xl text-sm text-text placeholder:text-text/30 focus:outline-none focus:border-primary transition-colors"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showFullRooms}
                            onChange={(e) => setShowFullRooms(e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-canvas/50 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-text/60">Show full rooms</span>
                    </label>

                    <button
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        className="p-2 rounded-lg bg-canvas/50 border border-white/10 hover:border-white/20 transition-colors"
                    >
                        <RefreshCw className={cn("w-4 h-4 text-text/60", isRefetching && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* Room Count */}
            <div className="flex items-center justify-between text-sm text-text/50">
                <span>{filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} available</span>
                {totalPages > 1 && (
                    <span>{currentPage} / {totalPages}</span>
                )}
            </div>

            {/* Room Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : paginatedRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="w-12 h-12 text-text/20 mb-4" />
                    <p className="text-text/40 text-lg">No public rooms available</p>
                    <p className="text-text/30 text-sm mt-1">Create one to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {paginatedRooms.map((room, index) => {
                        const status = getRoomStatus(room);
                        const isFull = status === 'full';

                        return (
                            <motion.button
                                key={room._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => !isFull && onJoinRoom(room)}
                                disabled={isFull}
                                className={cn(
                                    "cursor-target relative p-4 rounded-xl bg-[#2B7BB9] border-2 border-[#1A5C8E] text-left transition-all",
                                    isFull
                                        ? "opacity-60 cursor-not-allowed"
                                        : "hover:scale-[1.02] hover:border-[#4A9FD4] hover:shadow-lg hover:shadow-blue-500/20"
                                )}
                            >
                                {/* Room Name (Host) */}
                                <p className="font-semibold text-white truncate text-sm mb-1">
                                    {room.host_name || 'Unknown'}'s Room
                                </p>

                                {/* Host Info */}
                                <p className="text-white/60 text-xs truncate mb-3">
                                    #{room.room_code}
                                </p>

                                {/* Player Count Badge */}
                                <div className="flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5 text-white/70" />
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-xs font-bold text-white",
                                        statusColors[status]
                                    )}>
                                        {room.player_count}/{room.max_players}
                                    </span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-canvas/50 border border-white/10 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        ◄
                    </button>
                    <span className="px-4 py-2 text-accent font-bold">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg bg-canvas/50 border border-white/10 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        ►
                    </button>
                </div>
            )}
        </div>
    );
}
