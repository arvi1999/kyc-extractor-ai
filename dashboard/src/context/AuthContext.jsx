import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserDetails = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
            return true;
        } catch (error) {
            console.error('Failed to fetch user details:', error);
            // Only logout on 401 (unauthorized), not on network errors
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                setUser(null);
            }
            return false;
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            // Check if token exists on load
            const token = localStorage.getItem('token');
            if (token) {
                await fetchUserDetails();
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        const response = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token } = response.data;
        localStorage.setItem('token', access_token);

        // Fetch full user details after login
        await fetchUserDetails();

        return true;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
