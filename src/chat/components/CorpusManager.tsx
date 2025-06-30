import { useState, useCallback } from 'react'
import type { CorpusItem, CorpusType, CorpusConfig } from '../data/types'
import {
  createCorpusItem,
  updateCorpusItem,
  deleteCorpusItem,
  validateCorpusName,
  validateCorpusContent,
  exportCorpusConfig
} from '../data/corpus-utils'

interface CorpusManagerProps {
  config: CorpusConfig
  onConfigChange: (config: CorpusConfig) => void
  onClose: () => void
}

interface EditingCorpus {
  id?: string
  name: string
  content: string
  type: CorpusType
}

export function CorpusManager({ config, onConfigChange, onClose }: CorpusManagerProps) {
  const [activeTab, setActiveTab] = useState<CorpusType>('initial')
  const [editingCorpus, setEditingCorpus] = useState<EditingCorpus | null>(null)
  const [error, setError] = useState<string>('')

  const currentCorpus = activeTab === 'initial' ? config.initialCorpus : config.emphasisCorpus

  // 获取已存在的名称列表
  const existingNames = currentCorpus
    .filter(item => item.id !== editingCorpus?.id)
    .map(item => item.name)

  // 开始编辑语料
  const startEdit = useCallback((corpus?: CorpusItem) => {
    if (corpus) {
      setEditingCorpus({
        id: corpus.id,
        name: corpus.name,
        content: corpus.content,
        type: corpus.type
      })
    } else {
      setEditingCorpus({
        name: '',
        content: '',
        type: activeTab
      })
    }
    setError('')
  }, [activeTab])

  // 取消编辑
  const cancelEdit = useCallback(() => {
    setEditingCorpus(null)
    setError('')
  }, [])

  // 保存语料
  const saveCorpus = useCallback(() => {
    if (!editingCorpus) return

    // 验证名称
    const nameValidation = validateCorpusName(editingCorpus.name, existingNames)
    if (!nameValidation.valid) {
      setError(nameValidation.error!)
      return
    }

    // 验证内容
    const contentValidation = validateCorpusContent(editingCorpus.content)
    if (!contentValidation.valid) {
      setError(contentValidation.error!)
      return
    }

    const newConfig = { ...config }
    const targetCorpus = activeTab === 'initial' ? newConfig.initialCorpus : newConfig.emphasisCorpus

    if (editingCorpus.id) {
      // 更新现有语料
      const updatedCorpus = updateCorpusItem(targetCorpus, editingCorpus.id, {
        name: editingCorpus.name,
        content: editingCorpus.content
      })
      if (activeTab === 'initial') {
        newConfig.initialCorpus = updatedCorpus
      } else {
        newConfig.emphasisCorpus = updatedCorpus
      }
    } else {
      // 创建新语料
      const newCorpusItem = createCorpusItem(
        editingCorpus.name,
        editingCorpus.type,
        editingCorpus.content
      )
      if (activeTab === 'initial') {
        newConfig.initialCorpus = [...newConfig.initialCorpus, newCorpusItem]
      } else {
        newConfig.emphasisCorpus = [...newConfig.emphasisCorpus, newCorpusItem]
      }
    }

    onConfigChange(newConfig)
    setEditingCorpus(null)
    setError('')
  }, [editingCorpus, config, onConfigChange, activeTab, existingNames])

  // 删除语料
  const deleteCorpus = useCallback((id: string) => {
    if (!confirm('确定要删除这个语料吗？')) return

    const newConfig = { ...config }
    if (activeTab === 'initial') {
      newConfig.initialCorpus = deleteCorpusItem(newConfig.initialCorpus, id)
    } else {
      newConfig.emphasisCorpus = deleteCorpusItem(newConfig.emphasisCorpus, id)
    }
    onConfigChange(newConfig)
  }, [config, onConfigChange, activeTab])

  // 切换语料启用状态
  const toggleCorpusEnabled = useCallback((id: string) => {
    const newConfig = { ...config }
    const targetCorpus = activeTab === 'initial' ? config.initialCorpus : config.emphasisCorpus
    const corpus = targetCorpus.find(item => item.id === id)
    
    if (corpus) {
      const updatedCorpus = updateCorpusItem(targetCorpus, id, { enabled: !corpus.enabled })
      if (activeTab === 'initial') {
        newConfig.initialCorpus = updatedCorpus
      } else {
        newConfig.emphasisCorpus = updatedCorpus
      }
      onConfigChange(newConfig)
    }
  }, [config, onConfigChange, activeTab])

  // 导出配置
  const handleExport = useCallback(() => {
    const exportData = exportCorpusConfig(config)
    navigator.clipboard.writeText(exportData).then(() => {
      alert('配置已复制到剪贴板！请手动粘贴到 src/chat/data/data.json 文件中的 corpus 字段')
    }).catch(() => {
      // 如果复制失败，创建一个临时文本区域
      const textarea = document.createElement('textarea')
      textarea.value = exportData
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      alert('配置已复制到剪贴板！请手动粘贴到 src/chat/data/data.json 文件中的 corpus 字段')
    })
  }, [config])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">语料管理</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              导出到剪贴板
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              关闭
            </button>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="p-4 bg-amber-50 border-b border-amber-200">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <div className="text-sm text-amber-800">
              <div className="font-medium mb-1">语料配置说明</div>
              <div>语料配置会从 <code className="bg-amber-100 px-1 rounded">src/chat/data/data.json</code> 文件中加载。</div>
              <div>在此页面修改语料后，点击"导出到剪贴板"，然后手动粘贴到 data.json 文件的 corpus 字段中。</div>
              <div className="mt-1 text-amber-700">⚠️ 修改 data.json 文件后，需要刷新页面才能加载新的配置。</div>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* 左侧：类型选择和列表 */}
          <div className="w-1/3 border-r flex flex-col">
            {/* 标签页 */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('initial')}
                className={`flex-1 p-3 text-sm font-medium ${
                  activeTab === 'initial'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                首发语料 ({config.initialCorpus.length})
              </button>
              <button
                onClick={() => setActiveTab('emphasis')}
                className={`flex-1 p-3 text-sm font-medium ${
                  activeTab === 'emphasis'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                强调语料 ({config.emphasisCorpus.length})
              </button>
            </div>

            {/* 添加按钮 */}
            <div className="p-3 border-b">
              <button
                onClick={() => startEdit()}
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + 添加{activeTab === 'initial' ? '首发' : '强调'}语料
              </button>
            </div>

            {/* 语料列表 */}
            <div className="flex-1 overflow-y-auto">
              {currentCorpus.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">
                  暂无{activeTab === 'initial' ? '首发' : '强调'}语料
                </div>
              ) : (
                currentCorpus.map((corpus) => (
                  <div
                    key={corpus.id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                      editingCorpus?.id === corpus.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => startEdit(corpus)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={corpus.enabled}
                          onChange={(e) => {
                            e.stopPropagation()
                            toggleCorpusEnabled(corpus.id)
                          }}
                          className="rounded"
                        />
                        <span className={`font-medium ${!corpus.enabled ? 'text-gray-400' : ''}`}>
                          {corpus.name}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteCorpus(corpus.id)
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        删除
                      </button>
                    </div>
                    <div className={`text-sm mt-1 ${!corpus.enabled ? 'text-gray-400' : 'text-gray-600'}`}>
                      {corpus.content.length > 50 
                        ? corpus.content.substring(0, 50) + '...' 
                        : corpus.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 右侧：编辑区域 */}
          <div className="flex-1 flex flex-col">
            {editingCorpus ? (
              <div className="flex-1 flex flex-col p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">
                    {editingCorpus.id ? '编辑' : '添加'}{activeTab === 'initial' ? '首发' : '强调'}语料
                  </h3>
                  
                  {activeTab === 'initial' && (
                    <div className="text-sm text-gray-600 mb-3 p-2 bg-blue-50 rounded">
                      💡 首发语料会在每次新对话开始时自动发送给AI，用于设定角色、背景或特殊指令
                    </div>
                  )}
                  
                  {activeTab === 'emphasis' && (
                    <div className="text-sm text-gray-600 mb-3 p-2 bg-yellow-50 rounded">
                      ⚠️ 强调语料会在每次发送消息时夹带，在用户界面不可见，但AI可以看到
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mb-4 p-2 bg-red-50 text-red-600 rounded">
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">语料名称</label>
                  <input
                    type="text"
                    value={editingCorpus.name}
                    onChange={(e) => setEditingCorpus({ ...editingCorpus, name: e.target.value })}
                    placeholder="给语料起个名字..."
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-medium mb-1">语料内容</label>
                  <textarea
                    value={editingCorpus.content}
                    onChange={(e) => setEditingCorpus({ ...editingCorpus, content: e.target.value })}
                    placeholder={
                      activeTab === 'initial'
                        ? '输入首发语料内容，如角色设定、背景信息等...'
                        : '输入强调语料内容，每次对话都会包含...'
                    }
                    className="flex-1 p-2 border rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {editingCorpus.content.length}/2000 字符
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={saveCorpus}
                    disabled={!editingCorpus.name.trim() || !editingCorpus.content.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    保存
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <div>选择左侧的语料进行编辑</div>
                  <div className="text-sm mt-2">或点击"添加语料"创建新的语料</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 