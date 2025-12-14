import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { Card, Typography, InputNumber, Select, Button, Row, Col, message, Tooltip, Divider, Spin, Statistic } from 'antd'
import { PlusOutlined, DeleteOutlined, QuestionCircleOutlined, TrophyOutlined, ExperimentOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { useAppContext } from '../contexts/AppContext'
import api from '../services/api'
import type { Reagent, PreTreatmentReagent, ReagentFactor } from '../contexts/AppContext'
import { StorageHelper, STORAGE_KEYS } from '../utils/storage'
import './MethodsPage.css'

const { Title } = Typography
const { Option } = Select

const MethodsPage: React.FC = () => {
  const navigate = useNavigate()
  const { data, updateMethodsData, setIsDirty } = useAppContext()
  
  // 使用Context中的数据初始化本地状�?
  const [preTreatmentReagents, setPreTreatmentReagents] = useState<PreTreatmentReagent[]>(data.methods.preTreatmentReagents)
  const [mobilePhaseA, setMobilePhaseA] = useState<Reagent[]>(data.methods.mobilePhaseA)
  const [mobilePhaseB, setMobilePhaseB] = useState<Reagent[]>(data.methods.mobilePhaseB)
  
  // Power Factor (P) calculation states
  const [instrumentType, setInstrumentType] = useState<'low' | 'standard' | 'high'>(data.methods.instrumentType || 'standard')
  const [instrumentEnergy, setInstrumentEnergy] = useState<number>(data.methods.instrumentEnergy || 0)  // 仪器分析能耗 (kWh)
  const [pretreatmentEnergy, setPretreatmentEnergy] = useState<number>(data.methods.pretreatmentEnergy || 0)  // 前处理能耗 (kWh)
  const [weightScheme, setWeightScheme] = useState<string>('balanced')

  // 色谱类型选择状态（新增�?
  const [chromatographyType, setChromatographyType] = useState<string>('HPLC_UV')
  
  // 权重方案选择状�?
  const [safetyScheme, setSafetyScheme] = useState<string>('PBT_Balanced')
  const [healthScheme, setHealthScheme] = useState<string>('Absolute_Balance')
  const [environmentScheme, setEnvironmentScheme] = useState<string>('PBT_Balanced')
  const [instrumentStageScheme, setInstrumentStageScheme] = useState<string>('Balanced')
  const [prepStageScheme, setPrepStageScheme] = useState<string>('Balanced')
  const [finalScheme, setFinalScheme] = useState<string>('Standard')

  // 评分结果状态（新增�?
  const [scoreResults, setScoreResults] = useState<any>(null)
  const [isCalculatingScore, setIsCalculatingScore] = useState<boolean>(false)
  const [availableSchemes, setAvailableSchemes] = useState<any>(null)

  // �?Factors 页面加载试剂列表
  const [availableReagents, setAvailableReagents] = useState<string[]>([])
  const [factorsData, setFactorsData] = useState<ReagentFactor[]>([])
  
  // 存储gradient数据，用于图表计�?
  const [gradientData, setGradientData] = useState<any>(null)
  
  // 图表纵坐标范围控�?(null = 自动)
  const [preTreatmentYMax, setPreTreatmentYMax] = useState<number | null>(null)
  const [phaseAYMax, setPhaseAYMax] = useState<number | null>(null)
  const [phaseBYMax, setPhaseBYMax] = useState<number | null>(null)

  // 使用 useMemo 缓存 filterOption 函数，避免每次渲染都创建新函�?
  const selectFilterOption = React.useMemo(
    () => (input: string, option: any) => {
      const children = String(option?.children || '')
      return children.toLowerCase().includes(input.toLowerCase())
    },
    []
  )

  useEffect(() => {
    // 加载 Factors 数据
    const loadFactorsData = async () => {
      console.log('🔄 MethodsPage: 开始加载factors数据')
      try {
        const factorsDataStr = await StorageHelper.getJSON(STORAGE_KEYS.FACTORS)
        console.log('  - localStorage factors:', factorsDataStr ? `Found (${factorsDataStr.length} items)` : 'Not found')
        if (factorsDataStr) {
          const factors = factorsDataStr
          console.log(`  - Loaded ${factors.length} reagents`)
          setFactorsData(factors)
          
          // Extract reagent names, deduplicate and sort
          const reagentNames = Array.from(
            new Set(factors.map((f: any) => f.name).filter((n: string) => n && n.trim()))
          ).sort()
          
          console.log(`  - Extracted ${reagentNames.length} reagent names`, reagentNames.slice(0, 3))
          
          // Only update if reagent list actually changed
          setAvailableReagents(prev => {
            if (JSON.stringify(prev) === JSON.stringify(reagentNames)) {
              console.log('  - Reagent list unchanged, skip update')
              return prev // Return old reference to avoid re-render
            }
            console.log('  - Update reagent list')
            return reagentNames as string[]
          })
        } else {
          console.log('  Warning: No factors data in localStorage, clearing reagent list')
          setFactorsData([])
          setAvailableReagents([])
        }
      } catch (error) {
        console.error('Failed to load Factors data:', error)
      }
    }

    // 加载评分结果
    const loadScoreResults = async () => {
      console.log('🔄 MethodsPage: 开始加载评分结�?)
      try {
        const scoreResultsStr = await StorageHelper.getJSON(STORAGE_KEYS.SCORE_RESULTS)
        if (scoreResultsStr) {
          const results = JSON.parse(scoreResultsStr)
          console.log('�?评分结果加载成功:', results)
          setScoreResults(results)
        } else {
          console.log('  ℹ️ localStorage中没有评分结�?)
        }
      } catch (error) {
        console.error('�?加载评分结果失败:', error)
      }
    }

    loadFactorsData()
    loadScoreResults() // 新增：加载评分结�?
    
    // 加载gradient数据
    const loadGradientData = async () => {
      const gradientDataStr = await StorageHelper.getJSON(STORAGE_KEYS.GRADIENT)
      if (gradientDataStr) {
        setGradientData(gradientDataStr)
      }
    }
    loadGradientData()

    // 监听 HPLC Gradient 数据更新
    const handleGradientDataUpdated = async () => {
      console.log('🔔 检测到 HPLC Gradient 数据更新，刷新图�?..')
      loadGradientData()
    }
    
    // 检查打开文件时gradient数据是否包含calculations
    const checkGradientDataOnLoad = async () => {
      const gradientDataStr = await StorageHelper.getJSON(STORAGE_KEYS.GRADIENT)
      if (gradientDataStr) {
        const gradientData = gradientDataStr
        if (Array.isArray(gradientData) || !gradientData.calculations) {
          console.warn('⚠️ 打开的文件缺少gradient calculations数据')
          message.warning('This file is missing gradient calculation data. Please go to HPLC Gradient Prg page and click "Confirm" to recalculate', 5)
        }
      }
    }
    
    // 延迟检查，等待文件数据加载完成
    const checkTimer = setTimeout(checkGradientDataOnLoad, 500)
    
    // 监听文件数据变更事件（打开文件、新建文件时触发�?
    const handleFileDataChanged = async (e: Event) => {
      const customEvent = e as CustomEvent
      console.log('📢 MethodsPage: 接收�?fileDataChanged 事件', customEvent.detail)
      
      // 数据已自动触发更新
      
      // 延迟重新加载factors数据（等待FactorsPage初始化预定义数据�?
      setTimeout(() => {
        console.log('🔄 MethodsPage: 延迟加载factors数据')
        loadFactorsData()
        loadScoreResults() // 同时重新加载评分结果
      }, 100)
      
      console.log('🔄 MethodsPage: 已强制刷新页面数�?)
    }
    
    // 监听评分数据更新事件
    const handleScoreDataUpdated = async () => {
      console.log('📢 MethodsPage: 检测到评分数据更新')
      loadScoreResults()
    }

    // 自定义事件监�?同页面内的更�?
    window.addEventListener('factorsDataUpdated', loadFactorsData as EventListener)
    window.addEventListener('gradientDataUpdated', handleGradientDataUpdated)
    window.addEventListener('fileDataChanged', handleFileDataChanged)
    window.addEventListener('scoreDataUpdated', handleScoreDataUpdated)

    return () => {
      clearTimeout(checkTimer)
      window.removeEventListener('factorsDataUpdated', loadFactorsData as EventListener)
      window.removeEventListener('gradientDataUpdated', handleGradientDataUpdated)
      window.removeEventListener('fileDataChanged', handleFileDataChanged)
      window.removeEventListener('scoreDataUpdated', handleScoreDataUpdated)
    }
  }, [])

  // 自动计算评分（数据变化时触发）
  useEffect(() => {
    console.log('📌 自动计算useEffect触发')
    console.log('  - 前处理试剂数:', preTreatmentReagents.length)
    console.log('  - 仪器能耗:', instrumentEnergy, 'kWh')
    console.log('  - 前处理能耗:', pretreatmentEnergy, 'kWh')
    
    // 防抖计时器 - 3秒避免频繁计算
    const debounceTimer = setTimeout(async () => {
      // 检查是否有必要的数据
      const gradientData = await StorageHelper.getJSON(STORAGE_KEYS.GRADIENT)
      const factors = await StorageHelper.getJSON<any[]>(STORAGE_KEYS.FACTORS)
      
      // 只有当梯度数据和因子数据都存在时才自动计算
      if (gradientData && factors && factors.length > 0) {
        console.log('🔄 数据已变化，自动触发评分计算')
        calculateFullScoreAPI()
      } else {
        console.log('⚠️ 跳过自动计算 - 缺少必要数据', {
          hasGradient: !!gradientData,
          hasFactors: !!(factors && factors.length > 0)
        })
      }
    }, 3000) // 3秒防抖

    return () => clearTimeout(debounceTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // 监听所有可能影响评分的数据
    safetyScheme,
    healthScheme,
    environmentScheme,
    instrumentStageScheme,
    prepStageScheme,
    finalScheme,
    mobilePhaseA,
    mobilePhaseB,
    preTreatmentReagents,
    instrumentEnergy,
    pretreatmentEnergy
  ])

  // 监听Context数据变化，立即更新本地状态（使用useLayoutEffect确保同步更新�?
  const lastSyncedData = React.useRef<string>('')
  
  useLayoutEffect(() => {
    const currentDataStr = JSON.stringify(data.methods)
    
    // 如果数据没有变化，跳过更�?
    if (lastSyncedData.current === currentDataStr) {
      console.log('⏭️ MethodsPage: Context数据未变化，跳过更新')
      return
    }
    
    console.log('🔄 MethodsPage: Context数据变化，立即更新本地状�?)
    lastSyncedData.current = currentDataStr
    
    // 立即更新所有状�?
    setPreTreatmentReagents(data.methods.preTreatmentReagents)
    setMobilePhaseA(data.methods.mobilePhaseA)
    setMobilePhaseB(data.methods.mobilePhaseB)
    setInstrumentType(data.methods.instrumentType || 'standard')
  }, [data.methods])

  // 自动保存数据�?Context �?localStorage (每次状态变化时)
  // 使用 ref 来避免初始化时触�?dirty
  const isInitialMount = React.useRef(true)
  const lastLocalData = React.useRef<string>('')
  
  useEffect(() => {
    const saveData = async () => {
      const dataToSave = {
        preTreatmentReagents,
        mobilePhaseA,
        mobilePhaseB,
        instrumentType
      }
      
      const currentLocalDataStr = JSON.stringify(dataToSave)
      
      // 保存�?localStorage
      await StorageHelper.setJSON(STORAGE_KEYS.METHODS, dataToSave)
      
      // 跳过初始挂载时的更新
      if (isInitialMount.current) {
        console.log('⏭️ MethodsPage: 跳过初始挂载时的更新')
        isInitialMount.current = false
        lastLocalData.current = currentLocalDataStr
        return
      }
      
      // 如果本地数据没有变化（可能是从Context同步来的），跳过更新
      if (lastLocalData.current === currentLocalDataStr) {
        console.log('⏭️ MethodsPage: 本地数据未变化，跳过Context更新')
        return
      }
      
      console.log('🔄 MethodsPage: 本地数据变化，同步到Context并标记dirty')
      lastLocalData.current = currentLocalDataStr
      
      // 同步到Context并标记为脏数�?
      updateMethodsData(dataToSave)
      setIsDirty(true)
    }
    
    saveData()
  }, [preTreatmentReagents, mobilePhaseA, mobilePhaseB, updateMethodsData, setIsDirty])

  // 添加试剂
  const addReagent = (type: 'preTreatment' | 'phaseA' | 'phaseB') => {
    if (type === 'preTreatment') {
      const newReagent: PreTreatmentReagent = { id: Date.now().toString(), name: '', volume: 0 }
      setPreTreatmentReagents([...preTreatmentReagents, newReagent])
    } else {
      const newReagent: Reagent = { id: Date.now().toString(), name: '', percentage: 0 }
      if (type === 'phaseA') {
        setMobilePhaseA([...mobilePhaseA, newReagent])
      } else {
        setMobilePhaseB([...mobilePhaseB, newReagent])
      }
    }
  }

  // 删除最后一行试�?
  const deleteLastReagent = (type: 'preTreatment' | 'phaseA' | 'phaseB') => {
    if (type === 'preTreatment') {
      if (preTreatmentReagents.length <= 1) {
        message.warning('至少保留一个试�?)
        return
      }
      setPreTreatmentReagents(preTreatmentReagents.slice(0, -1))
    } else if (type === 'phaseA') {
      if (mobilePhaseA.length <= 1) {
        message.warning('至少保留一个试�?)
        return
      }
      setMobilePhaseA(mobilePhaseA.slice(0, -1))
    } else {
      if (mobilePhaseB.length <= 1) {
        message.warning('至少保留一个试�?)
        return
      }
      setMobilePhaseB(mobilePhaseB.slice(0, -1))
    }
  }

  // 更新试剂 - 使用useCallback缓存函数，避免每次渲染创建新函数
  const updateReagent = useCallback((
    type: 'preTreatment' | 'phaseA' | 'phaseB',
    id: string,
    field: 'name' | 'percentage' | 'volume',
    value: string | number
  ) => {
    console.log(`🔧 更新试剂 - type: ${type}, id: ${id}, field: ${field}, value:`, value)
    
    if (type === 'preTreatment') {
      setPreTreatmentReagents(prev => prev.map(r => 
        r.id === id ? { ...r, [field]: value } : r
      ))
    } else if (type === 'phaseA') {
      setMobilePhaseA(prev => {
        const updated = prev.map(r => 
          r.id === id ? { ...r, [field]: value } : r
        )
        // 🔥 试剂改变时重新计算gradient calculations
        recalculateGradientCalculations(updated, mobilePhaseB)
        return updated
      })
    } else if (type === 'phaseB') {
      setMobilePhaseB(prev => {
        const updated = prev.map(r => 
          r.id === id ? { ...r, [field]: value } : r
        )
        // 🔥 试剂改变时重新计算gradient calculations
        recalculateGradientCalculations(mobilePhaseA, updated)
        return updated
      })
    }
  }, [mobilePhaseA, mobilePhaseB])
  
  // 🔥 重新计算gradient的calculations（当试剂配置改变时）
  const recalculateGradientCalculations = async (phaseA: Reagent[], phaseB: Reagent[]) => {
    try {
      const gradientDataStr = await StorageHelper.getJSON(STORAGE_KEYS.GRADIENT)
      if (!gradientDataStr) {
        console.log('⏭️ 没有gradient数据，跳过重新计�?)
        return
      }
      
      const gradientData = gradientDataStr
      if (!gradientData.calculations) {
        console.log('⏭️ gradient数据没有calculations，跳过重新计�?)
        return
      }
      
      console.log('🔄 重新计算gradient calculations...')
      
      // 获取原有的体积数�?
      const totalVolumeA = gradientData.calculations.mobilePhaseA?.volume || 0
      const totalVolumeB = gradientData.calculations.mobilePhaseB?.volume || 0
      
      // 重新计算 Mobile Phase A 的组�?
      const totalPercentageA = phaseA.reduce((sum, r) => sum + (r.percentage || 0), 0)
      const newComponentsA = phaseA
        .filter(r => r.name && r.name.trim())
        .map(r => ({
          reagentName: r.name,
          percentage: r.percentage,
          ratio: totalPercentageA > 0 ? r.percentage / totalPercentageA : 0,
          volume: totalPercentageA > 0 ? (totalVolumeA * r.percentage / totalPercentageA) : 0
        }))
      
      // 重新计算 Mobile Phase B 的组�?
      const totalPercentageB = phaseB.reduce((sum, r) => sum + (r.percentage || 0), 0)
      const newComponentsB = phaseB
        .filter(r => r.name && r.name.trim())
        .map(r => ({
          reagentName: r.name,
          percentage: r.percentage,
          ratio: totalPercentageB > 0 ? r.percentage / totalPercentageB : 0,
          volume: totalPercentageB > 0 ? (totalVolumeB * r.percentage / totalPercentageB) : 0
        }))
      
      // 更新calculations中的组分信息
      gradientData.calculations.mobilePhaseA.components = newComponentsA
      gradientData.calculations.mobilePhaseB.components = newComponentsB
      
      // 重新计算所有试剂的总体�?
      const allReagentVolumes: { [key: string]: number } = {}
      
      newComponentsA.forEach((c: any) => {
        if (allReagentVolumes[c.reagentName]) {
          allReagentVolumes[c.reagentName] += c.volume
        } else {
          allReagentVolumes[c.reagentName] = c.volume
        }
      })
      
      newComponentsB.forEach((c: any) => {
        if (allReagentVolumes[c.reagentName]) {
          allReagentVolumes[c.reagentName] += c.volume
        } else {
          allReagentVolumes[c.reagentName] = c.volume
        }
      })
      
      gradientData.calculations.allReagentVolumes = allReagentVolumes
      
      // 保存更新后的gradient数据
      await StorageHelper.setJSON(STORAGE_KEYS.GRADIENT, gradientData)
      console.log('�?已更新gradient calculations')
      
      // gradientData state会自动触发图表更新
      setGradientData(gradientData)
    } catch (error) {
      console.error('�?重新计算gradient calculations失败:', error)
    }
  }

  // 计算百分比总和(仅用�?Mobile Phase A/B)
  const calculateTotal = (reagents: Reagent[]): number => {
    return reagents.reduce((sum, r) => sum + (r.percentage || 0), 0)
  }

  // 计算体积总和(仅用�?Sample PreTreatment)
  const calculateTotalVolume = (reagents: PreTreatmentReagent[]): number => {
    return reagents.reduce((sum, r) => sum + (r.volume || 0), 0)
  }

  // 验证百分比总和
  const validatePercentage = (reagents: Reagent[]): boolean => {
    const total = calculateTotal(reagents)
    return Math.abs(total - 100) < 0.01 // 允许浮点误差
  }

  // 获取百分比显示样�?
  const getPercentageStyle = (total: number) => {
    const isValid = Math.abs(total - 100) < 0.01
    return {
      color: isValid ? '#52c41a' : '#ff4d4f',
      fontWeight: 500,
      fontSize: 14
    }
  }

  // 计算柱状图数�?- Sample PreTreatment（需要乘以样品数�?
  const preTreatmentChartData = React.useMemo(() => {
    const chartData: any[] = []
    const currentSampleCount = 1
    
    preTreatmentReagents.forEach(reagent => {
      if (!reagent.name || reagent.volume <= 0) return
      
      const factor = factorsData.find(f => f.name === reagent.name)
      if (!factor) return
      
      const totalVolume = reagent.volume * currentSampleCount
      const mass = totalVolume * factor.density
      
      chartData.push({
        reagent: reagent.name,
        S: Number((mass * factor.safetyScore).toFixed(3)),
        H: Number((mass * factor.healthScore).toFixed(3)),
        E: Number((mass * factor.envScore).toFixed(3)),
        R: Number((mass * (factor.regeneration || 0)).toFixed(3)),
        D: Number((mass * factor.disposal).toFixed(3)),
        P: 0
      })
    })
    
    return chartData
  }, [preTreatmentReagents, factorsData])

  // 计算柱状图数�?- Mobile Phase (需�?HPLC Gradient 数据)
  const calculatePhaseChartData = (phaseType: 'A' | 'B') => {
    const chartData: any[] = []
    
    try {
      console.log(`📊 计算 Mobile Phase ${phaseType} 图表数据`)
      console.log('  - gradientData:', gradientData ? '存在' : '不存�?)
      
      if (!gradientData) {
        console.log('  �?没有gradient数据')
        return chartData
      }
      
      console.log('  - gradient数据类型:', Array.isArray(gradientData) ? '数组' : '对象')
      console.log('  - gradient对象�?', Object.keys(gradientData))
      console.log('  - 是否有calculations:', 'calculations' in gradientData)
      console.log('  - isValid标记:', gradientData.isValid)
      console.log('  - invalidReason:', gradientData.invalidReason)
      
      // 🔥 检查数据是否被标记为无效（所有流速为0�?
      if (gradientData.isValid === false || gradientData.calculations === null) {
        console.log('  ⚠️ Gradient数据无效（流速为0），返回特殊标记')
        return 'INVALID_FLOW_RATE' as any // 特殊标记
      }
      
      const phaseKey = phaseType === 'A' ? 'mobilePhaseA' : 'mobilePhaseB'
      const phaseData = gradientData.calculations?.[phaseKey]
      
      console.log(`  - ${phaseKey} 数据:`, phaseData)
      console.log(`  - ${phaseKey} components:`, phaseData?.components)
      
      if (!phaseData || !phaseData.components) {
        console.log(`  �?没有 ${phaseKey} �?components 数据`)
        return chartData
      }
      
      phaseData.components.forEach((component: any) => {
        if (!component.reagentName || component.volume <= 0) return
        
        const factor = factorsData.find(f => f.name === component.reagentName)
        if (!factor) {
          console.log(`  ⚠️ 找不到试�?${component.reagentName} 的factor数据`)
          return
        }
        
        const mass = component.volume * factor.density
        
        chartData.push({
          reagent: component.reagentName,
          S: Number((mass * factor.safetyScore).toFixed(3)),
          H: Number((mass * factor.healthScore).toFixed(3)),
          E: Number((mass * factor.envScore).toFixed(3)),
          R: Number((mass * (factor.regeneration || 0)).toFixed(3)),
          D: Number((mass * factor.disposal).toFixed(3)),
          P: 0
        })
      })
      
      console.log(`  �?生成�?${chartData.length} 个柱状图数据点`)
    } catch (error) {
      console.error('�?计算 Mobile Phase 图表数据失败:', error)
    }

    return chartData
  }

  // 使用 useMemo 缓存图表数据，当 gradient/factors 数据变化时重新计�?
  const phaseAChartData = React.useMemo(() => {
    console.log('🔄 重新计算 Phase A 图表数据')
    const data = calculatePhaseChartData('A')
    console.log('📈 Phase A 图表数据:', data)
    return data
  }, [gradientData, factorsData])
  
  const phaseBChartData = React.useMemo(() => {
    console.log('🔄 重新计算 Phase B 图表数据')
    const data = calculatePhaseChartData('B')
    console.log('📈 Phase B 图表数据:', data)
    return data
  }, [gradientData, factorsData])  
  
  // Calculate Power Factor (P) score
  const calculatePowerScore = (): number => {
    try {
      // Get instrument power in kW
      const powerMap = { low: 0.5, standard: 1.0, high: 2.0 }
      const P_inst = powerMap[instrumentType]
      
      console.log('�?计算P因子 - 仪器类型:', instrumentType, '功率:', P_inst, 'kW')
      
      // Get T_run from gradient data (totalTime)
      const gradientDataStr = await StorageHelper.getJSON(STORAGE_KEYS.GRADIENT)
      if (!gradientDataStr) {
        console.log('�?P因子计算失败: 没有gradient数据')
        return 0
      }
      
      const gradientData = JSON.parse(gradientDataStr)
      const T_run = gradientData.calculations?.totalTime || 0
      
      console.log('�?运行时间 T_run:', T_run, 'min')
      
      // Calculate energy consumption E_sample (kWh)
      const E_sample = P_inst * T_run / 60
      
      console.log('�?能�?E_sample:', E_sample, 'kWh')
      
      // Map E_sample to P score (0-100)
      let p_score = 0
      if (E_sample <= 0.1) {
        p_score = 0
      } else if (E_sample >= 1.5) {
        p_score = 100
      } else {
        p_score = ((E_sample - 0.1) / 1.4) * 100
      }
      
      console.log('�?P因子得分:', p_score)
      
      return p_score
    } catch (error) {
      console.error('�?Error calculating P score:', error)
      return 0
    }
  }

  // Calculate R (Regeneration) and D (Disposal) factors using normalization
  const calculateRDFactors = async (): Promise<{ instrument_r: number, instrument_d: number, pretreatment_r: number, pretreatment_d: number }> => {
    try {
      // Get factor data
      const factors = await StorageHelper.getJSON<any[]>(STORAGE_KEYS.FACTORS)
      if (!factors) return { 
        instrument_r: 0, 
        instrument_d: 0,
        pretreatment_r: 0,
        pretreatment_d: 0
      }

      // 阶段1：仪器分析试剂（流动相）
      let instrument_r_sum = 0
      let instrument_d_sum = 0

      console.log('🔍 开始计算仪器分析R/D因子...')

      const gradientData = await StorageHelper.getJSON(STORAGE_KEYS.GRADIENT)
      if (gradientData) {
        const calculations = gradientData.calculations
        
        if (calculations) {
          // Mobile Phase A
          if (calculations.mobilePhaseA?.components) {
            calculations.mobilePhaseA.components.forEach((component: any) => {
              const factor = factors.find((f: any) => f.name === component.reagentName)
              if (factor) {
                const mass = component.volume * factor.density
                const r_contribution = mass * (factor.regeneration || 0)
                const d_contribution = mass * factor.disposal
                instrument_r_sum += r_contribution
                instrument_d_sum += d_contribution
              }
            })
          }

          // Mobile Phase B
          if (calculations.mobilePhaseB?.components) {
            calculations.mobilePhaseB.components.forEach((component: any) => {
              const factor = factors.find((f: any) => f.name === component.reagentName)
              if (factor) {
                const mass = component.volume * factor.density
                const r_contribution = mass * (factor.regeneration || 0)
                const d_contribution = mass * factor.disposal
                instrument_r_sum += r_contribution
                instrument_d_sum += d_contribution
              }
            })
          }
        }
      }
      
      console.log(`  仪器分析累加结果: R_sum=${instrument_r_sum.toFixed(6)}, D_sum=${instrument_d_sum.toFixed(6)}`)

      // 阶段2：前处理试剂
      let pretreatment_r_sum = 0
      let pretreatment_d_sum = 0

      preTreatmentReagents.forEach(reagent => {
        if (!reagent.name || reagent.volume <= 0) return
        
        const factor = factors.find((f: any) => f.name === reagent.name)
        if (factor) {
          const totalVolume = reagent.volume
          const mass = totalVolume * factor.density
          pretreatment_r_sum += mass * (factor.regeneration || 0)
          pretreatment_d_sum += mass * factor.disposal
        }
      })

      // 分别归一化两个阶段（使用新公式）
      // 新公式: Score = min{45 × log₁₀(1 + 14 × Σ), 100}
      const instrument_r = instrument_r_sum > 0 ? Math.min(100, 45.0 * Math.log10(1 + 14 * instrument_r_sum)) : 0
      const instrument_d = instrument_d_sum > 0 ? Math.min(100, 45.0 * Math.log10(1 + 14 * instrument_d_sum)) : 0
      const pretreatment_r = pretreatment_r_sum > 0 ? Math.min(100, 45.0 * Math.log10(1 + 14 * pretreatment_r_sum)) : 0
      const pretreatment_d = pretreatment_d_sum > 0 ? Math.min(100, 45.0 * Math.log10(1 + 14 * pretreatment_d_sum)) : 0

      console.log('📊 R/D因子计算结果（分阶段）:', {
        仪器分析: {
          r_weighted_sum: instrument_r_sum.toFixed(3),
          d_weighted_sum: instrument_d_sum.toFixed(3),
          r_factor: instrument_r.toFixed(2),
          d_factor: instrument_d.toFixed(2)
        },
        前处理: {
          r_weighted_sum: pretreatment_r_sum.toFixed(3),
          d_weighted_sum: pretreatment_d_sum.toFixed(3),
          r_factor: pretreatment_r.toFixed(2),
          d_factor: pretreatment_d.toFixed(2)
        }
      })

      return { 
        instrument_r, 
        instrument_d,
        pretreatment_r,
        pretreatment_d
      }
    } catch (error) {
      console.error('Error calculating R/D factors:', error)
      return { 
        instrument_r: 0, 
        instrument_d: 0,
        pretreatment_r: 0,
        pretreatment_d: 0
      }
    }
  }

  // 计算完整评分（调用后端API�?
  const calculateFullScoreAPI = async () => {
    setIsCalculatingScore(true)
    try {
      // 1. 获取梯度数据
      const gradientDataStr = await StorageHelper.getJSON(STORAGE_KEYS.GRADIENT)
      if (!gradientDataStr) {
        message.error('请先在HPLC Gradient页面配置梯度程序')
        return
      }
      const gradientData = gradientDataStr
      
      // 2. 获取因子数据
      const factorsDataStr = await StorageHelper.getJSON(STORAGE_KEYS.FACTORS)
      if (!factorsDataStr) {
        message.error('请先在Factors页面配置试剂因子')
        return
      }
      const factors = factorsDataStr
      
      // 辅助函数：清理数字数�?
      const cleanNumber = (value: any, defaultValue: number = 0): number => {
        const num = parseFloat(String(value))
        if (isNaN(num) || !isFinite(num)) {
          return defaultValue
        }
        return num
      }
      
      // 辅助函数：清理数字数�?
      const cleanNumberArray = (arr: any[]): number[] => {
        return arr.map(v => cleanNumber(v, 0))
      }
      
      // 3. 构建试剂因子矩阵（映射字段名到后端期望的格式�?
      const buildFactorMatrix = (reagentNames: string[]) => {
        const matrix: any = {}
        reagentNames.forEach(name => {
          const factor = factors.find((f: any) => f.name === name)
          if (factor) {
            // 映射前端字段名到后端字段�?
            matrix[name] = {
              S1: cleanNumber(factor.releasePotential, 0),     // Release Potential
              S2: cleanNumber(factor.fireExplos, 0),            // Fire/Explosives
              S3: cleanNumber(factor.reactDecom, 0),            // Reaction/Decomposition
              S4: cleanNumber(factor.acuteToxicity, 0),         // Acute Toxicity
              H1: cleanNumber(factor.chronicToxicity, 0),       // Chronic Toxicity
              H2: cleanNumber(factor.irritation, 0),            // Irritation
              E1: cleanNumber(factor.persistency, 0),           // Persistency
              E2: cleanNumber(factor.airHazard, 0),             // Air Hazard (Emission)
              E3: cleanNumber(factor.waterHazard, 0)            // Water Hazard
            }
            
            // 🔍 诊断日志：检查因子值是否为0
            const hasZeroFactors = Object.entries(matrix[name]).filter(([key, val]) => val === 0)
            if (hasZeroFactors.length > 0) {
              console.warn(`⚠️ 试剂 "${name}" �?${hasZeroFactors.length} 个因子为0:`, {
                原始数据: {
                  releasePotential: factor.releasePotential,
                  fireExplos: factor.fireExplos,
                  reactDecom: factor.reactDecom,
                  acuteToxicity: factor.acuteToxicity,
                  chronicToxicity: factor.chronicToxicity,
                  irritation: factor.irritation,
                  persistency: factor.persistency,
                  airHazard: factor.airHazard,
                  waterHazard: factor.waterHazard
                },
                处理�? matrix[name],
                �?的因�? hasZeroFactors.map(([k, v]) => k).join(', ')
              })
            }
          } else {
            console.error(`�?找不到试�?"${name}" 的因子数据！`)
          }
        })
        return matrix
      }

      // 4. 获取试剂密度数据（从因子数据中）
      const getDensities = (reagentNames: string[]) => {
        const densities: any = {}
        reagentNames.forEach(name => {
          const factor = factors.find((f: any) => f.name === name)
          if (factor && factor.density) {
            densities[name] = factor.density
          } else {
            // 默认密度（水�?
            densities[name] = 1.0
          }
        })
        return densities
      }

      // 5. 构建仪器分析数据
      const instrumentReagents = [
        ...mobilePhaseA.map(r => r.name),
        ...mobilePhaseB.map(r => r.name)
      ].filter((name, index, self) => name && self.indexOf(name) === index)

      // 验证梯度数据结构
      if (!gradientData.steps || !Array.isArray(gradientData.steps)) {
        message.error('梯度数据格式错误：缺少steps数组')
        return
      }

      const instrumentComposition: any = {}
      instrumentReagents.forEach(reagent => {
        const percentages = gradientData.steps.map((step: any, index: number) => {
          // 计算该试剂在每个步骤的百分比
          // 注意：字段名�?phaseA �?phaseB，不�?compositionA �?compositionB
          const phaseAPercent = cleanNumber(step.phaseA, 0) / 100
          const phaseBPercent = cleanNumber(step.phaseB, 0) / 100
          
          const reagentInA = mobilePhaseA.find(r => r.name === reagent)
          const reagentInB = mobilePhaseB.find(r => r.name === reagent)
          
          const percentInA = reagentInA ? (cleanNumber(reagentInA.percentage, 0) / 100) : 0
          const percentInB = reagentInB ? (cleanNumber(reagentInB.percentage, 0) / 100) : 0
          
          const result = (phaseAPercent * percentInA + phaseBPercent * percentInB) * 100
          
          console.log(`🔍 步骤${index} - ${reagent}:`, {
            step: step,
            phaseA: step.phaseA,
            phaseB: step.phaseB,
            phaseAPercent,
            phaseBPercent,
            reagentInA,
            reagentInB,
            percentInA,
            percentInB,
            计算结果: result
          })
          
          return cleanNumber(result, 0)
        })
        
        // 确保数组中所有值都是有效数�?
        instrumentComposition[reagent] = cleanNumberArray(percentages)
      })

      // 验证时间点数�?
      const timePoints = cleanNumberArray(gradientData.steps.map((s: any) => s.time))
      
      // 提取曲线类型数据
      const curveTypes = gradientData.steps.map((s: any) => s.curve || 'linear')

      const instrumentData = {
        time_points: timePoints,
        composition: instrumentComposition,
        flow_rate: cleanNumber(gradientData.flowRate, 1.0),
        densities: getDensities(instrumentReagents),
        factor_matrix: buildFactorMatrix(instrumentReagents),
        curve_types: curveTypes  // 新增：发送曲线类�?
      }

      // 验证仪器数据
      console.log('📋 仪器分析数据验证:', {
        reagents: instrumentReagents,
        timePoints: timePoints,
        composition: instrumentComposition,
        flowRate: instrumentData.flow_rate
      })

      // 6. 构建前处理数�?
      const prepReagents = preTreatmentReagents.map(r => r.name).filter(Boolean)
      
      // 如果没有前处理试剂，使用空对�?
      const prepVolumes: any = {}
      const prepDensities: any = {}
      const prepFactorMatrix: any = {}
      
      if (prepReagents.length > 0) {
        preTreatmentReagents.forEach(r => {
          if (r.name) {
            // 前处理试剂体积（单个样品）
            const totalVolume = r.volume
            prepVolumes[r.name] = cleanNumber(totalVolume, 0)
            console.log(`🧪 ${r.name}: ${r.volume}ml/样品`)
          }
        })
        
        Object.assign(prepDensities, getDensities(prepReagents))
        Object.assign(prepFactorMatrix, buildFactorMatrix(prepReagents))
      } else {
        // 如果没有前处理试剂，创建一个虚拟试剂避免空数据错误
        prepVolumes['Water'] = 0.001  // 使用极小�?
        prepDensities['Water'] = 1.0
        const waterFactor = factors.find((f: any) => f.name === 'Water')
        if (waterFactor) {
          prepFactorMatrix['Water'] = {
            S1: waterFactor.releasePotential || 0,
            S2: waterFactor.fireExplos || 0,
            S3: waterFactor.reactDecom || 0,
            S4: waterFactor.acuteToxicity || 0,
            H1: waterFactor.chronicToxicity || 0,
            H2: waterFactor.irritation || 0,
            E1: waterFactor.persistency || 0,
            E2: waterFactor.airHazard || 0,
            E3: waterFactor.waterHazard || 0
          }
        } else {
          // 如果找不到Water，使用全0因子
          prepFactorMatrix['Water'] = {
            S1: 0, S2: 0, S3: 0, S4: 0,
            H1: 0, H2: 0,
            E1: 0, E2: 0, E3: 0
          }
        }
      }

      const prepData = {
        volumes: prepVolumes,
        densities: prepDensities,
        factor_matrix: prepFactorMatrix
      }

      // 验证前处理数�?
      console.log('📋 前处理数据验�?', {
        reagents: prepReagents,
        volumes: prepVolumes,
        densities: prepDensities
      })

      // 7. 计算P因子（分阶段，使用用户输入的能耗）
      const instrument_p_factor = cleanNumber(calculatePowerScore(instrumentEnergy), 0)
      const pretreatment_p_factor = cleanNumber(calculatePowerScore(pretreatmentEnergy), 0)

      // 8. 计算R和D因子（分阶段）
      const rdFactors = await calculateRDFactors()
      const instrument_r_factor = cleanNumber(rdFactors.instrument_r, 0)
      const instrument_d_factor = cleanNumber(rdFactors.instrument_d, 0)
      const pretreatment_r_factor = cleanNumber(rdFactors.pretreatment_r, 0)
      const pretreatment_d_factor = cleanNumber(rdFactors.pretreatment_d, 0)

      console.log('🎯 P/R/D因子计算结果（分阶段）:', {
        仪器分析: {
          P: instrument_p_factor,
          R: instrument_r_factor,
          D: instrument_d_factor
        },
        前处理: {
          P: pretreatment_p_factor,
          R: pretreatment_r_factor,
          D: pretreatment_d_factor
        }
      })

      // 9. 构建完整请求
      const requestData = {
        instrument: instrumentData,
        preparation: prepData,
        // 仪器分析阶段的P/R/D
        p_factor: instrument_p_factor,
        instrument_r_factor: instrument_r_factor,
        instrument_d_factor: instrument_d_factor,
        // 前处理阶段的P/R/D
        pretreatment_p_factor: pretreatment_p_factor,
        pretreatment_r_factor: pretreatment_r_factor,
        pretreatment_d_factor: pretreatment_d_factor,
        // 权重方案
        safety_scheme: safetyScheme,
        health_scheme: healthScheme,
        environment_scheme: environmentScheme,
        instrument_stage_scheme: instrumentStageScheme,
        prep_stage_scheme: prepStageScheme,
        final_scheme: finalScheme
      }

      console.log('📊 发送评分请�?', requestData)
      
      // 最终数据验�?
      const hasInvalidData = (
        !instrumentData.time_points.length ||
        Object.keys(instrumentData.composition).length === 0 ||
        Object.values(instrumentData.composition).some((arr: any) => 
          arr.some((val: any) => isNaN(val) || !isFinite(val))
        )
      )
      
      if (hasInvalidData) {
        message.error('数据验证失败：检测到无效数值，请检查梯度和试剂配置')
        console.error('�?数据验证失败，请求数�?', requestData)
        return
      }

      // 10. 调用后端API
      const response = await api.calculateFullScore(requestData)
      
      if (response.data.success) {
        setScoreResults(response.data.data)
        message.success('评分计算成功�?)
        
        // 详细日志输出
        console.log('�?评分计算成功！完整结�?', response.data.data)
        console.log('📊 小因子得�?(merged.sub_factors):', response.data.data.merged.sub_factors)
        console.log('🎯 最终总分 (Score�?:', response.data.data.final.score3)
        console.log('🔬 仪器阶段 (Score�?:', response.data.data.instrument.score1)
        console.log('🧪 前处理阶�?(Score�?:', response.data.data.preparation.score2)
        
        // 保存评分结果到localStorage
        await StorageHelper.setJSON(STORAGE_KEYS.SCORE_RESULTS, response.data.data)
        
        // 触发GraphPage更新
        window.dispatchEvent(new CustomEvent('scoreDataUpdated'))
      } else {
        message.error('评分计算失败: ' + response.data.message)
      }
    } catch (error: any) {
      console.error('评分计算错误:', error)
      console.error('错误详情:', error.response?.data)
      
      // 更好的错误信息显�?
      let errorMessage = '评分计算失败'
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage += ': ' + error.response.data.detail
        } else if (Array.isArray(error.response.data.detail)) {
          // Pydantic validation errors
          const errors = error.response.data.detail.map((e: any) => 
            `${e.loc.join('.')}: ${e.msg}`
          ).join('; ')
          errorMessage += ': ' + errors
        } else {
          errorMessage += ': ' + JSON.stringify(error.response.data.detail)
        }
      } else if (error.message) {
        errorMessage += ': ' + error.message
      }
      
      message.error(errorMessage, 8) // 显示8�?
    } finally {
      setIsCalculatingScore(false)
    }
  }
  
  // 确认提交
  const handleConfirm = () => {
    // 验证试剂名称
    const allReagents = [...preTreatmentReagents, ...mobilePhaseA, ...mobilePhaseB]
    if (allReagents.some(r => !r.name)) {
      message.error('请选择所有试�?)
      return
    }

    // 验证 Sample PreTreatment 的体�?
    const hasInvalidVolume = preTreatmentReagents.some(r => r.volume < 0)
    if (hasInvalidVolume) {
      message.error('Sample PreTreatment 的体积不能为�?)
      return
    }

    // 验证 Mobile Phase 百分�?
    if (!validatePercentage(mobilePhaseA)) {
      message.error('Mobile Phase A 的百分比总和必须�?100%')
      return
    }
    if (!validatePercentage(mobilePhaseB)) {
      message.error('Mobile Phase B 的百分比总和必须�?100%')
      return
    }

    // 准备后续计算所需的数据结�?
    const methodsData = {
      // 基础信息
      timestamp: new Date().toISOString(),
      
      // Sample PreTreatment 数据（直接使用体积，用于后续计算�?
      preTreatment: {
        reagents: preTreatmentReagents.map(r => ({
          reagentName: r.name,
          volume: r.volume  // 体积(ml)
        })),
        totalVolume: calculateTotalVolume(preTreatmentReagents)
      },
      
      // Mobile Phase A 数据（用于后续计算）
      mobilePhaseA: {
        reagents: mobilePhaseA.map(r => ({
          reagentName: r.name,
          percentage: r.percentage,
          ratio: r.percentage / 100
        })),
        totalPercentage: calculateTotal(mobilePhaseA)
      },
      
      // Mobile Phase B 数据（用于后续计算）
      mobilePhaseB: {
        reagents: mobilePhaseB.map(r => ({
          reagentName: r.name,
          percentage: r.percentage,
          ratio: r.percentage / 100
        })),
        totalPercentage: calculateTotal(mobilePhaseB)
      },
      
      // 计算参数（预留给后续使用�?
      calculationParams: {
        preTreatmentVolume: 0, // 将在后续计算中填�?
        phaseAVolume: 0,
        phaseBVolume: 0,
        totalVolume: 0,
        gradientSteps: [] // 梯度步骤
      }
    }

    // 保存�?localStorage（供后续模块使用�?
    localStorage.setItem('hplc_methods_data', JSON.stringify(methodsData))
    
    // 同时保存原始数据（便于编辑）
    await StorageHelper.setJSON(STORAGE_KEYS.METHODS, JSON.parse(JSON.stringify({
      preTreatmentReagents,
      mobilePhaseA,
      mobilePhaseB,
      instrumentType
    })))

    // 更新 Context
    updateMethodsData({
      preTreatmentReagents,
      mobilePhaseA,
      mobilePhaseB,
      instrumentType
    })
    setIsDirty(true)

    message.success('Data saved, navigating to HPLC Gradient Prg')
    
    // 触发自定义事件，通知其他组件数据已更�?
    window.dispatchEvent(new CustomEvent('methodsDataUpdated', { detail: methodsData }))
    
    // 跳转到下一�?
    navigate('/hplc-gradient')
  }

  // 渲染 Sample PreTreatment 试剂�?使用体积)
  const renderPreTreatmentGroup = () => {
    const totalVolume = calculateTotalVolume(preTreatmentReagents)
    
    return (
      <div className="reagent-section">
        <Title level={4}>Individual Sample PreTreatment</Title>
        {preTreatmentReagents.map((reagent) => (
          <Row gutter={8} key={reagent.id} style={{ marginBottom: 12 }}>
            <Col span={15}>
              <Select
                style={{ width: '100%' }}
                placeholder="Select reagent"
                value={reagent.name || null}
                onChange={(value) => updateReagent('preTreatment', reagent.id, 'name', value)}
                showSearch
                allowClear
                filterOption={selectFilterOption}
                notFoundContent="No reagent found"
                optionFilterProp="children"
                getPopupContainer={(trigger) => trigger.parentElement || document.body}
              >
                {availableReagents.map((name) => (
                  <Option key={name} value={name}>{name}</Option>
                ))}
              </Select>
            </Col>
            <Col span={9}>
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={0.1}
                placeholder="0.0"
                value={reagent.volume}
                onChange={(value) => updateReagent('preTreatment', reagent.id, 'volume', value || 0)}
                addonAfter="ml"
              />
            </Col>
          </Row>
        ))}
        
        <Row gutter={8} style={{ marginTop: 8 }}>
          <Col span={12}>
            <Button
              type="dashed"
              onClick={() => addReagent('preTreatment')}
              icon={<PlusOutlined />}
              style={{ width: '100%' }}
            >
              Add
            </Button>
          </Col>
          <Col span={12}>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteLastReagent('preTreatment')}
              disabled={preTreatmentReagents.length <= 1}
              style={{ width: '100%' }}
            >
              Delete
            </Button>
          </Col>
        </Row>
        
        <div style={{ marginTop: 12, color: '#52c41a', fontWeight: 500, fontSize: 14 }}>
          Total Volume: {totalVolume.toFixed(1)} ml
        </div>
      </div>
    )
  }

  // 渲染 Mobile Phase 试剂�?使用百分�?
  const renderReagentGroup = (
    title: string,
    reagents: Reagent[],
    type: 'phaseA' | 'phaseB'
  ) => {
    const total = calculateTotal(reagents)
    
    return (
      <div className="reagent-section">
        <Title level={4}>{title}</Title>
        {reagents.map((reagent) => (
          <Row gutter={8} key={reagent.id} style={{ marginBottom: 12 }}>
            <Col span={15}>
              <Select
                style={{ width: '100%' }}
                placeholder="Select reagent"
                value={reagent.name || null}
                onChange={(value) => updateReagent(type, reagent.id, 'name', value)}
                showSearch
                allowClear
                filterOption={selectFilterOption}
                notFoundContent="No reagent found"
                optionFilterProp="children"
                getPopupContainer={(trigger) => trigger.parentElement || document.body}
              >
                {availableReagents.map((name) => (
                  <Option key={name} value={name}>{name}</Option>
                ))}
              </Select>
            </Col>
            <Col span={9}>
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={100}
                step={0.1}
                placeholder="0.0"
                value={reagent.percentage}
                onChange={(value) => updateReagent(type, reagent.id, 'percentage', value || 0)}
                addonAfter="%"
              />
            </Col>
          </Row>
        ))}
        
        <Row gutter={8} style={{ marginTop: 8 }}>
          <Col span={12}>
            <Button
              type="dashed"
              onClick={() => addReagent(type)}
              icon={<PlusOutlined />}
              style={{ width: '100%' }}
            >
              Add
            </Button>
          </Col>
          <Col span={12}>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteLastReagent(type)}
              disabled={reagents.length <= 1}
              style={{ width: '100%' }}
            >
              Delete
            </Button>
          </Col>
        </Row>
        
        <div style={{ marginTop: 12, ...getPercentageStyle(total) }}>
          Current Total: {total.toFixed(1)}%
          {Math.abs(total - 100) >= 0.01 && (
            <span style={{ marginLeft: 8, fontSize: 12 }}>
              (Must be 100%)
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="methods-page">
      <Title level={2}>Methods</Title>

      {/* 上半部分：样品数 + 能源计算 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          {/* 左侧：能源计算 */}
          <Col span={12}>
            {/* 问题一 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                <span style={{ color: '#1890ff' }}>问题一�?/span> 仪器平台类型 (P<sub>inst</sub>)
                <Tooltip title={
                  <div>
                    <div><strong>A. 低能�?微型化系�?(0.5 kW)</strong></div>
                    <div>�?适用仪器：UPLC/UHPLC (UVPDA)、毛细管电泳 (CE)、Nano-LC</div>
                    <div>�?GEMAM 依据：对�?GEMAM 中评分较高的低能耗仪�?(Score 0.75-1.0)</div>
                    <div style={{ marginTop: 8 }}><strong>B. 标准能耗系�?(1.0 kW)</strong></div>
                    <div>�?适用仪器：常�?HPLC (UV/RI/FLD)、气相色�?GC (FID/TCD)、离子色�?(IC)</div>
                    <div>�?GEMAM 依据：对�?GEMAM 中评分中等的仪器 (Score 0.5)</div>
                    <div style={{ marginTop: 8 }}><strong>C. 高能�?制备型系�?(2.0 kW)</strong></div>
                    <div>�?适用仪器：液质联�?(LC-MS/MS)、气质联�?(GC-MS)、ICP-MS、ICP-OES</div>
                    <div>�?GEMAM 依据：对�?GEMAM 中评分最低的仪器 (Score 0.0-0.25)，明确指出了 LC、GC-四极杆检测器及高能耗的 ICP-MS</div>
                  </div>
                }>
                  <QuestionCircleOutlined style={{ marginLeft: 8, color: '#1890ff', cursor: 'pointer' }} />
                </Tooltip>
              </div>
              <Select
                style={{ width: '100%' }}
                value={instrumentType}
                onChange={(value) => setInstrumentType(value)}
              >
                <Option value="low">A. 低能�?微型化系�?(Low Energy / Miniaturized) - 0.5 kW</Option>
                <Option value="standard">B. 标准能耗系�?(Standard Energy) - 1.0 kW</Option>
                <Option value="high">C. 高能�?制备型系�?(High Energy / Hyphenated) - 2.0 kW</Option>
              </Select>
            </div>

            {/* 问题�?*/}
            <div>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                <span style={{ color: '#1890ff' }}>问题二：</span> 分析运行时间 (T<sub>run</sub>)
                <Tooltip title={
                  <div>
                    <div><strong>T<sub>run</sub></strong>：样品分析运行时�?/div>
                    <div style={{ marginTop: 8 }}>�?HPLC Gradient 页面根据梯度步骤自动计算得出</div>
                    <div style={{ marginTop: 8 }}>用于计算单次样品的能源消�?/div>
                  </div>
                }>
                  <QuestionCircleOutlined style={{ marginLeft: 8, color: '#1890ff', cursor: 'pointer' }} />
                </Tooltip>
              </div>
              <div style={{ 
                padding: '8px 12px', 
                background: '#fff',
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                marginBottom: 8
              }}>
                <span style={{ fontSize: 13, marginRight: 8, color: '#666' }}><strong>T<sub>run</sub></strong>:</span>
                {(() => {
                  const T_run = gradientData?.calculations?.totalTime || 0
                  return <span style={{ color: '#1890ff', fontWeight: 600, fontSize: 16 }}>{T_run.toFixed(2)} min</span>
                })()}
              </div>
              <div style={{ fontSize: 11, color: '#999' }}>
                �?�?HPLC Gradient 页面自动计算得出
              </div>
            </div>
          </Col>

          {/* 右侧：计算结�?*/}
          <Col span={12}>
            <div style={{ 
              background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%)', 
              padding: 16, 
              borderRadius: 8, 
              height: '100%',
              border: '1px solid #d6e4ff'
            }}>
              {/* 权重配置 */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#1890ff' }}>
                  �?权重配置方案
                  <Tooltip title={
                    <div>
                      <div><strong>不同权重方案的分配逻辑�?/strong></div>
                      <div style={{ marginTop: 8 }}>�?<strong>均衡�?/strong>：S=0.15, H=0.15, E=0.15, R=0.15, D=0.15, P=0.25</div>
                      <div>�?<strong>安全优先</strong>：S=0.30, H=0.30, E=0.10, R=0.10, D=0.10, P=0.10</div>
                      <div>�?<strong>环保优先</strong>：S=0.10, H=0.10, E=0.30, R=0.25, D=0.15, P=0.10</div>
                      <div>�?<strong>能效优先</strong>：S=0.10, H=0.10, E=0.15, R=0.15, D=0.10, P=0.40</div>
                      <div style={{ marginTop: 8, fontSize: 11, color: '#bbb' }}>总分 = S×w�?+ H×w�?+ E×w�?+ R×w�?+ D×w�?+ P×w�?/div>
                    </div>
                  }>
                    <QuestionCircleOutlined style={{ marginLeft: 6, cursor: 'pointer' }} />
                  </Tooltip>
                </div>
                <Select
                  value={weightScheme}
                  onChange={setWeightScheme}
                  style={{ width: '100%' }}
                  size="middle"
                >
                  <Option value="balanced">📦 均衡�?(Balanced) - 全面衡量各项指标</Option>
                  <Option value="safety">🛡�?安全优先 (Safety First) - 关注安全性与健康</Option>
                  <Option value="environmental">🌱 环保优先 (Eco-Friendly) - 关注环境影响</Option>
                  <Option value="efficiency">�?能效优先 (Energy Efficient) - 关注能源消�?/Option>
                </Select>
              </div>

              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#1890ff', borderBottom: '2px solid #1890ff', paddingBottom: 6 }}>
                📊 计算结果
              </div>
              {(() => {
                const T_run = gradientData?.calculations?.totalTime || 0
                const powerMap = { low: 0.5, standard: 1.0, high: 2.0 }
                const P_inst = powerMap[instrumentType]
                const E_sample = P_inst * T_run / 60
                const P_score = calculatePowerScore()

                return (
                    <div style={{ fontSize: 13 }}>
                      <div style={{ 
                        padding: 16, 
                        background: '#1890ff',
                        borderRadius: 6,
                        textAlign: 'center'
                      }}>
                        <div style={{ color: '#fff', fontSize: 12, marginBottom: 6 }}>P 分数 (P<sub>score</sub>)</div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                          {P_score.toFixed(2)}
                        </div>
                        <div style={{ fontSize: 10, color: '#e6f7ff', marginTop: 6 }}>
                          {E_sample <= 0.1 ? '(绿色基线：≤0.1 kWh)' : 
                           E_sample >= 1.5 ? '(红色警戒：≥1.5 kWh)' : 
                           '(线性区间：0.1~1.5 kWh)'}
                        </div>
                      </div>
                    </div>
                  )
              })()}
            </div>
          </Col>
        </Row>
      </Card>

      {/* 三个试剂部分 */}
      <Row gutter={16} style={{ marginLeft: 0, marginRight: 0 }}>
        <Col span={8}>
          <Card className="phase-card">
            {renderPreTreatmentGroup()}
            <div className="vine-divider vine-left"></div>
            <div className="chart-placeholder">
              {/* Sample PreTreatment 柱状�?*/}
              {(() => {
                const chartData = preTreatmentChartData
                if (chartData.length === 0) {
                  return (
                    <div style={{ height: 300, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                      Please enter reagent name and volume to view chart
                    </div>
                  )
                }
                
                const needsScroll = chartData.length > 2  // 改为超过2个才滚动
                const chartWidth = needsScroll ? chartData.length * 200 : '100%'  // 每个试剂200px�?
                
                // 计算自动最大�?
                const autoMax = Math.max(...chartData.flatMap(d => [d.S, d.H, d.E, d.R, d.D, d.P]))
                const currentMax = preTreatmentYMax !== null ? preTreatmentYMax : autoMax
                
                return (
                  <div className="chart-container">
                    {/* Y轴控制区 */}
                    <div className="y-axis-control">
                      <span>Y-axis Range: 0 - {currentMax.toFixed(2)}</span>
                      <input
                        type="range"
                        className="y-axis-slider"
                        min="0.01"
                        max={Math.max(autoMax * 2, 1)}
                        step="0.01"
                        value={currentMax}
                        onChange={(e) => setPreTreatmentYMax(parseFloat(e.target.value))}
                        title="Drag to adjust Y-axis range"
                      />
                      <button className="y-axis-reset-btn" onClick={() => setPreTreatmentYMax(null)}>
                        Auto
                      </button>
                    </div>
                    
                    {/* 图表区域 - 使用flex布局分离Y轴和柱状�?*/}
                    <div style={{ display: 'flex', alignItems: 'stretch' }}>
                      {/* 固定的Y轴区�?*/}
                      <div style={{ 
                        width: 60, 
                        flexShrink: 0,
                        position: 'relative',
                        paddingTop: 20,
                        paddingBottom: 5
                      }}>
                        {/* Y轴刻�?*/}
                        <div style={{ 
                          height: 240,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end',
                          paddingRight: 8,
                          fontSize: 10,
                          color: '#666'
                        }}>
                          <span>{currentMax.toFixed(1)}</span>
                          <span>{(currentMax * 0.75).toFixed(1)}</span>
                          <span>{(currentMax * 0.5).toFixed(1)}</span>
                          <span>{(currentMax * 0.25).toFixed(1)}</span>
                          <span>0</span>
                        </div>
                        {/* Y轴标�?*/}
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%) rotate(-90deg)',
                          fontSize: 12,
                          color: '#666',
                          whiteSpace: 'nowrap'
                        }}>
                          Score
                        </div>
                      </div>
                      
                      {/* 可滚动的柱状图和X轴标签区�?*/}
                      <div style={{ 
                        flex: 1,
                        overflowX: needsScroll ? 'auto' : 'hidden',
                        overflowY: 'hidden'
                      }} className="chart-scroll-area">
                        <div style={{ width: needsScroll ? chartWidth : '100%', minWidth: '100%' }}>
                          {/* 图表主体 - 隐藏Y�?*/}
                          <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="reagent" hide />
                              <YAxis hide domain={[0, currentMax]} allowDataOverflow={true} type="number" />
                              <RechartsTooltip 
                                contentStyle={{ fontSize: 12 }}
                                formatter={(value: any) => value.toFixed(4)}
                              />
                              <Bar dataKey="S" fill="#8884d8" name="Safety (S)" />
                              <Bar dataKey="H" fill="#82ca9d" name="Health Hazard (H)" />
                              <Bar dataKey="E" fill="#ffc658" name="Environmental Impact (E)" />
                              <Bar dataKey="R" fill="#ff8042" name="Recyclability (R)" />
                              <Bar dataKey="D" fill="#a4de6c" name="Disposal Difficulty (D)" />
                              <Bar dataKey="P" fill="#d0ed57" name="Energy Consumption (P)" />
                            </BarChart>
                          </ResponsiveContainer>
                          
                          {/* X轴标�?- 和图表一起滚�?*/}
                          <div style={{ 
                            display: 'flex',
                            height: 70,
                            alignItems: 'flex-start',
                            paddingTop: 8,
                            borderTop: '1px solid #e0e0e0'
                          }}>
                            {chartData.map((item, index) => (
                              <div
                                key={index}
                                style={{
                                  width: needsScroll ? 200 : `${100 / chartData.length}%`,
                                  textAlign: 'center',
                                  fontSize: 13,
                                  color: '#666',
                                  transform: 'rotate(-30deg)',
                                  transformOrigin: 'center top',
                                  whiteSpace: 'nowrap',
                                  marginTop: 20
                                }}
                              >
                                {item.reagent}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 固定Legend */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      gap: 16, 
                      fontSize: 10,
                      paddingTop: 12,
                      marginTop: 8,
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#8884d8', display: 'inline-block', borderRadius: 2 }}></span>
                        Safety (S)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#82ca9d', display: 'inline-block', borderRadius: 2 }}></span>
                        Health Hazard (H)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#ffc658', display: 'inline-block', borderRadius: 2 }}></span>
                        Environmental Impact (E)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#ff8042', display: 'inline-block', borderRadius: 2 }}></span>
                        Recyclability (R)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#a4de6c', display: 'inline-block', borderRadius: 2 }}></span>
                        Disposal Difficulty (D)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#d0ed57', display: 'inline-block', borderRadius: 2 }}></span>
                        Energy Consumption (P)
                      </span>
                    </div>
                    {/* Note for zero-impact reagents */}
                    {chartData.some(d => d.S === 0 && d.H === 0 && d.E === 0 && d.R === 0 && d.D === 0 && d.P === 0) && (
                      <div style={{ 
                        fontSize: 11, 
                        color: '#999', 
                        textAlign: 'center', 
                        marginTop: 8,
                        fontStyle: 'italic'
                      }}>
                        Note: Reagents with zero environmental impact (e.g., CO2, Water) appear on X-axis but have no visible bars
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card className="phase-card">
            {renderReagentGroup('Mobile Phase A', mobilePhaseA, 'phaseA')}
            <div className="vine-divider vine-middle"></div>
            <div className="chart-placeholder">
              {/* Mobile Phase A 柱状�?- 需�?HPLC Gradient 数据 */}
              {(() => {
                const chartData = phaseAChartData
                
                // 🔥 检查是否是无效流速标�?
                if (chartData === 'INVALID_FLOW_RATE') {
                  return (
                    <div style={{ 
                      height: 300, 
                      background: 'linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%)', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: '#ff4d4f',
                      padding: 20, 
                      textAlign: 'center',
                      border: '2px dashed #ff7875',
                      borderRadius: 8
                    }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
                      <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                        All Flow Rates are Zero!
                      </div>
                      <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
                        Cannot calculate volume when all flow rates are 0 ml/min
                      </div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        Please go to <strong>HPLC Gradient Prg</strong> page<br/>
                        and set at least one step with flow rate &gt; 0
                      </div>
                    </div>
                  )
                }
                
                if (chartData.length === 0) {
                  return (
                    <div style={{ height: 300, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', padding: 20, textAlign: 'center' }}>
                      Please complete HPLC Gradient setup first<br/>Chart will be displayed after gradient calculation
                    </div>
                  )
                }
                
                const needsScroll = chartData.length > 2  // 改为超过2个才滚动
                const chartWidth = needsScroll ? chartData.length * 200 : '100%'  // 每个试剂200px�?
                
                // 计算自动最大�?
                const autoMax = Math.max(...chartData.flatMap(d => [d.S, d.H, d.E, d.R, d.D, d.P]))
                const currentMax = phaseAYMax !== null ? phaseAYMax : autoMax
                
                return (
                  <div className="chart-container">
                    {/* Y轴控制区 */}
                    <div className="y-axis-control">
                      <span>Y-axis Range: 0 - {currentMax.toFixed(2)}</span>
                      <input
                        type="range"
                        className="y-axis-slider"
                        min="0.01"
                        max={Math.max(autoMax * 2, 1)}
                        step="0.01"
                        value={currentMax}
                        onChange={(e) => setPhaseAYMax(parseFloat(e.target.value))}
                        title="Drag to adjust Y-axis range"
                      />
                      <button className="y-axis-reset-btn" onClick={() => setPhaseAYMax(null)}>
                        Auto
                      </button>
                    </div>
                    
                    {/* 图表区域 - 使用flex布局分离Y轴和柱状�?*/}
                    <div style={{ display: 'flex', alignItems: 'stretch' }}>
                      {/* 固定的Y轴区�?*/}
                      <div style={{ 
                        width: 60, 
                        flexShrink: 0,
                        position: 'relative',
                        paddingTop: 20,
                        paddingBottom: 5
                      }}>
                        {/* Y轴刻�?*/}
                        <div style={{ 
                          height: 240,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end',
                          paddingRight: 8,
                          fontSize: 10,
                          color: '#666'
                        }}>
                          <span>{currentMax.toFixed(1)}</span>
                          <span>{(currentMax * 0.75).toFixed(1)}</span>
                          <span>{(currentMax * 0.5).toFixed(1)}</span>
                          <span>{(currentMax * 0.25).toFixed(1)}</span>
                          <span>0</span>
                        </div>
                        {/* Y轴标�?*/}
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%) rotate(-90deg)',
                          fontSize: 12,
                          color: '#666',
                          whiteSpace: 'nowrap'
                        }}>
                          Score
                        </div>
                      </div>
                      
                      {/* 可滚动的柱状图和X轴标签区�?*/}
                      <div style={{ 
                        flex: 1,
                        overflowX: needsScroll ? 'auto' : 'hidden',
                        overflowY: 'hidden'
                      }} className="chart-scroll-area">
                        <div style={{ width: needsScroll ? chartWidth : '100%', minWidth: '100%' }}>
                          {/* 图表主体 - 隐藏Y�?*/}
                          <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="reagent" hide />
                              <YAxis hide domain={[0, currentMax]} allowDataOverflow={true} type="number" />
                              <RechartsTooltip 
                                contentStyle={{ fontSize: 12 }}
                                formatter={(value: any) => value.toFixed(4)}
                              />
                              <Bar dataKey="S" fill="#8884d8" name="Safety (S)" />
                              <Bar dataKey="H" fill="#82ca9d" name="Health Hazard (H)" />
                              <Bar dataKey="E" fill="#ffc658" name="Environmental Impact (E)" />
                              <Bar dataKey="R" fill="#ff8042" name="Recyclability (R)" />
                              <Bar dataKey="D" fill="#a4de6c" name="Disposal Difficulty (D)" />
                              <Bar dataKey="P" fill="#d0ed57" name="Energy Consumption (P)" />
                            </BarChart>
                          </ResponsiveContainer>
                          
                          {/* X轴标�?- 和图表一起滚�?*/}
                          <div style={{ 
                            display: 'flex',
                            height: 70,
                            alignItems: 'flex-start',
                            paddingTop: 8,
                            borderTop: '1px solid #e0e0e0'
                          }}>
                            {chartData.map((item, index) => (
                              <div
                                key={index}
                                style={{
                                  width: needsScroll ? 200 : `${100 / chartData.length}%`,
                                  textAlign: 'center',
                                  fontSize: 13,
                                  color: '#666',
                                  transform: 'rotate(-30deg)',
                                  transformOrigin: 'center top',
                                  whiteSpace: 'nowrap',
                                  marginTop: 20
                                }}
                              >
                                {item.reagent}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 固定Legend */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      gap: 16, 
                      fontSize: 10,
                      paddingTop: 12,
                      marginTop: 8,
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#8884d8', display: 'inline-block', borderRadius: 2 }}></span>
                        Safety (S)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#82ca9d', display: 'inline-block', borderRadius: 2 }}></span>
                        Health Hazard (H)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#ffc658', display: 'inline-block', borderRadius: 2 }}></span>
                        Environmental Impact (E)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#ff8042', display: 'inline-block', borderRadius: 2 }}></span>
                        Recyclability (R)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#a4de6c', display: 'inline-block', borderRadius: 2 }}></span>
                        Disposal Difficulty (D)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#d0ed57', display: 'inline-block', borderRadius: 2 }}></span>
                        Energy Consumption (P)
                      </span>
                    </div>
                  </div>
                )
              })()}
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card className="phase-card">
            {renderReagentGroup('Mobile Phase B', mobilePhaseB, 'phaseB')}
            <div className="vine-divider vine-right"></div>
            <div className="chart-placeholder">
              {/* Mobile Phase B 柱状�?- 需�?HPLC Gradient 数据 */}
              {(() => {
                const chartData = phaseBChartData
                
                // 🔥 检查是否是无效流速标�?
                if (chartData === 'INVALID_FLOW_RATE') {
                  return (
                    <div style={{ 
                      height: 300, 
                      background: 'linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%)', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: '#ff4d4f',
                      padding: 20, 
                      textAlign: 'center',
                      border: '2px dashed #ff7875',
                      borderRadius: 8
                    }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
                      <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                        All Flow Rates are Zero!
                      </div>
                      <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
                        Cannot calculate volume when all flow rates are 0 ml/min
                      </div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        Please go to <strong>HPLC Gradient Prg</strong> page<br/>
                        and set at least one step with flow rate &gt; 0
                      </div>
                    </div>
                  )
                }
                
                if (chartData.length === 0) {
                  return (
                    <div style={{ height: 300, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', padding: 20, textAlign: 'center' }}>
                      Please complete HPLC Gradient setup first<br/>Chart will be displayed after gradient calculation
                    </div>
                  )
                }
                
                const needsScroll = chartData.length > 2  // 改为超过2个才滚动
                const chartWidth = needsScroll ? chartData.length * 200 : '100%'  // 每个试剂200px�?
                
                // 计算自动最大�?
                const autoMax = Math.max(...chartData.flatMap(d => [d.S, d.H, d.E, d.R, d.D, d.P]))
                const currentMax = phaseBYMax !== null ? phaseBYMax : autoMax
                
                return (
                  <div className="chart-container">
                    {/* Y轴控制区 */}
                    <div className="y-axis-control">
                      <span>Y-axis Range: 0 - {currentMax.toFixed(2)}</span>
                      <input
                        type="range"
                        className="y-axis-slider"
                        min="0.01"
                        max={Math.max(autoMax * 2, 1)}
                        step="0.01"
                        value={currentMax}
                        onChange={(e) => setPhaseBYMax(parseFloat(e.target.value))}
                        title="Drag to adjust Y-axis range"
                      />
                      <button className="y-axis-reset-btn" onClick={() => setPhaseBYMax(null)}>
                        Auto
                      </button>
                    </div>
                    
                    {/* 图表区域 - 使用flex布局分离Y轴和柱状�?*/}
                    <div style={{ display: 'flex', alignItems: 'stretch' }}>
                      {/* 固定的Y轴区�?*/}
                      <div style={{ 
                        width: 60, 
                        flexShrink: 0,
                        position: 'relative',
                        paddingTop: 20,
                        paddingBottom: 5
                      }}>
                        {/* Y轴刻�?*/}
                        <div style={{ 
                          height: 240,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end',
                          paddingRight: 8,
                          fontSize: 10,
                          color: '#666'
                        }}>
                          <span>{currentMax.toFixed(1)}</span>
                          <span>{(currentMax * 0.75).toFixed(1)}</span>
                          <span>{(currentMax * 0.5).toFixed(1)}</span>
                          <span>{(currentMax * 0.25).toFixed(1)}</span>
                          <span>0</span>
                        </div>
                        {/* Y轴标�?*/}
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%) rotate(-90deg)',
                          fontSize: 12,
                          color: '#666',
                          whiteSpace: 'nowrap'
                        }}>
                          Score
                        </div>
                      </div>
                      
                      {/* 可滚动的柱状图和X轴标签区�?*/}
                      <div style={{ 
                        flex: 1,
                        overflowX: needsScroll ? 'auto' : 'hidden',
                        overflowY: 'hidden'
                      }} className="chart-scroll-area">
                        <div style={{ width: needsScroll ? chartWidth : '100%', minWidth: '100%' }}>
                          {/* 图表主体 - 隐藏Y�?*/}
                          <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="reagent" hide />
                              <YAxis hide domain={[0, currentMax]} allowDataOverflow={true} type="number" />
                              <RechartsTooltip 
                                contentStyle={{ fontSize: 12 }}
                                formatter={(value: any) => value.toFixed(4)}
                              />
                              <Bar dataKey="S" fill="#8884d8" name="Safety (S)" />
                              <Bar dataKey="H" fill="#82ca9d" name="Health Hazard (H)" />
                              <Bar dataKey="E" fill="#ffc658" name="Environmental Impact (E)" />
                              <Bar dataKey="R" fill="#ff8042" name="Recyclability (R)" />
                              <Bar dataKey="D" fill="#a4de6c" name="Disposal Difficulty (D)" />
                              <Bar dataKey="P" fill="#d0ed57" name="Energy Consumption (P)" />
                            </BarChart>
                          </ResponsiveContainer>
                          
                          {/* X轴标�?- 和图表一起滚�?*/}
                          <div style={{ 
                            display: 'flex',
                            height: 70,
                            alignItems: 'flex-start',
                            paddingTop: 8,
                            borderTop: '1px solid #e0e0e0'
                          }}>
                            {chartData.map((item, index) => (
                              <div
                                key={index}
                                style={{
                                  width: needsScroll ? 200 : `${100 / chartData.length}%`,
                                  textAlign: 'center',
                                  fontSize: 13,
                                  color: '#666',
                                  transform: 'rotate(-30deg)',
                                  transformOrigin: 'center top',
                                  whiteSpace: 'nowrap',
                                  marginTop: 20
                                }}
                              >
                                {item.reagent}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 固定Legend */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      gap: 16, 
                      fontSize: 10,
                      paddingTop: 12,
                      marginTop: 8,
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#8884d8', display: 'inline-block', borderRadius: 2 }}></span>
                        Safety (S)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#82ca9d', display: 'inline-block', borderRadius: 2 }}></span>
                        Health Hazard (H)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#ffc658', display: 'inline-block', borderRadius: 2 }}></span>
                        Environmental Impact (E)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#ff8042', display: 'inline-block', borderRadius: 2 }}></span>
                        Recyclability (R)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#a4de6c', display: 'inline-block', borderRadius: 2 }}></span>
                        Disposal Difficulty (D)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, background: '#d0ed57', display: 'inline-block', borderRadius: 2 }}></span>
                        Energy Consumption (P)
                      </span>
                    </div>
                  </div>
                )
              })()}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 新增：权重方案配置和评分结果展示 */}
      <Card 
        title={
          <span>
            <TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} />
            绿色化学评分系统 (0-100分制)
          </span>
        }
        style={{ marginTop: 24 }}
      >
        <Row gutter={24}>
          {/* 左侧：色谱类型和权重方案选择 */}
          <Col span={12}>
            <Title level={4}>评分配置</Title>
            <Divider style={{ margin: '12px 0' }} />
            
            {/* 色谱类型选择（最重要，放在最前面�?*/}
            <div style={{ 
              marginBottom: 24, 
              padding: 16, 
              background: '#e6f7ff', 
              border: '1px solid #91d5ff',
              borderRadius: 4 
            }}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#0050b3' }}>
                <ExperimentOutlined style={{ marginRight: 8 }} />
                色谱类型选择
                <Tooltip title="不同色谱类型对应不同的废液基准质量，直接影响评分结果">
                  <QuestionCircleOutlined style={{ marginLeft: 8, color: '#1890ff', cursor: 'pointer' }} />
                </Tooltip>
              </div>
              <Select
                style={{ width: '100%' }}
                value={chromatographyType}
                onChange={setChromatographyType}
              >
                <Option value="UPCC">
                  <span>合相色谱 (UPCC)</span>
                  <span style={{ float: 'right', color: '#999', fontSize: 12 }}>基准: 4g</span>
                </Option>
                <Option value="UPLC">
                  <span>超高效液�?(UPLC)</span>
                  <span style={{ float: 'right', color: '#999', fontSize: 12 }}>基准: 4g</span>
                </Option>
                <Option value="HPLC_MS">
                  <span>常规HPLC (LC-MS)</span>
                  <span style={{ float: 'right', color: '#999', fontSize: 12 }}>基准: 10g</span>
                </Option>
                <Option value="HPLC_UV">
                  <span>常规HPLC (UV)</span>
                  <span style={{ float: 'right', color: '#999', fontSize: 12 }}>基准: 45g</span>
                </Option>
                <Option value="Semi_prep">
                  <span>半制备HPLC</span>
                  <span style={{ float: 'right', color: '#999', fontSize: 12 }}>基准: 250g</span>
                </Option>
              </Select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                💡 基准质量越小，相同试剂用量得分越�?
              </div>
            </div>

            <Title level={5} style={{ marginTop: 24 }}>权重方案配置</Title>
            
            {/* S/H/E因子权重 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                安全因子 (S) 权重方案
                <Tooltip title="S1-释放潜力, S2-火灾/爆炸, S3-反应/分解, S4-急性毒�?>
                  <QuestionCircleOutlined style={{ marginLeft: 8, color: '#1890ff', cursor: 'pointer' }} />
                </Tooltip>
              </div>
              <Select
                style={{ width: '100%' }}
                value={safetyScheme}
                onChange={setSafetyScheme}
              >
                <Option value="PBT_Balanced">PBT均衡�?(0.25/0.25/0.25/0.25)</Option>
                <Option value="Frontier_Focus">前沿聚焦�?(0.10/0.60/0.15/0.15)</Option>
                <Option value="Personnel_Exposure">人员曝露�?(0.10/0.20/0.20/0.50)</Option>
                <Option value="Material_Transport">物质运输�?(0.50/0.20/0.20/0.10)</Option>
              </Select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                健康因子 (H) 权重方案
                <Tooltip title="H1-慢性毒�? H2-刺激�?>
                  <QuestionCircleOutlined style={{ marginLeft: 8, color: '#1890ff', cursor: 'pointer' }} />
                </Tooltip>
              </div>
              <Select
                style={{ width: '100%' }}
                value={healthScheme}
                onChange={setHealthScheme}
              >
                <Option value="Occupational_Exposure">职业暴露�?(0.70/0.30)</Option>
                <Option value="Operation_Protection">操作防护�?(0.30/0.70)</Option>
                <Option value="Strict_Compliance">严格合规�?(0.90/0.10)</Option>
                <Option value="Absolute_Balance">绝对平衡�?(0.50/0.50)</Option>
              </Select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                环境因子 (E) 权重方案
                <Tooltip title="E1-持久�? E2-排放, E3-水体危害">
                  <QuestionCircleOutlined style={{ marginLeft: 8, color: '#1890ff', cursor: 'pointer' }} />
                </Tooltip>
              </div>
              <Select
                style={{ width: '100%' }}
                value={environmentScheme}
                onChange={setEnvironmentScheme}
              >
                <Option value="PBT_Balanced">PBT均衡�?(0.334/0.333/0.333)</Option>
                <Option value="Emission_Compliance">排放合规�?(0.10/0.80/0.10)</Option>
                <Option value="Deep_Impact">深远影响�?(0.10/0.10/0.80)</Option>
                <Option value="Degradation_Priority">降解优先�?(0.70/0.15/0.15)</Option>
              </Select>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* 阶段权重 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                仪器分析阶段权重方案 (6因子含P)
                <Tooltip title="包含S/H/E/P/R/D六个因子">
                  <QuestionCircleOutlined style={{ marginLeft: 8, color: '#1890ff', cursor: 'pointer' }} />
                </Tooltip>
              </div>
              <Select
                style={{ width: '100%' }}
                value={instrumentStageScheme}
                onChange={setInstrumentStageScheme}
              >
                <Option value="Balanced">均衡�?(S:0.25 H:0.15 E:0.15 P:0.25 R:0.10 D:0.10)</Option>
                <Option value="Safety_Priority">安全优先�?(S:0.50 H:0.20 E:0.10 P:0.10 R:0.05 D:0.05)</Option>
                <Option value="Eco_Priority">环保优先�?(S:0.15 H:0.10 E:0.45 P:0.10 R:0.10 D:0.10)</Option>
                <Option value="Efficiency_Priority">能效优先�?(S:0.10 H:0.10 E:0.10 P:0.40 R:0.15 D:0.15)</Option>
              </Select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                样品前处理阶段权重方�?(5因子无P)
                <Tooltip title="包含S/H/E/R/D五个因子">
                  <QuestionCircleOutlined style={{ marginLeft: 8, color: '#1890ff', cursor: 'pointer' }} />
                </Tooltip>
              </div>
              <Select
                style={{ width: '100%' }}
                value={prepStageScheme}
                onChange={setPrepStageScheme}
              >
                <Option value="Balanced">均衡�?(S:0.25 H:0.20 E:0.20 R:0.175 D:0.175)</Option>
                <Option value="Operation_Protection">操作防护�?(S:0.40 H:0.30 E:0.10 R:0.10 D:0.10)</Option>
                <Option value="Circular_Economy">循环经济�?(S:0.10 H:0.10 E:0.20 R:0.30 D:0.30)</Option>
                <Option value="Environmental_Tower">环境白塔�?(S:0.15 H:0.15 E:0.50 R:0.10 D:0.10)</Option>
              </Select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                最终汇总权重方�?
                <Tooltip title="仪器分析和样品前处理的权重分�?>
                  <QuestionCircleOutlined style={{ marginLeft: 8, color: '#1890ff', cursor: 'pointer' }} />
                </Tooltip>
              </div>
              <Select
                style={{ width: '100%' }}
                value={finalScheme}
                onChange={setFinalScheme}
              >
                <Option value="Standard">标准�?(仪器:0.6 前处�?0.4)</Option>
                <Option value="Complex_Prep">复杂前处理型 (仪器:0.3 前处�?0.7)</Option>
                <Option value="Direct_Online">直接进样�?(仪器:0.8 前处�?0.2)</Option>
                <Option value="Equal">等权�?(仪器:0.5 前处�?0.5)</Option>
              </Select>
            </div>

            <Button 
              type="primary" 
              block 
              size="large"
              onClick={calculateFullScoreAPI}
              loading={isCalculatingScore}
              style={{ marginTop: 16 }}
            >
              计算完整评分
            </Button>
          </Col>

          {/* 右侧：评分结果展�?*/}
          <Col span={12}>
            <Title level={4}>评分结果</Title>
            <Divider style={{ margin: '12px 0' }} />
            
            {scoreResults ? (
              <div>
                {/* 最终总分 */}
                <Card style={{ marginBottom: 16, background: '#f0f5ff', borderColor: '#1890ff' }}>
                  <Statistic
                    title="最终绿色化学总分 (Score�?"
                    value={scoreResults.final.score3}
                    precision={2}
                    suffix="/ 100"
                    valueStyle={{ color: '#1890ff', fontSize: 32, fontWeight: 'bold' }}
                  />
                </Card>

                {/* 阶段得分 */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Card>
                      <Statistic
                        title="仪器分析阶段 (Score�?"
                        value={scoreResults.instrument.score1}
                        precision={2}
                        suffix="/ 100"
                        valueStyle={{ color: '#52c41a', fontSize: 24 }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card>
                      <Statistic
                        title="样品前处理阶�?(Score�?"
                        value={scoreResults.preparation.score2}
                        precision={2}
                        suffix="/ 100"
                        valueStyle={{ color: '#faad14', fontSize: 24 }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* 大因子得�?*/}
                <Card title="大因子得�? size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={8}>
                    <Col span={8}>
                      <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>安全 (S)</div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: '#ff4d4f' }}>
                          {((scoreResults.instrument.major_factors.S + scoreResults.preparation.major_factors.S) / 2).toFixed(2)}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>健康 (H)</div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: '#fa8c16' }}>
                          {((scoreResults.instrument.major_factors.H + scoreResults.preparation.major_factors.H) / 2).toFixed(2)}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>环境 (E)</div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: '#52c41a' }}>
                          {((scoreResults.instrument.major_factors.E + scoreResults.preparation.major_factors.E) / 2).toFixed(2)}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>

                {/* 小因子得分（用于雷达图） */}
                <Card title="小因子得分（雷达图数据）" size="small" style={{ minHeight: 'auto' }}>
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>
                    这些数据将用于GraphPage的雷达图展示
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '8px'
                  }}>
                    {Object.entries(scoreResults.merged.sub_factors).map(([key, value]: [string, any]) => (
                      <div 
                        key={key}
                        style={{ 
                          padding: '6px 8px', 
                          background: '#fafafa', 
                          borderRadius: 4,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{key}:</span>
                        <span style={{ fontSize: 13, color: '#1890ff' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                color: '#999',
                background: '#fafafa',
                borderRadius: 8,
                border: '1px dashed #d9d9d9'
              }}>
                <TrophyOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                <div style={{ fontSize: 16, marginBottom: 8 }}>暂无评分结果</div>
                <div style={{ fontSize: 13 }}>请配置权重方案后点击"计算完整评分"按钮</div>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      {/* 确认按钮 */}
      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <Button type="primary" size="large" onClick={handleConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  )
}

export default MethodsPage

