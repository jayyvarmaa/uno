import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/client';
import CreateGame from '@/components/lobby/CreateGame';
import JoinGame from '@/components/lobby/JoinGame';
import WaitingRoom from '@/components/lobby/WaitingRoom';
import GameBoard from '@/components/game/GameBoard';
import { Button } from '@/components/ui/button';
import { Trophy, Gamepad2, LogOut, User } from 'lucide-react';
import { Toaster } from 'sonner';
import TargetCursor from '@/components/effects/TargetCursor';

export default function Home() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentGameId, setCurrentGameId] = useState(null);
  const [gameStatus, setGameStatus] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {
      navigate('/login');
    });
  }, [navigate]);

  const handleGameCreated = (game) => {
    setCurrentGameId(game.id || game._id);
    setGameStatus('waiting');
  };

  const handleGameJoined = (game) => {
    setCurrentGameId(game.id || game._id);
    setGameStatus('waiting');
  };

  const handleGameStart = (game) => {
    setGameStatus('playing');
  };

  const handleLeaveGame = () => {
    setCurrentGameId(null);
    setGameStatus(null);
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const isGuest = currentUser?.isGuest === true;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (gameStatus === 'playing' && currentGameId) {
    return (
      <>
        <TargetCursor spinDuration={2} hideDefaultCursor={true} parallaxOn={true} />
        <GameBoard
          gameId={currentGameId}
          currentUser={currentUser}
          onLeave={handleLeaveGame}
        />
        <Toaster position="top-center" />
      </>
    );
  }

  if (gameStatus === 'waiting' && currentGameId) {
    return (
      <div className="min-h-screen bg-canvas relative overflow-hidden">
        <TargetCursor spinDuration={2} hideDefaultCursor={true} parallaxOn={true} />
        <div className="noise-overlay" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <WaitingRoom
          gameId={currentGameId}
          currentUser={currentUser}
          onGameStart={handleGameStart}
          onLeave={handleLeaveGame}
        />
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas relative overflow-hidden selection:bg-primary/30">
      <TargetCursor spinDuration={2} hideDefaultCursor={true} parallaxOn={true} />
      <div className="noise-overlay" />
      <Toaster position="top-center" />

      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* User Info Bar */}
      <div className="relative z-20 flex items-center justify-end gap-4 px-6 py-4">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-canvas/50 border border-white/10">
          <User className="w-4 h-4 text-accent" />
          <span className="text-text font-medium">{currentUser.name}</span>
          {isGuest && (
            <span className="px-2 py-0.5 rounded-full bg-secondary/30 text-text/60 text-xs">Guest</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="cursor-target"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex flex-col items-center justify-center gap-6 mb-8">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-accent/50 blur-xl rounded-full" />
              <Gamepad2 className="w-20 h-20 text-accent relative z-10" />
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-text via-text to-text/50 drop-shadow-2xl tracking-tighter">
              UNO <span className="text-primary block md:inline">SHOWDOWN</span>
            </h1>
          </div>

          <p className="text-xl text-text/60 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience the classic card game reimagined with a modern, high-stakes design.
            Play with friends, climb the ranks, and master the deck.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/leaderboard" className="cursor-target">
              <Button variant="outline" size="lg" className="border-accent text-accent hover:bg-accent/10 glass cursor-target">
                <Trophy className="w-5 h-5 mr-2" />
                Leaderboard
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 relative">
          <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-32 bg-gradient-to-b from-transparent via-text/20 to-transparent" />

          {/* Create Game - Only for non-guests */}
          {!isGuest ? (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CreateGame
                currentUser={currentUser}
                onGameCreated={handleGameCreated}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary/30 flex items-center justify-center mb-4">
                <Gamepad2 className="w-7 h-7 text-text/50" />
              </div>
              <h2 className="text-xl font-bold text-text/50 mb-2">Create Game</h2>
              <p className="text-text/30 text-sm mb-6">Sign in with Google to create your own game rooms</p>
              <Link to="/login">
                <Button
                  variant="secondary"
                  className="cursor-target"
                >
                  Sign in with Google
                </Button>
              </Link>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <JoinGame
              currentUser={currentUser}
              onGameJoined={handleGameJoined}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
