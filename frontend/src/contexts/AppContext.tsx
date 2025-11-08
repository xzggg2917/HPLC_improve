import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// 定义数据类型
export interface Reagent {
  id: string
  name: string
  percentage: number
}

export interface PreTreatmentReagent {
  id: string
  name: string
  volume: number
}

export interface ReagentFactor {
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

export interface GradientStep {
  id: string
  stepNo: number
  time: number
  phaseA: number
  phaseB: number
  flowRate: number
  curve: string
}

export interface AppData {
  version: string
  lastModified: string
  methods: {
    sampleCount: number | null
    preTreatmentReagents: PreTreatmentReagent[]
    mobilePhaseA: Reagent[]
    mobilePhaseB: Reagent[]
  }
  factors: ReagentFactor[]
  gradient: GradientStep[]
}

interface AppContextType {
  // 数据状态
  data: AppData
  updateMethodsData: (methodsData: AppData['methods']) => void
  updateFactorsData: (factorsData: ReagentFactor[]) => void
  updateGradientData: (gradientData: GradientStep[]) => void
  setAllData: (newData: AppData) => void
  
  // 文件状态
  fileHandle: any | null
  setFileHandle: (handle: any | null) => void
  currentFilePath: string | null
  setCurrentFilePath: (path: string | null) => void
  
  // 保存状态
  isDirty: boolean
  setIsDirty: (dirty: boolean) => void
  
  // 导出当前完整数据
  exportData: () => AppData
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const getDefaultData = (): AppData => ({
  version: '1.0.0',
  lastModified: new Date().toISOString(),
  methods: {
    sampleCount: null,
    preTreatmentReagents: [{ id: Date.now().toString(), name: '', volume: 0 }],
    mobilePhaseA: [{ id: Date.now().toString() + '1', name: '', percentage: 0 }],
    mobilePhaseB: [{ id: Date.now().toString() + '2', name: '', percentage: 0 }]
  },
  factors: [],
  gradient: []
})

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(getDefaultData())
  const [fileHandle, setFileHandle] = useState<any | null>(null)
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  // 从localStorage加载初始数据
  useEffect(() => {
    try {
      // 尝试从localStorage恢复数据
      const savedMethodsRaw = localStorage.getItem('hplc_methods_raw')
      const savedFactors = localStorage.getItem('hplc_factors_data')
      const savedGradient = localStorage.getItem('hplc_gradient_data')
      
      const loadedData: AppData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        methods: savedMethodsRaw ? JSON.parse(savedMethodsRaw) : getDefaultData().methods,
        factors: savedFactors ? JSON.parse(savedFactors) : [],
        gradient: savedGradient ? JSON.parse(savedGradient) : []
      }
      
      setData(loadedData)
    } catch (error) {
      console.error('加载初始数据失败:', error)
    }
  }, [])

  const updateMethodsData = (methodsData: AppData['methods']) => {
    setData(prev => ({
      ...prev,
      methods: methodsData,
      lastModified: new Date().toISOString()
    }))
    setIsDirty(true)
    
    // 同步到localStorage
    localStorage.setItem('hplc_methods_raw', JSON.stringify(methodsData))
  }

  const updateFactorsData = (factorsData: ReagentFactor[]) => {
    setData(prev => ({
      ...prev,
      factors: factorsData,
      lastModified: new Date().toISOString()
    }))
    setIsDirty(true)
    
    // 同步到localStorage
    localStorage.setItem('hplc_factors_data', JSON.stringify(factorsData))
  }

  const updateGradientData = (gradientData: GradientStep[]) => {
    setData(prev => ({
      ...prev,
      gradient: gradientData,
      lastModified: new Date().toISOString()
    }))
    setIsDirty(true)
    
    // 同步到localStorage
    localStorage.setItem('hplc_gradient_data', JSON.stringify(gradientData))
  }

  const setAllData = (newData: AppData) => {
    setData(newData)
    // 同步到localStorage
    localStorage.setItem('hplc_methods_raw', JSON.stringify(newData.methods))
    localStorage.setItem('hplc_factors_data', JSON.stringify(newData.factors))
    localStorage.setItem('hplc_gradient_data', JSON.stringify(newData.gradient))
  }

  const exportData = (): AppData => {
    return {
      ...data,
      lastModified: new Date().toISOString()
    }
  }

  return (
    <AppContext.Provider
      value={{
        data,
        updateMethodsData,
        updateFactorsData,
        updateGradientData,
        setAllData,
        fileHandle,
        setFileHandle,
        currentFilePath,
        setCurrentFilePath,
        isDirty,
        setIsDirty,
        exportData
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
