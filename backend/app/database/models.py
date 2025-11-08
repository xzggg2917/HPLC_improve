"""
数据库模型
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database.connection import Base


class HPLCAnalysis(Base):
    """HPLC分析记录"""
    __tablename__ = "hplc_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 分析参数
    solvent_a = Column(String(100))
    solvent_b = Column(String(100))
    flow_rate = Column(Float)  # mL/min
    column_type = Column(String(100))
    temperature = Column(Float)  # ℃
    
    # 绿色化学评分
    green_score = Column(Float)
    eco_scale_score = Column(Float)
    
    # 分析数据（JSON格式存储）
    raw_data = Column(JSON)
    analysis_results = Column(JSON)


class GreenChemistryMetric(Base):
    """绿色化学评估指标"""
    __tablename__ = "green_chemistry_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, index=True)
    
    # 溶剂评分
    solvent_waste = Column(Float)
    solvent_hazard = Column(Float)
    
    # 能耗评分
    energy_consumption = Column(Float)
    
    # 原子经济性
    atom_economy = Column(Float)
    
    # 总体评分
    total_score = Column(Float)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
