import React, { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Layout, Menu, Typography, message } from 'antd'
import {
  FileOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  InfoCircleOutlined,
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
import './App.css'

const { Header, Content, Footer, Sider } = Layout
const { Title } = Typography

const App: React.FC = () => {
  const location = useLocation()
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null)

  // 创建新文件
  const handleNewFile = async () => {
    try {
      // 使用 File System Access API
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
      const initialData = {
        version: '1.0.0',
        created_at: new Date().toISOString(),
        analyses: [],
        settings: {}
      }
      await writable.write(JSON.stringify(initialData, null, 2))
      await writable.close()
      
      setCurrentFilePath(handle.name)
      message.success(`新文件已创建: ${handle.name}`)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        message.error('创建文件失败')
        console.error(error)
      }
    }
  }

  // 打开文件
  const handleOpenFile = async () => {
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
      const data = JSON.parse(content)
      
      // 将数据同步到系统中（这里可以根据需要存储到状态管理或localStorage）
      localStorage.setItem('hplc_current_file', JSON.stringify(data))
      localStorage.setItem('hplc_file_handle', handle.name)
      
      setCurrentFilePath(handle.name)
      message.success(`文件已打开: ${handle.name}`)
      
      // 可以在这里触发数据加载到各个页面
      window.dispatchEvent(new CustomEvent('fileLoaded', { detail: data }))
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        message.error('打开文件失败')
        console.error(error)
      }
    }
  }

  // 保存文件
  const handleSaveFile = async () => {
    try {
      // 获取当前系统中的数据
      const currentData = localStorage.getItem('hplc_current_file')
      if (!currentData) {
        message.warning('没有可保存的数据')
        return
      }

      if (!currentFilePath) {
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
        await writable.write(currentData)
        await writable.close()
        
        setCurrentFilePath(handle.name)
        message.success(`文件已保存: ${handle.name}`)
      } else {
        // 直接保存到原文件
        // 注意：直接保存需要保持文件句柄，这里简化处理
        message.info('正在保存文件...')
        // 实际应用中需要保持文件句柄的引用
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: currentFilePath,
          types: [
            {
              description: 'JSON Files',
              accept: { 'application/json': ['.json'] },
            },
          ],
        })
        
        const writable = await handle.createWritable()
        await writable.write(currentData)
        await writable.close()
        
        message.success('文件已保存')
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        message.error('保存文件失败')
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
          onClick: handleSaveFile,
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
          {currentFilePath && (
            <span style={{ padding: '0 24px', color: '#666' }}>
              当前文件: {currentFilePath}
            </span>
          )}
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

export default App
