import React, { createContext, useContext, useState, ReactNode } from 'react'

interface User {
  username: string
  registeredAt: string
}

interface AuthContextType {
  isAuthenticated: boolean
  currentUser: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (username: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  verifyUser: (username: string, password: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 初始化时直接从localStorage读取,避免闪现登录页面
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedUser = localStorage.getItem('hplc_current_user')
    return !!savedUser
  })
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('hplc_current_user')
    if (savedUser) {
      try {
        return JSON.parse(savedUser)
      } catch (error) {
        console.error('加载用户信息失败:', error)
        return null
      }
    }
    return null
  })

  console.log('🔒 AuthProvider 渲染 - isAuthenticated:', isAuthenticated, 'currentUser:', currentUser)

  const register = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // 获取已注册用户列表
      const usersData = localStorage.getItem('hplc_users')
      const users = usersData ? JSON.parse(usersData) : []

      // 检查用户名是否已存在
      if (users.some((u: any) => u.username === username)) {
        return { success: false, message: '用户名已存在' }
      }

      // 创建新用户（实际应用中应该加密密码）
      const newUser = {
        username,
        password, // 注意：生产环境中应该使用加密
        registeredAt: new Date().toISOString()
      }

      users.push(newUser)
      localStorage.setItem('hplc_users', JSON.stringify(users))

      return { success: true, message: '注册成功！请登录' }
    } catch (error) {
      return { success: false, message: '注册失败，请重试' }
    }
  }

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // 获取用户列表
      const usersData = localStorage.getItem('hplc_users')
      if (!usersData) {
        return { success: false, message: '用户不存在' }
      }

      const users = JSON.parse(usersData)
      const user = users.find((u: any) => u.username === username && u.password === password)

      if (!user) {
        return { success: false, message: '用户名或密码错误' }
      }

      // 保存登录状态
      const currentUser: User = {
        username: user.username,
        registeredAt: user.registeredAt
      }

      setCurrentUser(currentUser)
      setIsAuthenticated(true)
      localStorage.setItem('hplc_current_user', JSON.stringify(currentUser))

      return { success: true, message: '登录成功' }
    } catch (error) {
      return { success: false, message: '登录失败，请重试' }
    }
  }

  const logout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
    
    // 清理用户登录信息
    localStorage.removeItem('hplc_current_user')
    
    // 清理所有应用数据（可选：如果希望退出时保留数据，可以注释掉下面这些）
    localStorage.removeItem('hplc_methods_raw')
    localStorage.removeItem('hplc_factors_data')
    localStorage.removeItem('hplc_gradient_data')
  }

  // 验证用户密码（用于文件访问权限验证）
  const verifyUser = async (username: string, password: string): Promise<boolean> => {
    try {
      const usersData = localStorage.getItem('hplc_users')
      if (!usersData) {
        return false
      }

      const users = JSON.parse(usersData)
      const user = users.find((u: any) => u.username === username && u.password === password)

      return !!user
    } catch (error) {
      console.error('验证用户失败:', error)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        register,
        logout,
        verifyUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
