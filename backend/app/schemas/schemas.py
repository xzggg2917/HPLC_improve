"""
Pydantic数据模型
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class HPLCAnalysisCreate(BaseModel):
    """创建HPLC分析请求"""
    name: str = Field(..., description="分析名称")
    description: Optional[str] = Field(None, description="分析描述")
    solvent_a: str = Field(..., description="溶剂A")
    solvent_b: str = Field(..., description="溶剂B")
    flow_rate: float = Field(..., description="流速(mL/min)")
    column_type: str = Field(..., description="色谱柱类型")
    temperature: float = Field(..., description="温度(℃)")


class HPLCAnalysisResponse(BaseModel):
    """HPLC分析响应"""
    id: int
    name: str
    description: Optional[str]
    created_at: datetime
    solvent_a: str
    solvent_b: str
    flow_rate: float
    column_type: str
    temperature: float
    green_score: Optional[float]
    eco_scale_score: Optional[float]
    
    class Config:
        from_attributes = True


class GreenChemistryRequest(BaseModel):
    """绿色化学评估请求"""
    solvent_a: str = Field(..., description="溶剂A名称")
    solvent_b: str = Field(..., description="溶剂B名称")
    ratio_a: float = Field(0.5, description="溶剂A比例", ge=0, le=1)
    volume_ml: float = Field(1.0, description="总体积(mL)", gt=0)


class EcoScaleRequest(BaseModel):
    """Eco-Scale评估请求"""
    yield_percentage: float = Field(..., description="产率百分比", ge=0, le=100)
    reaction_time_hours: float = Field(..., description="反应时间(小时)", gt=0)
    temperature_celsius: float = Field(..., description="温度(℃)")
    solvent_volume_ml: float = Field(..., description="溶剂体积(mL)", gt=0)


class ChromatogramAnalysisRequest(BaseModel):
    """色谱图分析请求"""
    retention_times: List[float] = Field(..., description="保留时间列表")
    peak_areas: List[float] = Field(..., description="峰面积列表")


class ChromatogramAnalysisResponse(BaseModel):
    """色谱图分析响应"""
    num_peaks: int
    main_peak_retention_time: float
    main_peak_area: float
    total_area: float
    purity_percentage: float
    average_resolution: float
    peaks: List[Dict[str, float]]


class APIResponse(BaseModel):
    """通用API响应"""
    success: bool
    message: str
    data: Optional[Any] = None
