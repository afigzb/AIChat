import { useState } from 'react'
import type { DeepSeekResponse } from '../types'

export const useApiKeyValidation = () => {
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState('')

  const validateApiKey = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'user', content: '你好' }
          ],
          max_tokens: 10,
          temperature: 0.1
        })
      })

      if (response.ok) {
        const data: DeepSeekResponse = await response.json()
        return data.choices && data.choices.length > 0
      }
      
      return false
    } catch (error) {
      console.error('API Key验证失败:', error)
      return false
    }
  }

  const validateAndSave = async (
    apiKey: string, 
    onSuccess: (apiKey: string) => Promise<void>
  ): Promise<void> => {
    if (!apiKey.trim()) {
      setValidationError('请输入API Key')
      return
    }

    setIsValidating(true)
    setValidationError('')

    const isValid = await validateApiKey(apiKey.trim())
    
    if (!isValid) {
      setValidationError('API Key验证失败，请检查是否正确或网络连接')
      setIsValidating(false)
      return
    }

    try {
      await onSuccess(apiKey.trim())
    } catch (error) {
      setValidationError('保存失败，请重试')
    } finally {
      setIsValidating(false)
    }
  }

  const clearError = () => setValidationError('')

  return {
    isValidating,
    validationError,
    validateAndSave,
    clearError
  }
} 