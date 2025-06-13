import { useState, useRef, useEffect } from 'react'
import type { Message, DeepSeekResponse, DeepSeekStreamResponse, ChatConfig } from '../types'

const INITIAL_MESSAGE: Message = {
  id: '1',
  content: '你好！我是 DeepSeek AI 助手，有什么可以帮助你的吗？',
  role: 'assistant',
  timestamp: new Date()
}

const DEFAULT_CONFIG: ChatConfig = {
  enableThinking: false,
  enableSearch: false,
  temperature: 0.7,
  maxTokens: 1000
}

export const useChat = (apiKey: string, initialConfig: ChatConfig = DEFAULT_CONFIG) => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState<ChatConfig>(initialConfig)
  const [currentThinking, setCurrentThinking] = useState('')  // 当前思考过程
  const [currentAnswer, setCurrentAnswer] = useState('')      // 当前答案
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentThinking, currentAnswer])

  // 中断当前请求
  const abortRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
      setCurrentThinking('')
      setCurrentAnswer('')
    }
  }

  const callDeepSeekAPI = async (userMessage: string): Promise<void> => {
    // 创建新的AbortController
    abortControllerRef.current = new AbortController()
    
    const requestBody: any = {
      model: config.enableThinking ? 'deepseek-reasoner' : 'deepseek-chat',
      messages: [
        ...messages.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({
          role: m.role,
          content: m.content
          // 注意：根据文档，不能包含 reasoning_content 在请求中
        })),
        { role: 'user', content: userMessage }
      ],
      max_tokens: config.maxTokens,
      stream: true  // 启用流式响应以获取思考过程
    }

    // 只有在非思考模式下才添加 temperature 参数
    // deepseek-reasoner 模型不支持 temperature 参数
    if (!config.enableThinking) {
      requestBody.temperature = config.temperature
    }

    // 如果启用联网搜索
    if (config.enableSearch) {
      requestBody.tools = [{
        type: "web_search",
        web_search: {
          search_engine: "bing"
        }
      }]
    }

    // 添加调试日志
    console.log('API请求参数:', {
      model: requestBody.model,
      enableThinking: config.enableThinking,
      messagesCount: requestBody.messages.length,
      hasTemperature: !!requestBody.temperature,
      maxTokens: requestBody.max_tokens
    })

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: abortControllerRef.current.signal
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API错误响应:', errorText)
      throw new Error(`API 请求失败: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法获取响应流')
    }

    let reasoning_content = ''
    let content = ''
    let hasStartedReceiving = false

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') {
              continue
            }

            try {
              const parsed: DeepSeekStreamResponse = JSON.parse(data)
              const delta = parsed.choices[0]?.delta

              if (delta) {
                hasStartedReceiving = true
                
                // 添加调试日志
                console.log('收到delta:', {
                  hasReasoning: !!delta.reasoning_content,
                  hasContent: !!delta.content,
                  reasoningLength: delta.reasoning_content?.length || 0,
                  contentLength: delta.content?.length || 0
                })

                if (delta.reasoning_content) {
                  reasoning_content += delta.reasoning_content
                  setCurrentThinking(reasoning_content)
                  console.log('更新思考内容，总长度:', reasoning_content.length)
                }

                if (delta.content) {
                  content += delta.content
                  setCurrentAnswer(content)
                }
              }
            } catch (e) {
              // 添加解析错误日志
              console.warn('解析SSE数据失败:', e, 'data:', data)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    // 检查是否收到了任何数据
    if (!hasStartedReceiving) {
      console.error('没有收到任何流式数据')
      throw new Error('API响应异常：没有收到数据流')
    }

    // 添加最终结果日志
    console.log('流式响应完成:', {
      finalReasoningLength: reasoning_content.length,
      finalContentLength: content.length,
      hasReasoning: !!reasoning_content,
      enableThinking: config.enableThinking
    })

    // 流式完成后，创建最终消息
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content,
      role: 'assistant',
      timestamp: new Date(),
      reasoning_content: reasoning_content || undefined
    }

    console.log('创建助手消息:', {
      hasReasoningContent: !!assistantMessage.reasoning_content,
      reasoningLength: assistantMessage.reasoning_content?.length || 0
    })

    setMessages(prev => [...prev, assistantMessage])
    setCurrentThinking('')
    setCurrentAnswer('')
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setCurrentThinking('')
    setCurrentAnswer('')

    try {
      await callDeepSeekAPI(userMessage.content)
    } catch (error) {
      // 如果是用户主动中断，不显示错误
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `抱歉，发生了错误：${error instanceof Error ? error.message : '未知错误'}`,
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      setCurrentThinking('')
      setCurrentAnswer('')
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const clearChat = () => {
    abortRequest() // 中断当前请求
    setMessages([INITIAL_MESSAGE])
    setCurrentThinking('')
    setCurrentAnswer('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const updateConfig = (newConfig: ChatConfig) => {
    // 自动调整配置以适应思考模式
    if (newConfig.enableThinking && newConfig.maxTokens < 8000) {
      console.log('思考模式开启，自动调整 maxTokens 从', newConfig.maxTokens, '到 8000')
      newConfig = { ...newConfig, maxTokens: 8000 }
    }
    
    setConfig(newConfig)
  }

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    messagesEndRef,
    config,
    currentThinking,    // 当前思考过程
    currentAnswer,      // 当前答案
    sendMessage,
    clearChat,
    handleKeyPress,
    abortRequest,
    updateConfig
  }
} 