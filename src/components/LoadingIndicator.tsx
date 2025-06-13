import { useState } from 'react'

interface LoadingIndicatorProps {
  currentThinking?: string
  currentAnswer?: string
  enableThinking?: boolean
}

export const LoadingIndicator = ({ 
  currentThinking = '', 
  currentAnswer = '', 
  enableThinking = false 
}: LoadingIndicatorProps) => {
  const [showThinking, setShowThinking] = useState(true)

  // 如果没有启用思考功能，显示简单的加载状态
  if (!enableThinking) {
    return (
      <div className="flex max-w-[80%] flex-row items-start space-x-3">
        {/* AI头像 */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#ca8622] to-[#d48265] text-white flex items-center justify-center text-sm font-medium">
          AI
        </div>
        
        {/* 加载气泡 */}
        <div className="ml-3">
          <div className="bg-white border border-[#e8eaed] text-[#2f4554] rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#c23531] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#d48265] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#ca8622] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm text-[#6e7074]">AI正在回答...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex max-w-[80%] flex-row items-start space-x-3">
      {/* AI头像 */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#ca8622] to-[#d48265] text-white flex items-center justify-center text-sm font-medium">
        AI
      </div>
      
      <div className="ml-3 space-y-3">
        {/* 思考过程区域 */}
        {currentThinking && (
          <div>
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium transition-colors duration-200 border border-purple-200"
            >
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>{showThinking ? '隐藏思考过程' : '查看思考过程'}</span>
              <svg 
                className={`w-3 h-3 transition-transform duration-200 ${showThinking ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showThinking && (
              <div className="mt-2 px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-xs font-medium text-purple-700 mb-2 flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>AI 正在思考中...</span>
                  <div className="flex space-x-1 ml-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
                <div className="text-xs text-purple-600 leading-relaxed whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                  {currentThinking}
                  <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-1"></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 当前答案区域 */}
        {currentAnswer && (
          <div className="bg-white border border-[#e8eaed] text-[#2f4554] rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {currentAnswer}
              <span className="inline-block w-2 h-4 bg-[#c23531] animate-pulse ml-1"></span>
            </div>
          </div>
        )}

        {/* 如果还没有开始生成内容，显示加载状态 */}
        {!currentThinking && !currentAnswer && (
          <div className="bg-white border border-[#e8eaed] text-[#2f4554] rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#c23531] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#d48265] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#ca8622] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm text-[#6e7074]">AI正在深度思考...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 