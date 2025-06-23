import { useState, useRef, useEffect } from 'react'
import type { 
  ChatPageProps, 
  FlatMessage, 
  MessageNode, 
  ConversationTree, 
  AIConfig, 
  ChatMode,
  BranchNavigation
} from './types'
import { callDeepSeekAPI, DEFAULT_CONFIG } from './api'
import { MessageBubble, AISettings, LoadingDisplay, ChatInputArea } from './components'
import {
  createInitialConversationTree,
  createFlatMessage,
  buildTreeFromFlat,
  buildNodeMap,
  getActiveNodesFromPath,
  getBranchNavigation,
  navigateBranch,
  getConversationHistory,
  addMessageToTree,
  getRegenerateContext,
  findNode
} from './tree-utils'

// 设置按钮组件
function SettingsButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`fixed left-4 top-4 z-50 p-3 rounded-full shadow-lg transition-all duration-200 ${
        isOpen 
          ? 'bg-blue-600 text-white scale-110' 
          : 'bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 hover:shadow-xl'
      }`}
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
      </svg>
    </button>
  )
}

// 页面头部组件
function Header({ onBack }: { onBack: () => void }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="font-semibold text-gray-900 hover:text-gray-600 transition-colors"
        >
          DeepSeek Assistant
        </button>
      </div>
    </header>
  )
}

export default function ChatPage({ onBack }: ChatPageProps) {
  // 核心状态：对话树
  const [conversationTree, setConversationTree] = useState<ConversationTree>(() =>
    createInitialConversationTree('你好！这里是个人ai聊天工具，调用deepseekapi接口，纯前端设计，无保存对话功能')
  )

  // UI状态
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG)
  const [currentMode, setCurrentMode] = useState<ChatMode>('r1')
  const [showSettings, setShowSettings] = useState(false)
  const [currentThinking, setCurrentThinking] = useState('')
  const [currentAnswer, setCurrentAnswer] = useState('')
  
  // Refs
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationTree.activePath])

  // 清理流式状态
  const clearStreamState = () => {
    setCurrentThinking('')
    setCurrentAnswer('')
  }

  // 中断请求
  const abortRequest = () => {
    if (!abortControllerRef.current) return
    
    abortControllerRef.current.abort()
    abortControllerRef.current = null
    setIsLoading(false)
    
    // 保存已生成的内容
    const content = currentAnswer.trim() || '生成被中断'
    const reasoning = currentThinking.trim() || undefined
    
    if (content || reasoning) {
      const lastNodeId = conversationTree.activePath[conversationTree.activePath.length - 1]
      const newMessage = createFlatMessage(content, 'assistant', lastNodeId, reasoning)
      
      const { newFlatMessages, newActivePath } = addMessageToTree(
        conversationTree.flatMessages,
        conversationTree.activePath,
        newMessage
      )
      
      setConversationTree({
        flatMessages: newFlatMessages,
        rootNodes: buildTreeFromFlat(newFlatMessages),
        activePath: newActivePath
      })
    }
    
    clearStreamState()
  }

  // 发送消息
  const sendMessage = async (content: string, parentNodeId: string | null = null) => {
    if (!content.trim() || isLoading) return

    // 确定父节点ID
    const actualParentId = parentNodeId || (
      conversationTree.activePath.length > 0 
        ? conversationTree.activePath[conversationTree.activePath.length - 1]
        : null
    )

    // 创建用户消息
    const userMessage = createFlatMessage(content.trim(), 'user', actualParentId)
    
    // 添加用户消息到树中
    const { newFlatMessages: flatWithUser, newActivePath: pathWithUser } = addMessageToTree(
      conversationTree.flatMessages,
      conversationTree.activePath,
      userMessage
    )

    // 更新对话树
    setConversationTree({
      flatMessages: flatWithUser,
      rootNodes: buildTreeFromFlat(flatWithUser),
      activePath: pathWithUser
    })

    setIsLoading(true)
    clearStreamState()

    abortControllerRef.current = new AbortController()

    try {
      // 获取对话历史
      const conversationHistory = getConversationHistory(userMessage.id, flatWithUser)
      
      const result = await callDeepSeekAPI(
        conversationHistory,
        currentMode,
        config,
        abortControllerRef.current.signal,
        setCurrentThinking,
        setCurrentAnswer
      )

      // 创建AI回复消息
      const aiMessage = createFlatMessage(result.content, 'assistant', userMessage.id, result.reasoning_content)
      
      // 添加AI消息到树中
      const { newFlatMessages: finalFlatMessages, newActivePath: finalActivePath } = addMessageToTree(
        flatWithUser,
        pathWithUser,
        aiMessage
      )

      setConversationTree({
        flatMessages: finalFlatMessages,
        rootNodes: buildTreeFromFlat(finalFlatMessages),
        activePath: finalActivePath
      })

      clearStreamState()

    } catch (error: any) {
      if (error.name === 'AbortError') return
      
      console.error('发送消息失败:', error)
      const errorMessage = createFlatMessage(
        `抱歉，发送消息时出现了错误，请稍后重试。错误信息：${error.message || '未知错误'}`,
        'assistant',
        userMessage.id
      )
      
      const { newFlatMessages: errorFlatMessages, newActivePath: errorActivePath } = addMessageToTree(
        flatWithUser,
        pathWithUser,
        errorMessage
      )

      setConversationTree({
        flatMessages: errorFlatMessages,
        rootNodes: buildTreeFromFlat(errorFlatMessages),
        activePath: errorActivePath
      })
      
      clearStreamState()
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  // 处理发送
  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    
    const content = inputValue
    setInputValue('')
    sendMessage(content)
  }

  // 重新生成消息（支持任意层级）
  const handleRegenerate = async (nodeId: string) => {
    if (isLoading) return

    const regenerateContext = getRegenerateContext(nodeId, conversationTree.flatMessages)
    if (!regenerateContext) return

    const targetMessage = conversationTree.flatMessages.get(nodeId)
    if (!targetMessage) return

    // 🎯 UX优化：立即创建新节点并切换，提供即时反馈
    let newMessage: FlatMessage
    let newActivePath: string[]

    if (targetMessage.role === 'assistant') {
      // AI消息：创建新的AI回复节点，父节点与原消息相同
      newMessage = createFlatMessage('正在生成...', 'assistant', targetMessage.parentId)
      
      // 立即切换到新节点
      const targetNodeIndex = conversationTree.activePath.indexOf(nodeId)
      newActivePath = targetNodeIndex > 0 
        ? [...conversationTree.activePath.slice(0, targetNodeIndex), newMessage.id]
        : [newMessage.id]
    } else {
      // 用户消息：创建新的AI回复节点，父节点为用户消息
      newMessage = createFlatMessage('正在生成...', 'assistant', nodeId)
      
      // 立即切换到新节点
      const targetNodeIndex = conversationTree.activePath.indexOf(nodeId)
      newActivePath = targetNodeIndex >= 0 
        ? [...conversationTree.activePath.slice(0, targetNodeIndex + 1), newMessage.id]
        : [...conversationTree.activePath, newMessage.id]
    }

    // 立即更新UI，显示新节点和加载状态
    const { newFlatMessages } = addMessageToTree(
      conversationTree.flatMessages,
      [],
      newMessage
    )

    setConversationTree({
      flatMessages: newFlatMessages,
      rootNodes: buildTreeFromFlat(newFlatMessages),
      activePath: newActivePath
    })

    setIsLoading(true)
    clearStreamState()

    // 开始生成过程
    abortControllerRef.current = new AbortController()

    try {
      let conversationHistory: FlatMessage[]
      
      if (targetMessage.role === 'assistant') {
        // AI消息重新生成
        conversationHistory = regenerateContext.conversationHistory
      } else {
        // 用户消息重新生成
        conversationHistory = [...regenerateContext.conversationHistory, targetMessage]
      }

      const result = await callDeepSeekAPI(
        conversationHistory,
        currentMode,
        config,
        abortControllerRef.current.signal,
        setCurrentThinking,
        setCurrentAnswer
      )

      // 生成完成，更新节点内容
      const updatedMessage: FlatMessage = {
        ...newMessage,
        content: result.content,
        reasoning_content: result.reasoning_content
      }

      const updatedFlatMessages = new Map(newFlatMessages)
      updatedFlatMessages.set(newMessage.id, updatedMessage)

      setConversationTree({
        flatMessages: updatedFlatMessages,
        rootNodes: buildTreeFromFlat(updatedFlatMessages),
        activePath: newActivePath
      })

      clearStreamState()

    } catch (error: any) {
      if (error.name === 'AbortError') return
      
      console.error('重新生成失败:', error)
      
      // 生成失败，更新节点为错误信息
      const errorMessage: FlatMessage = {
        ...newMessage,
        content: `抱歉，重新生成时出现了错误，请稍后重试。错误信息：${error.message || '未知错误'}`
      }

      const errorFlatMessages = new Map(newFlatMessages)
      errorFlatMessages.set(newMessage.id, errorMessage)

      setConversationTree({
        flatMessages: errorFlatMessages,
        rootNodes: buildTreeFromFlat(errorFlatMessages),
        activePath: newActivePath
      })
      
      clearStreamState()
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  // 处理分支导航
  const handleBranchNavigate = (nodeId: string, direction: 'left' | 'right') => {
    const newActivePath = navigateBranch(nodeId, direction, conversationTree.activePath, conversationTree.rootNodes)
    if (newActivePath) {
      setConversationTree(prev => ({
        ...prev,
        activePath: newActivePath
      }))
    }
  }

  // 获取当前要渲染的消息节点（已优化：避免重复构建节点映射）
  const activeNodes = getActiveNodesFromPath(conversationTree.activePath, conversationTree.rootNodes)

  return (
    <div className="min-h-screen bg-white flex">
      {/* 侧边栏 */}
      <div className="relative">
        <SettingsButton isOpen={showSettings} onClick={() => setShowSettings(!showSettings)} />
        <AISettings
          config={config}
          onConfigChange={setConfig}
          onClose={() => setShowSettings(false)}
          isOpen={showSettings}
        />
      </div>

      {/* 主内容区 */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        showSettings ? 'ml-80' : 'ml-0'
      }`}>
        <Header onBack={onBack} />

        {/* 聊天区域 */}
        <main className="flex-1 overflow-y-auto">
          <div className="space-y-0">
            {activeNodes.map((node) => {
              // 已优化：getBranchNavigation内部使用节点映射提高性能
              const branchNavigation = getBranchNavigation(node.id, conversationTree.activePath, conversationTree.rootNodes)
              const isInActivePath = conversationTree.activePath.includes(node.id)
              
              // 检查是否是当前正在生成的节点
              const isGeneratingNode = isLoading && node.content === '正在生成...'
              
              return (
                <MessageBubble 
                  key={node.id} 
                  node={node}
                  onRegenerate={!isLoading ? handleRegenerate : undefined}
                  branchNavigation={branchNavigation}
                  onBranchNavigate={(direction) => handleBranchNavigate(node.id, direction)}
                  isInActivePath={isInActivePath}
                  showBranchControls={!isLoading && branchNavigation.totalBranches > 1}
                  isGenerating={isGeneratingNode}
                  currentThinking={isGeneratingNode ? currentThinking : ''}
                  currentAnswer={isGeneratingNode ? currentAnswer : ''}
                  showThinking={config.showThinking}
                />
              )
            })}
            
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* 输入区域 */}
        <ChatInputArea
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          isLoading={isLoading}
          onAbort={abortRequest}
          currentMode={currentMode}
          onModeChange={setCurrentMode}
        />
      </div>
    </div>
  )
} 