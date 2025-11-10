import React, { useState, useEffect, useLayoutEffect } from 'react'
import { Card, Typography, Button, InputNumber, Input, message, Row, Col } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'
import { useAppContext } from '../contexts/AppContext'
import type { ReagentFactor } from '../contexts/AppContext'
import './FactorsPage.css'

const { Title } = Typography

// 预定义的试剂数据(基于您提供的表格)
const PREDEFINED_REAGENTS: ReagentFactor[] = [
  { id: '1', name: 'Acetone', density: 0.791, safetyScore: 1.995, healthScore: 0.809, envScore: 0.310, recycleScore: 0, disposal: 2, power: 1 },
  { id: '2', name: 'Acetonitrile', density: 0.786, safetyScore: 2.724, healthScore: 1.056, envScore: 0.772, recycleScore: 0, disposal: 2, power: 2 },
  { id: '3', name: 'Chloroform', density: 1.483, safetyScore: 1.077, healthScore: 1.425, envScore: 1.435, recycleScore: 0, disposal: 2, power: 3 },
  { id: '4', name: 'CO2', density: 0, safetyScore: 0, healthScore: 0, envScore: 0, recycleScore: 0, disposal: 0, power: 0 },
  { id: '5', name: 'Dichloromethane', density: 1.327, safetyScore: 2.618, healthScore: 0.638, envScore: 0.343, recycleScore: 0, disposal: 2, power: 2 },
  { id: '6', name: 'Ethanol', density: 0.789, safetyScore: 1.872, healthScore: 0.204, envScore: 0.485, recycleScore: 0, disposal: 2, power: 3 },
  { id: '7', name: 'Ethyl acetate', density: 0.902, safetyScore: 1.895, healthScore: 0.796, envScore: 0.199, recycleScore: 0, disposal: 2, power: 2 },
  { id: '8', name: 'Heptane', density: 0.684, safetyScore: 1.925, healthScore: 0.784, envScore: 1.089, recycleScore: 0, disposal: 2, power: 3 },
  { id: '9', name: 'Hexane (n)', density: 0.659, safetyScore: 2.004, healthScore: 0.974, envScore: 1.100, recycleScore: 0, disposal: 2, power: 2 },
  { id: '10', name: 'Isooctane', density: 0.692, safetyScore: 1.630, healthScore: 0.330, envScore: 1.555, recycleScore: 0, disposal: 2, power: 2 },
  { id: '11', name: 'Isopropanol', density: 0.785, safetyScore: 1.874, healthScore: 0.885, envScore: 0.540, recycleScore: 0, disposal: 2, power: 3 },
  { id: '12', name: 'Methanol', density: 0.791, safetyScore: 1.912, healthScore: 0.430, envScore: 0.317, recycleScore: 0, disposal: 2, power: 3 },
  { id: '13', name: 'Sulfuric acid 96%', density: 1.84, safetyScore: 1.756, healthScore: 2.000, envScore: 1.985, recycleScore: 0, disposal: 2, power: 2 },
  { id: '14', name: 't-butyl methyl ether', density: 0.74, safetyScore: 1.720, healthScore: 0.570, envScore: 1.150, recycleScore: 0, disposal: 2, power: 2 },
  { id: '15', name: 'Tetrahydrofuran', density: 0.889, safetyScore: 1.965, healthScore: 0.990, envScore: 0.900, recycleScore: 0, disposal: 2, power: 2 },
  { id: '16', name: 'Water', density: 0, safetyScore: 0, healthScore: 0, envScore: 0, recycleScore: 0, disposal: 0, power: 0 },
]

const FACTORS_DATA_VERSION = 2 // Increment this when PREDEFINED_REAGENTS changes

const FactorsPage: React.FC = () => {
  const { data, updateFactorsData, setIsDirty } = useAppContext()
  
  // Check if factors data needs update
  const checkAndUpdateFactorsData = (existingFactors: ReagentFactor[]) => {
    const storedVersion = localStorage.getItem('hplc_factors_version')
    const currentVersion = FACTORS_DATA_VERSION.toString()
    
    // If version doesn't match or missing reagents, update to latest
    if (storedVersion !== currentVersion) {
      console.log('🔄 FactorsPage: Updating factors data to version', currentVersion)
      localStorage.setItem('hplc_factors_version', currentVersion)
      return [...PREDEFINED_REAGENTS]
    }
    
    // Check if CO2 and Water exist
    const hasCO2 = existingFactors.some(f => f.name === 'CO2')
    const hasWater = existingFactors.some(f => f.name === 'Water')
    
    if (!hasCO2 || !hasWater) {
      console.log('🔄 FactorsPage: Missing CO2 or Water, updating to complete data')
      return [...PREDEFINED_REAGENTS]
    }
    
    return existingFactors
  }
  
  // 使用Context中的数据初始化
  const [reagents, setReagents] = useState<ReagentFactor[]>(() => {
    // 如果Context中有数据就使用，否则使用预定义数据
    if (data.factors.length > 0) {
      return checkAndUpdateFactorsData(data.factors)
    }
    return [...PREDEFINED_REAGENTS]
  })
  const [isEditing, setIsEditing] = useState<boolean>(false)

  // 监听Context数据变化，立即同步更新
  const lastSyncedFactors = React.useRef<string>('')
  const hasInitialized = React.useRef(false)
  
  useLayoutEffect(() => {
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
      const updatedReagents = [...PREDEFINED_REAGENTS]
      setReagents(updatedReagents)
      // 立即同步到Context，避免其他页面读取到空数据
      updateFactorsData(updatedReagents)
      // 🔥 立即写入localStorage，避免MethodsPage读取时为空
      localStorage.setItem('hplc_factors_data', JSON.stringify(updatedReagents))
      localStorage.setItem('hplc_factors_version', FACTORS_DATA_VERSION.toString())
      console.log('✅ FactorsPage: 已立即写入localStorage')
      // 🔥 触发事件通知其他页面factors数据已更新
      window.dispatchEvent(new Event('factorsDataUpdated'))
      console.log('📢 FactorsPage: 触发 factorsDataUpdated 事件')
    } else if (data.factors.length > 0) {
      // 有数据时检查是否需要更新
      hasInitialized.current = true
      const updatedReagents = checkAndUpdateFactorsData(data.factors)
      console.log('🔄 FactorsPage: 立即同步Context数据')
      setReagents(updatedReagents)
      
      // If data was updated, sync back
      if (JSON.stringify(updatedReagents) !== JSON.stringify(data.factors)) {
        updateFactorsData(updatedReagents)
        localStorage.setItem('hplc_factors_data', JSON.stringify(updatedReagents))
        localStorage.setItem('hplc_factors_version', FACTORS_DATA_VERSION.toString())
        window.dispatchEvent(new Event('factorsDataUpdated'))
        console.log('📢 FactorsPage: 数据已更新并同步')
      }
    }
  }, [data.factors, updateFactorsData])

  // 自动保存数据到 Context 和 localStorage
  // 使用 ref 来避免初始化时触发 dirty 和避免循环更新
  const isInitialMount = React.useRef(true)
  const lastLocalData = React.useRef<string>('')
  
  useEffect(() => {
    const currentLocalDataStr = JSON.stringify(reagents)
    
    localStorage.setItem('hplc_factors_data', currentLocalDataStr)
    
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

  // 添加新试剂
  const addReagent = () => {
    const newReagent: ReagentFactor = {
      id: Date.now().toString(),
      name: '',
      density: 0,
      safetyScore: 0,
      healthScore: 0,
      envScore: 0,
      recycleScore: 0,
      disposal: 0,
      power: 0
    }
    setReagents([...reagents, newReagent])
    setIsEditing(true) // 添加新行后自动进入编辑模式
  }

  // Delete last reagent
  const deleteLastReagent = () => {
    if (reagents.length <= 1) {
      message.warning('At least one reagent must be kept')
      return
    }
    setReagents(reagents.slice(0, -1))
  }

  // Update reagent data
  const updateReagent = (id: string, field: keyof ReagentFactor, value: string | number) => {
    setReagents(reagents.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ))
  }

  // Toggle edit mode
  const toggleEdit = () => {
    if (isEditing) {
      // Validate data
      const hasEmptyName = reagents.some(r => !r.name.trim())
      if (hasEmptyName) {
        message.error('Reagent name cannot be empty')
        return
      }
      message.success('Data saved')
    }
    setIsEditing(!isEditing)
  }

  // Reset to predefined data
  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to reset to default data? This will overwrite all custom data.')) {
      setReagents([...PREDEFINED_REAGENTS])
      setIsEditing(false)
      message.success('Reset to default data successfully')
    }
  }

  return (
    <div className="factors-page">
      <Title level={2}>Factors</Title>

      <Card>
        <div className="factors-table-container">
          <table className="factors-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ρ (g/mL)</th>
                <th>S</th>
                <th>H</th>
                <th>E</th>
                <th>R</th>
                <th>D</th>
                <th>P</th>
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
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.safetyScore}
                        onChange={(value) => updateReagent(reagent.id, 'safetyScore', value || 0)}
                        step={0.001}
                        precision={3}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      reagent.safetyScore.toFixed(3)
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.healthScore}
                        onChange={(value) => updateReagent(reagent.id, 'healthScore', value || 0)}
                        step={0.001}
                        precision={3}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      reagent.healthScore.toFixed(3)
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.envScore}
                        onChange={(value) => updateReagent(reagent.id, 'envScore', value || 0)}
                        step={0.001}
                        precision={3}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      reagent.envScore.toFixed(3)
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.recycleScore}
                        onChange={(value) => updateReagent(reagent.id, 'recycleScore', value || 0)}
                        step={1}
                        precision={0}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      reagent.recycleScore
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.disposal}
                        onChange={(value) => updateReagent(reagent.id, 'disposal', value || 0)}
                        step={1}
                        precision={0}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      reagent.disposal
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <InputNumber
                        value={reagent.power}
                        onChange={(value) => updateReagent(reagent.id, 'power', value || 0)}
                        step={1}
                        precision={0}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      reagent.power
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={6}>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addReagent}
              style={{ width: '100%' }}
              disabled={!isEditing}
            >
              Add
            </Button>
          </Col>
          <Col span={6}>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={deleteLastReagent}
              disabled={reagents.length <= 1 || !isEditing}
              style={{ width: '100%' }}
            >
              Delete
            </Button>
          </Col>
          <Col span={6}>
            <Button
              type={isEditing ? 'primary' : 'default'}
              icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
              onClick={toggleEdit}
              style={{ width: '100%' }}
            >
              {isEditing ? 'Save' : 'Edit'}
            </Button>
          </Col>
          <Col span={6}>
            <Button
              onClick={resetToDefault}
              style={{ width: '100%' }}
              disabled={isEditing}
            >
              Reset to Default
            </Button>
          </Col>
        </Row>

        <div style={{ marginTop: 16, color: '#666', fontSize: 12 }}>
          <p><strong>Note:</strong></p>
          <ul>
            <li><strong>ρ</strong>: Density (g/mL)</li>
            <li><strong>S</strong>: Safety Score</li>
            <li><strong>H</strong>: Health Hazard Score</li>
            <li><strong>E</strong>: Environmental Impact Score</li>
            <li><strong>R</strong>: Recyclability Score</li>
            <li><strong>D</strong>: Disposal Difficulty</li>
            <li><strong>P</strong>: Power Consumption</li>
          </ul>
          <p>These factors will be used for green chemistry assessment calculations in Methods and HPLC Gradient.</p>
        </div>
      </Card>
    </div>
  )
}

export default FactorsPage
