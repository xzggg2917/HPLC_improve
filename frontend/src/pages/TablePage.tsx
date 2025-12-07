import React, { useState, useEffect } from 'react'
import { Card, Typography, Table, Descriptions, Alert, Tabs, Statistic, Row, Col } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { StorageHelper, STORAGE_KEYS } from '../utils/storage'

const { Title } = Typography

interface ReagentFactor {
  id: string
  name: string
  density: number
  // Sub-factors for Layer 1 calculation
  releasePotential: number     // S1
  fireExplos: number           // S2
  reactDecom: number           // S3
  acuteToxicity: number        // S4
  irritation: number           // H1
  chronicToxicity: number      // H2
  persistency: number          // E1
  airHazard: number            // E2
  waterHazard: number          // E3
  // Main factors (aggregated)
  safetyScore: number
  healthScore: number
  envScore: number
  regeneration?: number
  disposal: number
}

interface ReagentDetail {
  reagentName: string
  volume: number
  density: number
  mass: number
  S: number
  H: number
  E: number
  R: number
  D: number
  source: string
}

const TablePage: React.FC = () => {
  const [hasData, setHasData] = useState(false)
  const [sampleCount, setSampleCount] = useState(0)
  const [preTreatmentData, setPreTreatmentData] = useState<ReagentDetail[]>([])
  const [phaseAData, setPhaseAData] = useState<ReagentDetail[]>([])
  const [phaseBData, setPhaseBData] = useState<ReagentDetail[]>([])
  const [gradientInfo, setGradientInfo] = useState<any>(null)
  const [totalScores, setTotalScores] = useState<any>(null)
  const [powerScore, setPowerScore] = useState<number>(0)

  /**
   * 计算单个试剂的归一化子因子得分
   * 新公式: Score_sub = min(100, 33.3 × log₁₀(1 + mass × factor_value))
   */
  const calculateNormalizedSubFactor = (
    mass: number,
    factorValue: number
  ): number => {
    const weightedSum = mass * factorValue
    if (weightedSum <= 0) return 0
    return Math.min(100, 33.3 * Math.log10(1 + weightedSum))
  }

  /**
   * 计算单个试剂对 S/H/E/R/D 的贡献
   * 使用新归一化公式：Score = min(100, 33.3 × log₁₀(1 + m × F))
   */
  const calculateReagentContributions = (
    mass: number,
    factor: ReagentFactor
  ) => {
    // Safety (S) = S1×w1 + S2×w2 + S3×w3 + S4×w4
    // 权重：PBT均衡方案，每个子因子权重 0.25
    const S1 = calculateNormalizedSubFactor(mass, factor.releasePotential)
    const S2 = calculateNormalizedSubFactor(mass, factor.fireExplos)
    const S3 = calculateNormalizedSubFactor(mass, factor.reactDecom)
    const S4 = calculateNormalizedSubFactor(mass, factor.acuteToxicity)
    const S = S1 * 0.25 + S2 * 0.25 + S3 * 0.25 + S4 * 0.25
    
    // Health (H) = H1×w1 + H2×w2
    // 权重：绝对均衡方案，每个子因子权重 0.50
    const H1 = calculateNormalizedSubFactor(mass, factor.irritation)
    const H2 = calculateNormalizedSubFactor(mass, factor.chronicToxicity)
    const H = H1 * 0.50 + H2 * 0.50
    
    // Environment (E) = E1×w1 + E2×w2 + E3×w3
    // 权重：PBT均衡方案，权重约为 0.334, 0.333, 0.333
    const E1 = calculateNormalizedSubFactor(mass, factor.persistency)
    const E2 = calculateNormalizedSubFactor(mass, factor.airHazard)
    const E3 = calculateNormalizedSubFactor(mass, factor.waterHazard)
    const E = E1 * 0.334 + E2 * 0.333 + E3 * 0.333
    
    // R 和 D 直接归一化（无权重）
    const R = factor.regeneration !== undefined ? 
              calculateNormalizedSubFactor(mass, factor.regeneration) : 0
    const D = calculateNormalizedSubFactor(mass, factor.disposal)

    return { S, H, E, R, D }
  }

  // 加载试剂详细数据（使用 Layer 1 & Layer 2 归一化计算）
  const loadReagentDetails = async (factorsData: ReagentFactor[], methodsData: any, gradientData: any) => {
    const preTreatmentDetails: ReagentDetail[] = []
    const phaseADetails: ReagentDetail[] = []
    const phaseBDetails: ReagentDetail[] = []

    // Sample PreTreatment
    if (methodsData?.preTreatmentReagents) {
      methodsData.preTreatmentReagents.forEach((reagent: any) => {
        if (!reagent.name || reagent.volume <= 0) return
        const factor = factorsData.find(f => f.name === reagent.name)
        if (!factor) return
        
        const mass = reagent.volume * factor.density
        const contributions = calculateReagentContributions(mass, factor)
        
        preTreatmentDetails.push({
          reagentName: reagent.name,
          volume: reagent.volume,
          density: factor.density,
          mass,
          ...contributions,
          source: 'Sample PreTreatment'
        })
      })
    }
    
    // Mobile Phase A
    if (gradientData?.calculations?.mobilePhaseA?.components) {
      gradientData.calculations.mobilePhaseA.components.forEach((component: any) => {
        if (!component.reagentName || component.volume <= 0) return
        const factor = factorsData.find(f => f.name === component.reagentName)
        if (!factor) return
        
        const mass = component.volume * factor.density
        const contributions = calculateReagentContributions(mass, factor)
        
        phaseADetails.push({
          reagentName: component.reagentName,
          volume: component.volume,
          density: factor.density,
          mass,
          ...contributions,
          source: 'Mobile Phase A'
        })
      })
    }
    
    // Mobile Phase B
    if (gradientData?.calculations?.mobilePhaseB?.components) {
      gradientData.calculations.mobilePhaseB.components.forEach((component: any) => {
        if (!component.reagentName || component.volume <= 0) return
        const factor = factorsData.find(f => f.name === component.reagentName)
        if (!factor) return
        
        const mass = component.volume * factor.density
        const contributions = calculateReagentContributions(mass, factor)
        
        phaseBDetails.push({
          reagentName: component.reagentName,
          volume: component.volume,
          density: factor.density,
          mass,
          ...contributions,
          source: 'Mobile Phase B'
        })
      })
    }
    
    setPreTreatmentData(preTreatmentDetails)
    setPhaseAData(phaseADetails)
    setPhaseBData(phaseBDetails)

    // 返回数据用于汇总
    return {
      preTreatmentDetails,
      phaseADetails,
      phaseBDetails
    }
  }

  useEffect(() => {
    loadAllData()

    // 监听数据更新
    const handleDataUpdate = () => {
      console.log('🔔 TablePage: 检测到数据更新，重新加载表格...')
      loadAllData()
    }
    
    // 监听文件数据变更事件
    const handleFileDataChanged = () => {
      console.log('📢 TablePage: 接收到 fileDataChanged 事件，立即重新加载')
      loadAllData()
    }

    window.addEventListener('gradientDataUpdated', handleDataUpdate)
    window.addEventListener('factorsDataUpdated', handleDataUpdate)
    window.addEventListener('methodsDataUpdated', handleDataUpdate)
    window.addEventListener('scoreDataUpdated', handleDataUpdate)
    window.addEventListener('powerScoreUpdated', handleDataUpdate)
    window.addEventListener('fileDataChanged', handleFileDataChanged)

    return () => {
      window.removeEventListener('gradientDataUpdated', handleDataUpdate)
      window.removeEventListener('factorsDataUpdated', handleDataUpdate)
      window.removeEventListener('methodsDataUpdated', handleDataUpdate)
      window.removeEventListener('scoreDataUpdated', handleDataUpdate)
      window.removeEventListener('powerScoreUpdated', handleDataUpdate)
      window.removeEventListener('fileDataChanged', handleFileDataChanged)
    }
  }, [])

  const loadAllData = async () => {
    console.log('🔄 TablePage: loadAllData 开始执行')
    try {
      // 优先使用后端评分结果
      const scoreResults = await StorageHelper.getJSON(STORAGE_KEYS.SCORE_RESULTS)
      
      if (scoreResults && scoreResults.instrument && scoreResults.preparation) {
        console.log('✅ TablePage: 使用后端评分结果')
        
        // 从后端结果中提取数据
        const methodsData = await StorageHelper.getJSON(STORAGE_KEYS.METHODS)
        const gradientData = await StorageHelper.getJSON(STORAGE_KEYS.GRADIENT)
        
        setSampleCount(methodsData?.sampleCount || 0)
        setGradientInfo({
          totalVolume: gradientData?.calculations?.totalVolume || 0,
          totalTime: gradientData?.calculations?.totalTime || 0,
          steps: gradientData?.steps || []
        })
        
        // 使用后端返回的大因子分数
        const instMajor = scoreResults.instrument.major_factors
        const prepMajor = scoreResults.preparation.major_factors
        const additionalFactors = scoreResults.additional_factors || { P: 0, R: 0, D: 0 }
        
        const avgS = (instMajor.S + prepMajor.S) / 2
        const avgH = (instMajor.H + prepMajor.H) / 2
        const avgE = (instMajor.E + prepMajor.E) / 2
        
        setTotalScores({
          S: avgS,
          H: avgH,
          E: avgE,
          R: additionalFactors.R,
          D: additionalFactors.D,
          totalScore: scoreResults.final?.score3 || 0
        })
        
        setPowerScore(additionalFactors.P)
        
        // 构建试剂详细列表（使用前端归一化计算）
        const factorsData = await StorageHelper.getJSON<ReagentFactor[]>(STORAGE_KEYS.FACTORS)
        
        if (!factorsData) {
          // 即使没有详细数据，也显示后端总分
          setTotalScores({
            S: avgS,
            H: avgH,
            E: avgE,
            R: additionalFactors.R,
            D: additionalFactors.D,
            totalVolume: gradientData?.calculations?.totalVolume || 0,
            totalMass: gradientData?.calculations?.totalMass || 0,
            totalScore: scoreResults.final?.score3 || 0
          })
          setHasData(true)
          return
        }
        
        // 生成试剂详细列表（包含每个试剂的 S/H/E/R/D 贡献）
        const reagentDetails = await loadReagentDetails(factorsData, methodsData, gradientData)
        
        // 计算所有试剂的 R/D 总和（用于显示）
        const allReagents = [
          ...reagentDetails.preTreatmentDetails,
          ...reagentDetails.phaseADetails,
          ...reagentDetails.phaseBDetails
        ]
        const calculatedTotals = {
          S: avgS,  // 使用后端计算的 S
          H: avgH,  // 使用后端计算的 H
          E: avgE,  // 使用后端计算的 E
          R: allReagents.reduce((sum, r) => sum + r.R, 0),
          D: allReagents.reduce((sum, r) => sum + r.D, 0),
          totalVolume: gradientData?.calculations?.totalVolume || 0,
          totalMass: gradientData?.calculations?.totalMass || 0,
          totalScore: scoreResults.final?.score3 || 0
        }
        
        setTotalScores(calculatedTotals)
        setHasData(true)
        return
      }
      
      // 回退到旧的计算逻辑
      console.log('⚠️ TablePage: 后端评分结果不存在，使用旧的计算逻辑')
      
      // 加载所有数据源
      const factorsData = await StorageHelper.getJSON<ReagentFactor[]>(STORAGE_KEYS.FACTORS)
      const gradientData = await StorageHelper.getJSON(STORAGE_KEYS.GRADIENT)
      const methodsData = await StorageHelper.getJSON(STORAGE_KEYS.METHODS)

      console.log('📊 TablePage: 数据加载结果:', {
        factorsData: factorsData ? `${factorsData.length}个因子` : '无',
        gradientData: gradientData ? '存在' : '无',
        methodsData: methodsData ? '存在' : '无',
        gradientCalculations: gradientData?.calculations ? '存在' : '无',
        sampleCount: methodsData?.sampleCount,
        preTreatmentReagents: methodsData?.preTreatmentReagents?.length || 0,
        mobilePhaseA: methodsData?.mobilePhaseA?.length || 0,
        mobilePhaseB: methodsData?.mobilePhaseB?.length || 0
      })
      
      console.log('📋 TablePage: gradientData详情:', {
        hasCalculations: !!gradientData?.calculations,
        hasMobilePhaseA: !!gradientData?.calculations?.mobilePhaseA,
        hasMobilePhaseB: !!gradientData?.calculations?.mobilePhaseB,
        phaseAComponents: gradientData?.calculations?.mobilePhaseA?.components?.length || 0,
        phaseBComponents: gradientData?.calculations?.mobilePhaseB?.components?.length || 0
      })
      
      // 打印实际的 components 数组
      console.log('🔍 TablePage: Mobile Phase A components 实际内容:', 
        gradientData?.calculations?.mobilePhaseA?.components)
      console.log('🔍 TablePage: Mobile Phase B components 实际内容:', 
        gradientData?.calculations?.mobilePhaseB?.components)

      if (!factorsData || !gradientData || !methodsData) {
        console.log('❌ TablePage: 缺少必要数据')
        setHasData(false)
        return
      }

      // 保存基本信息
      setSampleCount(methodsData.sampleCount || 0)
      setGradientInfo({
        totalVolume: gradientData.calculations?.totalVolume || 0,
        totalTime: gradientData.calculations?.totalTime || 0,
        steps: gradientData.steps || []
      })

      // 处理 Sample PreTreatment 数据
      const preTreatmentDetails: ReagentDetail[] = []
      if (methodsData.preTreatmentReagents && Array.isArray(methodsData.preTreatmentReagents)) {
        console.log('🔍 TablePage: 处理Sample PreTreatment，试剂数:', methodsData.preTreatmentReagents.length)
        console.log('   试剂详情:', methodsData.preTreatmentReagents)
        
        methodsData.preTreatmentReagents.forEach((reagent: any) => {
          console.log(`   - 检查试剂: ${reagent.name}, 体积: ${reagent.volume}`)
          
          if (!reagent.name || reagent.volume <= 0) {
            console.log(`   ✗ 跳过（名称为空或体积≤0）`)
            return
          }

          const factor = factorsData.find(f => f.name === reagent.name)
          if (!factor) {
            console.warn(`   ⚠️ 找不到试剂 ${reagent.name} 的因子数据`)
            return
          }
          
          console.log(`   \u2713 \u6dfb\u52a0\u8bd5\u5242 ${reagent.name}`)
        

          const mass = reagent.volume * factor.density
          const contributions = calculateReagentContributions(mass, factor)

          preTreatmentDetails.push({
            reagentName: reagent.name,
            volume: reagent.volume,
            density: factor.density,
            mass: mass,
            ...contributions,
            source: 'Sample PreTreatment'
          })
        })
      }

      // 处理 Mobile Phase A 数据
      const phaseADetails: ReagentDetail[] = []
      if (gradientData.calculations?.mobilePhaseA?.components) {
        console.log('🔍 TablePage: 处理Mobile Phase A，组分数:', gradientData.calculations.mobilePhaseA.components.length)
        console.log('   组分详情:', gradientData.calculations.mobilePhaseA.components)
        
        gradientData.calculations.mobilePhaseA.components.forEach((component: any) => {
          console.log(`   - 检查组分: ${component.reagentName}, 体积: ${component.volume}`)
          
          if (!component.reagentName || component.volume <= 0) {
            console.log(`   ✗ 跳过（名称为空或体积≤0）`)
            return
          }

          const factor = factorsData.find(f => f.name === component.reagentName)
          if (!factor) {
            console.warn(`   ⚠️ 找不到试剂 ${component.reagentName} 的因子数据`)
            return
          }
          
          console.log(`   \u2713 \u6dfb\u52a0\u7ec4\u5206 ${component.reagentName}`)
        

          const mass = component.volume * factor.density
          const contributions = calculateReagentContributions(mass, factor)

          phaseADetails.push({
            reagentName: component.reagentName,
            volume: component.volume,
            density: factor.density,
            mass: mass,
            ...contributions,
            source: 'Mobile Phase A'
          })
        })
      }

      // 处理 Mobile Phase B 数据
      const phaseBDetails: ReagentDetail[] = []
      if (gradientData.calculations?.mobilePhaseB?.components) {
        console.log('🔍 TablePage: 处理Mobile Phase B，组分数:', gradientData.calculations.mobilePhaseB.components.length)
        gradientData.calculations.mobilePhaseB.components.forEach((component: any) => {
          if (!component.reagentName || component.volume <= 0) return

          const factor = factorsData.find(f => f.name === component.reagentName)
          if (!factor) {
            console.warn(`⚠️ TablePage: 找不到试剂 ${component.reagentName} 的因子数据`)
            return
          }

          const mass = component.volume * factor.density
          const contributions = calculateReagentContributions(mass, factor)

          phaseBDetails.push({
            reagentName: component.reagentName,
            volume: component.volume,
            density: factor.density,
            mass: mass,
            ...contributions,
            source: 'Mobile Phase B'
          })
        })
      }

      // 计算总得分
      const allDetails = [...preTreatmentDetails, ...phaseADetails, ...phaseBDetails]
      console.log('📊 TablePage: 汇总数据:', {
        preTreatment: preTreatmentDetails.length,
        phaseA: phaseADetails.length,
        phaseB: phaseBDetails.length,
        total: allDetails.length
      })
      
      // 从 Power Score 获取 P 值
      const P = await StorageHelper.getJSON<number>(STORAGE_KEYS.POWER_SCORE) || 0
      
      const totals = {
        totalVolume: allDetails.reduce((sum, r) => sum + r.volume, 0),
        totalMass: allDetails.reduce((sum, r) => sum + r.mass, 0),
        S: allDetails.reduce((sum, r) => sum + r.S, 0),
        H: allDetails.reduce((sum, r) => sum + r.H, 0),
        E: allDetails.reduce((sum, r) => sum + r.E, 0),
        R: allDetails.reduce((sum, r) => sum + r.R, 0),
        D: allDetails.reduce((sum, r) => sum + r.D, 0)
      }
      
      setPowerScore(P)
      
      console.log('🎯 TablePage: 计算结果:', {
        totals,
        P,
        sampleCount,
        totalSum: totals.S + totals.H + totals.E + totals.R + totals.D + P
      })
      
      // 计算总分
      const totalSum = totals.S + totals.H + totals.E + totals.R + totals.D + P
      const totalScore = sampleCount > 0 ? totalSum / sampleCount : 0

      setPreTreatmentData(preTreatmentDetails)
      setPhaseAData(phaseADetails)
      setPhaseBData(phaseBDetails)
      setTotalScores({ ...totals, totalScore })
      setHasData(true)
      
      console.log('✅ TablePage: 数据加载完成，hasData=true')

    } catch (error) {
      console.error('❌ TablePage: 加载数据失败:', error)
      setHasData(false)
    }
  }

  // Reagent detail table column definitions  
  const reagentColumns: ColumnsType<ReagentDetail> = [
    {
      title: 'Reagent Name',
      dataIndex: 'reagentName',
      key: 'reagentName',
      width: 150,
      fixed: 'left'
    },
    {
      title: 'Volume (ml)',
      dataIndex: 'volume',
      key: 'volume',
      width: 100,
      render: (val) => val.toFixed(3)
    },
    {
      title: 'Density (g/ml)',
      dataIndex: 'density',
      key: 'density',
      width: 100,
      render: (val) => val.toFixed(3)
    },
    {
      title: 'Mass (g)',
      dataIndex: 'mass',
      key: 'mass',
      width: 100,
      render: (val) => val.toFixed(3)
    },
    {
      title: 'Safety (S)',
      dataIndex: 'S',
      key: 'S',
      width: 120,
      render: (val) => val.toFixed(3)
    },
    {
      title: 'Health (H)',
      dataIndex: 'H',
      key: 'H',
      width: 120,
      render: (val) => val.toFixed(3)
    },
    {
      title: 'Environment (E)',
      dataIndex: 'E',
      key: 'E',
      width: 150,
      render: (val) => val.toFixed(3)
    },
    {
      title: 'Recyclability & Regeneration (R)',
      dataIndex: 'R',
      key: 'R',
      width: 200,
      render: (val) => val.toFixed(3)
    },
    {
      title: 'Disposal & Degradation (D)',
      dataIndex: 'D',
      key: 'D',
      width: 200,
      render: (val) => val.toFixed(3)
    }
  ]

  // Gradient step table column definitions
  const gradientStepsColumns: ColumnsType<any> = [
    {
      title: 'Step',
      dataIndex: 'stepNo',
      key: 'stepNo',
      width: 80
    },
    {
      title: 'Time (min)',
      dataIndex: 'time',
      key: 'time',
      width: 100
    },
    {
      title: 'Mobile Phase A (%)',
      dataIndex: 'phaseA',
      key: 'phaseA',
      width: 150
    },
    {
      title: 'Mobile Phase B (%)',
      dataIndex: 'phaseB',
      key: 'phaseB',
      width: 150
    },
    {
      title: 'Flow Rate (ml/min)',
      dataIndex: 'flowRate',
      key: 'flowRate',
      width: 120
    },
    {
      title: 'Volume (ml)',
      dataIndex: 'volume',
      key: 'volume',
      width: 100,
      render: (val) => val.toFixed(3)
    },
    {
      title: 'Curve Type',
      dataIndex: 'curve',
      key: 'curve',
      width: 100
    }
  ]

  return (
    <div className="table-page">
      <Title level={2}>Comprehensive Data Report</Title>

      {!hasData ? (
        <Alert
          message="No Data Available"
          description="Please complete Factors, Methods, and HPLC Gradient configuration first."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      ) : (
        <>
          {/* Basic Information Overview */}
          <Card title="Basic Information" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title="Sample Count" value={sampleCount} />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Total Volume" 
                  value={totalScores?.totalVolume || 0} 
                  precision={3}
                  suffix="ml" 
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Total Mass" 
                  value={totalScores?.totalMass || 0} 
                  precision={3}
                  suffix="g" 
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Total Gradient Time" 
                  value={gradientInfo?.totalTime || 0} 
                  suffix="min" 
                />
              </Col>
            </Row>
          </Card>

          {/* Total Score Summary */}
          <Card title="Green Chemistry Assessment Total Scores" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={4}>
                <Statistic 
                  title="Safety (S)" 
                  value={totalScores?.S || 0} 
                  precision={3}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Health Hazard (H)" 
                  value={totalScores?.H || 0} 
                  precision={3}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Environmental Impact (E)" 
                  value={totalScores?.E || 0} 
                  precision={3}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Regeneration (R)" 
                  value={totalScores?.R || 0} 
                  precision={3}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Disposal (D)" 
                  value={totalScores?.D || 0} 
                  precision={3}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Power (P)" 
                  value={powerScore.toFixed(3)} 
                  precision={3}
                  valueStyle={{ color: '#eb2f96' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Detailed Data Tables */}
          <Alert
            message="试剂级别 R/D 计算说明"
            description={
              <div>
                <p>表格中每个试剂的 R (Recyclability & Regeneration) 和 D (Disposal & Degradation) 值按照 GEMAM 评价体系计算：</p>
                <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                  <li><strong>归一化公式</strong>：Score = min(100, 33.3 × log₁₀(1 + 质量 × 因子值))</li>
                  <li><strong>R</strong>：反映试剂的可回收性和再生潜力</li>
                  <li><strong>D</strong>：反映试剂的处置难度和降解性</li>
                </ul>
                <p style={{ marginTop: 8, marginBottom: 0 }}>
                  <strong>注意：</strong>S/H/E 分数通过子因子（S1-S4, H1-H2, E1-E3）在后端计算，详见 "Green Chemistry Assessment Total Scores" 区域。
                </p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Tabs defaultActiveKey="1" items={[
            {
              key: '1',
              label: 'Sample PreTreatment Details',
              children: (
              <Table
                columns={reagentColumns}
                dataSource={preTreatmentData}
                rowKey={(record) => `${record.source}-${record.reagentName}`}
                pagination={false}
                scroll={{ x: 1200 }}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                      <Table.Summary.Cell index={0}>Subtotal</Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        {preTreatmentData.reduce((sum, r) => sum + r.volume, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>-</Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        {preTreatmentData.reduce((sum, r) => sum + r.mass, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        {preTreatmentData.reduce((sum, r) => sum + r.S, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        {preTreatmentData.reduce((sum, r) => sum + r.H, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                        {preTreatmentData.reduce((sum, r) => sum + r.E, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}>
                        {preTreatmentData.reduce((sum, r) => sum + r.R, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={8}>
                        {preTreatmentData.reduce((sum, r) => sum + r.D, 0).toFixed(3)}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
              )
            },
            {
              key: '2',
              label: 'Mobile Phase A Details',
              children: (
              <>
              <Card size="small" style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Total Volume">
                    {phaseAData.reduce((sum, r) => sum + r.volume, 0).toFixed(3)} ml
                  </Descriptions.Item>
                  <Descriptions.Item label="Average Percentage">
                    {gradientInfo?.totalVolume > 0 
                      ? ((phaseAData.reduce((sum, r) => sum + r.volume, 0) / gradientInfo.totalVolume) * 100).toFixed(2)
                      : 0} %
                  </Descriptions.Item>
                </Descriptions>
              </Card>
              <Table
                columns={reagentColumns}
                dataSource={phaseAData}
                rowKey={(record) => `${record.source}-${record.reagentName}`}
                pagination={false}
                scroll={{ x: 1200 }}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                      <Table.Summary.Cell index={0}>Subtotal</Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        {phaseAData.reduce((sum, r) => sum + r.volume, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>-</Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        {phaseAData.reduce((sum, r) => sum + r.mass, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        {phaseAData.reduce((sum, r) => sum + r.S, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        {phaseAData.reduce((sum, r) => sum + r.H, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                        {phaseAData.reduce((sum, r) => sum + r.E, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}>
                        {phaseAData.reduce((sum, r) => sum + r.R, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={8}>
                        {phaseAData.reduce((sum, r) => sum + r.D, 0).toFixed(3)}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
              </>
              )
            },
            {
              key: '3',
              label: 'Mobile Phase B Details',
              children: (
              <>
              <Card size="small" style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Total Volume">
                    {phaseBData.reduce((sum, r) => sum + r.volume, 0).toFixed(3)} ml
                  </Descriptions.Item>
                  <Descriptions.Item label="Average Percentage">
                    {gradientInfo?.totalVolume > 0 
                      ? ((phaseBData.reduce((sum, r) => sum + r.volume, 0) / gradientInfo.totalVolume) * 100).toFixed(2)
                      : 0} %
                  </Descriptions.Item>
                </Descriptions>
              </Card>
              <Table
                columns={reagentColumns}
                dataSource={phaseBData}
                rowKey={(record) => `${record.source}-${record.reagentName}`}
                pagination={false}
                scroll={{ x: 1200 }}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                      <Table.Summary.Cell index={0}>Subtotal</Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        {phaseBData.reduce((sum, r) => sum + r.volume, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>-</Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        {phaseBData.reduce((sum, r) => sum + r.mass, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        {phaseBData.reduce((sum, r) => sum + r.S, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        {phaseBData.reduce((sum, r) => sum + r.H, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                        {phaseBData.reduce((sum, r) => sum + r.E, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}>
                        {phaseBData.reduce((sum, r) => sum + r.R, 0).toFixed(3)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={8}>
                        {phaseBData.reduce((sum, r) => sum + r.D, 0).toFixed(3)}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
              </>
              )
            },
            {
              key: '4',
              label: 'Gradient Step Information',
              children: (
              <Table
                columns={gradientStepsColumns}
                dataSource={gradientInfo?.steps || []}
                rowKey={(record) => `step-${record.stepNo}`}
                pagination={false}
              />
              )
            }
          ]} />

          {/* Calculation Formula Explanation */}
          <Card title="Calculation Formula Explanation" style={{ marginTop: 24 }}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Mass Calculation">
                Mass (g) = Volume (ml) × Density (g/ml)
              </Descriptions.Item>
              <Descriptions.Item label="Score Calculation">
                Score for each metric = Mass (g) × Corresponding factor value
              </Descriptions.Item>
              <Descriptions.Item label="Mobile Phase Volume Calculation">
                Volume = Σ(Integral area of each segment × Flow rate / 100)
                <br />
                Integral area = Area under gradient curve (calculated using trapezoidal rule)
              </Descriptions.Item>
              <Descriptions.Item label="Reagent Volume Distribution">
                Reagent volume = Total Mobile Phase volume × Reagent percentage / 100
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </>
      )}
    </div>
  )
}

export default TablePage
