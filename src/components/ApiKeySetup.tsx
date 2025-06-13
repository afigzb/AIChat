import { useState } from 'react'
import { useApiKeyValidation } from '../hooks'
import type { ApiKeySetupProps } from '../types'

export const ApiKeySetup = ({ onSave, onCancel }: Omit<ApiKeySetupProps, 'isValidating' | 'validationError'>) => {
  const [apiKeyInput, setApiKeyInput] = useState('')
  const { isValidating, validationError, validateAndSave, clearError } = useApiKeyValidation()

  const handleSave = async () => {
    await validateAndSave(apiKeyInput, async (apiKey) => {
      await onSave(apiKey)
      setApiKeyInput('')
    })
  }

  const handleCancel = () => {
    onCancel()
    setApiKeyInput('')
    clearError()
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          设置 DeepSeek API Key
        </h2>
        
        <p className="text-gray-600 text-sm mb-4">
          请输入你的 DeepSeek API Key，我们会先验证其有效性，然后保存在本地浏览器中。
        </p>

        {/* 安全提醒 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="text-yellow-600 mr-2">⚠️</div>
            <div>
              <h4 className="text-yellow-800 font-semibold text-sm mb-2">安全提醒</h4>
              <ul className="text-yellow-700 text-xs space-y-1">
                <li>• API Key 仅保存在您的浏览器本地存储中</li>
                <li>• 不会上传到任何第三方服务器</li>
                <li>• 清除浏览器数据会导致 API Key 丢失</li>
                <li>• 请妥善保管您的原始 API Key</li>
              </ul>
            </div>
          </div>
        </div>
        
        <input
          type="password"
          value={apiKeyInput}
          onChange={(e) => {
            setApiKeyInput(e.target.value)
            clearError()
          }}
          onKeyPress={(e) => e.key === 'Enter' && !isValidating && handleSave()}
          placeholder="请输入 DeepSeek API Key"
          disabled={isValidating}
          className={`w-full px-4 py-3 border rounded-lg mb-3 text-sm transition-colors
            ${validationError 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
            } 
            focus:ring-2 focus:border-transparent outline-none
            ${isValidating ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        />
        
        {/* 错误信息显示 */}
        {validationError && (
          <p className="text-red-500 text-xs mb-4">
            {validationError}
          </p>
        )}
        
        {/* 验证状态显示 */}
        {isValidating && (
          <p className="text-blue-500 text-xs mb-4">
            正在验证API Key有效性...
          </p>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isValidating}
            className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKeyInput.trim() || isValidating}
            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isValidating ? '验证中...' : '验证并保存'}
          </button>
        </div>
      </div>
    </div>
  )
} 