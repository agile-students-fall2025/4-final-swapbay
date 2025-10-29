import { useChat } from '../context/ChatContext';
import { Link } from 'react-router-dom';

export default function Messages() {
  const { chats } = useChat();
  const sortedChats = [...chats].sort((a, b) => b.id - a.id);

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <h1 className="text-2xl font-bold p-4 border-b">Inbox</h1>

      {sortedChats.length === 0 ? (
        <p className="text-center text-gray-500 py-6">No messages yet</p>
      ) : (
        <ul>
          {sortedChats.map((chat) => (
            <li
              key={chat.user}
              className="flex justify-between items-center p-4 border-b hover:bg-gray-50 transition"
            >
              <Link to={`/messages/${chat.user}`} className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">@{chat.user}</p>
                    <p className="text-sm text-gray-500 truncate max-w-[250px]">
                      {chat.lastMessage}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {chat.time}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
