import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import TargetCursor from '@/components/effects/TargetCursor';

const GOOGLE_CLIENT_ID = '379788372636-g5u34aeep6jtpo2csl0n9cntiedmb9il.apps.googleusercontent.com';

export default function Login() {
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState('');
    const [nameError, setNameError] = useState('');
    const [isGuest, setIsGuest] = useState(false);

    // Validate display name: alphabets only, max 14 chars
    const validateName = (name) => {
        if (name.length > 14) {
            setNameError('Max 14 characters');
            return false;
        }
        if (!/^[a-zA-Z]*$/.test(name)) {
            setNameError('Letters only');
            return false;
        }
        setNameError('');
        return true;
    };

    const handleNameChange = (e) => {
        const value = e.target.value;
        if (value.length <= 14 && /^[a-zA-Z]*$/.test(value)) {
            setDisplayName(value);
            setNameError('');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            // Decode the JWT token to get user info
            const token = credentialResponse.credential;
            const payload = JSON.parse(atob(token.split('.')[1]));

            const user = {
                email: payload.email,
                name: displayName || payload.name,
                full_name: payload.name,
                picture: payload.picture,
                id: payload.sub,
                isGuest: false
            };

            // Store user and token
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            toast.success(`Welcome, ${user.name}!`);
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Failed to sign in');
        }
    };

    const handleGuestLogin = () => {
        if (!displayName || displayName.length < 2) {
            setNameError('Enter at least 2 letters');
            return;
        }

        const guestUser = {
            email: `guest-${Date.now()}@guest.uno`,
            name: displayName,
            full_name: displayName,
            id: `guest_${Date.now()}`,
            isGuest: true
        };

        localStorage.setItem('user', JSON.stringify(guestUser));
        toast.success(`Welcome, ${displayName}! (Guest mode)`);
        navigate('/');
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="min-h-screen bg-canvas relative overflow-hidden flex items-center justify-center px-4">
                <TargetCursor spinDuration={2} hideDefaultCursor={true} parallaxOn={true} />
                <div className="noise-overlay" />

                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 w-full max-w-md"
                >
                    {/* Logo */}
                    <div className="text-center mb-10">
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="inline-block mb-6"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-accent/50 blur-xl rounded-full" />
                                <Gamepad2 className="w-16 h-16 text-accent relative z-10" />
                            </div>
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black text-text mb-2">
                            UNO <span className="text-primary">SHOWDOWN</span>
                        </h1>
                        <p className="text-text/50">Sign in to create and join games</p>
                    </div>

                    {/* Login Card */}
                    <div className="glass-card rounded-3xl p-8 space-y-6">
                        {/* Display Name Input */}
                        <div>
                            <label className="flex items-center gap-2 text-sm text-text/70 mb-2">
                                <User className="w-4 h-4" />
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={handleNameChange}
                                placeholder="Enter your name"
                                maxLength={14}
                                className="w-full bg-canvas/50 border border-white/10 rounded-xl px-4 py-3 text-text placeholder:text-text/30 focus:outline-none focus:border-accent transition-colors text-lg"
                            />
                            <div className="flex justify-between mt-2">
                                {nameError ? (
                                    <span className="text-primary text-xs flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {nameError}
                                    </span>
                                ) : (
                                    <span className="text-text/30 text-xs">Letters only, max 14</span>
                                )}
                                <span className="text-text/30 text-xs">{displayName.length}/14</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-transparent text-text/40 text-sm">sign in with</span>
                            </div>
                        </div>

                        {/* Google Sign In */}
                        <div className="flex justify-center cursor-target">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error('Google sign in failed')}
                                theme="filled_black"
                                size="large"
                                text="signin_with"
                                shape="rectangular"
                                width="300"
                            />
                        </div>

                        {/* OR Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-transparent text-text/40 text-sm">or</span>
                            </div>
                        </div>

                        {/* Guest Mode */}
                        <Button
                            onClick={handleGuestLogin}
                            variant="secondary"
                            className="w-full cursor-target"
                            size="lg"
                        >
                            Continue as Guest
                        </Button>

                        <p className="text-center text-text/40 text-xs">
                            Guests can only join rooms, not create them
                        </p>
                    </div>
                </motion.div>
            </div>
        </GoogleOAuthProvider>
    );
}
