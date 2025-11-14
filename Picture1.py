# -*- coding: utf-8 -*-
"""
简洁扇子可视化 - 6个扇面区域
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Wedge, Polygon, Arc
from matplotlib.offsetbox import OffsetImage, AnnotationBbox
import numpy as np
from PIL import Image
import os

plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei', 'SimSun']
plt.rcParams['axes.unicode_minus'] = False


def create_simple_fan():
    """创建简洁的扇子 - 6个扇面区域"""
    
    fig, ax = plt.subplots(1, 1, figsize=(12, 8), facecolor='white')
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_xlim(-2, 2)
    ax.set_ylim(-0.8, 1.8)
    
    # 扇子参数
    fan_radius = 1.5
    inner_radius = 0.5  # 往上提，从0.2增加到0.5
    total_angle = 120
    start_angle = 30
    angle_per_section = total_angle / 6
    handle_length = 0.7  # 扇柄长度，让交汇点下移
    
    # 因子顺序（从左到右：P, D, R, E, H, S）
    factors = ['P', 'D', 'R', 'E', 'H', 'S']
    factor_names = {
        'S': 'Safety\n安全',
        'H': 'Health\n健康', 
        'E': 'Environment\n环境',
        'R': 'Recyclability\n回收',
        'D': 'Disposal\n处置',
        'P': 'Power\n能耗'
    }
    
    # 对应的emoji图标（作为图片的替代）
    factor_icons = {
        'P': '⚡',  # 能耗 - 闪电
        'D': '🗑️',  # 处置 - 垃圾桶
        'R': '♻️',  # 回收 - 回收标志
        'E': '🌍',  # 环境 - 地球
        'H': '⚖️',  # 健康 - 天平/体重秤
        'S': '💥'   # 安全 - 爆炸
    }
    
    # 1. 先绘制扇骨（在扇面后面，zorder较低）
    handle_bottom_y = inner_radius - handle_length  # 扇柄底部Y坐标
    
    for i in range(7):
        angle = start_angle + i * angle_per_section
        angle_rad = np.radians(angle)
        
        # 从扇柄底部到扇面顶部的直线（全部延伸到底）
        x_bottom = handle_bottom_y * np.cos(angle_rad)
        y_bottom = handle_bottom_y * np.sin(angle_rad)
        x_top = fan_radius * np.cos(angle_rad)
        y_top = fan_radius * np.sin(angle_rad)
        
        ax.plot(
            [x_bottom, x_top],
            [y_bottom, y_top],
            color='black',
            linewidth=2,
            solid_capstyle='round',
            zorder=2  # 在扇面后面
        )
    
    # 2. 绘制6个扇面区域（绿色，在扇骨上面）
    # 从左到右：P, D, R, E, H, S
    factor_labels = ['P', 'D', 'R', 'E', 'H', 'S']
    
    for i in range(6):
        angle_start = start_angle + i * angle_per_section
        angle_end = angle_start + angle_per_section
        
        # 使用Wedge绘制扇形（绿色填充）
        wedge = Wedge(
            (0, 0),
            fan_radius,
            angle_start,
            angle_end,
            width=fan_radius - inner_radius,
            facecolor='#90EE90',  # 浅绿色
            edgecolor='black',
            linewidth=2.5,
            zorder=3  # 在扇骨上面
        )
        ax.add_patch(wedge)
        
        # 在扇面上添加图标和文字
        angle_mid = (angle_start + angle_end) / 2
        angle_mid_rad = np.radians(angle_mid)
        
        # 获取当前扇面对应的因子
        current_factor = factors[i]
        
        # 1. 图标位置：扇面中心偏下（60%位置）
        icon_r = inner_radius + (fan_radius - inner_radius) * 0.5
        icon_x = icon_r * np.cos(angle_mid_rad)
        icon_y = icon_r * np.sin(angle_mid_rad)
        
        ax.text(
            icon_x, icon_y,
            factor_icons[current_factor],
            fontsize=50,
            ha='center',
            va='center',
            zorder=6
        )
        
        # 2. 文字位置：扇面顶部边缘（95%位置）
        text_r = fan_radius * 0.93
        text_x = text_r * np.cos(angle_mid_rad)
        text_y = text_r * np.sin(angle_mid_rad)
        
        ax.text(
            text_x, text_y,
            factor_names[current_factor],
            fontsize=8,
            fontweight='bold',
            ha='center',
            va='center',
            color='black',
            bbox=dict(
                boxstyle='round,pad=0.3',
                facecolor='white',
                edgecolor='none',
                alpha=0.8
            ),
            zorder=6
        )
    
    # 3. 绘制扇柄底部区域（扇形，在最上层）
    handle_wedge = Wedge(
        (0, 0),
        inner_radius,
        start_angle,
        start_angle + total_angle,
        width=handle_length,
        facecolor='white',
        edgecolor='black',
        linewidth=2.5,
        zorder=4
    )
    ax.add_patch(handle_wedge)
    
    # 4. 重新绘制中间5根扇骨在扇柄上（让它们显示在扇柄上层）
    for i in range(1, 6):  # 只绘制中间5根
        angle = start_angle + i * angle_per_section
        angle_rad = np.radians(angle)
        
        # 扇柄部分的扇骨（从内圈到扇柄底部）
        x_top = inner_radius * np.cos(angle_rad)
        y_top = inner_radius * np.sin(angle_rad)
        x_bottom = handle_bottom_y * np.cos(angle_rad)
        y_bottom = handle_bottom_y * np.sin(angle_rad)
        
        ax.plot(
            [x_bottom, x_top],
            [y_bottom, y_top],
            color='black',
            linewidth=1.5,
            solid_capstyle='round',
            zorder=5  # 在扇柄上面
        )
    
    plt.tight_layout()
    plt.savefig('simple_fan.png', dpi=300, bbox_inches='tight', facecolor='white')
    print('✅ 简洁扇子图已保存到: simple_fan.png')
    plt.show()
    
    return fig, ax


if __name__ == '__main__':
    print('=== 简洁扇子可视化 - 6个扇面区域 ===\n')
    create_simple_fan()
    print('\n✨ 完成！')
