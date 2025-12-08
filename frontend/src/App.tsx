import React, { useEffect, useState, useRef } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Typography, message, Modal, Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import {
  FileOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import HomePage from './pages/HomePage'
import MethodsPage from './pages/MethodsPage'
import FactorsPage from './pages/FactorsPage'
import GraphPage from './pages/GraphPage'
import PretreatmentAnalysisPage from './pages/PretreatmentAnalysisPage'
import InstrumentAnalysisPage from './pages/InstrumentAnalysisPage'
import MethodEvaluationPage from './pages/MethodEvaluationPage'
import TablePage from './pages/TablePage'
import AboutPage from './pages/AboutPage'
import HPLCGradientPage from './pages/HPLCGradientPage'
import LoginPage from './pages/LoginPage'
import ComparisonPage from './pages/ComparisonPage'
import VineBorder from './components/VineBorder'
import PasswordVerifyModal from './components/PasswordVerifyModal'
import PasswordConfirmModal from './components/PasswordConfirmModal'
import { AppProvider, useAppContext } from './contexts/AppContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { StorageHelper, STORAGE_KEYS } from './utils/storage'
import { encryptData, decryptData } from './utils/encryption'
import './App.css'

const { Header, Content, Footer, Sider } = Layout
const { Title } = Typography
const { confirm } = Modal

const AppContent: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, currentUser, logout, verifyUser } = useAuth()
  const {
    fileHandle,
    setFileHandle,
    currentFilePath,
    setCurrentFilePath,
    isDirty,
    setIsDirty,
    exportData,
    setAllData
  } = useAppContext()

  // 使用ref来存储处理函数，避免Hooks规则问题
  const handleNewFileRef = useRef<(() => void) | null>(null)
  const handleOpenFileRef = useRef<(() => void) | null>(null)

  // 密码验证模态框状态（用于打开其他用户的文件）
  const [verifyModalVisible, setVerifyModalVisible] = useState(false)
  const [pendingFileData, setPendingFileData] = useState<any>(null)
  const [pendingFileHandle, setPendingFileHandle] = useState<any>(null)

  // 密码确认模态框状态（用于保存加密文件）
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [pendingSaveData, setPendingSaveData] = useState<any>(null)

  // 调试：监控isDirty变化
  useEffect(() => {
    console.log('🔔 isDirty状态变化:', isDirty, '文件:', currentFilePath)
  }, [isDirty, currentFilePath])

  // ⚠️ 路由状态在刷新后会重置到首页，这是正常行为
  // 用户可以通过导航栏重新进入需要的页面

  // 添加关闭浏览器前的保存提示
  // 注意: 刷新页面(F5)不会触发此提示,因为数据已自动保存到localStorage
  // 只有关闭标签页/浏览器窗口时才提示,因为这会丢失localStorage
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 检测是否为刷新操作
      // 注意: 浏览器限制下,无法完全准确区分刷新和关闭
      // 这里只在有未保存文件时提示
      if (currentFilePath && isDirty && currentFilePath !== 'Untitled Project.json') {
        // Only prompt for files that have been saved before (i.e., with a file path)
        // Untitled projects can be restored through refresh, so no prompt needed
        e.preventDefault()
        e.returnValue = 'File has not been saved to disk, closing window will lose changes. Leave anyway?'
        return 'File has not been saved to disk, closing window will lose changes. Leave anyway?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [currentFilePath, isDirty])

  // 路由守卫：如果没有打开文件，禁止访问操作页面
  useEffect(() => {
    // Pages requiring a file to be opened
    const protectedPaths = ['/methods', '/factors', '/graph', '/graph/pretreatment', '/graph/instrument', '/graph/evaluation', '/table', '/hplc-gradient']
    
    // If currently on a protected path but no file is open, redirect to home page
    if (!currentFilePath && protectedPaths.includes(location.pathname)) {
      console.log('🚫 No file open, redirecting to home page')
      message.warning('Please create or open a file first')
      navigate('/', { replace: true })
    }
  }, [location.pathname, currentFilePath, navigate])

  // 监听HomePage触发的文件操作事件 - 必须在所有条件判断之前声明
  useEffect(() => {
    console.log('🔧 设置文件操作事件监听器')
    const handleTriggerNewFile = () => {
      console.log('📢 收到触发New File事件')
      // 通过ref调用实际的处理函数
      if (handleNewFileRef.current) {
        handleNewFileRef.current()
      }
    }

    const handleTriggerOpenFile = () => {
      console.log('📢 收到触发Open File事件')
      // 通过ref调用实际的处理函数
      if (handleOpenFileRef.current) {
        handleOpenFileRef.current()
      }
    }

    window.addEventListener('triggerNewFile', handleTriggerNewFile)
    window.addEventListener('triggerOpenFile', handleTriggerOpenFile)

    return () => {
      window.removeEventListener('triggerNewFile', handleTriggerNewFile)
      window.removeEventListener('triggerOpenFile', handleTriggerOpenFile)
    }
  }, [])

  console.log('🎨 AppContent渲染 - isAuthenticated:', isAuthenticated)

  // 如果未登录，显示登录页面
  if (!isAuthenticated) {
    return <LoginPage />
  }

  // Create new file (memory mode)
  const handleNewFile = async () => {
    // Only prompt to save if file is already open and has unsaved changes
    if (currentFilePath && isDirty) {
      confirm({
        title: 'Unsaved Changes',
        icon: <ExclamationCircleOutlined />,
        content: 'You have unsaved changes. Save them first?',
        okText: 'Save',
        cancelText: 'Don\'t Save',
        onOk: async () => {
          await handleSaveFile()
          createNewFile()
        },
        onCancel: () => {
          createNewFile()
        }
      })
    } else {
      createNewFile()
    }
  }

  // 更新ref，供事件监听器使用
  handleNewFileRef.current = handleNewFile

  const createNewFile = async () => {
    // Create empty data structure, add owner information
    const emptyData = {
      version: '1.0.0',
      lastModified: new Date().toISOString(),
      owner: currentUser?.username || 'unknown',  // Add owner
      createdAt: new Date().toISOString(),  // Add creation time
      methods: {
        sampleCount: null,
        preTreatmentReagents: [{ id: Date.now().toString(), name: '', volume: 0 }],
        mobilePhaseA: [{ id: Date.now().toString() + '1', name: '', percentage: 0 }],
        mobilePhaseB: [{ id: Date.now().toString() + '2', name: '', percentage: 0 }]
      },
      // 🔥 Factors由全局配置管理，新文件为空
      factors: [],
      // Empty gradient array for new files, let HPLC Gradient page initialize
      gradient: []
    }
    
    // 🔥 不再初始化factors，使用全局Factors配置
    console.log('✅ App: Created new file (factors managed globally)')
    
    // 🔥 创建无效的 gradient 数据（流速为0），以便 MethodsPage 显示警告
    const invalidGradientData = {
      steps: [
        { stepNo: 0, time: 0.0, phaseA: 0, phaseB: 100, flowRate: 0, volume: 0, curve: 'initial' },
        { stepNo: 1, time: 0, phaseA: 0, phaseB: 100, flowRate: 0, volume: 0, curve: 'linear' }
      ],
      chartData: [],
      calculations: null,
      timestamp: new Date().toISOString(),
      isValid: false,
      invalidReason: 'New file - flow rates not configured'
    }
    StorageHelper.setJSON(STORAGE_KEYS.GRADIENT, invalidGradientData)
    console.log('✅ App: Created invalid gradient data for new file (will show warning in MethodsPage)')
    
    // 🔥 清空对比数据
    StorageHelper.setJSON('hplc_comparison_files', [])
    console.log('✅ App: Cleared comparison files from localStorage')
    
    // Clear file handle, set to "Untitled" state
    setFileHandle(null)
    await setCurrentFilePath('Untitled Project.json')    // Load empty data
    await setAllData(emptyData)
    setIsDirty(false)
    
    // 🔥 Trigger event to notify other pages that factors data is ready
    setTimeout(() => {
      window.dispatchEvent(new Event('factorsDataUpdated'))
      console.log('📢 App: Triggered factorsDataUpdated event')
      window.dispatchEvent(new Event('newFileCreated'))
      console.log('📢 App: Triggered newFileCreated event')
    }, 50)
    
    // 导航到首页
    navigate('/')
    
    message.success(`New project created (Owner: ${currentUser?.username}), please save after editing`)
  }
  
  // Open file
  const handleOpenFile = async () => {
    // Only prompt to save if file is already open and has unsaved changes
    if (currentFilePath && isDirty) {
      confirm({
        title: 'Unsaved Changes',
        icon: <ExclamationCircleOutlined />,
        content: 'You have unsaved changes. Save them first?',
        okText: 'Save',
        cancelText: 'Don\'t Save',
        onOk: async () => {
          await handleSaveFile()
          openFile()
        },
        onCancel: () => {
          openFile()
        }
      })
    } else {
      openFile()
    }
  }

  // 更新ref，供事件监听器使用
  handleOpenFileRef.current = handleOpenFile

  const openFile = async () => {
    try {
      // 使用File System Access API打开文件
      const [handle] = await (window as any).showOpenFilePicker({
        types: [
          {
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          },
        ],
        multiple: false,
      })
      
      const file = await handle.getFile()
      const content = await file.text()
      
      // Try parsing as encrypted data (check if object format)
      let parsedContent
      try {
        parsedContent = JSON.parse(content)
      } catch (e) {
        // If not JSON, may be pure encrypted string (old version)
        message.error('File format error, cannot parse')
        return
      }

      // Check if encrypted data
      if (parsedContent.encrypted && parsedContent.data) {
        console.log('🔐 Encrypted file detected, password required')
        
        // Try getting file owner info (from encrypted metadata)
        const fileOwner = parsedContent.owner || 'unknown'
        
        // Check if it's current user's file
        if (fileOwner === currentUser?.username) {
          console.log('✅ This is current user\'s file, show password confirmation dialog')
          // Current user's file, let user enter password to decrypt
          setPendingFileData(parsedContent)
          setPendingFileHandle(handle)
          setVerifyModalVisible(true)
        } else {
          console.log('⚠️ This is another user\'s file, need to verify original owner password')
          // Another user's file, need to verify original owner's password
          setPendingFileData(parsedContent)
          setPendingFileHandle(handle)
          setVerifyModalVisible(true)
        }
      } else {
        // Unencrypted old file format, load directly
        console.log('📂 Opening unencrypted old format file')
        
        // Validate data format
        if (!parsedContent.version || !parsedContent.methods) {
          throw new Error('Incorrect file format')
        }
        
        // Load data directly
        await setAllData(parsedContent)
        setFileHandle(handle)
        await setCurrentFilePath(handle.name)
        setIsDirty(false)
        
        message.warning(`File opened: ${handle.name} (Unencrypted file, recommend re-saving to encrypt)`)
      }
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        message.error('Failed to open file: ' + error.message)
        console.error(error)
      }
    }
  }

  // Open file after password verification
  const handleVerifyPassword = async (username: string, password: string): Promise<boolean> => {
    if (!pendingFileData || !pendingFileHandle) {
      message.error('No file pending to open')
      return false
    }

    try {
      // Verify user password
      const isValid = await verifyUser(username, password)
      
      if (!isValid) {
        message.error('Incorrect password, cannot open file')
        return false
      }

      // Password correct, decrypt data
      console.log('🔓 Password verification successful, decrypting data...')
      const decryptedJson = decryptData(pendingFileData.data, password)
      
      if (!decryptedJson) {
        message.error('Decryption failed, password may be incorrect or file corrupted')
        return false
      }

      // Parse decrypted JSON string
      const decryptedData = JSON.parse(decryptedJson)

      // Validate decrypted data format
      if (!decryptedData.version || !decryptedData.methods) {
        throw new Error('Incorrect file format')
      }

      // Load decrypted data
      await setAllData(decryptedData)
      setFileHandle(pendingFileHandle)
      await setCurrentFilePath(pendingFileHandle.name)
      setIsDirty(false)

      // Clear temporary data
      setPendingFileData(null)
      setPendingFileHandle(null)
      setVerifyModalVisible(false)

      message.success(`File decrypted and opened: ${pendingFileHandle.name}`)
      return true
    } catch (error: any) {
      message.error('Failed to decrypt file: ' + error.message)
      console.error('❌ Decryption failed:', error)
      return false
    }
  }

  // Cancel password verification
  const handleCancelVerify = () => {
    setVerifyModalVisible(false)
    setPendingFileData(null)
    setPendingFileHandle(null)
    message.info('Cancelled opening file')
  }

  // Save file
  const handleSaveFile = async () => {
    console.log('💾 Starting file save, current isDirty:', isDirty)
    
    try {
      const dataToSave = await exportData()
      // Update lastModified timestamp
      dataToSave.lastModified = new Date().toISOString()
      
      // Show password confirmation dialog, wait for user input
      setPendingSaveData(dataToSave)
      setConfirmModalVisible(true)
      
    } catch (error: any) {
      message.error('Failed to prepare file for saving')
      console.error('❌ Failed to prepare save:', error)
    }
  }

  // Execute actual save after password confirmation
  const handleConfirmPassword = async (password: string) => {
    setConfirmModalVisible(false)
    
    if (!pendingSaveData) {
      message.error('No data pending to save')
      return
    }

    try {
      // 将数据转换为JSON字符串
      const jsonString = JSON.stringify(pendingSaveData, null, 2)
      
      // 使用密码加密数据
      console.log('🔐 使用密码加密数据...')
      const encryptedString = encryptData(jsonString, password)
      
      // 创建加密文件格式
      const encryptedFileContent = JSON.stringify({
        encrypted: true,
        owner: currentUser?.username,
        version: '1.0.0',
        data: encryptedString
      }, null, 2)
      
      if (!fileHandle) {
        console.log('📝 首次保存，弹出文件选择器')
        // 如果没有文件句柄，使用showSaveFilePicker
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: currentFilePath || 'hplc_analysis.json',
          types: [
            {
              description: 'JSON Files',
              accept: { 'application/json': ['.json'] },
            },
          ],
        })
        
        const writable = await handle.createWritable()
        await writable.write(encryptedFileContent)
        await writable.close()
        
        console.log('✅ 加密文件已写入，设置fileHandle和currentFilePath')
        setFileHandle(handle)
        await setCurrentFilePath(handle.name)
        
        // After successful save, only clear dirty flag, don't update Context data (avoid loops)
        console.log('🧹 Clearing isDirty flag')
        setIsDirty(false)
        setPendingSaveData(null)
        
        message.success(`File encrypted and saved: ${handle.name}`)
      } else {
        console.log('💾 Saving to existing file:', currentFilePath)
        // Save directly to original file
        const writable = await fileHandle.createWritable()
        await writable.write(encryptedFileContent)
        await writable.close()
        
        // After successful save, only clear dirty flag, don't update Context data (avoid loops)
        console.log('🧹 Clearing isDirty flag')
        setIsDirty(false)
        setPendingSaveData(null)
        
        message.success('File encrypted and saved')
      }
      console.log('✅ Save completed, current isDirty should be false')
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        message.error('Failed to save file')
        console.error('❌ Save failed:', error)
      }
      setPendingSaveData(null)
    }
  }

  // Cancel password confirmation
  const handleCancelPasswordConfirm = () => {
    setConfirmModalVisible(false)
    setPendingSaveData(null)
    message.info('Cancelled saving')
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'file',
      icon: <FileOutlined />,
      label: 'File',
      children: [
        {
          key: 'new-file',
          label: 'New File',
          onClick: handleNewFile,
        },
        {
          key: 'open-file',
          label: 'Open File',
          onClick: handleOpenFile,
        },
      ],
    },
    {
      key: 'data',
      icon: <DatabaseOutlined />,
      label: 'Data',
      disabled: !currentFilePath, // 没有打开文件时禁用
      children: [
        {
          key: '/methods',
          label: <Link to="/methods">Methods</Link>,
          disabled: !currentFilePath,
        },
        {
          key: '/factors',
          label: <Link to="/factors">Factors</Link>,
          disabled: !currentFilePath,
        },
      ],
    },
    {
      key: 'results',
      icon: <LineChartOutlined />,
      label: 'Results',
      disabled: !currentFilePath, // 没有打开文件时禁用
      children: [
        {
          key: 'graph-submenu',
          label: 'Graph',
          children: [
            {
              key: '/graph/pretreatment',
              label: <Link to="/graph/pretreatment">Pretreatment Analysis</Link>,
              disabled: !currentFilePath,
            },
            {
              key: '/graph/instrument',
              label: <Link to="/graph/instrument">Instrument Analysis</Link>,
              disabled: !currentFilePath,
            },
            {
              key: '/graph/evaluation',
              label: <Link to="/graph/evaluation">Method Evaluation</Link>,
              disabled: !currentFilePath,
            },
          ],
        },
        {
          key: '/table',
          label: <Link to="/table">Table</Link>,
          disabled: !currentFilePath,
        },
        {
          key: '/comparison',
          label: <Link to="/comparison">Comparison</Link>,
          disabled: false, // 对比功能独立，不需要当前打开文件
        },
      ],
    },
    {
      key: '/about',
      icon: <InfoCircleOutlined />,
      label: <Link to="/about">About</Link>,
    },
  ]

  // User dropdown menu
  const handleLogout = () => {
    confirm({
      title: 'Confirm Logout',
      icon: <ExclamationCircleOutlined />,
      content: (currentFilePath && isDirty) ? 'You have unsaved changes, are you sure you want to logout?' : 'Are you sure you want to logout?',
      okText: 'Logout',
      cancelText: 'Cancel',
      onOk: async () => {
        // Clear file-related state
        setFileHandle(null)
        await setCurrentFilePath(null)
        setIsDirty(false)
        
        // Clear all data, restore to initial state
        const emptyData = {
          version: '1.0.0',
          lastModified: new Date().toISOString(),
          methods: {
            sampleCount: null,
            preTreatmentReagents: [{ id: Date.now().toString(), name: '', volume: 0 }],
            mobilePhaseA: [{ id: Date.now().toString() + '1', name: '', percentage: 0 }],
            mobilePhaseB: [{ id: Date.now().toString() + '2', name: '', percentage: 0 }]
          },
          factors: [],
          gradient: []
        }
        await setAllData(emptyData)
        
        // Logout
        logout()
        message.success('Logged out successfully')
      }
    })
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 500 }}>{currentUser?.username}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            Registered: {currentUser?.registeredAt ? new Date(currentUser.registeredAt).toLocaleDateString() : ''}
          </div>
        </div>
      ),
      disabled: true
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint={undefined}
        collapsedWidth="0"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
          <Title level={4} style={{ color: 'white', margin: 0, fontSize: '16px' }}>
            HPLC Analysis
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="custom-menu"
          expandIcon={null}
          triggerSubMenuAction="hover"
        />
      </Sider>
      <Layout className="site-layout">
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          height: '64px',
          lineHeight: '64px',
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <Title level={3} style={{ 
            padding: 0, 
            margin: 0, 
            fontSize: '20px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: '0 0 auto',
            maxWidth: '600px'
          }}>
            HPLC Green Chemistry Analysis System
          </Title>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            flex: '0 0 auto',
            minWidth: 0,
            flexShrink: 0
          }}>
            {currentFilePath && (
              <span style={{ 
                color: currentFilePath === 'Untitled Project.json' ? '#faad14' : '#666',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '250px',
                display: 'inline-block'
              }}>
                Current File: {currentFilePath}
                {currentFilePath === 'Untitled Project.json' && <span style={{ fontSize: 12, marginLeft: 8 }}>(Not saved yet)</span>}
              </span>
            )}
            {currentFilePath && isDirty && (
              <Button 
                type="link" 
                danger 
                icon={<SaveOutlined />}
                onClick={handleSaveFile}
                style={{ padding: 0, height: 'auto', fontSize: '14px', flexShrink: 0 }}
              >
                Unsaved
              </Button>
            )}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {currentUser?.username}
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial', minWidth: 0 }}>
          <VineBorder>
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/methods" element={<MethodsPage />} />
                <Route path="/factors" element={<FactorsPage />} />
                <Route path="/graph" element={<GraphPage />} />
                <Route path="/graph/pretreatment" element={<PretreatmentAnalysisPage />} />
                <Route path="/graph/instrument" element={<InstrumentAnalysisPage />} />
                <Route path="/graph/evaluation" element={<MethodEvaluationPage />} />
                <Route path="/table" element={<TablePage />} />
                <Route path="/comparison" element={<ComparisonPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/hplc-gradient" element={<HPLCGradientPage />} />
              </Routes>
            </div>
          </VineBorder>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          HPLC Green Chemistry Analysis System ©2025 Created with React + FastAPI
        </Footer>
      </Layout>

      {/* 密码验证模态框 - 用于打开其他用户的文件 */}
      <PasswordVerifyModal
        visible={verifyModalVisible}
        ownerUsername={pendingFileData?.owner || 'unknown'}
        onVerify={handleVerifyPassword}
        onCancel={handleCancelVerify}
      />

      {/* 密码确认模态框 - 用于保存加密文件 */}
      <PasswordConfirmModal
        visible={confirmModalVisible}
        username={currentUser?.username || 'unknown'}
        onConfirm={handleConfirmPassword}
        onCancel={handleCancelPasswordConfirm}
      />
    </Layout>
  )
}

// 主App组件，包装AuthProvider和AppProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  )
}

export default App
