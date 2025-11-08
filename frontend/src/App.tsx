import React, { useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Layout, Menu, Typography, message, Modal } from 'antd'
import {
  FileOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import HomePage from './pages/HomePage'
import MethodsPage from './pages/MethodsPage'
import FactorsPage from './pages/FactorsPage'
import GraphPage from './pages/GraphPage'
import TablePage from './pages/TablePage'
import AboutPage from './pages/AboutPage'
import HPLCGradientPage from './pages/HPLCGradientPage'
import VineBorder from './components/VineBorder'
import { AppProvider, useAppContext } from './contexts/AppContext'
import './App.css'

const { Header, Content, Footer, Sider } = Layout
const { Title } = Typography
const { confirm } = Modal

const AppContent: React.FC = () => {
  const location = useLocation()
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

  // 添加关闭前保存提示
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // 创建新文件
  const handleNewFile = async () => {
    if (isDirty) {
      confirm({
        title: '未保存的更改',
        icon: <ExclamationCircleOutlined />,
        content: '当前有未保存的更改，是否先保存？',
        okText: '保存',
        cancelText: '不保存',
        onOk: async () => {
          await handleSaveFile()
          await createNewFile()
        },
        onCancel: async () => {
          await createNewFile()
        }
      })
    } else {
      await createNewFile()
    }
  }

  const createNewFile = async () => {
    try {
      // 弹出另存为对话框让用户命名新文件
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: 'new_analysis.json',
        types: [
          {
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          },
        ],
      })
      
      // 创建空数据结构
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
      
      // 将空数据写入新文件
      const writable = await handle.createWritable()
      await writable.write(JSON.stringify(emptyData, null, 2))
      await writable.close()
      
      // 设置新文件为当前文件
      setFileHandle(handle)
      setCurrentFilePath(handle.name)
      
      // 清空当前数据
      setAllData(emptyData)
      setIsDirty(false)
      
      message.success(`新文件已创建: ${handle.name}`)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        message.error('创建新文件失败')
        console.error(error)
      }
    }
  }

  // 打开文件
  const handleOpenFile = async () => {
    if (isDirty) {
      confirm({
        title: '未保存的更改',
        icon: <ExclamationCircleOutlined />,
        content: '当前有未保存的更改，是否先保存？',
        okText: '保存',
        cancelText: '不保存',
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

  const openFile = async () => {
    try {
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
      const loadedData = JSON.parse(content)
      
      // 验证数据格式
      if (!loadedData.version || !loadedData.methods) {
        throw new Error('文件格式不正确')
      }
      
      // 加载数据到Context
      setAllData(loadedData)
      setFileHandle(handle)
      setCurrentFilePath(handle.name)
      setIsDirty(false)
      
      message.success(`文件已打开: ${handle.name}`)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        message.error('打开文件失败: ' + error.message)
        console.error(error)
      }
    }
  }

  // 保存文件
  const handleSaveFile = async () => {
    try {
      const dataToSave = exportData()
      const jsonContent = JSON.stringify(dataToSave, null, 2)

      if (!fileHandle) {
        // 第一次保存，另存为
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: 'hplc_analysis.json',
          types: [
            {
              description: 'JSON Files',
              accept: { 'application/json': ['.json'] },
            },
          ],
        })
        
        const writable = await handle.createWritable()
        await writable.write(jsonContent)
        await writable.close()
        
        setFileHandle(handle)
        setCurrentFilePath(handle.name)
        setIsDirty(false)
        message.success(`文件已保存: ${handle.name}`)
      } else {
        // 直接保存到原文件
        const writable = await fileHandle.createWritable()
        await writable.write(jsonContent)
        await writable.close()
        
        setIsDirty(false)
        message.success('文件已保存')
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        message.error('保存文件失败')
        console.error(error)
      }
    }
  }

  // 另存为
  const handleSaveAs = async () => {
    try {
      const dataToSave = exportData()
      const jsonContent = JSON.stringify(dataToSave, null, 2)

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
      await writable.write(jsonContent)
      await writable.close()
      
      setFileHandle(handle)
      setCurrentFilePath(handle.name)
      setIsDirty(false)
      message.success(`文件已另存为: ${handle.name}`)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        message.error('另存为失败')
        console.error(error)
      }
    }
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
        {
          key: 'save-file',
          label: 'Save File',
          icon: isDirty ? <SaveOutlined style={{ color: '#ff4d4f' }} /> : <SaveOutlined />,
          onClick: handleSaveFile,
        },
        {
          key: 'save-as',
          label: 'Save As...',
          onClick: handleSaveAs,
        },
      ],
    },
    {
      key: 'data',
      icon: <DatabaseOutlined />,
      label: 'Data',
      children: [
        {
          key: '/methods',
          label: <Link to="/methods">Methods</Link>,
        },
        {
          key: '/factors',
          label: <Link to="/factors">Factors</Link>,
        },
      ],
    },
    {
      key: 'results',
      icon: <LineChartOutlined />,
      label: 'Results',
      children: [
        {
          key: '/graph',
          label: <Link to="/graph">Graph</Link>,
        },
        {
          key: '/table',
          label: <Link to="/table">Table</Link>,
        },
      ],
    },
    {
      key: '/about',
      icon: <InfoCircleOutlined />,
      label: <Link to="/about">About</Link>,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
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
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            HPLC分析
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
      <Layout style={{ marginLeft: 200 }}>
        <Header style={{ padding: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={3} style={{ padding: '0 24px', margin: 0 }}>
            HPLC绿色化学分析系统
          </Title>
          <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isDirty && (
              <span style={{ color: '#ff4d4f', fontSize: '12px' }}>
                <SaveOutlined /> 未保存
              </span>
            )}
            {currentFilePath && (
              <span style={{ color: '#666' }}>
                当前文件: {currentFilePath}
              </span>
            )}
          </div>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <VineBorder>
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/methods" element={<MethodsPage />} />
                <Route path="/factors" element={<FactorsPage />} />
                <Route path="/graph" element={<GraphPage />} />
                <Route path="/table" element={<TablePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/hplc-gradient" element={<HPLCGradientPage />} />
              </Routes>
            </div>
          </VineBorder>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          HPLC绿色化学分析系统 ©2025 Created with React + FastAPI
        </Footer>
      </Layout>
    </Layout>
  )
}

// 主App组件，包装AppProvider
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
