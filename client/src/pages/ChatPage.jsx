import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ChatContainer from '../components/Chat/ChatContainer';
import RightSideBar from '../components/Chat/RightSidebar';
import SideBar from '../components/Chat/SideBar';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import { getSocket, initSocket } from '../lib/socket';

const ChatPage = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      const socket = initSocket(user._id);

      socket.on('online_users', (ids) => {
        setOnlineUserIds(ids || []);
      });

      socket.on('new_message_notification', ({ conversationId, message }) => {
        setConversations((prev) => {
          return prev.map((c) => {
            if (c._id === conversationId) {
              return {
                ...c,
                lastMessageText: message.text || 'New message',
                lastMessageTime: new Date(),
              };
            }
            return c;
          });
        });
      });

      loadConversations(user._id);
    }
  }, []);

  const loadConversations = async (myUserId) => {
    try {
      setLoadingConversations(true);
      const res = await api.get('/api/messages/conversations');
      if (res.data.success && res.data.conversations) {
        setConversations(res.data.conversations);

        // Check if navigation state specified a conversation
        if (location.state?.conversationId) {
          const matchedConv = res.data.conversations.find(
            (c) => c._id === location.state.conversationId
          );
          if (matchedConv) {
            handleSelectConversation(matchedConv, myUserId);
            return;
          }
        }

        // Otherwise auto-select the first conversation if available
        if (res.data.conversations.length > 0) {
          handleSelectConversation(res.data.conversations[0], myUserId);
        }
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleSelectConversation = (conv, myUserId = currentUser?._id) => {
    setSelectedConversation(conv);
    const counterpart = conv.participants.find(
      (p) => p._id.toString() !== myUserId?.toString()
    );
    setSelectedUser(counterpart || conv.participants[0]);

    const socket = getSocket();
    if (socket && conv._id) {
      socket.emit('join_conversation', conv._id);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-slate-950">
      {/* Background Gradient Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-900 -z-10"></div>

      {/* Navbar */}
      <div className="relative z-50 bg-black/40 backdrop-blur-md border-b border-white/10 shrink-0">
        <Navbar userType={currentUser?.role || 'startup'} />
      </div>

      {/* Chat Layout Container */}
      <div className="flex-1 overflow-hidden p-3 sm:p-6 flex items-center justify-center">
        <div
          className={`w-full max-w-7xl h-full backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-purple-950/50 grid grid-cols-1 ${
            selectedUser
              ? 'md:grid-cols-[300px_1fr] lg:grid-cols-[320px_1fr_280px]'
              : 'md:grid-cols-[320px_1fr]'
          }`}
        >
          <SideBar
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            currentUser={currentUser}
            onlineUserIds={onlineUserIds}
            loading={loadingConversations}
          />
          <ChatContainer
            conversation={selectedConversation}
            selectedUser={selectedUser}
            currentUser={currentUser}
            onlineUserIds={onlineUserIds}
            onBack={() => {
              setSelectedConversation(null);
              setSelectedUser(null);
            }}
          />
          <RightSideBar selectedUser={selectedUser} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
