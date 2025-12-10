/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, registerUnauthorizedHandler } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setTokenState] = useState(() => api.getToken());

  const fetchCurrentUser = useCallback(async () => {
    if (!api.getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.get('/api/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    registerUnauthorizedHandler(() => {
      setUser(null);
      setTokenState(null);
    });
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password });
    api.setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async ({ name, username, email, password }) => {
    const payload = { name, username, email, password };
    const data = await api.post('/api/auth/register', payload);
    api.setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // ignore
    } finally {
      api.setToken(null);
      setTokenState(null);
      setUser(null);
    }
  };

  const deleteAccount = async () => {
    await api.delete('/api/auth/me');
    api.setToken(null);
    setTokenState(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const data = await api.put('/api/auth/me', updates);
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
