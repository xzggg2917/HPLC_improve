"""
API路由模块
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.schemas.schemas import (
    GreenChemistryRequest,
    EcoScaleRequest,
    ChromatogramAnalysisRequest,
    ChromatogramAnalysisResponse,
    HPLCAnalysisCreate,
    HPLCAnalysisResponse,
    APIResponse
)
from app.services.green_chemistry import analyzer
from app.database.connection import get_db
from app.database.models import HPLCAnalysis
from sqlalchemy import select

router = APIRouter()


@router.post("/green-chemistry/solvent-score", tags=["绿色化学"])
async def calculate_solvent_score(request: GreenChemistryRequest):
    """计算溶剂系统的绿色化学评分"""
    try:
        result = analyzer.calculate_solvent_score(
            solvent_a=request.solvent_a,
            solvent_b=request.solvent_b,
            ratio_a=request.ratio_a,
            volume_ml=request.volume_ml
        )
        return APIResponse(
            success=True,
            message="溶剂评分计算成功",
            data=result
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/green-chemistry/eco-scale", tags=["绿色化学"])
async def calculate_eco_scale(request: EcoScaleRequest):
    """计算Eco-Scale评分"""
    try:
        result = analyzer.calculate_eco_scale(
            yield_percentage=request.yield_percentage,
            reaction_time_hours=request.reaction_time_hours,
            temperature_celsius=request.temperature_celsius,
            solvent_volume_ml=request.solvent_volume_ml
        )
        return APIResponse(
            success=True,
            message="Eco-Scale评分计算成功",
            data=result
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/analysis/chromatogram", response_model=APIResponse, tags=["色谱分析"])
async def analyze_chromatogram(request: ChromatogramAnalysisRequest):
    """分析色谱图数据"""
    try:
        result = analyzer.analyze_chromatogram(
            retention_times=request.retention_times,
            peak_areas=request.peak_areas
        )
        return APIResponse(
            success=True,
            message="色谱图分析完成",
            data=result
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analysis/hplc", response_model=APIResponse, tags=["HPLC分析"])
async def create_hplc_analysis(
    analysis: HPLCAnalysisCreate,
    db: AsyncSession = Depends(get_db)
):
    """创建新的HPLC分析记录"""
    try:
        # 计算绿色化学评分
        green_score_data = analyzer.calculate_solvent_score(
            solvent_a=analysis.solvent_a,
            solvent_b=analysis.solvent_b,
            ratio_a=0.5,
            volume_ml=analysis.flow_rate
        )
        
        # 创建数据库记录
        db_analysis = HPLCAnalysis(
            name=analysis.name,
            description=analysis.description,
            solvent_a=analysis.solvent_a,
            solvent_b=analysis.solvent_b,
            flow_rate=analysis.flow_rate,
            column_type=analysis.column_type,
            temperature=analysis.temperature,
            green_score=green_score_data["overall_green_score"]
        )
        
        db.add(db_analysis)
        await db.commit()
        await db.refresh(db_analysis)
        
        return APIResponse(
            success=True,
            message="HPLC分析创建成功",
            data={
                "id": db_analysis.id,
                "name": db_analysis.name,
                "green_score": db_analysis.green_score
            }
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analysis/hplc", response_model=APIResponse, tags=["HPLC分析"])
async def list_hplc_analyses(
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """获取HPLC分析列表"""
    try:
        stmt = select(HPLCAnalysis).offset(skip).limit(limit)
        result = await db.execute(stmt)
        analyses = result.scalars().all()
        
        return APIResponse(
            success=True,
            message="获取分析列表成功",
            data=[
                {
                    "id": a.id,
                    "name": a.name,
                    "description": a.description,
                    "created_at": a.created_at.isoformat() if a.created_at else None,
                    "green_score": a.green_score
                }
                for a in analyses
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/solvents/list", tags=["溶剂数据库"])
async def list_solvents():
    """获取支持的溶剂列表"""
    solvents = [
        {
            "name": name,
            "hazard_score": props.hazard_score,
            "environmental_impact": props.environmental_impact,
            "health_hazard": props.health_hazard,
            "recyclability": props.recyclability
        }
        for name, props in analyzer.solvent_db.items()
    ]
    return APIResponse(
        success=True,
        message="获取溶剂列表成功",
        data=solvents
    )
