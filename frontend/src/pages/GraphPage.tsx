import React, { useState, useEffect } from 'react'
import { Card, Typography, Alert } from 'antd'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ResponsiveContainer } from 'recharts'

const { Title } = Typography

interface ReagentFactor {
  id: string
  name: string
  density: number
  safetyScore: number
  healthScore: number
  envScore: number
  recycleScore: number
  disposal: number
  power: number
}

const GraphPage: React.FC = () => {
  const [radarData, setRadarData] = useState<any[]>([])
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    calculateTotalScores()

    // 监听数据更新
    const handleDataUpdate = () => {
      console.log('🔔 GraphPage: 检测到数据更新，重新计算雷达图...')
      calculateTotalScores()
    }
    
    // 监听文件数据变更事件
    const handleFileDataChanged = () => {
      console.log('📢 GraphPage: 接收到 fileDataChanged 事件，立即重新计算')
      calculateTotalScores()
    }

    window.addEventListener('gradientDataUpdated', handleDataUpdate)
    window.addEventListener('factorsDataUpdated', handleDataUpdate)
    window.addEventListener('fileDataChanged', handleFileDataChanged)

    return () => {
      window.removeEventListener('gradientDataUpdated', handleDataUpdate)
      window.removeEventListener('factorsDataUpdated', handleDataUpdate)
      window.removeEventListener('fileDataChanged', handleFileDataChanged)
    }
  }, [])

  // 自定义雷达图标签渲染函数
  const renderCustomTick = (props: any) => {
    const { x, y, payload, index } = props
    const positions = [
      { dx: 0, dy: -35 },      // Safety (S) - 上方，远离数值
      { dx: 50, dy: -15 },     // Health Hazard (H) - 右上，增加偏移
      { dx: 55, dy: 15 },      // Environmental Impact (E) - 右下，增加偏移
      { dx: 0, dy: 30 },       // Recyclability (R) - 下方，增加偏移避开图例
      { dx: -50, dy: 15 },     // Disposal Difficulty (D) - 左下，增加偏移
      { dx: -55, dy: -15 }     // Energy Consumption (P) - 左上，增加偏移
    ]
    
    const pos = positions[index] || { dx: 0, dy: 0 }
    
    return (
      <text
        x={x + pos.dx}
        y={y + pos.dy}
        textAnchor="middle"
        fill="#666"
        fontSize={13}
        fontWeight="500"
      >
        {payload.value}
      </text>
    )
  }

  const calculateTotalScores = () => {
    try {
      // 加载数据
      const factorsDataStr = localStorage.getItem('hplc_factors_data')
      const gradientDataStr = localStorage.getItem('hplc_gradient_data')
      const methodsDataStr = localStorage.getItem('hplc_methods_raw')

      if (!factorsDataStr || !gradientDataStr || !methodsDataStr) {
        console.log('❌ 缺少必要数据')
        setHasData(false)
        return
      }

      const factorsData: ReagentFactor[] = JSON.parse(factorsDataStr)
      const gradientData = JSON.parse(gradientDataStr)
      const methodsData = JSON.parse(methodsDataStr)

      // Initialize total scores
      const totalScores = {
        S: 0,  // Safety
        H: 0,  // Health Hazard
        E: 0,  // Environmental Impact
        R: 0,  // Recyclability
        D: 0,  // Disposal Difficulty
        P: 0   // Energy Consumption
      }

      // 1. 计算 Sample PreTreatment 的得分
      if (methodsData.preTreatmentReagents && Array.isArray(methodsData.preTreatmentReagents)) {
        methodsData.preTreatmentReagents.forEach((reagent: any) => {
          if (!reagent.name || reagent.volume <= 0) return

          const factor = factorsData.find(f => f.name === reagent.name)
          if (!factor) return

          const mass = reagent.volume * factor.density // 质量 = 体积 × 密度

          totalScores.S += mass * factor.safetyScore
          totalScores.H += mass * factor.healthScore
          totalScores.E += mass * factor.envScore
          totalScores.R += mass * factor.recycleScore
          totalScores.D += mass * factor.disposal
          totalScores.P += mass * factor.power
        })
      }

      // 2. 计算 Mobile Phase A 和 B 的得分（从梯度数据中获取）
      const calculations = gradientData.calculations
      if (calculations) {
        // Mobile Phase A
        if (calculations.mobilePhaseA?.components) {
          calculations.mobilePhaseA.components.forEach((component: any) => {
            if (!component.reagentName || component.volume <= 0) return

            const factor = factorsData.find(f => f.name === component.reagentName)
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

        // Mobile Phase B
        if (calculations.mobilePhaseB?.components) {
          calculations.mobilePhaseB.components.forEach((component: any) => {
            if (!component.reagentName || component.volume <= 0) return

            const factor = factorsData.find(f => f.name === component.reagentName)
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

      // 3. Build radar chart data
      const chartData = [
        {
          subject: 'Safety (S)',
          score: Number(totalScores.S.toFixed(3)),
          fullMark: Math.max(totalScores.S * 1.2, 10)
        },
        {
          subject: 'Health Hazard (H)',
          score: Number(totalScores.H.toFixed(3)),
          fullMark: Math.max(totalScores.H * 1.2, 10)
        },
        {
          subject: 'Environmental Impact (E)',
          score: Number(totalScores.E.toFixed(3)),
          fullMark: Math.max(totalScores.E * 1.2, 10)
        },
        {
          subject: 'Recyclability (R)',
          score: Number(totalScores.R.toFixed(3)),
          fullMark: Math.max(totalScores.R * 1.2, 10)
        },
        {
          subject: 'Disposal Difficulty (D)',
          score: Number(totalScores.D.toFixed(3)),
          fullMark: Math.max(totalScores.D * 1.2, 10)
        },
        {
          subject: 'Energy Consumption (P)',
          score: Number(totalScores.P.toFixed(3)),
          fullMark: Math.max(totalScores.P * 1.2, 10)
        }
      ]

      console.log('📊 雷达图数据:', chartData)
      setRadarData(chartData)
      setHasData(true)

    } catch (error) {
      console.error('❌ 计算雷达图数据失败:', error)
      setHasData(false)
    }
  }

  return (
    <div className="graph-page">
      <Title level={2}>Green Chemistry Assessment Radar Chart</Title>

      {!hasData ? (
        <Alert
          message="No Data Available"
          description="Please complete Factors, Methods, and HPLC Gradient configuration, then refresh this page."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      ) : (
        <Card>
          <ResponsiveContainer width="100%" height={650}>
            <RadarChart data={radarData} margin={{ top: 80, right: 180, bottom: 100, left: 180 }}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={renderCustomTick}
              />
              <PolarRadiusAxis angle={90} domain={[0, 'auto']} />
              <Radar
                name="Comprehensive Score"
                dataKey="score"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Legend wrapperStyle={{ paddingTop: 20 }} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>

          <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
            <Title level={4}>Score Details</Title>
            {radarData.map((item, index) => (
              <div key={index} style={{ marginBottom: 8 }}>
                <strong>{item.subject}:</strong> {item.score}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default GraphPage
