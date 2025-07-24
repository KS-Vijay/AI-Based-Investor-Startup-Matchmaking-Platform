import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';

const industries = [
  { label: 'All', value: 'all' },
  { label: 'Fintech', value: 'fintech' },
  { label: 'Healthtech', value: 'healthtech' },
  { label: 'Edtech', value: 'edtech' },
  { label: 'E-commerce', value: 'ecommerce' },
  { label: 'AI', value: 'ai' },
  { label: 'AgriTech', value: 'agritech' },
];

const mockInvestors = [
  { id: 1, name: 'John Doe', focus: 'Fintech, SaaS, Seed-Stage', description: 'Angel investor with a focus on early-stage technology startups.', industry: 'fintech' },
  { id: 2, name: 'Jane Smith', focus: 'Healthtech, Series A', description: 'Venture capitalist passionate about healthcare innovation.', industry: 'healthtech' },
  { id: 3, name: 'Alex Lee', focus: 'Edtech, Angel', description: 'Edtech specialist investing in early-stage education startups.', industry: 'edtech' },
  { id: 4, name: 'Priya Patel', focus: 'E-commerce, Series B', description: 'E-commerce expert with a track record of scaling online brands.', industry: 'ecommerce' },
  { id: 5, name: 'Carlos Gomez', focus: 'AgriTech, Seed', description: 'Investing in sustainable agriculture and food tech startups.', industry: 'agritech' },
  { id: 6, name: 'Linda Wang', focus: 'AI, DeepTech', description: 'AI and deep tech investor supporting breakthrough innovation.', industry: 'ai' },
];

function InvestorSearch() {
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('all');
  const navigate = useNavigate();

  const filteredInvestors = mockInvestors.filter((investor) => {
    const matchesIndustry = industry === 'all' || investor.industry === industry;
    const matchesSearch =
      investor.name.toLowerCase().includes(search.toLowerCase()) ||
      investor.focus.toLowerCase().includes(search.toLowerCase()) ||
      investor.description.toLowerCase().includes(search.toLowerCase());
    return matchesIndustry && matchesSearch;
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white flex flex-col bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
      {/* Background Layer */}
      <div className="absolute inset-0 bg-[url('/src/assets/bgImage.svg')] bg-repeat-y bg-cover bg-center blur-sm brightness-75"></div>
      <div className="relative z-10 flex-1 w-full">
        {/* Navbar */}
        <header className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/startup-dashboard')}>
            <img src={assets.logo} alt="Logo" className="w-10 h-10" />
            <span className="text-2xl font-bold">Chatiao</span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <button onClick={() => navigate('/startup-dashboard')} className="hover:text-purple-300">Home</button>
            <button className="hover:text-purple-300">Investors</button>
            <button onClick={() => navigate('/chat')} className="ml-4 p-2 rounded-full hover:bg-indigo-800 transition flex items-center" title="Chat">
              <img src={assets.chat_icon} alt="Chat" className="w-8 h-8" />
            </button>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">Discover Potential Investors</h1>
          <p className="text-lg text-gray-300 mb-8">Connect with investors who match your startup's needs and vision.</p>
          <div className="search-bar max-w-xl mx-auto flex bg-white rounded-full overflow-hidden shadow-lg">
            <input
              type="text"
              className="flex-1 px-6 py-3 text-gray-700 outline-none"
              placeholder="Search investors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="bg-indigo-700 text-white px-6 py-3 font-bold hover:bg-indigo-900 transition">Search</button>
          </div>
        </section>

        {/* Filters */}
        <section className="filters bg-white/10 py-8 border-b border-gray-700">
          <div className="container mx-auto px-4">
            <div className="filter-buttons flex gap-4 flex-wrap justify-center">
              {industries.map((item) => (
                <button
                  key={item.value}
                  className={`filter-btn px-4 py-2 rounded-full border text-sm font-medium transition ${industry === item.value ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                  onClick={() => setIndustry(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Investors Grid */}
        <section className="investors-grid py-12">
          <div className="container mx-auto px-4">
            <h2 className="section-title text-3xl font-semibold mb-8 text-white">Featured Investors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredInvestors.map((investor) => (
                <div key={investor.id} className="investor-card bg-white/10 rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden">
                  <div className="card-image h-48 flex items-center justify-center bg-gradient-to-r from-indigo-400 to-purple-500 text-white text-2xl font-bold">
                    {investor.name.split(' ').map(word => word[0]).join('')}
                  </div>
                  <div className="card-content p-6">
                    <div className="card-title text-xl font-semibold mb-2 text-white">{investor.name}</div>
                    <div className="card-focus text-purple-300 mb-2">{investor.focus}</div>
                    <div className="card-description text-gray-300 mb-4">{investor.description}</div>
                    <div className="card-meta flex justify-between items-center mb-4">
                      <span className="industry-tag bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">{investor.industry}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/investordetails/${investor.id}`)}
                      className="view-details-btn w-full bg-indigo-700 text-white py-2 rounded-lg font-semibold hover:bg-indigo-900 transition block text-center mt-2"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      {/* Footer */}
      <footer className="text-center text-sm py-6 bg-black/70 border-t border-gray-700 relative z-10">
        © {new Date().getFullYear()} Chatiao. All rights reserved.
      </footer>
    </div>
  );
}

export default InvestorSearch;