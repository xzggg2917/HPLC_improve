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
  const [totalScore, setTotalScore] = useState<number>(0)
  const [sampleCount, setSampleCount] = useState<number>(0)

  useEffect(() => {
    calculateTotalScores()

    const handleDataUpdate = () => {
      console.log('GraphPage: Data updated, recalculating...')
      calculateTotalScores()
    }
    
    const handleFileDataChanged = () => {
      console.log('GraphPage: File data changed event received')
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

  const renderCustomTick = (props: any) => {
    const { x, y, payload, index } = props
    const positions = [
      { dx: 0, dy: -25 },      // Safety (S) - 上方，再往下移一点
      { dx: 55, dy: -15 },     // Health Hazard (H) - 右上
      { dx: 60, dy: 15 },      // Environmental Impact (E) - 右下
      { dx: 0, dy: 28 },       // Recyclability (R) - 下方，再往上移避免与图例重叠
      { dx: -55, dy: 15 },     // Disposal Difficulty (D) - 左下
      { dx: -60, dy: -15 }     // Energy Consumption (P) - 左上
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div style={{
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', marginBottom: 8 }}>
            {data.subject}
          </p>
          <p style={{ margin: 0, color: '#1890ff' }}>
            Score: <strong>{data.score}</strong>
          </p>
          {sampleCount > 0 && totalScore > 0 && (
            <p style={{ margin: '8px 0 0 0', paddingTop: 8, borderTop: '1px solid #eee', color: '#52c41a', fontSize: 12 }}>
              Total Score: <strong>{totalScore.toFixed(3)}</strong>
              <br />
              <span style={{ fontSize: 11, opacity: 0.8 }}>
                Formula: (S+H+E+R+D+P) / {sampleCount}
              </span>
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const calculateTotalScores = () => {
    try {
      const factorsDataStr = localStorage.getItem('hplc_factors_data')
      const gradientDataStr = localStorage.getItem('hplc_gradient_data')
      const methodsDataStr = localStorage.getItem('hplc_methods_raw')

      if (!factorsDataStr || !gradientDataStr || !methodsDataStr) {
        console.log('Missing required data')
        setHasData(false)
        return
      }

      const factorsData: ReagentFactor[] = JSON.parse(factorsDataStr)
      const gradientData = JSON.parse(gradientDataStr)
      const methodsData = JSON.parse(methodsDataStr)

      const sampleCountValue = methodsData.sampleCount || 0
      setSampleCount(sampleCountValue)

      const totalScores = {
        S: 0,
        H: 0,
        E: 0,
        R: 0,
        D: 0,
        P: 0
      }

      if (methodsData.preTreatmentReagents && Array.isArray(methodsData.preTreatmentReagents)) {
        methodsData.preTreatmentReagents.forEach((reagent: any) => {
          if (!reagent.name || reagent.volume <= 0) return

          const factor = factorsData.find(f => f.name === reagent.name)
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

      const calculations = gradientData.calculations
      if (calculations) {
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

      const sumOfAllScores = totalScores.S + totalScores.H + totalScores.E + totalScores.R + totalScores.D + totalScores.P
      const calculatedTotalScore = sampleCountValue > 0 ? sumOfAllScores / sampleCountValue : 0
      setTotalScore(calculatedTotalScore)

      // 雷达图只显示六个因素，不包含总分
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

      console.log('Radar chart data:', chartData)
      console.log('Total score:', calculatedTotalScore.toFixed(3), 'Sample count:', sampleCountValue)
      setRadarData(chartData)
      setHasData(true)

    } catch (error) {
      console.error('Failed to calculate radar chart data:', error)
      setHasData(false)
    }
  }

  return (
    <div className="graph-page">
      <Title level={2}>Green Chemistry Assessment Scores</Title>

      {/* 六个因素的分数卡片 */}
      {hasData && radarData.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            {radarData.map((item, index) => (
              <div key={index} style={{ textAlign: 'center', minWidth: '120px' }}>
                <div style={{ 
                  fontSize: 13, 
                  color: '#666', 
                  marginBottom: 8,
                  fontWeight: 500 
                }}>
                  {item.subject}
                </div>
                <div style={{ 
                  fontSize: 28, 
                  fontWeight: 'bold',
                  color: ['#52c41a', '#fa8c16', '#1890ff', '#f5222d', '#722ed1', '#eb2f96'][index]
                }}>
                  {item.score}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 总分卡片 */}
      {hasData && sampleCount > 0 && totalScore > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ 
            padding: '20px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 12,
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 8 }}>Overall Total Score</div>
            <div style={{ fontSize: 48, fontWeight: 'bold', marginBottom: 8 }}>{totalScore.toFixed(3)}</div>
            <div style={{ fontSize: 14, opacity: 0.85 }}>
              Formula: (S + H + E + R + D + P) / Sample Count ({sampleCount})
            </div>
          </div>
        </Card>
      )}

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
          <ResponsiveContainer width="100%" height={700}>
            <RadarChart data={radarData} margin={{ top: 100, right: 200, bottom: 120, left: 200 }}>
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
              <Legend wrapperStyle={{ paddingTop: 40 }} />
              <Tooltip content={<CustomTooltip />} />
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
