import { useState } from 'react'
import ChatPage from './ChatPage'
import { HomePage, ApiKeySetup } from './components'
import { useUserData } from './hooks'
import type { PageType } from './types'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home')
  const { userData, updateUserData, hasApiKey, chatConfig } = useUserData()

  const handleEnterChat = () => {
    if (hasApiKey) {
      setCurrentPage('chat')
    } else {
      setCurrentPage('setup')
    }
  }

  const handleSaveApiKey = async (apiKey: string) => {
    const success = await updateUserData({ apiKey })
    if (success) {
      setCurrentPage('chat')
    } else {
      throw new Error('保存失败')
    }
  }

  const handleBackToHome = () => {
    setCurrentPage('home')
  }

  // 路由渲染
  switch (currentPage) {
    case 'setup':
      return (
        <ApiKeySetup
          onSave={handleSaveApiKey}
          onCancel={handleBackToHome}
        />
      )

    case 'chat':
      if (!userData?.apiKey) {
        setCurrentPage('setup')
        return null
      }
      return (
        <ChatPage
          apiKey={userData.apiKey}
          onBack={handleBackToHome}
        />
      )

    default:
      return (
        <HomePage
          onEnterChat={handleEnterChat}
          onSetupApiKey={() => setCurrentPage('setup')}
          hasApiKey={hasApiKey}
        />
      )
  }
}

export default App
