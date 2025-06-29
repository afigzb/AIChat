import type { FlatMessage, DeepSeekStreamResponse, AIConfig, ChatMode } from '../data/types'

// DeepSeek API 配置
const API_KEY = 'sk-69570c7641cc45c7b8c3d7058f9d1743'
const API_BASE_URL = 'https://api.deepseek.com/v1/chat/completions'

// 默认AI配置参数
export const DEFAULT_CONFIG: AIConfig = {
  v3Config: {
    temperature: 1.0,    // 创造性参数，越高越创新
    maxTokens: 8192      // 最大输出长度
  },
  r1Config: {
    maxTokens: 8192      // R1模式最大输出长度
  },
  showThinking: true     // 是否显示思考过程
}

/**
 * 构建API请求消息列表
 * 过滤掉系统不需要的消息类型，添加系统提示
 */
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

/**
 * 构建完整的API请求体
 * 根据不同模式设置不同参数
 */
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
    stream: true    // 启用流式响应
  }

  // V3模式添加temperature参数，R1模式不支持
  if (currentMode === 'v3') {
    return { ...requestBody, temperature: config.v3Config.temperature }
  }

  return requestBody
}

/**
 * 解析流式响应数据块
 * 处理 Server-Sent Events 格式的数据
 */
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

/**
 * 调用DeepSeek API的主函数
 * 支持流式响应和中断控制
 * @param messages 对话历史
 * @param currentMode 当前聊天模式  
 * @param config AI配置
 * @param abortSignal 中断信号
 * @param onThinkingUpdate 思考过程更新回调
 * @param onAnswerUpdate 答案更新回调
 * @returns 完整的AI响应
 */
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

  let reasoning_content = ''  // R1模式的思考过程
  let content = ''           // 最终回答内容

  try {
    // 持续读取流式数据
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const deltas = parseStreamChunk(new TextDecoder().decode(value))
      for (const delta of deltas) {
        if (delta.reasoning_content) {
          reasoning_content += delta.reasoning_content
          onThinkingUpdate(reasoning_content)  // 实时更新思考过程
        }
        if (delta.content) {
          content += delta.content
          onAnswerUpdate(content)  // 实时更新回答内容
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