import { useParams, Link, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useEffect, useState } from 'react';

export default function Conversation() {
  const { username } = useParams();
  const { getOrCreateChat, addMessage, chats } = useChat();
  const [chat, setChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const chatFound = getOrCreateChat(username);
    setChat(chatFound);
  }, [username, chats]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    addMessage(username, messageText);
    setMessageText('');
  };

  if (!chat)
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl font-semibold text-gray-700">
          Loading conversation with @{username}...
        </h2>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">@{chat.user}</h1>
        <button
          onClick={() => navigate('/messages')}
          className="text-blue-600 hover:underline text-sm"
        >
          Back to Inbox
        </button>
      </div>

      {/* Chat messages */}
      <div className="p-4 space-y-3 h-96 overflow-y-auto bg-gray-50">
        {chat.messages.map((m, index) => (
          <div
            key={index}
            className={`flex ${
              m.sender === 'me' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className="max-w-[70%]">
              <div
                className={`px-3 py-2 rounded-lg text-sm ${
                  m.sender === 'me'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {m.text}
              </div>
              <p
                className={`text-xs text-gray-400 mt-1 ${
                  m.sender === 'me' ? 'text-right' : 'text-left'
                }`}
              >
                {m.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="flex border-t p-3 gap-2 bg-white"
      >
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
