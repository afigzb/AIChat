import type { UserData } from './types'

// 保存用户数据到localStorage
export const saveUserData = async (data: UserData): Promise<boolean> => {
  try {
    localStorage.setItem('userData', JSON.stringify(data))
    return true
  } catch (error) {
    console.error('保存用户数据失败:', error)
    return false
  }
}

// 从localStorage读取用户数据
export const getUserDataFromStorage = (): UserData | null => {
  try {
    const data = localStorage.getItem('userData')
    if (!data) {
      return null
    }
    return JSON.parse(data)
  } catch (error) {
    console.error('读取用户数据失败:', error)
    return null
  }
}

// 清除用户数据
export const clearUserData = (): boolean => {
  try {
    localStorage.removeItem('userData')
    return true
  } catch (error) {
    console.error('清除用户数据失败:', error)
    return false
  }
} 