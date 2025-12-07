import React, { useState, useEffect, useLayoutEffect } from 'react'
import { Card, Typography, Button, InputNumber, Input, message, Row, Col } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'
import { useAppContext } from '../contexts/AppContext'
import type { ReagentFactor } from '../contexts/AppContext'
import AddReagentModal from '../components/AddReagentModal'
import { StorageHelper, STORAGE_KEYS } from '../utils/storage'
import './FactorsPage.css'

const { Title } = Typography

// 预定义的试剂数据(基于您提供的表格)
const PREDEFINED_REAGENTS: ReagentFactor[] = [
  { id: '1', name: 'Acetone', density: 0.791, releasePotential: 0.698, fireExplos: 1.000, reactDecom: 0.000, acuteToxicity: 0.297, irritation: 0.625, chronicToxicity: 0.184, persistency: 0.126, airHazard: 0.184, waterHazard: 0.000, safetyScore: 1.995, healthScore: 0.809, envScore: 0.310, regeneration: 0, disposal: 2 },
  { id: '2', name: 'Acetonitrile', density: 0.786, releasePotential: 0.615, fireExplos: 1.000, reactDecom: 0.600, acuteToxicity: 0.510, irritation: 0.625, chronicToxicity: 0.431, persistency: 0.341, airHazard: 0.431, waterHazard: 0.000, safetyScore: 2.724, healthScore: 1.056, envScore: 0.772, regeneration: 0, disposal: 2 },
  { id: '3', name: 'Chloroform', density: 1.483, releasePotential: 0.684, fireExplos: 0.000, reactDecom: 0.000, acuteToxicity: 0.394, irritation: 0.625, chronicToxicity: 0.800, persistency: 0.457, airHazard: 0.800, waterHazard: 0.178, safetyScore: 1.077, healthScore: 1.425, envScore: 1.435, regeneration: 0, disposal: 2 },
  { id: '4', name: 'CO2', density: 0, releasePotential: 0, fireExplos: 0, reactDecom: 0, acuteToxicity: 0, irritation: 0, chronicToxicity: 0, persistency: 0, airHazard: 0, waterHazard: 0, safetyScore: 0, healthScore: 0, envScore: 0, regeneration: 0, disposal: 0 },
  { id: '5', name: 'Dichloromethane', density: 1.327, releasePotential: 0.753, fireExplos: 1.000, reactDecom: 0.600, acuteToxicity: 0.265, irritation: 0.349, chronicToxicity: 0.289, persistency: 0.023, airHazard: 0.289, waterHazard: 0.031, safetyScore: 2.618, healthScore: 0.638, envScore: 0.343, regeneration: 0, disposal: 2 },
  { id: '6', name: 'Ethanol', density: 0.789, releasePotential: 0.580, fireExplos: 1.000, reactDecom: 0.000, acuteToxicity: 0.292, irritation: 0.000, chronicToxicity: 0.204, persistency: 0.282, airHazard: 0.204, waterHazard: 0.000, safetyScore: 1.872, healthScore: 0.204, envScore: 0.485, regeneration: 0, disposal: 2 },
  { id: '7', name: 'Ethyl acetate', density: 0.902, releasePotential: 0.619, fireExplos: 1.000, reactDecom: 0.000, acuteToxicity: 0.276, irritation: 0.625, chronicToxicity: 0.171, persistency: 0.026, airHazard: 0.171, waterHazard: 0.003, safetyScore: 1.895, healthScore: 0.796, envScore: 0.199, regeneration: 0, disposal: 2 },
  { id: '8', name: 'Heptane', density: 0.684, releasePotential: 0.557, fireExplos: 1.000, reactDecom: 0.000, acuteToxicity: 0.368, irritation: 0.625, chronicToxicity: 0.159, persistency: 0.430, airHazard: 0.159, waterHazard: 0.500, safetyScore: 1.925, healthScore: 0.784, envScore: 1.089, regeneration: 0, disposal: 2 },
  { id: '9', name: 'Hexane (n)', density: 0.659, releasePotential: 0.661, fireExplos: 1.000, reactDecom: 0.000, acuteToxicity: 0.343, irritation: 0.625, chronicToxicity: 0.349, persistency: 0.426, airHazard: 0.349, waterHazard: 0.325, safetyScore: 2.004, healthScore: 0.974, envScore: 1.100, regeneration: 0, disposal: 2 },
  { id: '10', name: 'Isooctane', density: 0.692, releasePotential: 0.630, fireExplos: 1.000, reactDecom: 0.000, acuteToxicity: 0.000, irritation: 0.330, chronicToxicity: 0.000, persistency: 0.680, airHazard: 0.000, waterHazard: 0.875, safetyScore: 1.630, healthScore: 0.330, envScore: 1.555, regeneration: 0, disposal: 2 },
  { id: '11', name: 'Isopropanol', density: 0.785, releasePotential: 0.556, fireExplos: 1.000, reactDecom: 0.000, acuteToxicity: 0.318, irritation: 0.625, chronicToxicity: 0.260, persistency: 0.280, airHazard: 0.260, waterHazard: 0.000, safetyScore: 1.874, healthScore: 0.885, envScore: 0.540, regeneration: 0, disposal: 2 },
  { id: '12', name: 'Methanol', density: 0.791, releasePotential: 0.646, fireExplos: 1.000, reactDecom: 0.000, acuteToxicity: 0.267, irritation: 0.113, chronicToxicity: 0.317, persistency: 0.000, airHazard: 0.317, waterHazard: 0.000, safetyScore: 1.912, healthScore: 0.430, envScore: 0.317, regeneration: 0, disposal: 2 },
  { id: '13', name: 'Sulfuric acid 96%', density: 1.84, releasePotential: 0.000, fireExplos: 0.000, reactDecom: 0.800, acuteToxicity: 0.956, irritation: 1.000, chronicToxicity: 1.000, persistency: 0.485, airHazard: 1.000, waterHazard: 0.500, safetyScore: 1.756, healthScore: 2.000, envScore: 1.985, regeneration: 0, disposal: 2 },
  { id: '14', name: 't-butyl methyl ether', density: 0.74, releasePotential: 0.720, fireExplos: 1.000, reactDecom: 0.000, acuteToxicity: 0.000, irritation: 0.220, chronicToxicity: 0.350, persistency: 0.710, airHazard: 0.350, waterHazard: 0.090, safetyScore: 1.720, healthScore: 0.570, envScore: 1.150, regeneration: 0, disposal: 2 },
  { id: '15', name: 'Tetrahydrofuran', density: 0.889, releasePotential: 0.667, fireExplos: 1.000, reactDecom: 0.000, acuteToxicity: 0.298, irritation: 0.625, chronicToxicity: 0.365, persistency: 0.535, airHazard: 0.365, waterHazard: 0.000, safetyScore: 1.965, healthScore: 0.990, envScore: 0.900, regeneration: 0, disposal: 2 },
  { id: '16', name: 'Water', density: 0, releasePotential: 0, fireExplos: 0, reactDecom: 0, acuteToxicity: 0, irritation: 0, chronicToxicity: 0, persistency: 0, airHazard: 0, waterHazard: 0, safetyScore: 0, healthScore: 0, envScore: 0, regeneration: 0, disposal: 0 },
]

const FACTORS_DATA_VERSION = 5 // Increment this when PREDEFINED_REAGENTS changes

// 自动按首字母排序函数
const sortReagentsByName = (reagents: ReagentFactor[]): ReagentFactor[] => {
  return [...reagents].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
}

const FactorsPage: React.FC = () => {
  const { data, updateFactorsData, setIsDirty } = useAppContext()
  
  // Check if factors data needs update (同步版本)
  const checkAndUpdateFactorsData = (existingFactors: ReagentFactor[], storedVersion: string | null) => {
    const currentVersion = FACTORS_DATA_VERSION.toString()
    
    // If version doesn't match or missing reagents, update to latest
    if (storedVersion !== currentVersion) {
      console.log('🔄 FactorsPage: Updating factors data to version', currentVersion)
      return [...PREDEFINED_REAGENTS]
    }
    
    // Check if CO2 and Water exist
    const hasCO2 = existingFactors.some(f => f.name === 'CO2')
    const hasWater = existingFactors.some(f => f.name === 'Water')
    
    if (!hasCO2 || !hasWater) {
      console.log('🔄 FactorsPage: Missing CO2 or Water, updating to complete data')
      return [...PREDEFINED_REAGENTS]
    }
    
    // Check if data has sub-factor values (not all zeros)
    // Skip CO2 and Water as they legitimately have all zeros
    const hasValidSubFactors = existingFactors.some(f => 
      (f.name !== 'CO2' && f.name !== 'Water') && 
      (f.releasePotential > 0 || f.fireExplos > 0 || f.reactDecom > 0 || 
       f.acuteToxicity > 0 || f.irritation > 0 || f.chronicToxicity > 0 ||
       f.persistency > 0 || f.airHazard > 0 || f.waterHazard > 0)
    )
    
    if (!hasValidSubFactors) {
      console.log('🔄 FactorsPage: All sub-factors are zero, updating to complete data')
      return [...PREDEFINED_REAGENTS]
    }
    
    return existingFactors
  }
  
  // 使用Context中的数据初始化
  const [reagents, setReagents] = useState<ReagentFactor[]>(() => {
    // 如果Context中有数据就使用,否则使用预定义数据
    if (data.factors.length > 0) {
      // 同步读取版本号（初始化时从localStorage读取）
      const storedVersion = localStorage.getItem('hplc_factors_version')
      const updatedData = checkAndUpdateFactorsData(data.factors, storedVersion)
      return sortReagentsByName(updatedData)
    }
    return sortReagentsByName([...PREDEFINED_REAGENTS])
  })
  const [editSnapshot, setEditSnapshot] = useState<ReagentFactor[]>([]) // 保存进入Edit模式时的快照
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isDeletingMode, setIsDeletingMode] = useState<boolean>(false)
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)

  // 监听Context数据变化，立即同步更新
  const lastSyncedFactors = React.useRef<string>('')
  const hasInitialized = React.useRef(false)
  
  useLayoutEffect(() => {
    const syncData = async () => {
      const currentFactorsStr = JSON.stringify(data.factors)
      
      // 如果数据没有变化，跳过更新
      if (lastSyncedFactors.current === currentFactorsStr) {
        return
      }
      
      lastSyncedFactors.current = currentFactorsStr
      
      if (data.factors.length === 0 && !hasInitialized.current) {
        // 只在第一次遇到空数据时使用预定义数据
        hasInitialized.current = true
        console.log('🔄 FactorsPage: 检测到空数据，使用预定义试剂列表')
        const updatedReagents = sortReagentsByName([...PREDEFINED_REAGENTS])
        setReagents(updatedReagents)
        // 立即同步到Context，避免其他页面读取到空数据
        updateFactorsData(updatedReagents)
        // 🔥 立即写入存储，避免MethodsPage读取时为空
        await StorageHelper.setJSON(STORAGE_KEYS.FACTORS, updatedReagents)
        await StorageHelper.setJSON(STORAGE_KEYS.FACTORS_VERSION, FACTORS_DATA_VERSION.toString())
        console.log('✅ FactorsPage: 已立即写入存储')
        // 🔥 触发事件通知其他页面factors数据已更新
        window.dispatchEvent(new Event('factorsDataUpdated'))
        console.log('📢 FactorsPage: 触发 factorsDataUpdated 事件')
      } else if (data.factors.length > 0) {
        // 有数据时检查是否需要更新
        hasInitialized.current = true
        const storedVersion = await StorageHelper.getJSON<string>(STORAGE_KEYS.FACTORS_VERSION)
        const updatedReagents = checkAndUpdateFactorsData(data.factors, storedVersion)
        console.log('🔄 FactorsPage: 立即同步Context数据')
        setReagents(sortReagentsByName(updatedReagents))
        
        // If data was updated, sync back
        if (JSON.stringify(updatedReagents) !== JSON.stringify(data.factors)) {
          updateFactorsData(updatedReagents)
          await StorageHelper.setJSON(STORAGE_KEYS.FACTORS, updatedReagents)
          await StorageHelper.setJSON(STORAGE_KEYS.FACTORS_VERSION, FACTORS_DATA_VERSION.toString())
          window.dispatchEvent(new Event('factorsDataUpdated'))
          console.log('📢 FactorsPage: 数据已更新并同步')
        }
      }
    }
    
    syncData()
  }, [data.factors, updateFactorsData])

  // 自动保存数据到 Context 和 localStorage
  // 使用 ref 来避免初始化时触发 dirty 和避免循环更新
  const isInitialMount = React.useRef(true)
  const lastLocalData = React.useRef<string>('')
  
  useEffect(() => {
    const saveData = async () => {
      const currentLocalDataStr = JSON.stringify(reagents)
      
      await StorageHelper.setJSON(STORAGE_KEYS.FACTORS, reagents)
      
      // 跳过初始挂载时的更新
      if (isInitialMount.current) {
        isInitialMount.current = false
        lastLocalData.current = currentLocalDataStr
        return
      }
    
      // 如果本地数据没有变化（可能是从Context同步来的），跳过更新
      if (lastLocalData.current === currentLocalDataStr) {
        return
      }
      
      lastLocalData.current = currentLocalDataStr
      updateFactorsData(reagents)
      setIsDirty(true)
    }
    
    saveData()
  }, [reagents, updateFactorsData, setIsDirty])
  
  // 监听文件数据变更事件
  useEffect(() => {
    const handleFileDataChanged = () => {
      console.log('📢 FactorsPage: 接收到 fileDataChanged 事件')
      // hasInitialized标记会在useLayoutEffect中处理数据更新
      // 这里只需要重置标记，让下次Context变化时能正确处理
      hasInitialized.current = false
      console.log('🔄 FactorsPage: 已重置初始化标记')
    }
    
    window.addEventListener('fileDataChanged', handleFileDataChanged)
    return () => {
      window.removeEventListener('fileDataChanged', handleFileDataChanged)
    }
  }, [])

  // 打开添加试剂模态窗口
  const addReagent = () => {
    setIsModalVisible(true)
  }

  // 处理模态窗口添加试剂
  const handleAddReagent = async (newReagent: ReagentFactor) => {
    // 为自定义试剂保存原始版本（用于Reset功能）
    const reagentWithOriginal = {
      ...newReagent,
      originalData: {
        id: newReagent.id,
        name: newReagent.name,
        density: newReagent.density,
        releasePotential: newReagent.releasePotential,
        fireExplos: newReagent.fireExplos,
        reactDecom: newReagent.reactDecom,
        acuteToxicity: newReagent.acuteToxicity,
        irritation: newReagent.irritation,
        chronicToxicity: newReagent.chronicToxicity,
        persistency: newReagent.persistency,
        airHazard: newReagent.airHazard,
        waterHazard: newReagent.waterHazard,
        regeneration: newReagent.regeneration,
        disposal: newReagent.disposal,
        isCustom: newReagent.isCustom,
        safetyScore: newReagent.safetyScore,
        healthScore: newReagent.healthScore,
        envScore: newReagent.envScore
      }
    }
    const updatedReagents = sortReagentsByName([...reagents, reagentWithOriginal])
    setReagents(updatedReagents)
    
    // 🔥 立即保存到文件和Context，确保数据持久化
    await StorageHelper.setJSON(STORAGE_KEYS.FACTORS, updatedReagents)
    updateFactorsData(updatedReagents)
    setIsDirty(true)
    console.log('✅ handleAddReagent: 试剂已添加并立即保存到文件')
    
    setIsModalVisible(false)
    message.success(`试剂 "${newReagent.name}" 添加成功！`)
  }

  // Delete last reagent (old function, now toggle delete mode)
  const toggleDeleteMode = () => {
    setIsDeletingMode(!isDeletingMode)
    if (!isDeletingMode) {
      message.info('请点击每行后的垃圾筒图标来删除该试剂')
    }
  }

  // Delete specific reagent
  const deleteReagent = async (id: string) => {
    const reagentToDelete = reagents.find(r => r.id === id)
    if (reagents.length <= 1) {
      message.warning('至少要保留一个试剂')
      return
    }
    if (window.confirm(`确定要删除试剂 "${reagentToDelete?.name}" 吗？`)) {
      const updatedReagents = sortReagentsByName(reagents.filter(r => r.id !== id))
      setReagents(updatedReagents)
      
      // 🔥 立即保存到文件和Context
      await StorageHelper.setJSON(STORAGE_KEYS.FACTORS, updatedReagents)
      updateFactorsData(updatedReagents)
      setIsDirty(true)
      console.log('✅ deleteReagent: 试剂已删除并立即保存到文件')
      
      message.success(`已删除试剂 "${reagentToDelete?.name}"`)
    }
  }

  // Update reagent data
  const updateReagent = (id: string, field: keyof ReagentFactor, value: string | number) => {
    setReagents(reagents.map(r => {
      if (r.id !== id) return r
      
      // 更新指定字段
      const updatedReagent = { ...r, [field]: value }
      
      // 🔥 自动重新计算 S、H、E 分数
      // Safety Score (S) = Release Potential + Fire/Explos + React/Decom + Acute Toxicity
      updatedReagent.safetyScore = Number((
        (updatedReagent.releasePotential || 0) +
        (updatedReagent.fireExplos || 0) +
        (updatedReagent.reactDecom || 0) +
        (updatedReagent.acuteToxicity || 0)
      ).toFixed(3))
      
      // Health Score (H) = Irritation + Chronic Toxicity
      updatedReagent.healthScore = Number((
        (updatedReagent.irritation || 0) +
        (updatedReagent.chronicToxicity || 0)
      ).toFixed(3))
      
      // Environment Score (E) = Persistency + Air Hazard + Water Hazard
      updatedReagent.envScore = Number((
        (updatedReagent.persistency || 0) +
        (updatedReagent.airHazard || 0) +
        (updatedReagent.waterHazard || 0)
      ).toFixed(3))
      
      console.log(`✅ updateReagent: ${updatedReagent.name} 更新后 S=${updatedReagent.safetyScore}, H=${updatedReagent.healthScore}, E=${updatedReagent.envScore}`)
      
      return updatedReagent
    }))
  }

  // Toggle edit mode
  const toggleEdit = async () => {
    if (isEditing) {
      // Save: 验证并保存数据
      const hasEmptyName = reagents.some(r => !r.name.trim())
      if (hasEmptyName) {
        message.error('Reagent name cannot be empty')
        return
      }
      
      // 🔥 立即保存到文件和Context
      await StorageHelper.setJSON(STORAGE_KEYS.FACTORS, reagents)
      updateFactorsData(reagents)
      setIsDirty(true)
      console.log('✅ toggleEdit: 编辑完成，数据已立即保存到文件')
      
      message.success('Data saved successfully')
      setIsEditing(false)
      setIsDeletingMode(false)
    } else {
      // 进入Edit模式，保存当前数据快照
      setEditSnapshot(JSON.parse(JSON.stringify(reagents))) // 深拷贝
      setIsEditing(true)
    }
  }

  // Cancel edit: 取消编辑，恢复到编辑前的状态
  const cancelEdit = () => {
    if (editSnapshot.length > 0) {
      setReagents(JSON.parse(JSON.stringify(editSnapshot))) // 恢复到编辑前的快照
      message.info('Edit cancelled')
    }
    setIsEditing(false)
    setIsDeletingMode(false)
  }

  // Reset to predefined data: 恢复到系统预定义数据
  const resetToDefault = async () => {
    // 分离自定义试剂和预定义试剂
    const customReagents = reagents.filter(r => r.isCustom === true)
    const hasModifiedData = reagents.some(r => !r.isCustom)
    
    if (!hasModifiedData && customReagents.length === 0) {
      message.info('No data to reset')
      return
    }
    
    // 检查自定义试剂是否被修改过
    const modifiedCustomCount = customReagents.filter(r => {
      if (!r.originalData) return false
      // 比较当前数据和原始数据是否有差异
      return JSON.stringify({
        density: r.density,
        releasePotential: r.releasePotential,
        fireExplos: r.fireExplos,
        reactDecom: r.reactDecom,
        acuteToxicity: r.acuteToxicity,
        irritation: r.irritation,
        chronicToxicity: r.chronicToxicity,
        persistency: r.persistency,
        airHazard: r.airHazard,
        waterHazard: r.waterHazard,
        disposal: r.disposal
      }) !== JSON.stringify({
        density: r.originalData.density,
        releasePotential: r.originalData.releasePotential,
        fireExplos: r.originalData.fireExplos,
        reactDecom: r.originalData.reactDecom,
        acuteToxicity: r.originalData.acuteToxicity,
        irritation: r.originalData.irritation,
        chronicToxicity: r.originalData.chronicToxicity,
        persistency: r.originalData.persistency,
        airHazard: r.originalData.airHazard,
        waterHazard: r.originalData.waterHazard,
        disposal: r.originalData.disposal
      })
    }).length
    
    let confirmMessage = ''
    if (customReagents.length > 0 && hasModifiedData) {
      confirmMessage = `Are you sure to reset all reagents to their original values?\n\n`
      confirmMessage += `- ${PREDEFINED_REAGENTS.length} predefined reagents will be reset\n`
      if (modifiedCustomCount > 0) {
        confirmMessage += `- ${modifiedCustomCount} custom reagent(s) will be reset to their original values\n`
      }
      if (customReagents.length > modifiedCustomCount) {
        confirmMessage += `- ${customReagents.length - modifiedCustomCount} custom reagent(s) are unchanged\n`
      }
    } else if (customReagents.length > 0) {
      confirmMessage = `Are you sure to reset custom reagents?\n\n${modifiedCustomCount} custom reagent(s) will be reset to original values.`
    } else {
      confirmMessage = 'Are you sure to reset all data to default values? This will override all modifications.'
    }
    
    if (window.confirm(confirmMessage)) {
      // 恢复自定义试剂到原始版本
      const resetCustomReagents = customReagents.map(r => {
        if (r.originalData) {
          // 有原始数据，恢复到原始版本
          return {
            ...r.originalData,
            isCustom: true,
            originalData: r.originalData // 保留原始数据引用
          } as ReagentFactor
        }
        // 没有原始数据（旧数据），保持不变
        return r
      })
      
      // 合并预定义试剂和恢复后的自定义试剂
      const resetData = sortReagentsByName([...PREDEFINED_REAGENTS, ...resetCustomReagents])
      setReagents(resetData)
      
      // 🔥 立即保存到文件和Context
      await StorageHelper.setJSON(STORAGE_KEYS.FACTORS, resetData)
      updateFactorsData(resetData)
      setIsDirty(true)
      console.log('✅ resetReagent: 数据已重置并立即保存到文件')
      
      setIsEditing(false)
      setIsDeletingMode(false)
      
      if (customReagents.length > 0) {
        if (modifiedCustomCount > 0) {
          message.success(`All data reset: predefined reagents + ${modifiedCustomCount} custom reagent(s) restored to original values`)
        } else {
          message.success(`Predefined reagents reset, ${customReagents.length} custom reagent(s) unchanged`)
        }
      } else {
        message.success('All data reset to default')
      }
    }
  }

  return (
    <div className="factors-page">
      <Title level={2}>Factors</Title>

      <Card>
        <div className="factors-table-container" style={{ 
          overflowX: 'auto',
          border: '1px solid #f0f0f0',
          borderRadius: '8px'
        }}>
          <table className="factors-table">
            <thead>
              <tr>
                <th rowSpan={2} style={{ verticalAlign: 'middle', textAlign: 'center' }}>Substance</th>
                <th rowSpan={2} style={{ verticalAlign: 'middle', textAlign: 'center' }}>ρ (g/mL)</th>
                <th colSpan={4} style={{ textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>Safety</th>
                <th colSpan={2} style={{ textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>Health</th>
                <th colSpan={3} style={{ textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>Environment</th>
                <th rowSpan={2} style={{ verticalAlign: 'middle', textAlign: 'center' }}>Regeneration</th>
                <th rowSpan={2} style={{ verticalAlign: 'middle', textAlign: 'center' }}>Disposal</th>
                {isDeletingMode && (
                  <th rowSpan={2} style={{ verticalAlign: 'middle', textAlign: 'center', minWidth: '60px' }}>操作</th>
                )}
              </tr>
              <tr>
                <th style={{ fontSize: '11px', padding: '4px', textAlign: 'center' }}>Release potential</th>
                <th style={{ fontSize: '11px', padding: '4px', textAlign: 'center' }}>Fire/Explos.</th>
                <th style={{ fontSize: '11px', padding: '4px', textAlign: 'center' }}>React./Decom.</th>
                <th style={{ fontSize: '11px', padding: '4px', textAlign: 'center' }}>Acute toxicity</th>
                <th style={{ fontSize: '11px', padding: '4px', textAlign: 'center' }}>Irritation</th>
                <th style={{ fontSize: '11px', padding: '4px', textAlign: 'center' }}>Chronic toxicity</th>
                <th style={{ fontSize: '11px', padding: '4px', textAlign: 'center' }}>Persis-tency</th>
                <th style={{ fontSize: '11px', padding: '4px', textAlign: 'center' }}>Air Hazard</th>
                <th style={{ fontSize: '11px', padding: '4px', textAlign: 'center' }}>Water Hazard</th>
              </tr>
            </thead>
            <tbody>
              {reagents.map((reagent) => (
                <tr key={reagent.id}>
                  <td>
                    {isEditing ? (
                      <Input
                        value={reagent.name}
                        onChange={(e) => updateReagent(reagent.id, 'name', e.target.value)}
                        placeholder="Reagent name"
                      />
                    ) : (
                      reagent.name
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.density}
                        onChange={(value) => updateReagent(reagent.id, 'density', value || 0)}
                        step={0.001}
                        precision={3}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      reagent.density.toFixed(3)
                    )}
                  </td>
                  {/* Safety sub-factors */}
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.releasePotential}
                        onChange={(value) => updateReagent(reagent.id, 'releasePotential', value || 0)}
                        step={0.001}
                        precision={3}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      (reagent.releasePotential || 0).toFixed(3)
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.fireExplos}
                        onChange={(value) => updateReagent(reagent.id, 'fireExplos', value || 0)}
                        step={0.001}
                        precision={3}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      (reagent.fireExplos || 0).toFixed(3)
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.reactDecom}
                        onChange={(value) => updateReagent(reagent.id, 'reactDecom', value || 0)}
                        step={0.001}
                        precision={3}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      (reagent.reactDecom || 0).toFixed(3)
                    )}
                  </td>
                  {/* Health sub-factors */}
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.acuteToxicity}
                        onChange={(value) => updateReagent(reagent.id, 'acuteToxicity', value || 0)}
                        step={0.001}
                        precision={3}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      (reagent.acuteToxicity || 0).toFixed(3)
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.irritation}
                        onChange={(value) => updateReagent(reagent.id, 'irritation', value || 0)}
                        step={0.001}
                        precision={3}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      (reagent.irritation || 0).toFixed(3)
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.chronicToxicity}
                        onChange={(value) => updateReagent(reagent.id, 'chronicToxicity', value || 0)}
                        step={0.001}
                        precision={3}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      (reagent.chronicToxicity || 0).toFixed(3)
                    )}
                  </td>
                  {/* Environment sub-factors */}
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.persistency}
                        onChange={(value) => updateReagent(reagent.id, 'persistency', value || 0)}
                        step={0.001}
                        precision={3}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      (reagent.persistency || 0).toFixed(3)
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.airHazard}
                        onChange={(value) => updateReagent(reagent.id, 'airHazard', value || 0)}
                        step={0.001}
                        precision={3}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      (reagent.airHazard || 0).toFixed(3)
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.waterHazard}
                        onChange={(value) => updateReagent(reagent.id, 'waterHazard', value || 0)}
                        step={0.001}
                        precision={3}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      (reagent.waterHazard || 0).toFixed(3)
                    )}
                  </td>
                  {/* Main factors - R and D only */}
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.regeneration}
                        onChange={(value) => updateReagent(reagent.id, 'regeneration', value || 0)}
                        step={0.25}
                        precision={2}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      (reagent.regeneration || 0).toFixed(2)
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.disposal}
                        onChange={(value) => updateReagent(reagent.id, 'disposal', value || 0)}
                        step={0.25}
                        precision={2}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      (reagent.disposal || 0).toFixed(2)
                    )}
                  </td>
                  {isDeletingMode && (
                    <td style={{ textAlign: 'center' }}>
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => deleteReagent(reagent.id)}
                        disabled={reagents.length <= 1}
                        title="Delete this reagent"
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Row gutter={16} style={{ marginTop: 16 }}>
          {!isEditing ? (
            // 非编辑模式：显示Add、Delete、Edit、Reset to Default
            <>
              <Col span={6}>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addReagent}
                  style={{ width: '100%' }}
                >
                  Add
                </Button>
              </Col>
              <Col span={6}>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => message.info('Please enter Edit mode first')}
                  style={{ width: '100%' }}
                  disabled
                >
                  Delete
                </Button>
              </Col>
              <Col span={6}>
                <Button
                  icon={<EditOutlined />}
                  onClick={toggleEdit}
                  style={{ width: '100%' }}
                >
                  Edit
                </Button>
              </Col>
              <Col span={6}>
                <Button
                  onClick={resetToDefault}
                  style={{ width: '100%' }}
                >
                  Reset to Default
                </Button>
              </Col>
            </>
          ) : (
            // 编辑模式：显示Delete、Save、Cancel
            <>
              <Col span={8}>
                <Button
                  danger={isDeletingMode}
                  type={isDeletingMode ? 'primary' : 'default'}
                  icon={<DeleteOutlined />}
                  onClick={toggleDeleteMode}
                  style={{ width: '100%' }}
                >
                  {isDeletingMode ? 'Cancel Delete' : 'Delete'}
                </Button>
              </Col>
              <Col span={8}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={toggleEdit}
                  style={{ width: '100%' }}
                >
                  Save
                </Button>
              </Col>
              <Col span={8}>
                <Button
                  onClick={cancelEdit}
                  style={{ width: '100%' }}
                >
                  Cancel
                </Button>
              </Col>
            </>
          )}
        </Row>

  
      </Card>

      {/* 添加试剂模态窗口 */}
      <AddReagentModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleAddReagent}
      />
    </div>
  )
}

export default FactorsPage
