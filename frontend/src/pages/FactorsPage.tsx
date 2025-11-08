import React, { useState, useEffect } from 'react'
import { Card, Typography, Button, InputNumber, Input, message, Row, Col } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'
import './FactorsPage.css'

const { Title } = Typography

interface ReagentFactor {
  id: string
  name: string           // 试剂名称
  density: number        // 密度 ρ (g/mL)
  safetyScore: number    // 安全性评分 S
  healthScore: number    // 健康危害评分 H
  envScore: number       // 环境影响评分 E
  recycleScore: number   // 可回收性评分 R
  disposal: number       // 处置难度 D
  power: number          // 耗能 P
}

// 预定义的试剂数据(基于您提供的表格)
const PREDEFINED_REAGENTS: ReagentFactor[] = [
  { id: '1', name: 'Acetone', density: 0.791, safetyScore: 1.995, healthScore: 0.809, envScore: 0.310, recycleScore: 0, disposal: 2, power: 1 },
  { id: '2', name: 'Acetonitrile', density: 0.786, safetyScore: 2.724, healthScore: 1.056, envScore: 0.772, recycleScore: 0, disposal: 2, power: 2 },
  { id: '3', name: 'Chloroform', density: 1.483, safetyScore: 1.077, healthScore: 1.425, envScore: 1.435, recycleScore: 0, disposal: 2, power: 3 },
  { id: '4', name: 'Dichloromethane', density: 1.327, safetyScore: 2.618, healthScore: 0.638, envScore: 0.343, recycleScore: 0, disposal: 2, power: 2 },
  { id: '5', name: 'Ethanol', density: 0.789, safetyScore: 1.872, healthScore: 0.204, envScore: 0.485, recycleScore: 0, disposal: 2, power: 3 },
  { id: '6', name: 'Ethyl acetate', density: 0.902, safetyScore: 1.895, healthScore: 0.796, envScore: 0.199, recycleScore: 0, disposal: 2, power: 2 },
  { id: '7', name: 'Heptane', density: 0.684, safetyScore: 1.925, healthScore: 0.784, envScore: 1.089, recycleScore: 0, disposal: 2, power: 3 },
  { id: '8', name: 'Hexane (n)', density: 0.659, safetyScore: 2.004, healthScore: 0.974, envScore: 1.100, recycleScore: 0, disposal: 2, power: 2 },
  { id: '9', name: 'Isooctane', density: 0.692, safetyScore: 1.630, healthScore: 0.330, envScore: 1.555, recycleScore: 0, disposal: 2, power: 2 },
  { id: '10', name: 'Isopropanol', density: 0.785, safetyScore: 1.874, healthScore: 0.885, envScore: 0.540, recycleScore: 0, disposal: 2, power: 3 },
  { id: '11', name: 'Methanol', density: 0.791, safetyScore: 1.912, healthScore: 0.430, envScore: 0.317, recycleScore: 0, disposal: 2, power: 3 },
  { id: '12', name: 'Sulfuric acid 96%', density: 1.84, safetyScore: 1.756, healthScore: 2.000, envScore: 1.985, recycleScore: 0, disposal: 2, power: 2 },
  { id: '13', name: 't-butyl methyl ether', density: 0.74, safetyScore: 1.720, healthScore: 0.570, envScore: 1.150, recycleScore: 0, disposal: 2, power: 2 },
  { id: '14', name: 'Tetrahydrofuran', density: 0.889, safetyScore: 1.965, healthScore: 0.990, envScore: 0.900, recycleScore: 0, disposal: 2, power: 2 }
]

const FactorsPage: React.FC = () => {
  // 从 localStorage 加载初始数据
  const loadInitialData = (): ReagentFactor[] => {
    try {
      const savedData = localStorage.getItem('hplc_factors_data')
      if (savedData) {
        return JSON.parse(savedData)
      }
    } catch (error) {
      console.error('加载因子数据失败:', error)
    }
    // 返回预定义数据
    return [...PREDEFINED_REAGENTS]
  }

  const [reagents, setReagents] = useState<ReagentFactor[]>(loadInitialData())
  const [isEditing, setIsEditing] = useState<boolean>(false)

  // 自动保存数据到 localStorage
  useEffect(() => {
    localStorage.setItem('hplc_factors_data', JSON.stringify(reagents))
  }, [reagents])

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

  // 删除最后一个试剂
  const deleteLastReagent = () => {
    if (reagents.length <= 1) {
      message.warning('至少保留一个试剂')
      return
    }
    setReagents(reagents.slice(0, -1))
  }

  // 更新试剂数据
  const updateReagent = (id: string, field: keyof ReagentFactor, value: string | number) => {
    setReagents(reagents.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ))
  }

  // 切换编辑模式
  const toggleEdit = () => {
    if (isEditing) {
      // 验证数据
      const hasEmptyName = reagents.some(r => !r.name.trim())
      if (hasEmptyName) {
        message.error('试剂名称不能为空')
        return
      }
      message.success('数据已保存')
    }
    setIsEditing(!isEditing)
  }

  // 重置为预定义数据
  const resetToDefault = () => {
    if (window.confirm('确定要重置为默认数据吗？这将覆盖所有自定义数据。')) {
      setReagents([...PREDEFINED_REAGENTS])
      setIsEditing(false)
      message.success('已重置为默认数据')
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
          <p><strong>说明：</strong></p>
          <ul>
            <li><strong>ρ</strong>: 密度 (g/mL) - Density</li>
            <li><strong>S</strong>: 安全性评分 (Safety Score)</li>
            <li><strong>H</strong>: 健康危害评分 (Health Hazard Score)</li>
            <li><strong>E</strong>: 环境影响评分 (Environmental Impact Score)</li>
            <li><strong>R</strong>: 可回收性评分 (Recyclability Score)</li>
            <li><strong>D</strong>: 处置难度 (Disposal Difficulty)</li>
            <li><strong>P</strong>: 耗能 (Power Consumption)</li>
          </ul>
          <p>这些因子将用于 Methods 和 HPLC Gradient 的绿色化学评估计算。</p>
        </div>
      </Card>
    </div>
  )
}

export default FactorsPage
