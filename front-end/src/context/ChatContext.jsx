import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [conversations, setConversations] = useState({});
  const [loading, setLoading] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const pollRef = useRef(null);

  const cacheConversation = useCallback((chat) => {
    if (!chat?.username) return;
    setConversations((prev) => ({
      ...prev,
      [chat.username]: { ...(prev[chat.username] || {}), ...chat },
    }));
  }, []);

  const refreshChats = useCallback(
    async ({ silent = false } = {}) => {
      if (!user) {
        setChats([]);
        setConversations({});
        setUnreadTotal(0);
        return;
      }
      if (!silent) setLoading(true);
      try {
        const data = await api.get('/api/chats');
        const nextChats = data.chats || [];
        setChats(nextChats);
        const unread = data.unreadTotal ?? nextChats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setUnreadTotal(unread);
      } catch (error) {
        console.error('Failed to load chats', error);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [user]
  );

  const fetchConversation = useCallback(
    async (username) => {
      const data = await api.get(`/api/chats/${username}`);
      cacheConversation(data.chat);
      await refreshChats({ silent: true });
      return data.chat;
    },
    [cacheConversation, refreshChats]
  );

  const addMessage = useCallback(
    async (username, text) => {
      const data = await api.post(`/api/chats/${username}/messages`, { text });
      cacheConversation(data.chat);
      await refreshChats({ silent: true });
      return data.message;
    },
    [cacheConversation, refreshChats]
  );

  useEffect(() => {
    if (!user) {
      setChats([]);
      setConversations({});
      setUnreadTotal(0);
      return;
    }

    refreshChats();
    const interval = setInterval(() => refreshChats({ silent: true }), 2000);
    pollRef.current = interval;

    return () => {
      clearInterval(interval);
      pollRef.current = null;
    };
  }, [user, refreshChats]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        conversations,
        fetchChats: refreshChats,
        fetchConversation,
        addMessage,
        loading,
        unreadTotal,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
