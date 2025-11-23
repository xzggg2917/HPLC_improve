import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

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

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)

    // 过滤掉值为0的数据
    const mainFactorData = [
      { value: Number(mainFactors.S.toFixed(2)), name: 'S', itemStyle: { color: '#52c41a' } },
      { value: Number(mainFactors.H.toFixed(2)), name: 'H', itemStyle: { color: '#fa8c16' } },
      { value: Number(mainFactors.E.toFixed(2)), name: 'E', itemStyle: { color: '#1890ff' } },
      { value: Number(mainFactors.R.toFixed(2)), name: 'R', itemStyle: { color: '#f5222d' } },
      { value: Number(mainFactors.D.toFixed(2)), name: 'D', itemStyle: { color: '#722ed1' } },
      { value: Number(mainFactors.P.toFixed(2)), name: 'P', itemStyle: { color: '#eb2f96' } }
    ].filter(item => item.value > 0)

    const subFactorData = [
      { 
        value: Number(subFactors.releasePotential.toFixed(2)), 
        name: 'Release potential',
        itemStyle: { color: '#95de64' }
      },
      { 
        value: Number(subFactors.fireExplos.toFixed(2)), 
        name: 'Fire/Explos.',
        itemStyle: { color: '#73d13d' }
      },
      { 
        value: Number(subFactors.reactDecom.toFixed(2)), 
        name: 'React./Decom.',
        itemStyle: { color: '#52c41a' }
      },
      { 
        value: Number(subFactors.acuteToxicity.toFixed(2)), 
        name: 'Acute toxicity',
        itemStyle: { color: '#ffd666' }
      },
      { 
        value: Number(subFactors.irritation.toFixed(2)), 
        name: 'Irritation',
        itemStyle: { color: '#ffc53d' }
      },
      { 
        value: Number(subFactors.chronicToxicity.toFixed(2)), 
        name: 'Chronic toxicity',
        itemStyle: { color: '#fa8c16' }
      },
      { 
        value: Number(subFactors.persistency.toFixed(2)), 
        name: 'Persis-tency',
        itemStyle: { color: '#69c0ff' }
      },
      { 
        value: Number(subFactors.airHazard.toFixed(2)), 
        name: 'Air Hazard',
        itemStyle: { color: '#40a9ff' }
      },
      { 
        value: Number(subFactors.waterHazard.toFixed(2)), 
        name: 'Water Hazard',
        itemStyle: { color: '#1890ff' }
      }
    ].filter(item => item.value > 0)

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
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
      series: [
        // 内圈：6个大因子
        {
          name: 'Main Factors',
          type: 'pie',
          selectedMode: 'single',
          radius: [0, '30%'],
          center: ['50%', '45%'],
          label: {
            position: 'inner',
            fontSize: 13,
            fontWeight: 'bold',
            color: '#fff',
            formatter: (params: any) => {
              // 当扇区角度太小时不显示标签（小于5%）
              if (params.percent < 5) {
                return ''
              }
              return params.name
            }
          },
          labelLine: {
            show: false
          },
          data: mainFactorData
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
              return `{name|${params.name}}\n{value|${params.value}} {percent|(${params.percent}%)}`
            },
            rich: {
              name: {
                fontSize: 10,
                color: '#666',
                lineHeight: 16
              },
              value: {
                fontSize: 11,
                fontWeight: 'bold',
                color: '#333',
                lineHeight: 18
              },
              percent: {
                fontSize: 9,
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
  }, [mainFactors, subFactors])

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
}

export default NestedPieChart
