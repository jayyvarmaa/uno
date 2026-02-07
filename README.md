# UNO Showdown 🎮

A multiplayer UNO-style card game built with React, Node.js, and Socket.io.

## ✨ Features

- **Real-time Multiplayer** - Play with friends using Socket.io
- **AI Opponents** - Practice against intelligent bot players
- **Modern UI** - Glassmorphism design with smooth animations
- **Public & Private Rooms** - Create private games or browse public lobbies
- **Leaderboard** - Track your wins and climb the ranks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (optional - runs in demo mode without it)

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start development servers**
   ```bash
   npm run dev:full
   ```
   This starts both the frontend (port 5173) and backend (port 5000).

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/base44_uno` |
| `JWT_SECRET` | Secret for JWT tokens | (required) |
| `PORT` | Backend server port | `5000` |
| `VITE_API_URL` | API URL for frontend | `http://localhost:5000/api` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173,http://localhost:3000` |

## 📁 Project Structure

```
UNO/
├── src/                  # Frontend React app
│   ├── api/              # API client
│   ├── components/       # React components
│   │   ├── game/         # Game board components
│   │   ├── lobby/        # Room/lobby components
│   │   └── ui/           # Reusable UI components
│   └── pages/            # Page components
├── server/               # Backend Express app
│   ├── models/           # MongoDB models
│   └── routes/           # API routes
└── Cards/                # Card assets
```

## 🎨 Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Framer Motion
- **Backend**: Express.js, Socket.io, MongoDB
- **3D**: Three.js, React Three Fiber

## 🎯 npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start frontend only |
| `npm run server` | Start backend only |
| `npm run dev:full` | Start full stack (frontend + backend) |
| `npm run build` | Build for production |

## 📝 License

MIT
