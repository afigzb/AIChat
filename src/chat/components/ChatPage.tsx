import { useState, useRef, useEffect } from 'react'
import type { 
  ChatPageProps, 
  AIConfig, 
  ChatMode
} from '../data/types'
import { DEFAULT_CONFIG } from '../api/api'
import { MessageBubble, AISettings, ChatInputArea } from './components'
import { useConversationManager } from '../managers/conversation-manager'
import { useBranchManager } from '../managers/branch-manager'

// 页面头部组件
function Header({ onBack, onSettingsClick, showSettings }: { 
  onBack: () => void
  onSettingsClick: () => void
  showSettings: boolean
}) {
  return (
    <header className="bg-white border-b relative border-gray-200 px-6 py-4 top-0 z-40">
      <button
        onClick={onSettingsClick}
        className={`p-2 rounded-lg absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 ${
          showSettings 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
        }`}
        title="设置"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
        </svg>
      </button>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="font-semibold text-gray-900 hover:text-gray-600 transition-colors"
          >
            DeepSeek Assistant
          </button>
        </div>
      </div>
    </header>
  )
}

export default function ChatPage({ onBack }: ChatPageProps) {
  // UI状态
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG)
  const [currentMode, setCurrentMode] = useState<ChatMode>('r1')
  const [showSettings, setShowSettings] = useState(false)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 对话管理器（现在包含重新生成功能）
  const {
    state: conversationState,
    actions: conversationActions,
    activeNodes,
    regenerateMessage
  } = useConversationManager(config, currentMode)

  // 分支管理器
  const branchManager = useBranchManager({
    conversationTree: conversationState.conversationTree,
    updateActivePath: conversationActions.updateActivePath
  })

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationState.conversationTree.activePath])

  // 处理发送
  const handleSendMessage = () => {
    if (!conversationState.inputValue.trim()) return
    
    const content = conversationState.inputValue
    conversationActions.updateInputValue('')
    conversationActions.sendMessage(content)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 设置侧边栏 - 绝对定位 */}
      <AISettings
        config={config}
        onConfigChange={setConfig}
        onClose={() => setShowSettings(false)}
        isOpen={showSettings}
      />

      {/* 主内容区 */}
      <div className="flex flex-col min-h-screen">
        <Header onBack={onBack} onSettingsClick={() => setShowSettings(!showSettings)} showSettings={showSettings} />

        {/* 聊天区域 */}
        <main className="flex-1 overflow-y-auto">
          <div className="space-y-0">
            {activeNodes.map((node) => {
              const branchNavigation = branchManager.getBranchNavigationForNode(node.id)
              const isInActivePath = conversationState.conversationTree.activePath.includes(node.id)
              const isGeneratingNode = conversationState.isLoading && node.content === '正在生成...'
              
              return (
                <MessageBubble 
                  key={node.id} 
                  node={node}
                  onRegenerate={!conversationState.isLoading ? regenerateMessage : undefined}
                  onEditUserMessage={!conversationState.isLoading ? conversationActions.editUserMessage : undefined}
                  branchNavigation={branchNavigation}
                  onBranchNavigate={(direction) => branchManager.navigateToSibling(node.id, direction)}
                  isInActivePath={isInActivePath}
                  showBranchControls={!conversationState.isLoading && branchNavigation.totalBranches > 1}
                  isGenerating={isGeneratingNode}
                  currentThinking={isGeneratingNode ? conversationState.currentThinking : ''}
                  currentAnswer={isGeneratingNode ? conversationState.currentAnswer : ''}
                  showThinking={config.showThinking}
                />
              )
            })}
            
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* 输入区域 */}
        <ChatInputArea
          value={conversationState.inputValue}
          onChange={conversationActions.updateInputValue}
          onSend={handleSendMessage}
          isLoading={conversationState.isLoading}
          onAbort={conversationActions.abortRequest}
          currentMode={currentMode}
          onModeChange={setCurrentMode}
        />
      </div>
    </div>
  )
} 