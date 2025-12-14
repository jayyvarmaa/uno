import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UserNotRegisteredError({ onLogin }) {
    return (
        <div className="min-h-screen bg-canvas flex items-center justify-center relative overflow-hidden">
            <div className="noise-overlay" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-3xl p-10 text-center max-w-md mx-4"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center"
                >
                    <AlertCircle className="w-10 h-10 text-primary" />
                </motion.div>

                <h2 className="text-2xl font-bold text-text mb-3">
                    Not Logged In
                </h2>

                <p className="text-text/50 mb-8">
                    You need to be logged in to play UNO Showdown.
                    Create an account or sign in to continue.
                </p>

                <Button
                    onClick={onLogin}
                    size="lg"
                    className="w-full"
                >
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In to Play
                </Button>
            </motion.div>
        </div>
    );
}
