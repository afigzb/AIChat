import { useState } from 'react'
import type { ChatMessageProps } from '../types'

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user'
  const [showThinking, setShowThinking] = useState(false)
  
  // 添加调试日志
  if (!isUser) {
    console.log('渲染AI消息:', {
      messageId: message.id,
      hasReasoningContent: !!message.reasoning_content,
      reasoningLength: message.reasoning_content?.length || 0,
      reasoningPreview: message.reasoning_content?.substring(0, 100) || '无思考内容'
    })
  }
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
        {/* 头像 */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          isUser 
            ? 'bg-[#c23531] text-white' 
            : 'bg-gradient-to-br from-[#ca8622] to-[#d48265] text-white'
        }`}>
          {isUser ? '我' : 'AI'}
        </div>
        
        {/* 消息气泡 */}
        <div className={`relative group ${isUser ? 'mr-3' : 'ml-3'}`}>
          {/* 思考过程区域 - 仅在非用户消息且有思考内容时显示 */}
          {!isUser && message.reasoning_content && (
            <div className="mb-3">
              <button
                onClick={() => setShowThinking(!showThinking)}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium transition-colors duration-200 border border-purple-200"
              >
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
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
                    <span>AI 思考过程</span>
                  </div>
                  <div className="text-xs text-purple-600 leading-relaxed whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                    {message.reasoning_content}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 主要回答 */}
          <div className={`px-4 py-3 rounded-2xl ${
            isUser 
              ? 'bg-[#c23531] text-white rounded-br-md' 
              : 'bg-white border border-[#e8eaed] text-[#2f4554] rounded-bl-md shadow-sm'
          }`}>
            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </div>
          </div>
          
          {/* 时间戳 */}
          <div className={`text-xs text-[#9ca3af] mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
            isUser ? 'text-right' : 'text-left'
          }`}>
            {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 