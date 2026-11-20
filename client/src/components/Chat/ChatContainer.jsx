import { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { formatMessageTime } from '../../lib/util';
import { FaPaperPlane, FaArrowLeft, FaUserCircle, FaCircle } from 'react-icons/fa';

const ChatContainer = ({ conversation, selectedUser, currentUser, onlineUserIds, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load messages whenever conversation changes
  useEffect(() => {
    if (conversation?._id) {
      fetchMessages(conversation._id);
    } else {
      setMessages([]);
    }
  }, [conversation?._id]);

  // Listen for socket events
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !conversation?._id) return;

    const handleReceiveMessage = (newMsg) => {
      if (newMsg.conversationId === conversation._id) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
      }
    };

    const handleUserTyping = ({ conversationId, userId, isTyping: typingState }) => {
      if (conversationId === conversation._id && userId !== currentUser?._id) {
        setIsTyping(typingState);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [conversation?._id, currentUser?._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollEndRef.current) {
      scrollEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const fetchMessages = async (convId) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/messages/${convId}`);
      if (res.data.success && res.data.messages) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    const socket = getSocket();
    if (socket && conversation?._id) {
      socket.emit('typing', {
        conversationId: conversation._id,
        userId: currentUser?._id,
        isTyping: true,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', {
          conversationId: conversation._id,
          userId: currentUser?._id,
          isTyping: false,
        });
      }, 1500);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || !conversation?._id || !currentUser?._id) return;

    setInputText('');

    const socket = getSocket();
    const receiverId = selectedUser?._id;

    // Send via Socket.io
    if (socket) {
      socket.emit('send_message', {
        conversationId: conversation._id,
        senderId: currentUser._id,
        receiverId,
        text: textToSend,
      });

      socket.emit('typing', {
        conversationId: conversation._id,
        userId: currentUser._id,
        isTyping: false,
      });
    }

    // Fallback/Persistence via HTTP
    try {
      const res = await api.post('/api/messages/send', {
        conversationId: conversation._id,
        receiverId,
        text: textToSend,
      });
      if (res.data.success && res.data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data.message._id)) return prev;
          return [...prev, res.data.message];
        });
      }
    } catch (err) {
      console.error('Failed to send message via HTTP:', err);
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-900/40">
        <div className="w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
          <FaPaperPlane className="text-2xl" />
        </div>
        <h3 className="text-lg font-bold text-white">Your Direct Messages</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Select an active conversation from the sidebar or click "Chat Now" on any high-compatibility match to start communicating.
        </p>
      </div>
    );
  }

  const isOnline = onlineUserIds.includes(selectedUser?._id?.toString());

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-900/50 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 shrink-0 bg-slate-900/80">
        <button
          onClick={onBack}
          className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition"
        >
          <FaArrowLeft className="text-sm" />
        </button>

        <div className="relative">
          {selectedUser.profilePic ? (
            <img
              src={selectedUser.profilePic}
              alt={selectedUser.fullName}
              className="w-10 h-10 rounded-full object-cover border border-white/10"
            />
          ) : (
            <FaUserCircle className="w-10 h-10 text-slate-400" />
          )}
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
              isOnline ? 'bg-emerald-400' : 'bg-slate-500'
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-white truncate flex items-center gap-2">
            {selectedUser.fullName}
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {selectedUser.role}
            </span>
          </h2>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
            <FaCircle className={`text-[8px] ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>{isOnline ? 'Active Now' : 'Offline'}</span>
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
        {loading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-12 w-48 rounded-2xl bg-white/5 animate-pulse ${
                  n % 2 === 0 ? 'ml-auto' : 'mr-auto'
                }`}
              ></div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No messages yet. Break the ice and introduce your vision!
          </div>
        ) : (
          messages.map((message, idx) => {
            const isMe =
              message.sender?._id?.toString() === currentUser?._id?.toString() ||
              message.sender?.toString() === currentUser?._id?.toString();

            return (
              <div
                key={message._id || idx}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="w-7 h-7 shrink-0 rounded-full overflow-hidden bg-white/10 mb-1">
                    {selectedUser.profilePic ? (
                      <img
                        src={selectedUser.profilePic}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="w-full h-full text-slate-400" />
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[75%] sm:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-md ${
                    isMe
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-100 rounded-bl-none border border-white/5'
                  }`}
                >
                  <p className="break-words">{message.text}</p>
                  <p
                    className={`text-[10px] mt-1 text-right ${
                      isMe ? 'text-purple-200/80' : 'text-slate-400'
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Counterpart Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-purple-300 italic py-1 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>{selectedUser.fullName} is typing...</span>
          </div>
        )}

        <div ref={scrollEndRef}></div>
      </div>

      {/* Input Form Area */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 sm:p-4 border-t border-white/10 bg-slate-900/90 shrink-0 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder={`Message ${selectedUser.fullName}...`}
          className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-semibold text-sm transition shadow-lg shadow-purple-600/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          <span>Send</span>
          <FaPaperPlane className="text-xs" />
        </button>
      </form>
    </div>
  );
};

export default ChatContainer;
