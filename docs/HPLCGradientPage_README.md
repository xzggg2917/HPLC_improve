# HPLC Gradient Programming 页面说明

## 功能概述
该页面实现了 HPLC 梯度编程功能,允许用户创建和可视化色谱梯度程序。

## 主要功能

### 1. 梯度步骤表格
- **Step No**: 自动编号,从 0 开始
- **Time**: 时间点(分钟或秒)
- **Mobile Phase A (%)**: 流动相 A 的百分含量 (0-100%)
- **Flow rate (ml/min)**: 流速,用于计算体积(体积 = 流速 × 时间)
- **Curve**: 曲线类型,定义从上一步到当前步的过渡曲线

### 2. 曲线类型(基于 curve.py)
1. **预先骤曲线 (Pre-step)**: 立即跳到目标值
2. **弱凸曲线 (Weak Convex)**: y = y₁ - (y₁-y₀)×(1-t/T)²
3. **中凸曲线 (Medium Convex)**: y = y₁ - (y₁-y₀)×(1-t/T)³
4. **强凸曲线 (Strong Convex)**: y = y₁ - (y₁-y₀)×(1-t/T)⁴
5. **超凸曲线 (Ultra Convex)**: y = y₁ - (y₁-y₀)×(1-t/T)⁶
6. **线性曲线 (Linear)**: y = y₀ + (y₁-y₀)×(t/T)
7. **弱凹曲线 (Weak Concave)**: y = y₀ + (y₁-y₀)×(t/T)²
8. **中凹曲线 (Medium Concave)**: y = y₀ + (y₁-y₀)×(t/T)³
9. **强凹曲线 (Strong Concave)**: y = y₀ + (y₁-y₀)×(t/T)⁴
10. **超凹曲线 (Ultra Concave)**: y = y₀ + (y₁-y₀)×(t/T)⁶
11. **后步骤曲线 (Post-step)**: 保持初值直到最后一刻跳变

### 3. Mobile Phase 关系
- Mobile Phase A + Mobile Phase B = 100%
- 用户只需输入 Mobile Phase A 的百分比
- Mobile Phase B 自动计算并显示在图表中

### 4. 操作按钮
- **Add**: 添加新的梯度步骤(追加到末尾)
- **Delete**: 删除最后一个梯度步骤(至少保留1个)
- **确定**: 验证并保存梯度程序到 localStorage

### 5. 梯度曲线预览
- 实时显示 Mobile Phase A 和 B 的变化曲线
- X 轴: 时间 (t/s)
- Y 轴: 百分比 (%)
- 蓝色线: Mobile Phase A
- 绿色线: Mobile Phase B

## 数据验证
- 时间必须递增(后续步骤时间 ≥ 前一步骤时间)
- Mobile Phase A 必须在 0-100% 范围内
- 流速不能为负
- 时间不能为负

## 数据存储
保存在 `localStorage` 的 `hplc_gradient_data` 键中,包含:
- steps: 所有步骤的详细信息
- chartData: 图表绘制数据
- timestamp: 保存时间戳

## 与 Methods 页面的关联
- 可以读取 Methods 页面中定义的 Mobile Phase A 组成
- 后续可以基于 Methods 数据进行绿色化学评分计算
