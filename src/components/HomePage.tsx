import reactLogo from '../assets/react.svg'

interface HomePageProps {
  onEnterChat: () => void
  onSetupApiKey: () => void
  hasApiKey: boolean
}

export const HomePage = ({ onEnterChat, onSetupApiKey, hasApiKey }: HomePageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        {/* 头部区域 */}
        <div className="mb-12">
          <img 
            src={reactLogo} 
            className="h-24 w-24 mx-auto mb-6 animate-spin-slow" 
            alt="React logo" 
          />
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            AI 聊天助手
          </h1>
          <p className="text-xl text-gray-600">
            基于 DeepSeek API 的智能对话系统
          </p>
        </div>

        {/* 进入聊天按钮 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
          <button 
            onClick={onEnterChat}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 px-8 rounded-lg transition-colors duration-200 text-lg"
          >
            开始 AI 对话
          </button>
          <p className="text-gray-500 mt-4 text-sm">
            {hasApiKey ? '点击进入与 AI 助手的智能对话' : '首次使用需要设置 API Key'}
          </p>
          
          {hasApiKey && (
            <button
              onClick={onSetupApiKey}
              className="mt-3 px-4 py-2 bg-transparent text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors duration-200 text-xs"
            >
              重新设置 API Key
            </button>
          )}
        </div>

        {/* 功能介绍 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-indigo-600 text-2xl mb-3">🤖</div>
            <h3 className="font-semibold text-gray-800 mb-2">智能对话</h3>
            <p className="text-gray-600 text-sm">基于先进的AI技术，提供自然流畅的对话体验</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-indigo-600 text-2xl mb-3">⚡</div>
            <h3 className="font-semibold text-gray-800 mb-2">快速响应</h3>
            <p className="text-gray-600 text-sm">毫秒级响应速度，让对话更加顺畅自然</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-indigo-600 text-2xl mb-3">🎯</div>
            <h3 className="font-semibold text-gray-800 mb-2">精准理解</h3>
            <p className="text-gray-600 text-sm">深度理解用户意图，提供准确有用的回答</p>
          </div>
        </div>
      </div>
    </div>
  )
} 