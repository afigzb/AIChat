import type { ChatSettingsProps } from '../types'

export const ChatSettings = ({ config, onConfigChange, isOpen, onClose }: ChatSettingsProps) => {
  const handleChange = (key: keyof typeof config, value: any) => {
    onConfigChange({
      ...config,
      [key]: value
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-[#e8eaed]">
        {/* 头部 */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-[#e8eaed] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-[#2f4554]">聊天设置</h3>
              <p className="text-sm text-[#6e7074] mt-1">自定义你的AI助手体验</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6e7074] hover:text-[#2f4554] hover:bg-[#f5f6f7] transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 设置内容 */}
        <div className="p-6 space-y-8">
          {/* AI能力设置 */}
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-[#2f4554] flex items-center space-x-2">
              <div className="w-2 h-6 bg-[#c23531] rounded-full"></div>
              <span>AI 能力</span>
            </h4>
            
            {/* 深度思考开关 */}
            <div className="bg-[#f5f6f7] rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <h5 className="font-medium text-[#2f4554]">深度思考</h5>
                  </div>
                  <p className="text-sm text-[#6e7074] leading-relaxed">
                    启用后AI会进行更深入的推理思考，使用deepseek-reasoner模型提供更准确的回答
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={config.enableThinking}
                    onChange={(e) => handleChange('enableThinking', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-[#e8eaed] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c23531]"></div>
                </label>
              </div>
            </div>

            {/* 联网搜索开关 */}
            <div className="bg-[#f5f6f7] rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                    <h5 className="font-medium text-[#2f4554]">联网搜索</h5>
                  </div>
                  <p className="text-sm text-[#6e7074] leading-relaxed">
                    允许AI搜索最新信息来回答问题，获取实时数据和最新资讯
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={config.enableSearch}
                    onChange={(e) => handleChange('enableSearch', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-[#e8eaed] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c23531]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 参数调节 */}
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-[#2f4554] flex items-center space-x-2">
              <div className="w-2 h-6 bg-[#ca8622] rounded-full"></div>
              <span>生成参数</span>
            </h4>

            {/* 创造性温度 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-medium text-[#2f4554]">创造性</label>
                <span className="text-sm text-[#6e7074] bg-[#f5f6f7] px-3 py-1 rounded-full">
                  {config.temperature.toFixed(1)}
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#e8eaed] rounded-lg appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: `linear-gradient(to right, #c23531 0%, #c23531 ${(config.temperature / 2) * 100}%, #e8eaed ${(config.temperature / 2) * 100}%, #e8eaed 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-[#6e7074] mt-2">
                  <span>保守严谨</span>
                  <span>创意灵活</span>
                </div>
              </div>
            </div>

            {/* 回复长度 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-medium text-[#2f4554]">回复长度</label>
                <span className="text-sm text-[#6e7074] bg-[#f5f6f7] px-3 py-1 rounded-full">
                  {config.maxTokens.toLocaleString()} tokens
                </span>
              </div>
              {config.enableThinking && (
                <div className="text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                  💡 深度思考模式建议使用更多 tokens (推荐 8000+ 以获得完整的思考过程)
                </div>
              )}
              <div className="relative">
                <input
                  type="range"
                  min="100"
                  max="32000"
                  step="100"
                  value={config.maxTokens}
                  onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
                  className="w-full h-2 bg-[#e8eaed] rounded-lg appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: `linear-gradient(to right, #d48265 0%, #d48265 ${((config.maxTokens - 100) / 31900) * 100}%, #e8eaed ${((config.maxTokens - 100) / 31900) * 100}%, #e8eaed 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-[#6e7074] mt-2">
                  <span>简洁回答</span>
                  <span>详细阐述</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-[#e8eaed] px-6 py-4">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[#6e7074] hover:text-[#2f4554] hover:bg-[#f5f6f7] rounded-lg transition-all duration-200 font-medium"
            >
              取消
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#c23531] hover:bg-[#d48265] text-white rounded-lg transition-all duration-200 font-medium"
            >
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 