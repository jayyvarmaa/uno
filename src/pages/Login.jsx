import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GoogleLogin, GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Dither from '@/components/effects/Dither';

// ... existing code ...

{/* Dither Background Effect */ }
<div className="absolute inset-0 z-0 opacity-60">
    <ErrorBoundary fallback={<div className="w-full h-full bg-primary/20" />}>
        <Dither
            waveSpeed={0.03}
            waveFrequency={2.5}
            waveAmplitude={0.4}
            waveColor={[0.8, 0.15, 0.1]}
            colorNum={4}
            pixelSize={3}
            enableMouseInteraction={false}
            mouseRadius={0.8}
        />
    </ErrorBoundary>
</div>



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

                <div className="noise-overlay" />

                {/* Dither Background Effect - Disabled */}
                <div className="absolute inset-0 z-0 opacity-60 bg-primary/20" />

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



                        {/* Guest Mode - on top */}
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

                        {/* OR Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-transparent text-text/40 text-sm">or</span>
                            </div>
                        </div>

                        {/* Google Sign In - at bottom */}
                        <div className="flex justify-center">
                            <Button
                                onClick={() => {
                                    const googleLoginBtn = document.querySelector('[data-google-login-btn]');
                                    if (googleLoginBtn) googleLoginBtn.click();
                                }}
                                variant="secondary"
                                className="w-full flex items-center justify-center gap-3 py-6 cursor-target"
                                size="lg"
                            >
                                {/* Google "G" Icon */}
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign in with Google
                            </Button>
                            {/* Hidden actual Google login trigger */}
                            <div className="hidden" data-google-login-btn>
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => toast.error('Google sign in failed')}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </GoogleOAuthProvider>
    );
}
