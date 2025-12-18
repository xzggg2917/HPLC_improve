import React, { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { getColorHex } from '../utils/colorScale'
import { StorageHelper, STORAGE_KEYS } from '../utils/storage'

interface NestedPieChartProps {
  mainFactors: {
    S: number
    H: number
    E: number
    R: number
    D: number
    P: number
  }
  subFactors: {
    releasePotential: number
    fireExplos: number
    reactDecom: number
    acuteToxicity: number
    irritation: number
    chronicToxicity: number
    persistency: number
    airHazard: number
    waterHazard: number
  }
}

const NestedPieChart: React.FC<NestedPieChartProps> = ({ mainFactors, subFactors }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [weightScheme, setWeightScheme] = useState<string>('')
  const [forceUpdate, setForceUpdate] = useState<number>(0)

  // 监听权重方案变化
  useEffect(() => {
    const loadWeightScheme = async () => {
      try {
        const methodsData = await StorageHelper.getJSON(STORAGE_KEYS.METHODS)
        const schemes = methodsData?.weightSchemes || {}
        // 使用统一的stageScheme，向后兼容旧数据
        const scheme = schemes.stageScheme || schemes.instrumentStageScheme || schemes.prepStageScheme || 'Balanced'
        setWeightScheme(scheme)
      } catch (error) {
        console.error('读取权重方案失败:', error)
        setWeightScheme('Balanced')
      }
    }
    
    loadWeightScheme()
    
    // 监听权重方案更新事件
    const handleWeightSchemeUpdate = () => {
      console.log('🔄 NestedPieChart接收到权重方案更新事件')
      loadWeightScheme()
      setForceUpdate(prev => prev + 1)
    }
    
    window.addEventListener('weightSchemeUpdated', handleWeightSchemeUpdate)
    
    return () => {
      window.removeEventListener('weightSchemeUpdated', handleWeightSchemeUpdate)
    }
  }, [mainFactors.P])

  useEffect(() => {
    if (!chartRef.current) return

    const initChart = async () => {
      const chart = echarts.init(chartRef.current!)

      // 从storage读取实际的权重方案
      const getMainFactorWeights = async () => {
        try {
          const methodsData = await StorageHelper.getJSON(STORAGE_KEYS.METHODS)
          const schemes = methodsData?.weightSchemes || {}
          
          // 使用统一的stageScheme，向后兼容旧数据
          const scheme = schemes.stageScheme || schemes.instrumentStageScheme || schemes.prepStageScheme || 'Balanced'
          console.log('📊 Stage权重方案:', scheme, 'P因子:', mainFactors.P)
          
          if (scheme === 'Balanced') {
            return { S: 0.18, H: 0.18, E: 0.18, R: 0.18, D: 0.18, P: 0.10 }
          } else if (scheme === 'Safety_First') {
            return { S: 0.30, H: 0.30, E: 0.10, R: 0.10, D: 0.10, P: 0.10 }
          } else if (scheme === 'Eco_Friendly') {
            return { S: 0.10, H: 0.10, E: 0.30, P: 0.10, R: 0.25, D: 0.15 }
          } else if (scheme === 'Energy_Efficient') {
            return { S: 0.10, H: 0.10, E: 0.15, P: 0.40, R: 0.15, D: 0.10 }
          }
          // 默认Balanced
          return { S: 0.18, H: 0.18, E: 0.18, R: 0.18, D: 0.18, P: 0.10 }
        } catch (error) {
          console.error('读取权重方案失败:', error)
          return { S: 0.18, H: 0.18, E: 0.18, R: 0.18, D: 0.18, P: 0.10 }
        }
      }

      const weights = await getMainFactorWeights()
      console.log('📊 NestedPieChart使用的权重:', weights)

      // 定义小因子权重（均衡方案）
      const subFactorWeights = {
        releasePotential: 0.25,    // S1
        fireExplos: 0.25,          // S2
        reactDecom: 0.25,          // S3
        acuteToxicity: 0.25,       // S4
        chronicToxicity: 0.50,     // H1
        irritation: 0.50,          // H2
        persistency: 0.334,        // E1
        airHazard: 0.333,          // E2
        waterHazard: 0.333         // E3
      }

      // 使用权重作为占比，保留原始分数用于显示
      const mainFactorData = [
        { value: weights.S * 100, originalValue: mainFactors.S, name: 'S', itemStyle: { color: getColorHex(mainFactors.S) } },
        { value: weights.H * 100, originalValue: mainFactors.H, name: 'H', itemStyle: { color: getColorHex(mainFactors.H) } },
        { value: weights.E * 100, originalValue: mainFactors.E, name: 'E', itemStyle: { color: getColorHex(mainFactors.E) } },
        { value: weights.R * 100, originalValue: mainFactors.R, name: 'R', itemStyle: { color: getColorHex(mainFactors.R) } },
        { value: weights.D * 100, originalValue: mainFactors.D, name: 'D', itemStyle: { color: getColorHex(mainFactors.D) } },
        { value: weights.P * 100, originalValue: mainFactors.P, name: 'P', itemStyle: { color: getColorHex(mainFactors.P) } }
      ].filter(item => item.value > 0)

      const subFactorData = [
        { 
          value: subFactors.releasePotential,
          originalValue: subFactors.releasePotential,
          name: 'Release potential',
          itemStyle: { color: getColorHex(subFactors.releasePotential) }
        },
        { 
          value: subFactors.fireExplos,
          originalValue: subFactors.fireExplos,
          name: 'Fire/Explos.',
          itemStyle: { color: getColorHex(subFactors.fireExplos) }
        },
        { 
          value: subFactors.reactDecom,
          originalValue: subFactors.reactDecom,
          name: 'React./Decom.',
          itemStyle: { color: getColorHex(subFactors.reactDecom) }
        },
        { 
          value: subFactors.acuteToxicity,
          originalValue: subFactors.acuteToxicity,
          name: 'Acute toxicity',
          itemStyle: { color: getColorHex(subFactors.acuteToxicity) }
        },
        { 
          value: subFactors.irritation,
          originalValue: subFactors.irritation,
          name: 'Irritation',
          itemStyle: { color: getColorHex(subFactors.irritation) }
        },
        { 
          value: subFactors.chronicToxicity,
          originalValue: subFactors.chronicToxicity,
          name: 'Chronic toxicity',
          itemStyle: { color: getColorHex(subFactors.chronicToxicity) }
        },
        { 
          value: subFactors.persistency,
          originalValue: subFactors.persistency,
          name: 'Persis-tency',
          itemStyle: { color: getColorHex(subFactors.persistency) }
        },
        { 
          value: subFactors.airHazard,
          originalValue: subFactors.airHazard,
          name: 'Air Hazard',
          itemStyle: { color: getColorHex(subFactors.airHazard) }
        },
        { 
          value: subFactors.waterHazard,
          originalValue: subFactors.waterHazard,
          name: 'Water Hazard',
          itemStyle: { color: getColorHex(subFactors.waterHazard) }
        }
      ].filter(item => item.originalValue > 0)

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            // 显示实际评分值和权重占比
            const originalValue = params.data.originalValue
            const weight = params.percent
            if (originalValue !== undefined) {
              return `${params.name}<br/>Score: ${originalValue.toFixed(2)}<br/>Weight: ${weight.toFixed(1)}%`
            }
            return `${params.name}: ${params.value.toFixed(2)} (${weight.toFixed(1)}%)`
          }
        },
        legend: {
          show: false
        },
        grid: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20,
          containLabel: true
        },
      labelLayout: function (params: any) {
        // 只对内圈饼图（seriesIndex = 0）进行标签位置调整
        if (params.seriesIndex === 0) {
          const points = params.labelLinePoints as number[][]
          
          // 计算扇形中心角度
          const midAngle = ((params.startAngle || 0) + (params.endAngle || 0)) / 2
          const radius = params.seriesModel.getData().getItemLayout(params.dataIndex).r || 0
          const center = params.seriesModel.get('center')
          
          // 计算中心点坐标（处理百分比）
          const cx = typeof center[0] === 'string' ? 
            parseFloat(center[0]) / 100 * chart.getWidth() : center[0]
          const cy = typeof center[1] === 'string' ? 
            parseFloat(center[1]) / 100 * chart.getHeight() : center[1]
          
          // 将标签推到半径的85%位置
          const targetRadius = radius * 0.85
          const radian = midAngle * Math.PI / 180
          
          return {
            x: cx + Math.cos(radian) * targetRadius,
            y: cy + Math.sin(radian) * targetRadius,
            labelLinePoints: points
          }
        }
      },
      series: [
        // 内圈：6个大因子
        {
          name: 'Main Factors',
          type: 'pie',
          selectedMode: 'single',
          radius: [0, '35%'],  // 从30%增加到35%，饼图更大，标签更靠近绝对边缘
          center: ['50%', '45%'],
          label: {
            show: true,
            position: 'inside',
            fontSize: 15,
            fontWeight: '900',
            color: '#fff',
            formatter: (params: any) => {
              return params.name
            }
          },
          labelLine: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 17,
              fontWeight: '900'
            }
          },
          data: mainFactorData.map((item, index) => {
            const total = mainFactorData.reduce((sum, d) => sum + d.value, 0)
            const percent = (item.value / total) * 100
            
            // 计算该扇形的中间角度
            let startAngle = -90  // 从-90度开始（12点钟方向）
            for (let i = 0; i < index; i++) {
              startAngle += (mainFactorData[i].value / total) * 360
            }
            const endAngle = startAngle + (item.value / total) * 360
            const midAngle = (startAngle + endAngle) / 2
            const radian = midAngle * Math.PI / 180
            
            // 计算标签的径向偏移（向外移动到80%半径位置）
            const baseRadius = 0.35  // 对应radius的35%
            const targetRadiusRatio = 0.80  // 移动到半径的80%位置
            const offsetDistance = baseRadius * targetRadiusRatio * 100  // 转换为百分比坐标
            
            return {
              ...item,
              label: {
                fontSize: percent < 3 ? 11 : percent < 5 ? 13 : percent < 10 ? 14 : 16,
                fontWeight: '900',
                // 使用position数组直接指定标签偏移量（相对于扇形中心）
                offset: [
                  Math.cos(radian) * offsetDistance * 0.8,  // x方向偏移
                  Math.sin(radian) * offsetDistance * 0.8   // y方向偏移
                ]
              }
            }
          })
        },
        // 外圈：9个小因子
        {
          name: 'Sub Factors',
          type: 'pie',
          radius: ['45%', '60%'],
          center: ['50%', '45%'],
          labelLine: {
            length: 15,
            length2: 8
          },
          label: {
            formatter: (params: any) => {
              const originalValue = params.data.originalValue
              if (originalValue !== undefined) {
                return `{name|${params.name}}\n{value|${originalValue.toFixed(2)}} {percent|(${params.percent.toFixed(2)}%)}`
              }
              return `{name|${params.name}}\n{value|${params.value.toFixed(2)}} {percent|(${params.percent.toFixed(2)}%)}`
            },
            rich: {
              name: {
                fontSize: 12,
                color: '#000',
                fontWeight: 'bold',
                lineHeight: 16
              },
              value: {
                fontSize: 13,
                fontWeight: '900',
                color: '#000',
                lineHeight: 18
              },
              percent: {
                fontSize: 10,
                fontWeight: 'bold',
                color: '#fff',
                backgroundColor: '#4C5058',
                padding: [2, 3],
                borderRadius: 3
              }
            },
            backgroundColor: '#F6F8FC',
            borderColor: '#8C8D8E',
            borderWidth: 1,
            borderRadius: 4,
            padding: [4, 6]
          },
          data: subFactorData
        }
      ]
      }

      chart.setOption(option)

      // 响应式调整
      const handleResize = () => {
        chart.resize()
      }

      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chart.dispose()
      }
    }

    initChart()
  }, [mainFactors, subFactors, weightScheme, forceUpdate])

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
}

export default NestedPieChart
