import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Navbar from './Navbar';

const AIInvestorChatModal = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('aiInvestorChatHistory');
    if (savedChats) {
      setChatHistory(JSON.parse(savedChats));
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('aiInvestorChatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/ai/chat', {
        message: currentMessage,
        context: 'investor_dashboard'
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.reply || response.data.text || 'Sorry, I could not process your request.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat failed:', error);
      const fallback = error.response?.data?.message || "AI service unavailable. Here's a quick tip: diversify your portfolio by sector and stage to reduce risk and improve returns.";
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: fallback,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    if (messages.length > 0) {
      const chatId = Date.now();
      const newChat = {
        id: chatId,
        title: messages[0].content.substring(0, 50) + '...',
        messages: [...messages],
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [newChat, ...prev]);
    }
    setMessages([]);
    setSelectedChat(null);
  };

  const loadChat = (chat) => {
    setMessages(chat.messages);
    setSelectedChat(chat);
  };

  const deleteChat = (chatId) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (selectedChat && selectedChat.id === chatId) {
      setMessages([]);
      setSelectedChat(null);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Navbar */}
        <Navbar userType="investor" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Investment Advisor</h2>
              <p className="text-gray-300 text-sm">Ask me about investments, market trends, portfolio strategies, and more!</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-gray-400 hover:text-white transition p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar - Chat History */}
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 300 }}
                exit={{ width: 0 }}
                className="border-r border-white/20 flex flex-col"
              >
                <div className="p-4 border-b border-white/20">
                  <button
                    onClick={startNewChat}
                    className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-violet-700 transition"
                  >
                    + New Chat
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-3 rounded-lg cursor-pointer transition ${
                        selectedChat?.id === chat.id
                          ? 'bg-purple-600/30 border border-purple-500'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                      onClick={() => loadChat(chat)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {chat.title}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(chat.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                          }}
                          className="text-gray-400 hover:text-red-400 transition ml-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Welcome to AI Investment Advisor!</h3>
                  <p className="text-gray-300 mb-8 max-w-md">
                    I'm here to help you with investment strategies, market analysis, portfolio management, and more. 
                    Ask me anything related to investing and business opportunities!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                    <button
                      onClick={() => setCurrentMessage("What are the current market trends for tech investments?")}
                      className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-left transition"
                    >
                      <div className="font-semibold text-white">📈 Market Trends</div>
                      <div className="text-sm text-gray-400">Current tech investment trends</div>
                    </button>
                    <button
                      onClick={() => setCurrentMessage("How should I evaluate a startup for investment?")}
                      className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-left transition"
                    >
                      <div className="font-semibold text-white">🔍 Due Diligence</div>
                      <div className="text-sm text-gray-400">Startup evaluation criteria</div>
                    </button>
                    <button
                      onClick={() => setCurrentMessage("What's the best portfolio diversification strategy?")}
                      className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-left transition"
                    >
                      <div className="font-semibold text-white">📊 Portfolio Strategy</div>
                      <div className="text-sm text-gray-400">Diversification best practices</div>
                    </button>
                    <button
                      onClick={() => setCurrentMessage("What are the key metrics to track in startup investments?")}
                      className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-left transition"
                    >
                      <div className="font-semibold text-white">📋 Key Metrics</div>
                      <div className="text-sm text-gray-400">Important investment metrics</div>
                    </button>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white'
                          : 'bg-white/10 text-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                        {message.type === 'ai' && (
                          <span className="text-xs bg-purple-600/50 px-2 py-1 rounded">AI</span>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/20">
              <div className="flex space-x-4">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about investments, market trends, portfolio strategies..."
                  className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-500"
                  rows="1"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !currentMessage.trim()}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIInvestorChatModal; 