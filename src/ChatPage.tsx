import { useState, useEffect } from 'react'
import { useChat, useUserData } from './hooks'
import { ChatMessage, LoadingIndicator, ChatSettings } from './components'
import type { ChatPageProps, ChatConfig } from './types'

export default function ChatPage({ apiKey, onBack }: ChatPageProps) {
  const [showSettings, setShowSettings] = useState(false)
  const { chatConfig, updateChatConfig } = useUserData()
  
  const {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    messagesEndRef,
    config,
    currentThinking,
    currentAnswer,
    sendMessage,
    clearChat,
    handleKeyPress,
    abortRequest,
    updateConfig
  } = useChat(apiKey, chatConfig)

  // 当组件加载时，确保useChat使用最新的保存配置
  useEffect(() => {
    updateConfig(chatConfig)
  }, [chatConfig, updateConfig])

  const handleConfigChange = async (newConfig: ChatConfig) => {
    updateConfig(newConfig)
    await updateChatConfig(newConfig)
  }

  return (
    <div className="min-h-screen bg-[#f5f6f7] flex flex-col">
      {/* 现代化头部 */}
      <header className="bg-white shadow-sm border-b border-[#e8eaed]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-[#6e7074] hover:text-[#2f4554] transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">返回首页</span>
              </button>
              
              <div className="h-6 w-px bg-[#e8eaed]"></div>
              
              <h1 className="text-xl font-semibold text-[#2f4554]">AI 聊天助手</h1>
              
              {/* 现代化状态指示器 */}
              <div className="flex items-center space-x-2">
                {config.enableThinking && (
                  <div className="flex items-center space-x-1 bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>深度思考</span>
                  </div>
                )}
                {config.enableSearch && (
                  <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span>联网搜索</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 中断按钮 - 现代化设计 */}
              {isLoading && (
                <button
                  onClick={abortRequest}
                  className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                  </svg>
                  <span>停止生成</span>
                </button>
              )}
              
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center space-x-2 bg-[#f5f6f7] hover:bg-[#e8eaed] text-[#6e7074] hover:text-[#2f4554] px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>设置</span>
              </button>
              
              <button
                onClick={clearChat}
                className="flex items-center space-x-2 bg-[#f5f6f7] hover:bg-[#e8eaed] text-[#6e7074] hover:text-[#c23531] px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>清空对话</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 聊天主体区域 */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-6">
        {/* 消息区域 */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#e8eaed] mb-6 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <LoadingIndicator 
                    currentThinking={currentThinking}
                    currentAnswer={currentAnswer}
                    enableThinking={config.enableThinking}
                  />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* 现代化输入区域 */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e8eaed] p-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入你的消息... (Shift + Enter 换行)"
                disabled={isLoading}
                className="w-full px-4 py-3 border border-[#e8eaed] rounded-lg focus:ring-2 focus:ring-[#c23531] focus:border-transparent outline-none resize-none min-h-[52px] max-h-[120px] disabled:opacity-60 disabled:bg-[#f5f6f7] text-[#2f4554] placeholder-[#9ca3af] transition-all duration-200"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '52px'
                }}
              />
            </div>
            
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 bg-[#c23531] hover:bg-[#d48265] disabled:bg-[#9ca3af] text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed font-medium flex items-center space-x-2 min-w-[100px] justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>发送中</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>发送</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* 设置弹窗 */}
      <ChatSettings
        config={config}
        onConfigChange={handleConfigChange}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  )
} 