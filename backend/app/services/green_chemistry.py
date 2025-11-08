"""
绿色化学分析核心模块
"""
import numpy as np
from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class SolventProperties:
    """溶剂属性"""
    name: str
    hazard_score: float  # 1-10，10为最危险
    environmental_impact: float  # 1-10，10为最大影响
    health_hazard: float  # 1-10，10为最危险
    recyclability: float  # 1-10，10为最易回收


# 常见HPLC溶剂的绿色化学评分数据库
SOLVENT_DATABASE = {
    "水": SolventProperties("水", 1.0, 1.0, 1.0, 10.0),
    "甲醇": SolventProperties("甲醇", 5.5, 4.0, 6.0, 7.0),
    "乙腈": SolventProperties("乙腈", 6.0, 5.0, 7.0, 6.0),
    "四氢呋喃": SolventProperties("四氢呋喃", 7.0, 6.0, 7.5, 5.0),
    "乙酸乙酯": SolventProperties("乙酸乙酯", 4.0, 3.5, 4.0, 8.0),
    "正己烷": SolventProperties("正己烷", 6.5, 7.0, 6.0, 6.0),
    "异丙醇": SolventProperties("异丙醇", 4.5, 3.0, 4.5, 8.0),
}


class GreenChemistryAnalyzer:
    """绿色化学分析器"""
    
    def __init__(self):
        self.solvent_db = SOLVENT_DATABASE
    
    def calculate_solvent_score(
        self,
        solvent_a: str,
        solvent_b: str,
        ratio_a: float = 0.5,
        volume_ml: float = 1.0
    ) -> Dict[str, float]:
        """
        计算溶剂系统的绿色化学评分
        
        Args:
            solvent_a: 溶剂A名称
            solvent_b: 溶剂B名称
            ratio_a: 溶剂A的比例（0-1）
            volume_ml: 总体积（mL）
        
        Returns:
            包含各项评分的字典
        """
        ratio_b = 1 - ratio_a
        
        # 获取溶剂属性
        props_a = self.solvent_db.get(solvent_a, SolventProperties(solvent_a, 5.0, 5.0, 5.0, 5.0))
        props_b = self.solvent_db.get(solvent_b, SolventProperties(solvent_b, 5.0, 5.0, 5.0, 5.0))
        
        # 加权平均计算
        hazard = ratio_a * props_a.hazard_score + ratio_b * props_b.hazard_score
        environmental = ratio_a * props_a.environmental_impact + ratio_b * props_b.environmental_impact
        health = ratio_a * props_a.health_hazard + ratio_b * props_b.health_hazard
        recyclability = ratio_a * props_a.recyclability + ratio_b * props_b.recyclability
        
        # 体积惩罚（使用越多越不环保）
        volume_penalty = min(volume_ml / 100, 2.0)  # 最大2倍惩罚
        
        # 综合评分（0-100，100为最绿色）
        green_score = 100 - (
            (hazard * 0.3 + environmental * 0.3 + health * 0.2) * 10 * volume_penalty
            - recyclability * 0.2 * 10
        )
        green_score = max(0, min(100, green_score))
        
        return {
            "hazard_score": round(10 - hazard, 2),
            "environmental_score": round(10 - environmental, 2),
            "health_score": round(10 - health, 2),
            "recyclability_score": round(recyclability, 2),
            "overall_green_score": round(green_score, 2),
            "volume_penalty": round(volume_penalty, 2)
        }
    
    def calculate_eco_scale(
        self,
        yield_percentage: float,
        reaction_time_hours: float,
        temperature_celsius: float,
        solvent_volume_ml: float
    ) -> Dict[str, float]:
        """
        计算Eco-Scale评分（Van Aken等，2006）
        
        Args:
            yield_percentage: 产率百分比
            reaction_time_hours: 反应时间（小时）
            temperature_celsius: 温度（℃）
            solvent_volume_ml: 溶剂体积（mL）
        
        Returns:
            Eco-Scale评分和细节
        """
        base_score = 100
        
        # 产率惩罚
        if yield_percentage < 50:
            yield_penalty = 10
        elif yield_percentage < 75:
            yield_penalty = 5
        else:
            yield_penalty = 0
        
        # 时间惩罚
        if reaction_time_hours > 24:
            time_penalty = 5
        elif reaction_time_hours > 12:
            time_penalty = 3
        else:
            time_penalty = 0
        
        # 温度惩罚
        if abs(temperature_celsius - 25) > 50:
            temp_penalty = 5
        elif abs(temperature_celsius - 25) > 25:
            temp_penalty = 3
        else:
            temp_penalty = 0
        
        # 溶剂体积惩罚
        if solvent_volume_ml > 100:
            solvent_penalty = 10
        elif solvent_volume_ml > 50:
            solvent_penalty = 5
        else:
            solvent_penalty = 0
        
        eco_scale = base_score - yield_penalty - time_penalty - temp_penalty - solvent_penalty
        
        return {
            "eco_scale_score": max(0, eco_scale),
            "yield_penalty": yield_penalty,
            "time_penalty": time_penalty,
            "temperature_penalty": temp_penalty,
            "solvent_penalty": solvent_penalty
        }
    
    def calculate_process_mass_intensity(
        self,
        product_mass_g: float,
        total_input_mass_g: float
    ) -> float:
        """
        计算工艺质量强度（PMI）
        PMI = 总输入质量 / 产品质量
        """
        if product_mass_g <= 0:
            return 0.0
        return round(total_input_mass_g / product_mass_g, 2)
    
    def analyze_chromatogram(
        self,
        retention_times: List[float],
        peak_areas: List[float]
    ) -> Dict[str, any]:
        """
        分析色谱图数据
        
        Args:
            retention_times: 保留时间列表
            peak_areas: 峰面积列表
        
        Returns:
            分析结果
        """
        if len(retention_times) != len(peak_areas):
            raise ValueError("保留时间和峰面积数量不匹配")
        
        rt_array = np.array(retention_times)
        area_array = np.array(peak_areas)
        
        # 找到主峰
        main_peak_idx = np.argmax(area_array)
        main_peak_rt = rt_array[main_peak_idx]
        main_peak_area = area_array[main_peak_idx]
        
        # 计算总面积和纯度
        total_area = np.sum(area_array)
        purity = (main_peak_area / total_area * 100) if total_area > 0 else 0
        
        # 分辨率计算（相邻峰）
        resolutions = []
        for i in range(len(rt_array) - 1):
            res = abs(rt_array[i+1] - rt_array[i])
            resolutions.append(res)
        
        return {
            "num_peaks": len(retention_times),
            "main_peak_retention_time": round(main_peak_rt, 3),
            "main_peak_area": round(main_peak_area, 2),
            "total_area": round(total_area, 2),
            "purity_percentage": round(purity, 2),
            "average_resolution": round(np.mean(resolutions), 3) if resolutions else 0,
            "peaks": [
                {
                    "retention_time": round(rt, 3),
                    "area": round(area, 2),
                    "percentage": round(area / total_area * 100, 2) if total_area > 0 else 0
                }
                for rt, area in zip(retention_times, peak_areas)
            ]
        }


# 全局分析器实例
analyzer = GreenChemistryAnalyzer()
