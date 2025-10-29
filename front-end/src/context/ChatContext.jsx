import { createContext, useContext, useState } from 'react';
import { mockChats as initialChats } from '../utils/mockChats';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chats, setChats] = useState(initialChats);

  // Helper to get a readable time string
  const timeNow = () => {
    const date = new Date();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Find or create a chat by username (no duplicates)
  const getOrCreateChat = (username) => {
    let chat = chats.find((c) => c.user === username);
    if (!chat) {
      chat = {
        id: chats.length + 1,
        user: username,
        lastMessage: 'New conversation started',
        time: timeNow(),
        messages: [
          { sender: 'me', text: 'Hey there!', time: timeNow() },
          { sender: username, text: 'Hi! Nice to connect.', time: timeNow() },
        ],
      };
      setChats((prev) => {
        // prevent duplicates just in case
        if (prev.find((c) => c.user === username)) return prev;
        return [...prev, chat];
      });
    }
    return chat;
  };

  // Add a message to an existing chat
  const addMessage = (username, messageText) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.user === username
          ? {
              ...chat,
              lastMessage: messageText,
              time: timeNow(),
              messages: [
                ...chat.messages,
                { sender: 'me', text: messageText, time: timeNow() },
              ],
            }
          : chat
      )
    );
  };

  return (
    <ChatContext.Provider value={{ chats, getOrCreateChat, addMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
