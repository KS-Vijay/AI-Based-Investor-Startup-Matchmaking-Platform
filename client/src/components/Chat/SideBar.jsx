import React, { useState } from 'react';
import assets from '../../assets/assets';
import { FaSearch, FaUserCircle } from 'react-icons/fa';

const SideBar = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  currentUser,
  onlineUserIds,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    const counterpart = conv.participants.find(
      (p) => p._id.toString() !== currentUser?._id?.toString()
    );
    if (!counterpart) return true;
    return (
      counterpart.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counterpart.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div
      className={`bg-slate-900/80 border-r border-white/10 h-full p-4 flex flex-col text-white ${
        selectedConversation ? 'max-md:hidden' : ''
      }`}
    >
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
            Conversations
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-medium border border-purple-500/30">
            {conversations.length} Active
          </span>
        </div>

        {/* Search */}
        <div className="bg-slate-800/80 rounded-xl flex items-center gap-2 py-2 px-3 mt-4 border border-white/5">
          <FaSearch className="text-slate-400 text-xs" />
          <input
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-slate-400 flex-1"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-1 pr-1">
        {loading ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-14 rounded-xl bg-white/5 animate-pulse"></div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            {searchTerm ? 'No conversations found.' : 'No active chats yet. Start one from the Matches page!'}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const counterpart = conv.participants.find(
              (p) => p._id.toString() !== currentUser?._id?.toString()
            ) || conv.participants[0];

            const isOnline = onlineUserIds.includes(counterpart?._id?.toString());
            const isSelected = selectedConversation?._id === conv._id;

            return (
              <div
                onClick={() => onSelectConversation(conv)}
                key={conv._id}
                className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                  isSelected
                    ? 'bg-purple-600/30 border border-purple-500/40 text-white'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                {/* Profile Pic / Avatar with Online Dot */}
                <div className="relative shrink-0">
                  {counterpart?.profilePic ? (
                    <img
                      src={counterpart.profilePic}
                      alt={counterpart.fullName}
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

                {/* Name & Last Message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate text-white">
                      {counterpart?.fullName || 'User'}
                    </p>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/5">
                      {counterpart?.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {conv.lastMessageText || 'Tap to send a message'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SideBar;
