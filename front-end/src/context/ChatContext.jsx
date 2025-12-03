import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchChats = useCallback(async () => {
    if (!user) {
      setChats([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.get('/api/chats');
      setChats(data.chats || []);
    } catch (error) {
      console.error('Failed to load chats', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const fetchConversation = useCallback(async (username) => {
    const data = await api.get(`/api/chats/${username}`);
    return data.chat;
  }, []);

  const addMessage = useCallback(
    async (username, text) => {
      await api.post(`/api/chats/${username}/messages`, { text });
      await fetchChats();
    },
    [fetchChats]
  );

  return (
    <ChatContext.Provider value={{ chats, fetchChats, fetchConversation, addMessage, loading }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
