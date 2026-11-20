import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import AIPitchFeedback from '../components/AIPitchFeedback';
import AIChatModal from '../components/AIChatModal';
import Navbar from '../components/Navbar';
import axios from 'axios';

const featuredInvestors = [
  { id: 1, name: 'John Doe', focus: 'Fintech, SaaS, Seed-Stage', desc: 'Angel investor with a focus on early-stage technology startups.' },
  { id: 2, name: 'Jane Smith', focus: 'Healthtech, Series A', desc: 'Venture capitalist passionate about healthcare innovation.' },
  { id: 3, name: 'Alex Lee', focus: 'Edtech, Angel', desc: 'Edtech specialist investing in early-stage education startups.' },
  { id: 4, name: 'Priya Patel', focus: 'E-commerce, Series B', desc: 'E-commerce expert with a track record of scaling online brands.' },
  { id: 5, name: 'Carlos Gomez', focus: 'AgriTech, Seed', desc: 'Investing in sustainable agriculture and food tech startups.' },
  { id: 6, name: 'Linda Wang', focus: 'AI, DeepTech', desc: 'AI and deep tech investor supporting breakthrough innovation.' },
];

const StartupDashboard = () => {
  const navigate = useNavigate();
  const [showAIFeedback, setShowAIFeedback] = useState(false);
  const [startupData, setStartupData] = useState(null);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [matchedInvestors, setMatchedInvestors] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [tractionMetrics, setTractionMetrics] = useState({
    mrr: '$0',
    users: '0',
    growth: '0%'
  });
  const [monthlyUpdate, setMonthlyUpdate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [userName, setUserName] = useState('');
  const [aiFeedbackKeyPoints, setAiFeedbackKeyPoints] = useState([]);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  // Calculate profile completeness based on startup form data
  const calculateProfileCompleteness = (data) => {
    if (!data) return 0;

    const requiredFields = [
      'startupName',
      'websiteUrl',
      'founderNames',
      'email',
      'numberOfFounders',
      'teamSize',
      'founderBackground',
      'industry',
      'problemStatement',
      'productDescription',
      'businessModel',
      'startupStage',
      'fundingAmount',
      'fundingRoundType',
      'headquarters'
    ];

    const optionalFields = [
      'phone',
      'linkedinProfiles',
      'teamSkills',
      'techStack',
      'monthlyRevenue',
      'activeUsers',
      'fundingRaised',
      'customerRetention',
      'growthRate',
      'equityOffering',
      'operatingMarkets',
      'expansionPlan',
      'pitchDeck'
    ];

    let completedRequired = 0;
    let completedOptional = 0;

    // Check required fields
    requiredFields.forEach(field => {
      if (data[field]) {
        if (Array.isArray(data[field])) {
          if (data[field].length > 0) completedRequired++;
        } else if (typeof data[field] === 'boolean') {
          completedRequired++; // Boolean fields are considered complete if they exist
        } else if (data[field].toString().trim() !== '') {
          completedRequired++;
        }
      }
    });

    // Check optional fields
    optionalFields.forEach(field => {
      if (data[field]) {
        if (Array.isArray(data[field])) {
          if (data[field].length > 0) completedOptional++;
        } else if (typeof data[field] === 'boolean') {
          completedOptional++;
        } else if (data[field].toString().trim() !== '') {
          completedOptional++;
        }
      }
    });

    // Calculate percentage: 70% weight for required fields, 30% for optional fields
    const requiredPercentage = (completedRequired / requiredFields.length) * 70;
    const optionalPercentage = (completedOptional / optionalFields.length) * 30;
    
    return Math.round(requiredPercentage + optionalPercentage);
  };

  // Update traction metrics from startup data
  const updateTractionMetrics = (data) => {
    if (data) {
      setTractionMetrics({
        mrr: data.monthlyRevenue || '$0',
        users: data.activeUsers || '0',
        growth: data.growthRate || '0%'
      });
    }
  };

  // Extract key points from AI analysis
  const extractKeyPoints = (analysis) => {
    if (!analysis) return [];
    
    const keyPoints = [];
    const lines = analysis.split('\n');
    
    // Look for key sections in the AI analysis
    let currentSection = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Detect section headers
      if (trimmedLine.includes('✅ Strengths') || trimmedLine.includes('Strengths of This Pitch Deck') || trimmedLine.includes('### ✅ Strengths')) {
        currentSection = 'strengths';
      } else if (trimmedLine.includes('⚠️ Areas for Improvement') || trimmedLine.includes('Areas for Improvement') || trimmedLine.includes('### ⚠️ Areas for Improvement')) {
        currentSection = 'improvements';
      } else if (trimmedLine.includes('📈 Investment Recommendation') || trimmedLine.includes('Investment Recommendation') || trimmedLine.includes('### 📈 Investment Recommendation')) {
        currentSection = 'recommendation';
      } else if (trimmedLine.includes('🚨 Red Flags') || trimmedLine.includes('Red Flags') || trimmedLine.includes('### 🚨 Red Flags')) {
        currentSection = 'concerns';
      } else if (trimmedLine.includes('🔧 Specific Improvement') || trimmedLine.includes('Improvement Recommendations') || trimmedLine.includes('### 🔧 Specific Improvement')) {
        currentSection = 'improvements';
      } else if (trimmedLine.includes('🎯') || trimmedLine.includes('•') || trimmedLine.includes('-') || trimmedLine.includes('*')) {
        // Extract bullet points
        if (currentSection && trimmedLine.length > 10) {
          const cleanPoint = trimmedLine
            .replace(/^[•\-\*\s]+/, '')
            .replace(/^🎯\s*/, '')
            .replace(/^✅\s*/, '')
            .replace(/^⚠️\s*/, '')
            .replace(/^📈\s*/, '')
            .replace(/^🚨\s*/, '')
            .replace(/^🔧\s*/, '');
          
          if (cleanPoint.length > 5) {
            keyPoints.push({
              type: currentSection,
              point: cleanPoint
            });
          }
        }
      } else if (trimmedLine.length > 20 && !trimmedLine.startsWith('###') && !trimmedLine.startsWith('##') && !trimmedLine.startsWith('#')) {
        // If no section is detected but we have substantial content, treat as general feedback
        if (currentSection === '') {
          currentSection = 'general';
        }
        
        if (currentSection && trimmedLine.length > 15) {
          keyPoints.push({
            type: currentSection,
            point: trimmedLine
          });
        }
      }
    }
    
    // If no key points were extracted, provide fallback points
    if (keyPoints.length === 0) {
      return [
        { type: 'strengths', point: 'AI analysis completed successfully' },
        { type: 'improvements', point: 'Review the detailed analysis for specific recommendations' },
        { type: 'recommendation', point: 'Check the full analysis for investment insights' }
      ];
    }
    
    return keyPoints.slice(0, 6); // Limit to 6 key points
  };

  // Get user name from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user && user.name) {
      setUserName(user.name);
    }
  }, []);

  // Fetch startup data for AI analysis and profile completeness
  useEffect(() => {
    const fetchStartupData = async () => {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (user && user._id) {
        try {
          const response = await axios.get(`http://localhost:5000/api/forms/startup-form/user/${user._id}`);
          const data = response.data;
          setStartupData(data);
          
          // Calculate and set profile completeness
          const completeness = calculateProfileCompleteness(data);
          setProfileCompleteness(completeness);
          
          // Update traction metrics with real data
          updateTractionMetrics(data);
        } catch (error) {
          console.error('Failed to fetch startup data:', error);
          setStartupData(null);
          setProfileCompleteness(0);
        }
      }
    };
    fetchStartupData();
  }, []);

  // Fetch AI analysis for key points
  useEffect(() => {
    const fetchAIAnalysis = async () => {
      if (startupData && startupData._id) {
        setAiAnalysisLoading(true);
        try {
          console.log('Fetching AI analysis for startup:', startupData._id);
          console.log('Startup data:', startupData);
          console.log('Startup _id type:', typeof startupData._id);
          console.log('Startup _id value:', startupData._id);
          const response = await axios.post(`http://localhost:5000/api/ai/analyze/${startupData._id}`);
          console.log('AI analysis response:', response.data);
          
          if (response.data.success && response.data.analysis) {
            const keyPoints = extractKeyPoints(response.data.analysis);
            console.log('Extracted key points:', keyPoints);
            setAiFeedbackKeyPoints(keyPoints);
          } else {
            console.log('No analysis data in response');
            // Set default key points if AI analysis fails
            setAiFeedbackKeyPoints([
              { type: 'strengths', point: 'AI analysis available for your pitch deck' },
              { type: 'improvements', point: 'Get detailed feedback on your presentation' },
              { type: 'recommendation', point: 'AI will provide investment insights' }
            ]);
          }
        } catch (error) {
          console.error('Failed to fetch AI analysis:', error);
          console.error('Error details:', error.response?.data || error.message);
          
          // Set default key points if AI analysis fails
          setAiFeedbackKeyPoints([
            { type: 'strengths', point: 'AI analysis available for your pitch deck' },
            { type: 'improvements', point: 'Get detailed feedback on your presentation' },
            { type: 'recommendation', point: 'AI will provide investment insights' }
          ]);
        } finally {
          setAiAnalysisLoading(false);
        }
      } else if (startupData && (!startupData.pitchDeck || !startupData.pitchDeck.path)) {
        // No pitch deck available
        setAiFeedbackKeyPoints([
          { type: 'improvements', point: 'Upload a pitch deck to get AI analysis' },
          { type: 'recommendation', point: 'Complete your profile and add pitch deck' },
          { type: 'strengths', point: 'AI will analyze your presentation structure' }
        ]);
      } else {
        // No startup data
        setAiFeedbackKeyPoints([
          { type: 'improvements', point: 'Complete your startup profile first' },
          { type: 'recommendation', point: 'Fill out your startup form to get started' },
          { type: 'strengths', point: 'AI analysis will be available once profile is complete' }
        ]);
      }
    };
    
    fetchAIAnalysis();
  }, [startupData]);

  // Fetch matched investors
  useEffect(() => {
    const fetchMatchedInvestors = async () => {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (user && user._id) {
        setLoadingMatches(true);
        try {
          const response = await axios.get(`http://localhost:5000/api/forms/matched-investors/${user._id}`);
          if (response.data.success) {
            setMatchedInvestors(response.data.matches);
          } else {
            console.error('Failed to fetch matched investors:', response.data.message);
            setMatchedInvestors([]);
          }
        } catch (error) {
          console.error('Error fetching matched investors:', error);
          // If it's a 404 error (no investors in database), show a helpful message
          if (error.response && error.response.status === 404) {
            setMatchedInvestors([]);
          } else {
            setMatchedInvestors([]);
          }
        } finally {
          setLoadingMatches(false);
        }
      }
    };
    fetchMatchedInvestors();
  }, []);

  const handleAIFeedback = () => {
    if (!startupData || !startupData.pitchDeck || !startupData.pitchDeck.path) {
      alert('Please upload a pitch deck first to get AI feedback. You can do this by filling out the startup form.');
      navigate('/startup-form');
      return;
    }
    setShowAIFeedback(true);
  };

  const handleRefreshAIFeedback = async () => {
    if (!startupData || !startupData.pitchDeck || !startupData.pitchDeck.path) {
      alert('Please complete your profile and upload a pitch deck first.');
      return;
    }
    
    setAiAnalysisLoading(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/ai/analyze/${startupData._id}`);
      if (response.data.success && response.data.analysis) {
        const keyPoints = extractKeyPoints(response.data.analysis);
        setAiFeedbackKeyPoints(keyPoints);
      }
    } catch (error) {
      console.error('Failed to refresh AI analysis:', error);
      alert('Failed to refresh AI feedback. Please try again.');
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  const handleFileUpload = (file) => {
    setSelectedFile(file);
    // Here you would typically upload the file to your server
    console.log('File selected:', file.name);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Helper function to get investor initials for avatar
  const getInvestorInitials = (investor) => {
    if (investor.fullName) {
      return investor.fullName.split(' ').map(name => name[0]).join('').toUpperCase();
    }
    return 'IN';
  };

  // Helper function to get investor organization
  const getInvestorOrganization = (investor) => {
    return investor.organization || 'Independent Investor';
  };

  // Helper function to get AI feedback icon
  const getAIFeedbackIcon = (type) => {
    switch (type) {
      case 'strengths':
        return '✅';
      case 'improvements':
        return '⚠️';
      case 'recommendation':
        return '💡';
      case 'concerns':
        return '🚨';
      case 'general':
        return '📊';
      default:
        return '📊';
    }
  };

  // Helper function to get AI feedback color
  const getAIFeedbackColor = (type) => {
    switch (type) {
      case 'strengths':
        return 'text-green-400';
      case 'improvements':
        return 'text-yellow-400';
      case 'recommendation':
        return 'text-blue-400';
      case 'concerns':
        return 'text-red-400';
      case 'general':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white flex flex-col bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
      {/* Background Layer */}
      <div className="absolute inset-0 bg-[url('/src/assets/bgImage.svg')] bg-repeat-y bg-cover bg-center blur-sm brightness-75"></div>
      <div className="relative z-10 flex-1 w-full">
        {/* Navbar */}
        <Navbar userType="startup" />

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {userName || 'Founder'}! 👋</h1>
            <p className="text-gray-300">Here's what's happening with your startup today</p>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Profile Completeness */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-sm">📊</div>
                <h3 className="text-xl font-semibold">Profile Completeness</h3>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Completion</span>
                  <span className="text-sm font-semibold">{profileCompleteness}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-violet-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${profileCompleteness}%` }}
                  ></div>
                </div>
              </div>
              <button
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                onClick={() => navigate('/startup-profile-settings')}
              >
                Complete Profile
              </button>
            </div>

            {/* Traction Metrics */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-sm">📈</div>
                <h3 className="text-xl font-semibold">Traction Metrics</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Monthly Revenue</span>
                  <span className="font-semibold text-green-400">{tractionMetrics.mrr}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Active Users</span>
                  <span className="font-semibold">{tractionMetrics.users}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Growth Rate</span>
                  <span className="font-semibold text-green-400">{tractionMetrics.growth}</span>
                </div>
              </div>
            </div>

            {/* Matched Investors */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-sm">🎯</div>
                <h3 className="text-xl font-semibold">Matched Investors</h3>
              </div>
              <p className="text-gray-300 mb-6">Based on your profile and industry focus</p>
              
              {loadingMatches ? (
                <div className="space-y-4 mb-6">
                  <div className="animate-pulse">
                    <div className="bg-purple-600/20 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-gray-600 rounded-full mx-auto mb-3"></div>
                      <div className="h-4 bg-gray-600 rounded mb-2"></div>
                      <div className="h-3 bg-gray-600 rounded mb-2"></div>
                      <div className="h-6 bg-gray-600 rounded w-20 mx-auto"></div>
                    </div>
                  </div>
                </div>
              ) : matchedInvestors.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {matchedInvestors.slice(0, 3).map((match, index) => (
                    <div key={index} className="bg-purple-600/20 rounded-lg p-4 text-center hover:bg-purple-600/30 transition">
                      <div className="w-12 h-12 bg-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold">
                        {getInvestorInitials(match.investor)}
                      </div>
                      <div className="font-semibold text-white">{match.investor.fullName || 'Unknown Investor'}</div>
                      <div className="text-sm text-gray-400 mb-2">{getInvestorOrganization(match.investor)}</div>
                      <div className="bg-green-600/50 text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                        {match.score}% Match
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">No investors available</div>
                  <div className="text-sm text-gray-500">There are currently no investors in the database. Complete your profile to be ready when investors join the platform.</div>
                </div>
              )}
              
            <button
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
              onClick={() => navigate('/matches')}
            >
              View All Matches
            </button>
            </div>

            {/* AI Pitch Feedback */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-sm">🤖</div>
                <h3 className="text-xl font-semibold">AI Pitch Feedback</h3>
              </div>
              <div className="space-y-4 mb-6">
                {aiAnalysisLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                    <span className="ml-3 text-gray-300 text-sm">Analyzing pitch deck...</span>
                  </div>
                ) : aiFeedbackKeyPoints.length > 0 ? (
                  aiFeedbackKeyPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-purple-600/20 rounded-lg hover:bg-purple-600/30 transition">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {getAIFeedbackIcon(point.type)}
                      </div>
                      <div>
                        <div className={`font-semibold ${getAIFeedbackColor(point.type)}`}>{point.point}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">No AI analysis available</div>
                    <div className="text-sm text-gray-500">Complete your profile and upload a pitch deck to get AI feedback.</div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
            <button
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
              onClick={handleAIFeedback}
            >
              Get Detailed Analysis
            </button>
            <button className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition">
              Upload New Deck
            </button>
          </div>
            </div>

            {/* Messages & Meetings */}
            <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-sm">💬</div>
                <h3 className="text-xl font-semibold">Messages & Meetings</h3>
              </div>
              <div className="space-y-4 mb-6">
                {/* Recent Messages */}
                <div className="bg-purple-600/20 rounded-lg p-4 border-l-4 border-purple-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">Sarah Johnson - TechVentures</span>
                    <span className="text-sm text-gray-400">2 hours ago</span>
                  </div>
                  <p className="text-gray-300">Interested in learning more about your traction metrics. Available for a call this week?</p>
                </div>
                <div className="bg-purple-600/20 rounded-lg p-4 border-l-4 border-purple-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">Mike Chen - Innovation Partners</span>
                    <span className="text-sm text-gray-400">1 day ago</span>
                  </div>
                  <p className="text-gray-300">Great pitch deck! Would love to discuss your go-to-market strategy.</p>
                </div>
                <div className="bg-purple-600/20 rounded-lg p-4 border-l-4 border-purple-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">Emily Rodriguez - Startup Accelerator</span>
                    <span className="text-sm text-gray-400">3 days ago</span>
            </div>
                  <p className="text-gray-300">Your application has been reviewed. We'd like to schedule a follow-up meeting.</p>
            </div>
          </div>
              <div className="flex gap-4">
                  <button 
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                  onClick={() => navigate('/chat')}
                  >
                  View All Messages
                </button>
                <button className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition">
                  Schedule Meeting
                  </button>
                </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="mt-12 text-center">
            <h2 className="text-3xl font-bold mb-8">Quick Actions</h2>
            <div className="flex flex-wrap justify-center gap-6">
          <button 
                className="bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition flex items-center gap-2"
            onClick={() => navigate('/investor-search')}
          >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Investors
              </button>
              <button 
                className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-violet-700 transition flex items-center gap-2"
                onClick={handleAIFeedback}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Pitch Feedback
              </button>
              <button 
                className="bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-600 transition flex items-center gap-2"
                onClick={() => navigate('/startup-form')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Update Profile
          </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Pitch Feedback Modal */}
      {showAIFeedback && startupData && (
        <AIPitchFeedback
          startupId={startupData._id}
          onClose={() => setShowAIFeedback(false)}
        />
      )}

      {/* Fixed AI Chat Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowAIChat(true)}
          className="bg-gradient-to-r from-purple-500 to-violet-600 text-white p-4 rounded-full shadow-lg hover:from-purple-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-110"
          title="Chat with AI Assistant"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* AI Chat Modal */}
      {showAIChat && (
        <AIChatModal onClose={() => setShowAIChat(false)} />
      )}
    </div>
  );
};

export default StartupDashboard;