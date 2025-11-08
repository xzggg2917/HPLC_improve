import numpy as np
import matplotlib.pyplot as plt
from matplotlib import rcParams

# 设置中文字体和样式
rcParams['font.sans-serif'] = ['SimHei', 'Arial Unicode MS', 'DejaVu Sans']
rcParams['axes.unicode_minus'] = False

# 定义参数
T = 10  # 总时长
y0 = 10  # 初始值
yT = 90  # 终值
t = np.linspace(0, T, 1000)  # 时间点

plt.figure(figsize=(15, 10))

# 1. 预先骤曲线 (Pre-step) —— 一开始就跳到终值
y1 = np.full_like(t, yT)
y1[0] = y0
plt.subplot(4, 3, 1)
plt.plot(t, y1, 'b-', linewidth=2)
plt.title('1. 预先骤曲线 (Pre-step)')
plt.xlabel('时间')
plt.ylabel('溶剂比例')
plt.grid(True, alpha=0.3)
plt.ylim(y0-5, yT+5)

# 2. 弱凸曲线 (Weak Convex)
y2 = yT - (yT - y0) * ((T - t) / T) ** 2
plt.subplot(4, 3, 2)
plt.plot(t, y2, 'r-', linewidth=2)
plt.title('2. 弱凸曲线 (Weak Convex)')
plt.xlabel('时间')
plt.ylabel('溶剂比例')
plt.grid(True, alpha=0.3)
plt.ylim(y0-5, yT+5)

# 3. 中凸曲线 (Medium Convex)
y3 = yT - (yT - y0) * ((T - t) / T) ** 3
plt.subplot(4, 3, 3)
plt.plot(t, y3, 'r-', linewidth=2)
plt.title('3. 中凸曲线 (Medium Convex)')
plt.xlabel('时间')
plt.ylabel('溶剂比例')
plt.grid(True, alpha=0.3)
plt.ylim(y0-5, yT+5)

# 4. 强凸曲线 (Strong Convex)
y4 = yT - (yT - y0) * ((T - t) / T) ** 4
plt.subplot(4, 3, 4)
plt.plot(t, y4, 'r-', linewidth=2)
plt.title('4. 强凸曲线 (Strong Convex)')
plt.xlabel('时间')
plt.ylabel('溶剂比例')
plt.grid(True, alpha=0.3)
plt.ylim(y0-5, yT+5)

# 5. 超凸曲线 (Ultra Convex)
y5 = yT - (yT - y0) * ((T - t) / T) ** 6
plt.subplot(4, 3, 5)
plt.plot(t, y5, 'r-', linewidth=2)
plt.title('5. 超凸曲线 (Ultra Convex)')
plt.xlabel('时间')
plt.ylabel('溶剂比例')
plt.grid(True, alpha=0.3)
plt.ylim(y0-5, yT+5)

# 6. 线性曲线 (Linear)
y6 = y0 + (yT - y0) * t / T
plt.subplot(4, 3, 6)
plt.plot(t, y6, 'g-', linewidth=2)
plt.title('6. 线性曲线 (Linear)')
plt.xlabel('时间')
plt.ylabel('溶剂比例')
plt.grid(True, alpha=0.3)
plt.ylim(y0-5, yT+5)

# 7. 弱凹曲线 (Weak Concave)
y7 = y0 + (yT - y0) * (t / T) ** 2
plt.subplot(4, 3, 7)
plt.plot(t, y7, 'purple', linewidth=2)
plt.title('7. 弱凹曲线 (Weak Concave)')
plt.xlabel('时间')
plt.ylabel('溶剂比例')
plt.grid(True, alpha=0.3)
plt.ylim(y0-5, yT+5)

# 8. 中凹曲线 (Medium Concave)
y8 = y0 + (yT - y0) * (t / T) ** 3
plt.subplot(4, 3, 8)
plt.plot(t, y8, 'purple', linewidth=2)
plt.title('8. 中凹曲线 (Medium Concave)')
plt.xlabel('时间')
plt.ylabel('溶剂比例')
plt.grid(True, alpha=0.3)
plt.ylim(y0-5, yT+5)

# 9. 强凹曲线 (Strong Concave)
y9 = y0 + (yT - y0) * (t / T) ** 4
plt.subplot(4, 3, 9)
plt.plot(t, y9, 'purple', linewidth=2)
plt.title('9. 强凹曲线 (Strong Concave)')
plt.xlabel('时间')
plt.ylabel('溶剂比例')
plt.grid(True, alpha=0.3)
plt.ylim(y0-5, yT+5)

# 10. 超凹曲线 (Ultra Concave)
y10 = y0 + (yT - y0) * (t / T) ** 6
plt.subplot(4, 3, 10)
plt.plot(t, y10, 'purple', linewidth=2)
plt.title('10. 超凹曲线 (Ultra Concave)')
plt.xlabel('时间')
plt.ylabel('溶剂比例')
plt.grid(True, alpha=0.3)
plt.ylim(y0-5, yT+5)

# 11. 后步骤曲线 (Post-step) —— 一直保持初值，最后一刻跳到终值
y11 = np.full_like(t, y0)
y11[-1] = yT
plt.subplot(4, 3, 11)
plt.plot(t, y11, 'orange', linewidth=2)
plt.title('11. 后步骤曲线 (Post-step)')
plt.xlabel('时间')
plt.ylabel('溶剂比例')
plt.grid(True, alpha=0.3)
plt.ylim(y0-5, yT+5)

# 添加图例说明曲线类型
plt.subplot(4, 3, 12)
plt.axis('off')
legend_text = "曲线类型说明:\n\n" \
             "蓝色: 步骤曲线\n" \
             "红色: 凸形曲线\n" \
             "绿色: 线性曲线\n" \
             "紫色: 凹形曲线\n" \
             "橙色: 后步骤曲线\n\n" \
             "参数: T=10, y₀=10, y_T=90"
plt.text(0.1, 0.5, legend_text, fontsize=12, verticalalignment='center')

plt.tight_layout()
plt.suptitle('11种梯度曲线同图对比', fontsize=16, y=0.995)

# 保存图片
plt.savefig('frontend/public/gradient_curves.png', dpi=150, bbox_inches='tight')
print("图片已保存到: frontend/public/gradient_curves.png")
plt.show()