import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    const demoUser = {
      name: 'Demo User',
      username: email.split('@')[0].toLowerCase(),
      email,
      photo: 'https://picsum.photos/200',
    };
    setUser(demoUser);
  };

  const register = (email, username, password) => {
    const demoUser = {
      name: 'New User',
      username: username.replace(/\s+/g, '').toLowerCase(),
      email,
      photo: 'https://picsum.photos/200',
    };
    setUser(demoUser);
  };

  const logout = () => setUser(null);
  const deleteAccount = () => setUser(null);
  const updateProfile = (updates) => setUser((prev) => ({ ...prev, ...updates }));

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateProfile, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
