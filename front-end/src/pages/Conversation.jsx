import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import toast from 'react-hot-toast';

export default function Conversation() {
  const { username } = useParams();
  const { fetchConversation, addMessage, conversations } = useChat();
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const chat = conversations[username];

  const loadChat = useCallback(
    async (silent = false) => {
      try {
        await fetchConversation(username, { silent });
      } catch (error) {
        if (!silent) {
          toast.error(error.message || 'Unable to load conversation');
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [fetchConversation, username]
  );

  useEffect(() => {
    setLoading(true);
    loadChat();
    const interval = setInterval(() => loadChat(true), 1500);
    return () => clearInterval(interval);
  }, [loadChat]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chat?.messages?.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const text = messageText.trim();
    setMessageText('');
    try {
      await addMessage(username, text);
      await loadChat(true);
    } catch (error) {
      toast.error(error.message || 'Failed to send message');
      setMessageText(text); // restore text so user can retry
    }
  };

  if (loading && !chat) {
    return (
      <div className="text-center mt-10 text-gray-600">
        Loading conversation with @{username}...
      </div>
    );
  }

  if (!chat)
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl font-semibold text-gray-700">
          Conversation with @{username} is unavailable.
        </h2>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Chatting with</p>
          <h1 className="text-xl font-bold text-blue-700">
            {chat.name ? `${chat.name} (@${chat.username})` : `@${chat.username}`}
          </h1>
        </div>
        <button
          onClick={() => navigate('/messages')}
          className="text-blue-600 hover:underline text-sm"
        >
          Back to Inbox
        </button>
      </div>

      {/* Chat messages */}
      <div className="p-4 space-y-3 h-96 overflow-y-auto bg-gray-50">
        {(chat.messages || []).length === 0 ? (
          <p className="text-center text-gray-400 mt-20 text-sm">
            No messages yet. Say hello!
          </p>
        ) : (
          (chat.messages || []).map((m, index) => (
            <div
              key={`${m.timestamp}-${index}`}
              className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[70%]">
                <div
                  className={`px-3 py-2 rounded-lg text-sm ${
                    m.sender === 'me' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {m.text}
                </div>
                <p
                  className={`text-xs text-gray-400 mt-1 ${
                    m.sender === 'me' ? 'text-right' : 'text-left'
                  }`}
                >
                  {new Date(m.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="flex border-t p-3 gap-2 bg-white">
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
