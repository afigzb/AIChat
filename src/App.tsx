import { useState } from 'react'
import { ChatPage } from './chat'

type PageType = 'home' | 'chat'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home')
  const [chatKey, setChatKey] = useState<number>(0) // 添加chatKey状态

  const handleEnterChat = () => {
    setCurrentPage('chat')
    setChatKey(prev => prev + 1) // 每次进入聊天时更新key，强制重新创建组件
  }

  const handleBackToHome = () => {
    setCurrentPage('home')
  }

  if (currentPage === 'chat') {
    return <ChatPage key={chatKey} onBack={handleBackToHome} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            React 应用
          </h1>
          <p className="text-xl text-gray-600">
            一个基于 React + TypeScript + Tailwind CSS 的现代化应用
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            欢迎使用
          </h2>
          <p className="text-gray-600 mb-6">
            这是一个干净的 React 应用模板，现在包含 DeepSeek AI 聊天功能。
          </p>
          
          <button
            onClick={handleEnterChat}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            进入 AI 聊天
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
