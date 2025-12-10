import { useChat } from '../context/ChatContext';
import { Link } from 'react-router-dom';

export default function Messages() {
  const { chats, loading } = useChat();
  const sortedChats = [...chats].sort(
    (a, b) =>
      new Date(b.lastTimestamp || 0).getTime() -
      new Date(a.lastTimestamp || 0).getTime()
  );

  const formatStamp = (stamp) => {
    if (!stamp) return '';
    return new Date(stamp).toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <h1 className="text-2xl font-bold p-4 border-b">Inbox</h1>

      {loading ? (
        <p className="text-center text-gray-500 py-6">Loading chats...</p>
      ) : sortedChats.length === 0 ? (
        <p className="text-center text-gray-500 py-6">No messages yet</p>
      ) : (
        <ul>
          {sortedChats.map((chat) => {
            const subtitle = chat.lastMessage
              ? `${chat.lastSender === 'me' ? 'You: ' : ''}${chat.lastMessage}`
              : 'No messages yet';
            return (
              <li
                key={chat.username}
                className="flex justify-between items-center p-4 border-b hover:bg-gray-50 transition"
              >
                <Link to={`/messages/${chat.username}`} className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">@{chat.username}</p>
                      <p className="text-sm text-gray-500 truncate max-w-[250px]">{subtitle}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                        {formatStamp(chat.lastTimestamp)}
                      </span>
                      {chat.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[22px] h-6 px-2 rounded-full bg-red-500 text-white text-xs font-semibold">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
