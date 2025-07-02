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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo区域 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-slate-800 mb-3">
            AI助手
          </h1>
          <p className="text-slate-600 leading-relaxed">
            基于 DeepSeek 的智能对话助手<br />
            支持思维链推理和多分支对话
          </p>
        </div>
        
        {/* 主卡片 */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200">
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-xl font-medium text-slate-800 mb-2">
                开始对话
              </h2>
              <p className="text-slate-500 text-sm">
                与 AI 进行深度交流，探索无限可能
              </p>
            </div>
            
            <button
              onClick={handleEnterChat}
              className="w-full bg-teal-500 text-white font-medium py-4 px-6 rounded-2xl transition-colors hover:bg-teal-600"
            >
              开始聊天
            </button>
          </div>
        </div>
        
        {/* 底部信息 */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-400">
            Powered by React + TypeScript + Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
