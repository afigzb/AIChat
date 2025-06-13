// 消息接口
export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  reasoning_content?: string  // 添加思考过程字段
}

// 聊天配置接口
export interface ChatConfig {
  enableThinking: boolean      // 深度思考
  maxTokens: number           // 最大token数
}

// 用户数据接口
export interface UserData {
  apiKey?: string
  chatConfig?: ChatConfig
}

// 页面类型
export type PageType = 'home' | 'chat' | 'setup'

// API 响应类型
export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string
      reasoning_content?: string  // 添加思考过程字段
    }
  }>
}

// API 流式响应类型
export interface DeepSeekStreamResponse {
  choices: Array<{
    delta: {
      content?: string
      reasoning_content?: string  // 添加流式思考过程字段
    }
  }>
}

// 组件 Props 类型
export interface ChatPageProps {
  apiKey: string
  onBack: () => void
}

export interface ApiKeySetupProps {
  onSave: (apiKey: string) => Promise<void>
  onCancel: () => void
  isValidating?: boolean
  validationError?: string
}

// 聊天设置Props
export interface ChatSettingsProps {
  config: ChatConfig
  onConfigChange: (config: ChatConfig) => void
  isOpen: boolean
  onClose: () => void
}

export interface ChatMessageProps {
  message: Message
} 