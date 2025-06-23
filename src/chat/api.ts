import type { FlatMessage, DeepSeekStreamResponse, AIConfig, ChatMode } from './types'

const API_KEY = 'sk-69570c7641cc45c7b8c3d7058f9d1743'
const API_BASE_URL = 'https://api.deepseek.com/v1/chat/completions'

// 默认配置
export const DEFAULT_CONFIG: AIConfig = {
  v3Config: {
    temperature: 1.0,
    maxTokens: 8192
  },
  r1Config: {
    maxTokens: 8192  
  },
  showThinking: true
}

// 构建请求消息
function buildMessages(messages: FlatMessage[]): Array<{ role: string; content: string }> {
  const currentDate = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
  
  const systemPrompt = `该助手为DeepSeek Chat，由深度求索公司创造。\n今天是${currentDate}。`
  
  return [
    { role: 'system', content: systemPrompt },
    ...messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      // 注意：根据DeepSeek官方文档，reasoning_content不应包含在下一轮请求中
      .map(m => ({ role: m.role, content: m.content }))
  ]
}

// 构建请求体
function buildRequestBody(
  messages: FlatMessage[], 
  currentMode: ChatMode, 
  config: AIConfig
): Record<string, any> {
  const model = currentMode === 'r1' ? 'deepseek-reasoner' : 'deepseek-chat'
  const modelConfig = currentMode === 'r1' ? config.r1Config : config.v3Config
  
  const requestBody = {
    model,
    messages: buildMessages(messages),
    max_tokens: modelConfig.maxTokens,
    stream: true
  }

  // V3模式添加temperature参数
  if (currentMode === 'v3') {
    return { ...requestBody, temperature: config.v3Config.temperature }
  }

  return requestBody
}

// 处理流式响应数据
function parseStreamChunk(chunk: string): Array<{ reasoning_content?: string; content?: string }> {
  return chunk.split('\n')
    .filter(line => line.startsWith('data: '))
    .map(line => line.slice(6).trim())
    .filter(data => data !== '[DONE]')
    .map(data => {
      try {
        const parsed: DeepSeekStreamResponse = JSON.parse(data)
        return parsed.choices[0]?.delta || {}
      } catch {
        return {}
      }
    })
    .filter(delta => delta.reasoning_content || delta.content)
}

// 调用DeepSeek API
export async function callDeepSeekAPI(
  messages: FlatMessage[],
  currentMode: ChatMode,
  config: AIConfig,
  abortSignal: AbortSignal,
  onThinkingUpdate: (thinking: string) => void,
  onAnswerUpdate: (answer: string) => void
): Promise<{ reasoning_content?: string; content: string }> {
  
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify(buildRequestBody(messages, currentMode, config)),
    signal: abortSignal
  })

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('无法获取响应流')

  let reasoning_content = ''
  let content = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const deltas = parseStreamChunk(new TextDecoder().decode(value))
      for (const delta of deltas) {
        if (delta.reasoning_content) {
          reasoning_content += delta.reasoning_content
          onThinkingUpdate(reasoning_content)
        }
        if (delta.content) {
          content += delta.content
          onAnswerUpdate(content)
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return {
    reasoning_content: reasoning_content || undefined,
    content: content || '抱歉，我无法理解您的问题。'
  }
} 