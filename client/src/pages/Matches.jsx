import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import { toast } from 'react-toastify';
import { FaMagic, FaComments, FaArrowRight, FaFilter, FaSearch, FaSync, FaShieldAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const Matches = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [connectingUserId, setConnectingUserId] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    fetchMatches(user._id);
  }, []);

  const fetchMatches = async (userId) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/ai/matches/${userId}`);
      if (res.data.success && res.data.matches) {
        setMatches(res.data.matches);
      } else {
        setMatches([]);
      }
    } catch (err) {
      console.error('Failed to fetch matches:', err);
      toast.error(err.response?.data?.message || 'Could not load AI matches');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!currentUser) return;
    try {
      setRecalculating(true);
      const res = await api.post(`/api/ai/matches/${currentUser._id}`);
      if (res.data.success && res.data.matches) {
        setMatches(res.data.matches);
        toast.success(`AI evaluated ${res.data.totalProfilesAnalyzed} profiles successfully!`);
      }
    } catch (err) {
      toast.error('Failed to recalculate matches');
    } finally {
      setRecalculating(false);
    }
  };

  const handleStartChat = async (targetUserId) => {
    if (!targetUserId) {
      toast.info('Opening messages...');
      navigate('/chat');
      return;
    }

    try {
      setConnectingUserId(targetUserId);
      const res = await api.post('/api/messages/start', { recipientId: targetUserId });
      if (res.data.success && res.data.conversation) {
        navigate('/chat', { state: { conversationId: res.data.conversation._id, recipientId: targetUserId } });
      } else {
        navigate('/chat');
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      navigate('/chat');
    } finally {
      setConnectingUserId(null);
    }
  };

  // Filter matches
  const filteredMatches = matches.filter((m) => {
    const scoreMatches = m.score >= minScoreFilter;
    const query = searchQuery.toLowerCase();
    const nameMatches =
      (m.name && m.name.toLowerCase().includes(query)) ||
      (m.organization && m.organization.toLowerCase().includes(query)) ||
      (m.type && m.type.toLowerCase().includes(query));

    const industryMatches =
      selectedIndustry === 'all' ||
      (m.type && m.type.toLowerCase().includes(selectedIndustry.toLowerCase())) ||
      (m.investor?.preferredIndustries &&
        m.investor.preferredIndustries.some((i) => i.toLowerCase().includes(selectedIndustry.toLowerCase()))) ||
      (m.startup?.industry &&
        m.startup.industry.some((i) => i.toLowerCase().includes(selectedIndustry.toLowerCase())));

    return scoreMatches && nameMatches && industryMatches;
  });

  const getScoreColor = (score) => {
    if (score >= 85) return 'from-emerald-400 to-green-500 text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 70) return 'from-purple-400 to-indigo-500 text-purple-400 border-purple-500/40 bg-purple-500/10';
    return 'from-amber-400 to-yellow-500 text-amber-400 border-amber-500/40 bg-amber-500/10';
  };

  const getBadgeStyle = (level) => {
    if (level === 'Highly Recommended') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (level === 'Recommended') return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-purple-950 text-white">
      {/* Top Navigation */}
      <Navbar userType={currentUser?.role || 'startup'} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-sm font-medium mb-3">
              <FaMagic className="text-purple-400" />
              <span>Gemini-Powered Matchmaking Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {currentUser?.role === 'startup' ? 'Top Investor Matches' : 'Top Startup Opportunities'}
            </h1>
            <p className="mt-2 text-slate-400 max-w-2xl text-sm sm:text-base">
              {currentUser?.role === 'startup'
                ? 'High-precision investor matchmaking combining sector alignment, stage focus, ticket size compatibility, and investment thesis.'
                : 'Curated deal flow analyzed and scored based on your fund mandates, risk appetite, and strategic portfolio pillars.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 transition font-semibold text-sm shadow-lg shadow-purple-600/30 disabled:opacity-50"
            >
              <FaSync className={recalculating ? 'animate-spin' : ''} />
              <span>{recalculating ? 'Analyzing Profiles...' : 'Refresh Matches'}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name, organization or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-sm placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Industry Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-purple-400 text-sm ml-1" />
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Sectors & Industries</option>
              <option value="Artificial Intelligence">Artificial Intelligence & ML</option>
              <option value="B2B SaaS">B2B SaaS & Enterprise</option>
              <option value="DevTools">Developer Tools</option>
              <option value="Fintech">FinTech & Payments</option>
              <option value="Healthcare">Healthcare & BioTech</option>
              <option value="CleanTech">CleanTech & Sustainability</option>
              <option value="Cybersecurity">Cybersecurity</option>
            </select>
          </div>

          {/* Min Score Filter */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Min Score:</span>
            <div className="flex gap-2 w-full">
              {[0, 70, 85].map((threshold) => (
                <button
                  key={threshold}
                  onClick={() => setMinScoreFilter(threshold)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                    minScoreFilter === threshold
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-slate-900/40 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {threshold === 0 ? 'All' : `${threshold}%+`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-white/5 border border-white/10 animate-pulse p-6"></div>
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl bg-white/5 border border-white/10">
            <FaShieldAlt className="mx-auto text-4xl text-purple-400 mb-4" />
            <h3 className="text-xl font-bold">No Matches Found</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
              No profiles currently meet the selected filter criteria. Try clearing your filters or click Refresh Matches to re-run the AI matching algorithm.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedIndustry('all');
                setMinScoreFilter(0);
              }}
              className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMatches.map((match, idx) => {
              const targetUserId =
                currentUser?.role === 'startup'
                  ? match.investor?.userId?._id || match.investor?.userId
                  : match.startup?.userId?._id || match.startup?.userId;

              const targetProfileId =
                currentUser?.role === 'startup'
                  ? match.investor?._id
                  : match.startup?._id;

              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/70 border border-white/10 hover:border-purple-500/40 transition-all p-6 backdrop-blur-md shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Name + Score Badge */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(match.recommendation)}`}>
                            {match.recommendation || 'Recommended'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {match.type || (currentUser?.role === 'startup' ? 'Venture Capital' : 'Startup')}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold mt-2 text-white">{match.name}</h2>
                        {match.organization && match.organization !== match.name && (
                          <p className="text-sm text-purple-300 font-medium">{match.organization}</p>
                        )}
                      </div>

                      {/* Compatibility Score Circle */}
                      <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border ${getScoreColor(match.score)} shadow-inner`}>
                        <span className="text-xl font-extrabold">{match.score}%</span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Match</span>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-2 mt-4 text-xs text-slate-300">
                      {currentUser?.role === 'startup' ? (
                        <>
                          {match.investor?.ticketSize && (
                            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                              💰 Ticket: {match.investor.ticketSize}
                            </span>
                          )}
                          {match.investor?.preferredStages?.length > 0 && (
                            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                              🎯 Stages: {match.investor.preferredStages.slice(0, 2).join(', ')}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          {match.startup?.startupStage && (
                            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                              🚀 Stage: {match.startup.startupStage}
                            </span>
                          )}
                          {match.startup?.fundingAmount && (
                            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                              💵 Target: {match.startup.fundingAmount}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Why This Works Section */}
                    <div className="mt-5 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Why this match works
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {match.whyWorks && match.whyWorks.length > 0 ? (
                          match.whyWorks.map((pt, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2">
                              <FaCheckCircle className="text-emerald-400 text-xs mt-0.5 shrink-0" />
                              <span>{pt}</span>
                            </li>
                          ))
                        ) : (
                          <li className="flex items-center gap-2">
                            <FaCheckCircle className="text-emerald-400 text-xs shrink-0" />
                            <span>Strong alignment on investment mandates and growth trajectory</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Key Considerations / Potential Concerns */}
                    {match.potentialConcerns && match.potentialConcerns.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/5">
                        <div className="flex items-start gap-2 text-xs text-amber-300/90">
                          <FaExclamationTriangle className="text-amber-400 mt-0.5 shrink-0" />
                          <span>
                            <strong>Due Diligence Focus:</strong> {match.potentialConcerns.join('; ')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    {targetProfileId && (
                      <button
                        onClick={() =>
                          navigate(
                            currentUser?.role === 'startup'
                              ? `/investordetails/${targetProfileId}`
                              : `/startupsdetails/${targetProfileId}`
                          )
                        }
                        className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition"
                      >
                        <span>Full Profile</span>
                        <FaArrowRight className="text-[10px]" />
                      </button>
                    )}

                    <button
                      onClick={() => handleStartChat(targetUserId)}
                      disabled={connectingUserId === targetUserId}
                      className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 transition text-xs font-semibold text-white shadow-md shadow-purple-600/30"
                    >
                      <FaComments className="text-sm" />
                      <span>{connectingUserId === targetUserId ? 'Opening...' : 'Chat Now'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Matches;
