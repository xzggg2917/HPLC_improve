import React, { useEffect, useRef, useState } from 'react'

interface FanChartProps {
  scores: {
    S: number
    H: number
    E: number
    R: number
    D: number
    P: number
  }
  width?: number
  height?: number
}

const FanChart: React.FC<FanChartProps> = ({ scores, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 })

  // 自适应容器大小 - 优化缩放稳定性
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        // 固定大小,不随窗口缩放而变化
        const size = Math.min(containerWidth, 800)
        setDimensions({ width: size, height: size })
      }
    }

    // 初始化大小
    updateSize()
    
    // 仅在窗口大小真正改变时更新,不响应浏览器缩放
    let resizeTimer: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(updateSize, 150)
    }
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)
    }
  }, [])

  const canvasWidth = width || dimensions.width
  const canvasHeight = height || dimensions.height

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // === 扇子参数（精确匹配 Picture1.py）===
    const scale = Math.min(canvasWidth, canvasHeight) / 3  // 缩放因子（从 /4 增加到 /3，放大）
    const centerX = canvasWidth / 2
    const centerY = canvasHeight * 0.88  // 扇子中心位置（与雷达图对齐）
    
    // Picture1.py 的参数
    const fanRadius = 1.5 * scale
    const innerRadius = 0.5 * scale
    const totalAngle = 120
    const startAngle = 30
    const anglePerSection = totalAngle / 6
    const handleLength = 0.7* scale
    
    // 关键：扇柄底部半径可以是负数！
    const handleBottomY = innerRadius - handleLength

    // 因子顺序（从左到右）- 匹配 Picture1.py
    const factorOrder = ['P', 'D', 'R', 'E', 'H', 'S']
    const factorLabels: { [key: string]: string } = {
      'S': 'S',
      'H': 'H',
      'E': 'E',
      'R': 'R',
      'D': 'D',
      'P': 'P'
    }

    const factorIcons: { [key: string]: string } = {
      'P': '⚡',
      'D': '🗑️',
      'R': '♻️',
      'E': '🌍',
      'H': '⚖️',
      'S': '💥'
    }

    // 转换角度为弧度
    const toRad = (deg: number) => (deg * Math.PI) / 180

    // 辅助函数：计算极坐标位置（Canvas坐标系，Y轴向下）
    const polarToCanvas = (r: number, angleDeg: number) => {
      const rad = toRad(angleDeg)
      return {
        x: centerX + r * Math.cos(rad),
        y: centerY - r * Math.sin(rad)  // Y轴向下，所以减
      }
    }

    // === 1. 绘制扇骨（底层，zorder=2）===
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'

    for (let i = 0; i < 7; i++) {
      const angle = startAngle + i * anglePerSection
      
      const bottom = polarToCanvas(handleBottomY, angle)
      const top = polarToCanvas(fanRadius, angle)

      ctx.beginPath()
      ctx.moveTo(bottom.x, bottom.y)
      ctx.lineTo(top.x, top.y)
      ctx.stroke()
    }

    // === 2. 绘制6个扇面区域（浅绿色，zorder=3）===
    for (let i = 0; i < 6; i++) {
      const angleStart = startAngle + i * anglePerSection
      const angleEnd = angleStart + anglePerSection

      ctx.beginPath()
      
      // 移动到内圆弧起点
      const innerStart = polarToCanvas(innerRadius, angleStart)
      ctx.moveTo(innerStart.x, innerStart.y)
      
      // 外圆弧（从 angleStart 到 angleEnd）
      ctx.arc(centerX, centerY, fanRadius, -toRad(angleStart), -toRad(angleEnd), true)
      
      // 连线到内圆弧
      const innerEnd = polarToCanvas(innerRadius, angleEnd)
      ctx.lineTo(innerEnd.x, innerEnd.y)
      
      // 内圆弧（从 angleEnd 回到 angleStart）
      ctx.arc(centerX, centerY, innerRadius, -toRad(angleEnd), -toRad(angleStart), false)
      
      ctx.closePath()

      ctx.fillStyle = '#90EE90'  // 浅绿色
      ctx.fill()
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2.5
      ctx.stroke()
    }

    // === 3. 绘制扇柄底部区域（白色扇形，zorder=4）===
    // Picture1.py 的 Wedge: 外半径=inner_radius(0.5), width=handle_length(0.7)
    // 内半径 = 0.5 - 0.7 = -0.2 (负数表示在圆心对侧)
    // Canvas 实现：画两个同心圆弧 + 连线
    ctx.beginPath()
    
    const absHandleBottomY = Math.abs(handleBottomY)
    
    // 起点：内圆左端（30°，在上方）
    let angle1 = -toRad(startAngle)
    ctx.moveTo(
      centerX + innerRadius * Math.cos(angle1),
      centerY + innerRadius * Math.sin(angle1)
    )
    
    // 1. 内圆弧（30° -> 150°，逆时针）
    let angle2 = -toRad(startAngle + totalAngle)
    ctx.arc(centerX, centerY, innerRadius, angle1, angle2, true)
    
    // 2. 直线到扇柄底部圆弧左端（330° = 150° + 180°，在下方）
    // 注意：Canvas 的 Y 轴向下，330° 的 sin 是负数，要加到 centerY 上才向下
    let bottomAngle1 = -toRad(startAngle + totalAngle + 180)  // -330° = -5.759 rad
    ctx.lineTo(
      centerX + absHandleBottomY * Math.cos(bottomAngle1),
      centerY + absHandleBottomY * Math.sin(bottomAngle1)
    )
    
    // 3. 扇柄底部圆弧（330° -> 210°，顺时针，在圆心下方）
    let bottomAngle2 = -toRad(startAngle + 180)  // -210°
    ctx.arc(centerX, centerY, absHandleBottomY, bottomAngle1, bottomAngle2, false)
    
    // 4. closePath 自动连回起点
    ctx.closePath()

    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2.5
    ctx.stroke()

    // === 4. 重新绘制中间5根扇骨在扇柄上（zorder=5）===
    // 这5根扇骨从内圆弧(innerRadius)延伸到扇柄底部圆弧(absHandleBottomY)
    // 扇柄底部在圆心下方，角度 = 原角度 + 180°
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1.5

    for (let i = 1; i < 6; i++) {
      const angle = startAngle + i * anglePerSection
      
      // 顶部：内圆弧上的点
      const topAngle = -toRad(angle)
      const topX = centerX + innerRadius * Math.cos(topAngle)
      const topY = centerY + innerRadius * Math.sin(topAngle)
      
      // 底部：扇柄底部圆弧上的点（角度+180°，在圆心下方）
      const bottomAngle = -toRad(angle + 180)
      const bottomX = centerX + absHandleBottomY * Math.cos(bottomAngle)
      const bottomY = centerY + absHandleBottomY * Math.sin(bottomAngle)

      ctx.beginPath()
      ctx.moveTo(bottomX, bottomY)
      ctx.lineTo(topX, topY)
      ctx.stroke()
    }

    // === 5. 在每个扇面上添加图标和文字（zorder=6）===
    for (let i = 0; i < 6; i++) {
      const angleMid = startAngle + (i + 0.5) * anglePerSection
      const factor = factorOrder[i]

      // 图标位置（扇面上边缘偏下，25%位置）
      const iconR = innerRadius + (fanRadius - innerRadius) * 0.25
      const iconPos = polarToCanvas(iconR, angleMid)

      // 绘制图标（缩小）
      ctx.font = '35px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#000'
      ctx.fillText(factorIcons[factor], iconPos.x, iconPos.y)

      // 文字位置（扇面顶部边缘，93%位置）
      const textR = fanRadius * 0.93
      const textPos = polarToCanvas(textR, angleMid)

      // 绘制文字（无背景框）
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#000'
      ctx.fillText(factorLabels[factor], textPos.x, textPos.y)
    }

  }, [scores, canvasWidth, canvasHeight])

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
      />
    </div>
  )
}

export default FanChart
