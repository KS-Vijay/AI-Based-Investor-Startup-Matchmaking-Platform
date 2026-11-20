import React from 'react';
import { FaUserCircle, FaBuilding, FaEnvelope, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const RightSidebar = ({ selectedUser }) => {
  const navigate = useNavigate();

  if (!selectedUser) return null;

  return (
    <div className="bg-slate-900/80 border-l border-white/10 h-full p-6 flex flex-col text-white max-lg:hidden overflow-y-auto">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center mt-4">
        {selectedUser.profilePic ? (
          <img
            src={selectedUser.profilePic}
            alt={selectedUser.fullName}
            className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/40 shadow-xl"
          />
        ) : (
          <FaUserCircle className="w-20 h-20 text-slate-400" />
        )}
        <h3 className="text-base font-bold mt-3 text-white">{selectedUser.fullName}</h3>
        <span className="mt-1 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
          {selectedUser.role}
        </span>
      </div>

      <div className="my-6 border-t border-white/10" />

      {/* Details List */}
      <div className="space-y-4 text-xs">
        <div>
          <span className="text-slate-400 font-semibold block mb-1">Email</span>
          <div className="flex items-center gap-2 text-slate-200 break-all">
            <FaEnvelope className="text-purple-400 shrink-0" />
            <span>{selectedUser.email || 'Not provided'}</span>
          </div>
        </div>

        <div>
          <span className="text-slate-400 font-semibold block mb-1">Account Role</span>
          <div className="flex items-center gap-2 text-slate-200 capitalize">
            <FaBuilding className="text-purple-400 shrink-0" />
            <span>{selectedUser.role === 'startup' ? 'Startup Founder' : 'Venture / Angel Investor'}</span>
          </div>
        </div>

        <div className="pt-2">
          <span className="text-slate-400 font-semibold block mb-1">Status</span>
          <p className="text-slate-300 leading-relaxed">
            Verified participant in the AI-Based Matchmaking Platform.
          </p>
        </div>
      </div>

      {/* Quick Action */}
      <div className="mt-auto pt-6">
        <button
          onClick={() => navigate('/matches')}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center justify-center gap-2"
        >
          <span>Explore Matches</span>
          <FaExternalLinkAlt className="text-[10px]" />
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;
