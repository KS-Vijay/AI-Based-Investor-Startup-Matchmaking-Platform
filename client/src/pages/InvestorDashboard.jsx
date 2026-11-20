import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import startupsData from '../startups.js'
import Navbar from '../components/Navbar'
import AIInvestorChatModal from '../components/AIInvestorChatModal'
import axios from 'axios'

const InvestorDashboard = () => {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState(null)
  const [showAiChat, setShowAiChat] = useState(false)
  const [marketTrends, setMarketTrends] = useState(null)
  const [portfolioAnalytics, setPortfolioAnalytics] = useState(null)
  const [recommendedStartups, setRecommendedStartups] = useState([])
  
  // Dummy: Replace with real data if available
  const [investedStartups, setInvestedStartups] = useState([startupsData[0], startupsData[1]])
  const [interestedStartups, setInterestedStartups] = useState([startupsData[2], startupsData[3]])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (user) {
      setCurrentUser(user)
      setProfile({
        fullName: user.fullName || '',
        email: user.email || '',
      })
      // Load AI insights and recommendations
      loadAiInsights(user._id)
      loadMarketTrends()
      loadPortfolioAnalytics()
    }
  }, [])

     const loadAiInsights = async (userId) => {
     try {
       setLoading(true)
       // Get investor profile for AI analysis
       const profileResponse = await axios.get(`http://localhost:5000/api/forms/investor-form/user/${userId}`)
       const investorProfile = profileResponse.data || {}
       
       // Store investor profile in localStorage for later use
       localStorage.setItem('investorProfile', JSON.stringify(investorProfile))
       
       // Get all startups for AI recommendations
       const startupsResponse = await axios.get('http://localhost:5000/api/forms/startup-form')
       const allStartups = startupsResponse.data || []
       
       // Generate AI insights
       const insightsResponse = await axios.post('http://localhost:5000/api/ai/investor-insights', {
         investorProfile,
         allStartups,
         investedStartups,
         interestedStartups
       })
       
       if (insightsResponse.data.success) {
         setAiInsights(insightsResponse.data.insights)
         setRecommendedStartups(insightsResponse.data.recommendations || [])
       }
     } catch (error) {
       console.error('Error loading AI insights:', error)
       // Set fallback insights
       setAiInsights({
         marketOpportunities: ['AI/ML startups showing strong growth', 'Fintech sector experiencing consolidation', 'HealthTech gaining investor interest'],
         portfolioGaps: ['Early-stage SaaS opportunities', 'Emerging market exposure', 'ESG-focused investments'],
         riskFactors: ['Market volatility in tech sector', 'Regulatory changes in fintech', 'Supply chain disruptions'],
         recommendations: ['Consider diversifying into emerging markets', 'Focus on sustainable tech investments', 'Monitor regulatory developments']
       })
     } finally {
       setLoading(false)
     }
   }

  const loadMarketTrends = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/ai/market-trends')
      if (response.data.success) {
        setMarketTrends(response.data.trends)
      }
    } catch (error) {
      console.error('Error loading market trends:', error)
      // Set fallback trends
      setMarketTrends({
        topSectors: ['AI/ML', 'Fintech', 'HealthTech', 'CleanTech', 'EdTech'],
        emergingTrends: ['Web3 adoption', 'Sustainable tech', 'Remote work solutions', 'Cybersecurity'],
        marketSentiment: 'Bullish',
        keyMetrics: {
          totalDeals: '2,847',
          avgDealSize: '$12.5M',
          growthRate: '23%',
          exitValue: '$89.2B'
        }
      })
    }
  }

     const loadPortfolioAnalytics = async () => {
     try {
       const response = await axios.post('http://localhost:5000/api/ai/portfolio-analytics', {
         investedStartups,
         interestedStartups
       })
       if (response.data.success) {
         setPortfolioAnalytics(response.data.analytics)
       }
     } catch (error) {
       console.error('Error loading portfolio analytics:', error)
       // Set fallback analytics
       setPortfolioAnalytics({
         totalInvestments: investedStartups.length,
         portfolioValue: '$2.4M',
         avgReturn: '18.5%',
         diversification: 'Good',
         riskScore: 'Medium',
         topPerformers: investedStartups.slice(0, 2),
         sectors: ['Fintech', 'AI/ML', 'HealthTech'],
         stages: ['Series A', 'Series B', 'Seed']
       })
     }
   }

   // Function to generate specific message when no startups are found
   const getNoStartupsMessage = () => {
     // Get investor profile from localStorage or use default
     const user = JSON.parse(localStorage.getItem('currentUser'))
     if (!user) {
       return "There are currently no startups matching your investment criteria."
     }

     // Try to get investor profile data
     const investorProfile = JSON.parse(localStorage.getItem('investorProfile')) || {}
     
     // Extract interests from various possible fields
     const interests = [
       investorProfile.investmentInterests,
       investorProfile.preferredIndustries,
       investorProfile.focusAreas,
       investorProfile.sectors,
       investorProfile.industries
     ].filter(Boolean).join(', ')

     if (interests) {
       // Extract the first/main interest for the message
       const mainInterest = interests.split(',')[0].trim()
       return `There are currently no startups focused on ${mainInterest} that match your investment criteria.`
     }

     // Fallback based on common investment areas
     const commonAreas = ['AI/ML', 'Fintech', 'HealthTech', 'CleanTech', 'EdTech', 'SaaS']
     const randomArea = commonAreas[Math.floor(Math.random() * commonAreas.length)]
     return `There are currently no startups focused on ${randomArea} that match your investment criteria.`
   }



  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white flex flex-col bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
      {/* Background Layer */}
      <div className="absolute inset-0 bg-[url('/src/assets/bgImage.svg')] bg-repeat-y bg-cover bg-center blur-sm brightness-75"></div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 w-full">
        {/* Navbar */}
        <Navbar userType="investor" />

        {/* Welcome Section */}
        <section className="flex flex-col items-center justify-center text-center py-12 px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-2">
            Welcome, {profile.fullName || 'Investor'}
          </h1>
          <p className="mt-2 text-gray-300 text-lg">
            Your AI-powered investment dashboard with intelligent insights and recommendations.
          </p>
        </section>

                 {/* Fixed AI Chat Icon */}
         <div className="fixed bottom-6 right-6 z-50">
           <button
             onClick={() => setShowAiChat(true)}
             className="bg-gradient-to-r from-purple-500 to-violet-600 text-white p-4 rounded-full shadow-lg hover:from-purple-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-110"
             title="Chat with AI Assistant"
           >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
             </svg>
           </button>
         </div>

                 {/* AI Chat Modal */}
         {showAiChat && (
           <AIInvestorChatModal onClose={() => setShowAiChat(false)} />
         )}

        {/* Dashboard Grid */}
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          
                     {/* AI Investment Insights */}
           <section className="lg:col-span-2 bg-white/10 rounded-xl p-6 border border-gray-700 shadow-lg">
             <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
               <span className="text-2xl">🤖</span>
               AI Investment Insights
             </h2>
             {loading ? (
               <div className="text-center py-8">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                 <p className="mt-2 text-gray-300">Loading AI insights...</p>
               </div>
             ) : aiInsights ? (
               <div className="space-y-4">
                 {/* Market Opportunities */}
                 <div className="bg-black/30 p-4 rounded-lg border border-gray-600">
                   <h3 className="font-semibold text-white mb-3">Market Opportunities</h3>
                   <div className="space-y-3">
                     {aiInsights.marketOpportunities?.map((opp, index) => (
                       <div key={index} className="border-l-2 border-green-400 pl-3">
                         <div className="flex justify-between items-start">
                           <div className="font-medium text-sm text-white">{opp.sector || opp}</div>
                           {opp.confidence && (
                             <span className={`px-2 py-1 rounded text-xs ${
                               opp.confidence === 'High' ? 'bg-green-600' :
                               opp.confidence === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'
                             }`}>
                               {opp.confidence}
                             </span>
                           )}
                         </div>
                         <div className="text-xs text-gray-200 mt-1">
                           {opp.opportunity || opp}
                         </div>
                         {opp.marketCondition && (
                           <div className="text-xs text-green-300 mt-1">
                             📈 {opp.marketCondition}
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Portfolio Gaps */}
                 <div className="bg-black/30 p-4 rounded-lg border border-gray-600">
                   <h3 className="font-semibold text-white mb-3">Portfolio Gaps</h3>
                   <div className="space-y-3">
                     {aiInsights.portfolioGaps?.map((gap, index) => (
                       <div key={index} className="border-l-2 border-yellow-400 pl-3">
                         <div className="font-medium text-sm text-white">{gap.gap || gap}</div>
                         {gap.impact && (
                           <div className="text-xs text-gray-200 mt-1">
                             ⚠️ {gap.impact}
                           </div>
                         )}
                         {gap.recommendation && (
                           <div className="text-xs text-blue-300 mt-1">
                             💡 {gap.recommendation}
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Risk Factors */}
                 {aiInsights.riskFactors && (
                   <div className="bg-black/30 p-4 rounded-lg border border-gray-600">
                     <h3 className="font-semibold text-white mb-3">Risk Assessment</h3>
                     <div className="space-y-3">
                       {aiInsights.riskFactors?.map((risk, index) => (
                         <div key={index} className="border-l-2 border-red-400 pl-3">
                           <div className="flex justify-between items-start">
                             <div className="font-medium text-sm text-white">{risk.risk || risk}</div>
                             {risk.severity && (
                               <span className={`px-2 py-1 rounded text-xs ${
                                 risk.severity === 'High' ? 'bg-red-600' :
                                 risk.severity === 'Medium' ? 'bg-yellow-600' : 'bg-green-600'
                               }`}>
                                 {risk.severity}
                               </span>
                             )}
                           </div>
                           {risk.mitigation && (
                             <div className="text-xs text-blue-300 mt-1">
                               🛡️ {risk.mitigation}
                             </div>
                           )}
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Strategic Recommendations */}
                 {aiInsights.strategicRecommendations && (
                   <div className="bg-black/30 p-4 rounded-lg border border-gray-600">
                     <h3 className="font-semibold text-white mb-3">Strategic Recommendations</h3>
                     <div className="space-y-3">
                       {aiInsights.strategicRecommendations?.map((strategy, index) => (
                         <div key={index} className="border-l-2 border-blue-400 pl-3">
                           <div className="flex justify-between items-start">
                             <div className="font-medium text-sm text-white">{strategy.strategy || strategy}</div>
                             {strategy.timeline && (
                               <span className="px-2 py-1 rounded text-xs bg-blue-600">
                                 {strategy.timeline}
                               </span>
                             )}
                           </div>
                           {strategy.rationale && (
                             <div className="text-xs text-gray-200 mt-1">
                               💭 {strategy.rationale}
                             </div>
                           )}
                           {strategy.expectedOutcome && (
                             <div className="text-xs text-green-300 mt-1">
                               🎯 {strategy.expectedOutcome}
                             </div>
                           )}
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Fallback for old format */}
                 {!aiInsights.strategicRecommendations && aiInsights.recommendations && (
                   <div className="bg-black/30 p-4 rounded-lg border border-gray-600">
                     <h3 className="font-semibold text-white mb-2">AI Recommendations</h3>
                     <ul className="space-y-1 text-sm">
                       {aiInsights.recommendations?.map((rec, index) => (
                         <li key={index} className="flex items-center gap-2 text-gray-200">
                           <span className="text-blue-400">→</span>
                           {rec}
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
               </div>
             ) : (
               <p className="text-gray-300">AI insights not available</p>
             )}
           </section>

          {/* Portfolio Analytics */}
          <section className="bg-white/10 rounded-xl p-6 border border-gray-700 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Portfolio Analytics
            </h2>
            {portfolioAnalytics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{portfolioAnalytics.totalInvestments}</div>
                    <div className="text-sm text-gray-300">Investments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{portfolioAnalytics.avgReturn}</div>
                    <div className="text-sm text-gray-300">Avg Return</div>
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="text-sm text-gray-300 mb-1">Portfolio Value</div>
                  <div className="text-xl font-bold">{portfolioAnalytics.portfolioValue}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-300">Risk Score:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      portfolioAnalytics.riskScore === 'Low' ? 'bg-green-600' :
                      portfolioAnalytics.riskScore === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                      {portfolioAnalytics.riskScore}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Diversification:</span>
                    <span className="ml-2 text-green-400">{portfolioAnalytics.diversification}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-300">Analytics loading...</p>
            )}
          </section>

          {/* Market Trends */}
          <section className="bg-white/10 rounded-xl p-6 border border-gray-700 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Market Trends
            </h2>
            {marketTrends ? (
              <div className="space-y-4">
                {/* Market Sentiment */}
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="text-sm text-gray-300 mb-1">Market Sentiment</div>
                  <div className={`text-lg font-bold ${
                    marketTrends.marketSentiment === 'Bullish' ? 'text-green-400' : 
                    marketTrends.marketSentiment === 'Bearish' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {marketTrends.marketSentiment}
                  </div>
                </div>

                {/* Market Indices */}
                {marketTrends.marketIndices && (
                  <div>
                    <div className="text-sm text-gray-300 mb-2">Market Indices</div>
                    <div className="space-y-2">
                      {marketTrends.marketIndices.slice(0, 2).map((index, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span>{index.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">${index.price?.toFixed(2)}</span>
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              index.changePercent > 0 ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                              {index.changePercent > 0 ? '+' : ''}{index.changePercent?.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sector Performance */}
                {marketTrends.sectorPerformance && (
                  <div>
                    <div className="text-sm text-gray-300 mb-2">Top Sectors</div>
                    <div className="space-y-1">
                      {marketTrends.sectorPerformance.slice(0, 3).map((sector, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span>{sector.name}</span>
                          <span className={`px-2 py-0.5 rounded ${
                            sector.performance > 0 ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                            {sector.performance > 0 ? '+' : ''}{sector.performance?.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VC Trends */}
                {marketTrends.vcTrends && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(marketTrends.vcTrends).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="font-bold">{value}</div>
                        <div className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Data Source */}
                {marketTrends.dataSource && (
                  <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-600">
                    {marketTrends.dataSource}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-300">Market data loading...</p>
            )}
          </section>

                     {/* AI Recommended Startups */}
           <section className="lg:col-span-2 bg-white/10 rounded-xl p-6 border border-gray-700 shadow-lg">
             <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
               <span className="text-2xl">🎯</span>
               AI Recommended Startups
             </h2>
             {recommendedStartups.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {recommendedStartups.slice(0, 4).map((startup, index) => (
                   <div key={index} className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition">
                     <div className="flex justify-between items-start mb-2">
                       <h3 className="font-semibold">{startup.name}</h3>
                       <span className="bg-green-600 px-2 py-1 rounded text-xs">
                         {startup.matchScore || '85%'} Match
                       </span>
                     </div>
                     <p className="text-sm text-gray-300 mb-2">{startup.description}</p>
                     <div className="flex gap-2">
                       <span className="bg-indigo-700 px-2 py-1 rounded text-xs">{startup.industry}</span>
                       <span className="bg-purple-700 px-2 py-1 rounded text-xs">{startup.stage}</span>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8">
                 <div className="text-6xl mb-4">🔍</div>
                 <h3 className="text-lg font-semibold text-gray-200 mb-2">No Matching Startups Found</h3>
                 <p className="text-gray-400 text-sm mb-4">
                   {getNoStartupsMessage()}
                 </p>
                 <div className="bg-black/30 p-4 rounded-lg border border-gray-600">
                   <h4 className="font-medium text-white mb-2">💡 Suggestions:</h4>
                   <ul className="text-sm text-gray-300 space-y-1">
                     <li>• Try broadening your investment criteria</li>
                     <li>• Check back later for new startups</li>
                     <li>• Consider exploring related industries</li>
                   </ul>
                 </div>
               </div>
             )}
             <div className="mt-4 flex gap-3">
               <button
                 onClick={() => navigate('/matches')}
                 className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl font-semibold transition"
               >
                 View All AI Matches
               </button>
               <button
                 onClick={() => navigate('/startupssearch')}
                 className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-medium transition"
               >
                 Search Directory
               </button>
             </div>
           </section>
         </div>

         {/* Your Investments - Full Width Section */}
         <div className="max-w-7xl mx-auto px-4 mb-16">
           <section className="bg-white/10 rounded-xl p-6 border border-gray-700 shadow-lg">
             <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
               <span className="text-2xl">💼</span>
               Your Investments
             </h2>
             {investedStartups.length === 0 ? (
               <p className="text-gray-300">You haven't invested in any startups yet.</p>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {investedStartups.slice(0, 6).map((startup) => (
                   <div key={startup.id} className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition">
                     <div className="font-semibold text-sm mb-2">{startup.name}</div>
                     <div className="text-gray-300 text-xs mb-3">{startup.description}</div>
                     <div className="flex gap-2">
                       <span className="bg-indigo-700 text-white px-2 py-1 rounded text-xs">{startup.industry}</span>
                       <span className="bg-purple-700 text-white px-2 py-1 rounded text-xs">{startup.stage}</span>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </section>
         </div>

         {/* Quick Actions Section */}
         <div className="mt-12 text-center">
           <h2 className="text-3xl font-bold mb-8">Quick Actions</h2>
           <div className="flex flex-wrap justify-center gap-6">
             <button 
               className="bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition flex items-center gap-2"
               onClick={() => navigate('/startupssearch')}
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
               Browse Startups
             </button>
             <button 
               className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-violet-700 transition flex items-center gap-2"
               onClick={() => setShowAiChat(true)}
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
               </svg>
               AI Investment Advisor
             </button>
             <button 
               className="bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-600 transition flex items-center gap-2"
               onClick={() => navigate('/investor-profile-settings')}
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
               Update Profile
             </button>
           </div>
         </div>
       </div>

       {/* Footer */}
       <footer className="text-center text-sm py-6 bg-black/70 border-t border-gray-700 relative z-10">
         © {new Date().getFullYear()} Chatiao. All rights reserved.
       </footer>
    </div>
  )
}

export default InvestorDashboard