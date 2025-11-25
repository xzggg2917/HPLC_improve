import React, { useState, useEffect, useRef } from 'react'
import { Card, Typography, Button, Upload, message, Row, Col, Table, Empty, Modal, Input } from 'antd'
import { UploadOutlined, DeleteOutlined, SwapOutlined, LockOutlined } from '@ant-design/icons'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { decryptData } from '../utils/encryption'
import { useAppContext } from '../contexts/AppContext'

const { Title, Paragraph, Text } = Typography

interface FileData {
  id: string
  name: string
  data: {
    S: number
    H: number
    E: number
    R: number
    D: number
    P: number
    N: number
    totalScore: number
  }
}

interface PendingFile {
  file: File
  encryptedContent: string
}

const ComparisonPage: React.FC = () => {
  const { data: allData, currentFilePath } = useAppContext()
  const [files, setFiles] = useState<FileData[]>(() => {
    // 从 localStorage 加载已保存的对比数据
    const saved = localStorage.getItem('hplc_comparison_files')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        console.log('📂 Loaded comparison files from localStorage:', parsed.length)
        return parsed
      } catch (e) {
        console.error('Failed to load comparison data:', e)
      }
    }
    console.log('📂 No saved comparison files found')
    return []
  })
  const [loading, setLoading] = useState(false)
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [currentFileId, setCurrentFileId] = useState<string | null>(null)
  const [updateTrigger, setUpdateTrigger] = useState(0) // 用于强制更新
  const hasLoadedCurrentFile = useRef(false) // 追踪是否已加载当前文件

  // 保存文件列表到 localStorage
  useEffect(() => {
    localStorage.setItem('hplc_comparison_files', JSON.stringify(files))
  }, [files])

  // 监听 New File 事件，清空对比数据
  useEffect(() => {
    const handleNewFile = () => {
      console.log('🔄 ComparisonPage: New file created event received')
      console.log('Current files before clear:', files.length)
      
      setFiles([])
      localStorage.removeItem('hplc_comparison_files')
      setCurrentFileId(null)
      hasLoadedCurrentFile.current = false // 重置加载标记
      
      console.log('Files cleared, triggering update')
      
      // 延迟触发当前文件数据重新加载，等待 allData 准备好
      setTimeout(() => {
        console.log('Triggering update after new file')
        setUpdateTrigger(prev => {
          console.log('Update trigger:', prev, '->', prev + 1)
          return prev + 1
        })
      }, 500) // 增加延迟到 500ms
    }

    console.log('📌 ComparisonPage: Registering newFileCreated listener')
    window.addEventListener('newFileCreated', handleNewFile)
    
    return () => {
      console.log('📌 ComparisonPage: Unregistering newFileCreated listener')
      window.removeEventListener('newFileCreated', handleNewFile)
    }
  }, [files.length]) // 添加 files.length 依赖，确保能看到最新的 files

  // 自动加载当前打开的文件数据(包括未保存的新文件)
  // 在组件挂载时或文件更新时检查
  useEffect(() => {
    console.log('🔍 Current file effect triggered:', { 
      currentFilePath, 
      currentFilePathType: typeof currentFilePath,
      allData: allData ? 'exists' : 'null/undefined',
      allDataType: typeof allData,
      hasMethods: !!(allData?.methods), 
      updateTrigger,
      hasLoadedBefore: hasLoadedCurrentFile.current
    })
    
    // 如果没有当前文件或当前文件数据,跳过
    if (!currentFilePath || !allData) {
      console.log('❌ No current file or allData, skipping. currentFilePath:', currentFilePath, 'allData:', allData)
      return
    }
    
    const fileId = currentFilePath + '_current'
    
    // 如果已经标记为加载过，跳过（防止重复添加）
    if (hasLoadedCurrentFile.current) {
      console.log('⏭️ File already loaded before, skipping')
      return
    }

    console.log('📝 Processing current file...')

    try {
      const parsedData = allData
      const methodsData = parsedData.methods || { sampleCount: null, preTreatmentReagents: [], mobilePhaseA: [], mobilePhaseB: [] }
      const gradientData = parsedData.gradient || {}
      const factorsData = parsedData.factors || []

      const sampleCount = methodsData.sampleCount || 0
      const totalScores = { S: 0, H: 0, E: 0, R: 0, D: 0, P: 0 }
      
      console.log('Sample count:', sampleCount, 'Factors count:', factorsData.length)

      // 计算前处理试剂得分
      if (methodsData.preTreatmentReagents && Array.isArray(methodsData.preTreatmentReagents)) {
        methodsData.preTreatmentReagents.forEach((reagent: any) => {
          if (!reagent.name || reagent.volume <= 0) return
          const factor = factorsData.find((f: any) => f.name === reagent.name)
          if (!factor) return
          const mass = reagent.volume * factor.density
          totalScores.S += mass * factor.safetyScore
          totalScores.H += mass * factor.healthScore
          totalScores.E += mass * factor.envScore
          totalScores.R += mass * factor.recycleScore
          totalScores.D += mass * factor.disposal
          totalScores.P += mass * factor.power
        })
      }

      // 计算流动相得分
      const calculations = gradientData.calculations
      if (calculations) {
        if (calculations.mobilePhaseA?.components) {
          calculations.mobilePhaseA.components.forEach((component: any) => {
            if (!component.reagentName || component.volume <= 0) return
            const factor = factorsData.find((f: any) => f.name === component.reagentName)
            if (!factor) return
            const mass = component.volume * factor.density
            totalScores.S += mass * factor.safetyScore
            totalScores.H += mass * factor.healthScore
            totalScores.E += mass * factor.envScore
            totalScores.R += mass * factor.recycleScore
            totalScores.D += mass * factor.disposal
            totalScores.P += mass * factor.power
          })
        }
        
        if (calculations.mobilePhaseB?.components) {
          calculations.mobilePhaseB.components.forEach((component: any) => {
            if (!component.reagentName || component.volume <= 0) return
            const factor = factorsData.find((f: any) => f.name === component.reagentName)
            if (!factor) return
            const mass = component.volume * factor.density
            totalScores.S += mass * factor.safetyScore
            totalScores.H += mass * factor.healthScore
            totalScores.E += mass * factor.envScore
            totalScores.R += mass * factor.recycleScore
            totalScores.D += mass * factor.disposal
            totalScores.P += mass * factor.power
          })
        }
      }

      const sumOfAllScores = totalScores.S + totalScores.H + totalScores.E + totalScores.R + totalScores.D + totalScores.P
      const totalScore = sampleCount > 0 ? sumOfAllScores / sampleCount : 0

      const fileData: FileData = {
        id: fileId,
        name: currentFilePath.replace('.hplc', '').replace('.json', '') + ' (Current)',
        data: {
          S: totalScores.S,
          H: totalScores.H,
          E: totalScores.E,
          R: totalScores.R,
          D: totalScores.D,
          P: totalScores.P,
          N: sampleCount,
          totalScore: totalScore
        }
      }

      // 使用函数式更新来安全地检查和添加/更新文件
      setFiles(prev => {
        const existingIndex = prev.findIndex(f => f.id === fileId)
        if (existingIndex >= 0) {
          // 更新已存在的文件
          console.log('✏️ Updating existing file at index:', existingIndex)
          const newFiles = [...prev]
          newFiles[existingIndex] = fileData
          return newFiles
        } else {
          // 添加新文件
          console.log('➕ Adding new file:', fileData.name)
          message.success(`Current file "${fileData.name}" added to comparison`)
          return [...prev, fileData]
        }
      })
      
      setCurrentFileId(fileId)
      hasLoadedCurrentFile.current = true // 标记已加载
    } catch (error) {
      console.error('Error loading current file data:', error)
    }
  }, [currentFilePath, allData, updateTrigger]) // 不添加 files 依赖，避免无限循环

  // 处理已解密的数据
  const processDecryptedData = async (parsedData: any, fileName: string) => {
    try {
      console.log('Processing decrypted data:', parsedData)
      
      const methodsData = parsedData.methods || {}
      const gradientData = parsedData.gradient || {}
      const factorsData = parsedData.factors || []

      const sampleCount = methodsData.sampleCount || 0
      const totalScores = { S: 0, H: 0, E: 0, R: 0, D: 0, P: 0 }

      // 计算前处理试剂得分
      if (methodsData.preTreatmentReagents && Array.isArray(methodsData.preTreatmentReagents)) {
        methodsData.preTreatmentReagents.forEach((reagent: any) => {
          if (!reagent.name || reagent.volume <= 0) return
          const factor = factorsData.find((f: any) => f.name === reagent.name)
          if (!factor) return
          const mass = reagent.volume * factor.density
          totalScores.S += mass * factor.safetyScore
          totalScores.H += mass * factor.healthScore
          totalScores.E += mass * factor.envScore
          totalScores.R += mass * factor.recycleScore
          totalScores.D += mass * factor.disposal
          totalScores.P += mass * factor.power
        })
      }

      // 计算流动相得分
      const calculations = gradientData.calculations
      if (calculations) {
        if (calculations.mobilePhaseA?.components) {
          calculations.mobilePhaseA.components.forEach((component: any) => {
            if (!component.reagentName || component.volume <= 0) return
            const factor = factorsData.find((f: any) => f.name === component.reagentName)
            if (!factor) return
            const mass = component.volume * factor.density
            totalScores.S += mass * factor.safetyScore
            totalScores.H += mass * factor.healthScore
            totalScores.E += mass * factor.envScore
            totalScores.R += mass * factor.recycleScore
            totalScores.D += mass * factor.disposal
            totalScores.P += mass * factor.power
          })
        }
        
        if (calculations.mobilePhaseB?.components) {
          calculations.mobilePhaseB.components.forEach((component: any) => {
            if (!component.reagentName || component.volume <= 0) return
            const factor = factorsData.find((f: any) => f.name === component.reagentName)
            if (!factor) return
            const mass = component.volume * factor.density
            totalScores.S += mass * factor.safetyScore
            totalScores.H += mass * factor.healthScore
            totalScores.E += mass * factor.envScore
            totalScores.R += mass * factor.recycleScore
            totalScores.D += mass * factor.disposal
            totalScores.P += mass * factor.power
          })
        }
      }

      const sumOfAllScores = totalScores.S + totalScores.H + totalScores.E + totalScores.R + totalScores.D + totalScores.P
      const totalScore = sampleCount > 0 ? sumOfAllScores / sampleCount : 0

      const fileData: FileData = {
        id: Date.now().toString() + Math.random(),
        name: fileName.replace('.hplc', '').replace('.json', ''),
        data: {
          S: totalScores.S,
          H: totalScores.H,
          E: totalScores.E,
          R: totalScores.R,
          D: totalScores.D,
          P: totalScores.P,
          N: sampleCount,
          totalScore: totalScore
        }
      }

      setFiles(prev => [...prev, fileData])
      message.success(`File ${fileName} loaded successfully`)
    } catch (error) {
      console.error('Error processing data:', error)
      message.error(`Failed to process file ${fileName}`)
      throw error
    }
  }

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    setLoading(true)
    try {
      console.log('Reading file:', file.name)
      const text = await file.text()
      
      let parsedContent
      try {
        parsedContent = JSON.parse(text)
      } catch (e) {
        message.error('File format error, cannot parse')
        setLoading(false)
        return false
      }

      // 检查是否为加密文件
      if (parsedContent.encrypted && parsedContent.data) {
        console.log('🔐 Encrypted file detected')
        setPendingFile({
          file: file,
          encryptedContent: parsedContent.data
        })
        setPasswordModalVisible(true)
        setLoading(false)
      } else {
        console.log('📂 Unencrypted file detected')
        await processDecryptedData(parsedContent, file.name)
        setLoading(false)
      }
      
      return false
    } catch (error) {
      console.error('Error reading file:', error)
      message.error(`Failed to read file ${file.name}`)
      setLoading(false)
      return false
    }
  }

  // 处理密码确认
  const handlePasswordSubmit = async () => {
    if (!pendingFile) return
    
    if (!password) {
      message.error('Please enter password')
      return
    }

    setPasswordLoading(true)
    try {
      const decryptedData = decryptData(pendingFile.encryptedContent, password)
      
      if (!decryptedData) {
        message.error('Decryption failed. Please check your password.')
        setPasswordLoading(false)
        return
      }

      const parsedData = JSON.parse(decryptedData)
      await processDecryptedData(parsedData, pendingFile.file.name)
      
      setPasswordModalVisible(false)
      setPendingFile(null)
      setPassword('')
      setPasswordLoading(false)
    } catch (error) {
      console.error('Error decrypting file:', error)
      message.error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setPasswordLoading(false)
    }
  }

  const handlePasswordCancel = () => {
    setPasswordModalVisible(false)
    setPendingFile(null)
    setPassword('')
  }

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
    message.success('File removed')
  }

  const handleClearAll = () => {
    if (files.length === 0) return
    if (window.confirm(`Are you sure you want to remove all ${files.length} file(s)?`)) {
      setFiles([])
      localStorage.removeItem('hplc_comparison_files')
      message.success('All files cleared')
    }
  }

  // 确保 files 数组中没有重复的 id（防御性编程）
  const uniqueFiles = React.useMemo(() => {
    const seen = new Set<string>()
    const result: FileData[] = []
    
    for (const file of files) {
      if (!seen.has(file.id)) {
        seen.add(file.id)
        result.push(file)
      } else {
        console.warn('⚠️ Duplicate file id detected and removed:', file.id)
      }
    }
    
    if (result.length !== files.length) {
      console.error('❌ Found duplicate files! Original:', files.length, 'Unique:', result.length)
      console.log('Files:', files.map(f => ({ id: f.id, name: f.name })))
    }
    
    return result
  }, [files])

  const radarData = React.useMemo(() => [
    { subject: 'Safety (S)', ...Object.fromEntries(uniqueFiles.map(f => [f.name, Number(f.data.S.toFixed(2))])) },
    { subject: 'Health (H)', ...Object.fromEntries(uniqueFiles.map(f => [f.name, Number(f.data.H.toFixed(2))])) },
    { subject: 'Environment (E)', ...Object.fromEntries(uniqueFiles.map(f => [f.name, Number(f.data.E.toFixed(2))])) },
    { subject: 'Recycle (R)', ...Object.fromEntries(uniqueFiles.map(f => [f.name, Number(f.data.R.toFixed(2))])) },
    { subject: 'Disposal (D)', ...Object.fromEntries(uniqueFiles.map(f => [f.name, Number(f.data.D.toFixed(2))])) },
    { subject: 'Power (P)', ...Object.fromEntries(uniqueFiles.map(f => [f.name, Number(f.data.P.toFixed(2))])) },
    { subject: 'Samples (N)', ...Object.fromEntries(uniqueFiles.map(f => [f.name, f.data.N])) },
  ], [uniqueFiles])

  // 对数缩放函数（保留原始数值，但用对数刻度显示）
  const logScale = (value: number): number => {
    if (value <= 0) return 0
    // 使用 log(1 + value) 来处理小数值
    return Math.log10(1 + value) * 50 // 乘以50调整显示范围
  }

  // 反对数函数（用于tooltip显示原始值）
  const inverseLogScale = (scaledValue: number): number => {
    return Math.pow(10, scaledValue / 50) - 1
  }

  // 应用对数缩放到雷达图数据
  const scaledRadarData = React.useMemo(() => radarData.map(item => {
    const scaled: any = { 
      subject: item.subject,
      _rawData: {} // 存储原始数据用于tooltip
    }
    
    const isSamplesN = item.subject === 'Samples (N)'
    
    files.forEach(f => {
      const rawValue = item[f.name]
      scaled._rawData[f.name] = rawValue
      
      // 对于样品数N，数值越大应该越靠外，所以要反转
      // 其他因子是越小越好（越靠内），N是越大越好（越靠外）
      if (isSamplesN && rawValue > 0) {
        // 找出最大样品数用于归一化
        const maxN = Math.max(...files.map(file => item[file.name] || 0))
        // 反转：用最大值减去当前值，这样大的N会显示在外侧
        const invertedValue = maxN - rawValue + 1 // +1避免为0
        scaled[f.name] = logScale(invertedValue)
      } else {
        scaled[f.name] = logScale(rawValue)
      }
    })
    
    return scaled
  }), [radarData])

  // 自定义雷达图 Tooltip（显示原始值）
  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{payload[0].payload.subject}</p>
          {payload.map((entry: any, index: number) => {
            const rawValue = entry.payload._rawData[entry.name]
            return (
              <p key={index} style={{ margin: '3px 0', color: entry.color }}>
                {entry.name}: {typeof rawValue === 'number' ? rawValue.toFixed(2) : rawValue}
              </p>
            )
          })}
        </div>
      )
    }
    return null
  }

  console.log('Radar Data:', radarData)
  console.log('Scaled Radar Data:', scaledRadarData)
  console.log('Files:', uniqueFiles)

  const pieData = uniqueFiles.map(f => ({
    name: f.name,
    value: Number(f.data.totalScore.toFixed(2)),
    // 保存所有7个因子的数据用于tooltip
    details: {
      S: f.data.S,
      H: f.data.H,
      E: f.data.E,
      R: f.data.R,
      D: f.data.D,
      P: f.data.P,
      N: f.data.N
    }
  })).filter(item => item.value > 0)

  // 自定义饼图 Tooltip
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          minWidth: '200px'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '14px' }}>{data.name}</p>
          <p style={{ margin: '5px 0', color: '#1890ff' }}>
            <strong>Total Score:</strong> {data.value}
          </p>
          <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #eee' }} />
          <p style={{ margin: '3px 0', fontSize: '13px' }}><strong>Safety (S):</strong> {data.details.S.toFixed(2)}</p>
          <p style={{ margin: '3px 0', fontSize: '13px' }}><strong>Health (H):</strong> {data.details.H.toFixed(2)}</p>
          <p style={{ margin: '3px 0', fontSize: '13px' }}><strong>Environment (E):</strong> {data.details.E.toFixed(2)}</p>
          <p style={{ margin: '3px 0', fontSize: '13px' }}><strong>Recycle (R):</strong> {data.details.R.toFixed(2)}</p>
          <p style={{ margin: '3px 0', fontSize: '13px' }}><strong>Disposal (D):</strong> {data.details.D.toFixed(2)}</p>
          <p style={{ margin: '3px 0', fontSize: '13px' }}><strong>Power (P):</strong> {data.details.P.toFixed(2)}</p>
          <p style={{ margin: '3px 0', fontSize: '13px' }}><strong>Samples (N):</strong> {data.details.N}</p>
        </div>
      )
    }
    return null
  }

  console.log('Pie Data:', pieData)

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a28fd0', '#f4a261']

  const generateEvaluation = () => {
    if (uniqueFiles.length === 0) return null

    const sortedFiles = [...uniqueFiles].sort((a, b) => a.data.totalScore - b.data.totalScore)
    const best = sortedFiles[0]

    const getBestPerformance = (factor: keyof Omit<FileData['data'], 'totalScore'>) => {
      const sorted = [...uniqueFiles].sort((a, b) => a.data[factor] - b.data[factor])
      const best = sorted[0]
      return `${best.name} has the lowest value (${best.data[factor].toFixed(2)})`
    }

    const getMaxSamples = () => {
      const sorted = [...uniqueFiles].sort((a, b) => b.data.N - a.data.N)
      const best = sorted[0]
      return `${best.name} processes the most samples (${best.data.N})`
    }

    return (
      <Card title="Evaluation" style={{ marginTop: 24 }}>
        <Paragraph>
          <Text strong>Total Score Comparison:</Text> Based on the comprehensive analysis of {uniqueFiles.length} methods, 
          <Text strong style={{ color: '#52c41a' }}> {best.name}</Text> demonstrates the best overall performance 
          with a total score of <Text strong>{best.data.totalScore.toFixed(3)}</Text> per sample.
        </Paragraph>
        
        <Paragraph>
          <Text strong>Individual Factor Analysis:</Text>
        </Paragraph>
        <ul>
          <li><Text strong>Safety (S):</Text> {getBestPerformance('S')}</li>
          <li><Text strong>Health (H):</Text> {getBestPerformance('H')}</li>
          <li><Text strong>Environment (E):</Text> {getBestPerformance('E')}</li>
          <li><Text strong>Recyclability (R):</Text> {getBestPerformance('R')}</li>
          <li><Text strong>Disposal (D):</Text> {getBestPerformance('D')}</li>
          <li><Text strong>Power (P):</Text> {getBestPerformance('P')}</li>
          <li><Text strong>Sample Throughput (N):</Text> {getMaxSamples()}</li>
        </ul>

        <Paragraph style={{ marginTop: 16 }}>
          <Text strong>Recommendation:</Text> For applications prioritizing green chemistry principles, 
          <Text strong style={{ color: '#52c41a' }}> {best.name}</Text> is recommended. 
          However, specific factor requirements should be considered based on laboratory constraints and analytical needs.
        </Paragraph>
      </Card>
    )
  }

  const columns = [
    {
      title: 'Method Name',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left' as const,
      width: 150,
    },
    {
      title: 'S',
      dataIndex: ['data', 'S'],
      key: 'S',
      render: (val: number) => val.toFixed(2),
      sorter: (a: FileData, b: FileData) => a.data.S - b.data.S,
    },
    {
      title: 'H',
      dataIndex: ['data', 'H'],
      key: 'H',
      render: (val: number) => val.toFixed(2),
      sorter: (a: FileData, b: FileData) => a.data.H - b.data.H,
    },
    {
      title: 'E',
      dataIndex: ['data', 'E'],
      key: 'E',
      render: (val: number) => val.toFixed(2),
      sorter: (a: FileData, b: FileData) => a.data.E - b.data.E,
    },
    {
      title: 'R',
      dataIndex: ['data', 'R'],
      key: 'R',
      render: (val: number) => val.toFixed(2),
      sorter: (a: FileData, b: FileData) => a.data.R - b.data.R,
    },
    {
      title: 'D',
      dataIndex: ['data', 'D'],
      key: 'D',
      render: (val: number) => val.toFixed(2),
      sorter: (a: FileData, b: FileData) => a.data.D - b.data.D,
    },
    {
      title: 'P',
      dataIndex: ['data', 'P'],
      key: 'P',
      render: (val: number) => val.toFixed(2),
      sorter: (a: FileData, b: FileData) => a.data.P - b.data.P,
    },
    {
      title: 'N',
      dataIndex: ['data', 'N'],
      key: 'N',
      sorter: (a: FileData, b: FileData) => a.data.N - b.data.N,
    },
    {
      title: 'Total Score',
      dataIndex: ['data', 'totalScore'],
      key: 'totalScore',
      render: (val: number) => <Text strong>{val.toFixed(3)}</Text>,
      sorter: (a: FileData, b: FileData) => a.data.totalScore - b.data.totalScore,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right' as const,
      width: 100,
      align: 'center' as const,
      render: (_: any, record: FileData) => (
        <Button 
          type="link" 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveFile(record.id)}
        >
          Remove
        </Button>
      ),
    },
  ]

  return (
    <div className="comparison-page" style={{ padding: '24px' }}>
      <Title level={2}>
        <SwapOutlined /> Method Comparison
      </Title>
      <Paragraph>
        Upload multiple HPLC method files to compare their green chemistry performance across different dimensions.
      </Paragraph>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Upload
              accept=".hplc,.json"
              multiple
              showUploadList={false}
              beforeUpload={handleFileUpload}
              disabled={loading}
            >
              <Button icon={<UploadOutlined />} loading={loading}>
                Upload HPLC Files
              </Button>
            </Upload>
            <Text type="secondary" style={{ marginLeft: 16 }}>
              {uniqueFiles.length} file(s) loaded
            </Text>
          </Col>
          <Col>
            <Button danger onClick={handleClearAll} disabled={uniqueFiles.length === 0}>
              Clear All
            </Button>
          </Col>
        </Row>
      </Card>

      {uniqueFiles.length === 0 ? (
        <Card>
          <Empty description="No files uploaded. Please upload at least one HPLC method file to start comparison." />
        </Card>
      ) : (
        <>
          <Card title="Comparison Data" style={{ marginBottom: 24 }}>
            <Table
              columns={columns}
              dataSource={uniqueFiles}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1000 }}
              size="small"
            />
          </Card>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="Multi-dimensional Radar Chart (Log Scale)">
                <div style={{ width: '100%', height: '450px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={scaledRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} />
                      {uniqueFiles.map((file, index) => (
                        <Radar
                          key={file.id}
                          name={file.name}
                          dataKey={file.name}
                          stroke={COLORS[index % COLORS.length]}
                          fill={COLORS[index % COLORS.length]}
                          fillOpacity={0.3}
                        />
                      ))}
                      <Legend />
                      <Tooltip content={<CustomRadarTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>            <Col xs={24} lg={12}>
              <Card title="Total Score Comparison">
                <div style={{ width: '100%', height: '450px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>

          {generateEvaluation()}
        </>
      )}

      <Modal
        title={
          <span>
            <LockOutlined /> Enter Password to Decrypt File
          </span>
        }
        open={passwordModalVisible}
        onOk={handlePasswordSubmit}
        onCancel={handlePasswordCancel}
        confirmLoading={passwordLoading}
        okText="Decrypt"
        cancelText="Cancel"
      >
        <Paragraph>
          Please enter the password to decrypt <Text strong>{pendingFile?.file.name}</Text>
        </Paragraph>
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onPressEnter={handlePasswordSubmit}
          autoFocus
        />
      </Modal>
    </div>
  )
}

export default ComparisonPage
