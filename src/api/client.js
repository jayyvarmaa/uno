import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor for auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Get current user from localStorage
const getCurrentUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
};

// API client matching base44 SDK structure
const client = {
    auth: {
        me: async () => {
            const user = getCurrentUser();
            if (user) return user;
            throw new Error('Not logged in');
        },
        logout: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        },
        isGuest: () => {
            const user = getCurrentUser();
            return user?.isGuest === true;
        },
        redirectToLogin: () => {
            window.location.href = '/login';
        }
    },
    entities: {
        Game: {
            create: async (data) => (await api.post('/games', data)).data,
            update: async (id, data) => (await api.put(`/games/${id}`, data)).data,
            filter: async (query) => {
                const params = {};
                if (query.id) params.id = query.id;
                if (query.room_code) params.room_code = query.room_code;
                return (await api.get('/games', { params })).data;
            },
            get: async (id) => (await api.get(`/games/${id}`)).data,
        },
        PlayerStats: {
            filter: async (query) => (await api.get('/stats', { params: query })).data,
            create: async (data) => (await api.post('/stats', data)).data,
            update: async (id, data) => (await api.put(`/stats/${id}`, data)).data,
            list: async (sort, limit) => (await api.get('/stats', { params: { sort, limit } })).data,
        },
        Message: {
            filter: async (query, sort, limit) => (await api.get('/messages', { params: { ...query, sort, limit } })).data,
            create: async (data) => (await api.post('/messages', data)).data,
        }
    }
};

export default client;
export { client as base44 };
