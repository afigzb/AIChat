import { useState, useEffect } from 'react'
import { getUserDataFromStorage, saveUserData } from '../utils'
import type { UserData, ChatConfig } from '../types'

const DEFAULT_CHAT_CONFIG: ChatConfig = {
  enableThinking: false,
  maxTokens: 8000  // 增加默认值以支持思考模式
}

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const data = getUserDataFromStorage()
    if (data) {
      // 确保聊天配置存在，如果不存在则使用默认配置
      if (!data.chatConfig) {
        data.chatConfig = DEFAULT_CHAT_CONFIG
      }
      setUserData(data)
    }
    setIsLoading(false)
  }, [])

  const updateUserData = async (newData: Partial<UserData>): Promise<boolean> => {
    const updatedData = { 
      ...userData, 
      ...newData,
      // 合并聊天配置而不是替换
      chatConfig: newData.chatConfig 
        ? { ...userData?.chatConfig, ...newData.chatConfig }
        : userData?.chatConfig || DEFAULT_CHAT_CONFIG
    }
    
    const success = await saveUserData(updatedData)
    if (success) {
      setUserData(updatedData)
    }
    return success
  }

  const updateChatConfig = async (chatConfig: ChatConfig): Promise<boolean> => {
    return updateUserData({ chatConfig })
  }

  return {
    userData,
    isLoading,
    updateUserData,
    updateChatConfig,
    hasApiKey: Boolean(userData?.apiKey),
    chatConfig: userData?.chatConfig || DEFAULT_CHAT_CONFIG
  }
} 