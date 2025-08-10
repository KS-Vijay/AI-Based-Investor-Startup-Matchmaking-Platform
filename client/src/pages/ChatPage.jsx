import { useState, useEffect } from 'react'
import ChatContainer from '../components/Chat/ChatContainer'
import RightSideBar from '../components/Chat/RightSidebar'
import SideBar from '../components/Chat/SideBar'
import Navbar from '../components/Navbar'

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(false)
  const [userType, setUserType] = useState('startup')

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    if (currentUser && currentUser.role) {
      setUserType(currentUser.role)
    }
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image Layer */}
      <div className="absolute inset-0 bg-[url('/src/assets/bgImage.svg')] bg-cover bg-center blur-sm brightness-75 -z-10"></div>

      {/* Navbar - Fixed at top */}
      <div className="relative z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <Navbar userType={userType} />
      </div>

      {/* Foreground Chat UI */}
      <div className="relative w-full h-full flex items-center justify-center px-4 py-6 sm:px-[10%] sm:py-[5%] pt-4">
        <div
          className={`w-full h-full backdrop-blur-2xl border-2 border-gray-600 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/30 grid grid-cols-1 ${
            selectedUser
              ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]'
              : 'md:grid-cols-2'
          }`}
        >
          <SideBar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
          <ChatContainer selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
          <RightSideBar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        </div>
      </div>
    </div>
  )
}

export default ChatPage