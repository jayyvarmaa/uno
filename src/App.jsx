import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Leaderboard from './pages/Leaderboard'
import { Toaster } from 'sonner'
import TargetCursor from '@/components/effects/TargetCursor'

// Protected Route component
function ProtectedRoute({ children }) {
    const user = localStorage.getItem('user');
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function App() {
    return (
        <>
            {/* Global custom cursor */}
            <TargetCursor spinDuration={2} hideDefaultCursor={true} parallaxOn={true} />

            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                } />
                <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
            <Toaster position="top-center" richColors />
        </>
    )
}

export default App
