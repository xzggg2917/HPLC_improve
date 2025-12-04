"""
测试评分系统的计算逻辑
"""
import sys
sys.path.append('.')

from app.services import scoring_service

# 测试数据：简单案例
def test_simple_case():
    print("=" * 80)
    print("测试案例：简单的单试剂评分")
    print("=" * 80)
    
    # 仪器分析数据
    inst_time_points = [0, 10, 20]
    inst_composition = {
        "Water": [100, 50, 0],      # Water从100%降到0%
        "Methanol": [0, 50, 100]    # Methanol从0%升到100%
    }
    inst_flow_rate = 1.0  # mL/min
    inst_densities = {
        "Water": 1.0,
        "Methanol": 0.791
    }
    inst_factor_matrix = {
        "Water": {
            "S1": 0.0, "S2": 0.0, "S3": 0.0, "S4": 0.0,
            "H1": 0.0, "H2": 0.0,
            "E1": 0.0, "E2": 0.0, "E3": 0.0
        },
        "Methanol": {
            "S1": 0.6, "S2": 0.8, "S3": 0.2, "S4": 0.3,
            "H1": 0.4, "H2": 0.5,
            "E1": 0.3, "E2": 0.2, "E3": 0.1
        }
    }
    
    # 前处理数据（极小值）
    prep_volumes = {"Water": 0.001}
    prep_densities = {"Water": 1.0}
    prep_factor_matrix = {
        "Water": {
            "S1": 0.0, "S2": 0.0, "S3": 0.0, "S4": 0.0,
            "H1": 0.0, "H2": 0.0,
            "E1": 0.0, "E2": 0.0, "E3": 0.0
        }
    }
    
    # 其他因子
    p_factor = 50.0  # 0-100
    r_factor_raw = 0.5  # 0-1
    d_factor_raw = 0.5  # 0-1
    
    # 计算评分
    result = scoring_service.calculate_full_scores(
        instrument_time_points=inst_time_points,
        instrument_composition=inst_composition,
        instrument_flow_rate=inst_flow_rate,
        instrument_densities=inst_densities,
        instrument_factor_matrix=inst_factor_matrix,
        prep_volumes=prep_volumes,
        prep_densities=prep_densities,
        prep_factor_matrix=prep_factor_matrix,
        p_factor=p_factor,
        r_factor_raw=r_factor_raw,
        d_factor_raw=d_factor_raw,
        safety_scheme="PBT_Balanced",
        health_scheme="Absolute_Balance",
        environment_scheme="PBT_Balanced",
        instrument_stage_scheme="Balanced",
        prep_stage_scheme="Balanced",
        final_scheme="Standard"
    )
    
    print("\n【计算结果】")
    print(f"仪器分析质量: {result['instrument']['masses']}")
    print(f"仪器小因子得分: {result['instrument']['sub_factors']}")
    print(f"仪器大因子得分: {result['instrument']['major_factors']}")
    print(f"Score₁ (仪器): {result['instrument']['score1']}")
    print()
    print(f"前处理质量: {result['preparation']['masses']}")
    print(f"前处理小因子得分: {result['preparation']['sub_factors']}")
    print(f"前处理大因子得分: {result['preparation']['major_factors']}")
    print(f"Score₂ (前处理): {result['preparation']['score2']}")
    print()
    print(f"合成小因子得分 (雷达图): {result['merged']['sub_factors']}")
    print(f"Score₃ (最终): {result['final']['score3']}")
    print()
    
    # 验证数值范围
    print("【数值范围验证】")
    for key, value in result['merged']['sub_factors'].items():
        if not (0 <= value <= 100):
            print(f"❌ {key} = {value} 超出范围 [0, 100]")
        else:
            print(f"✅ {key} = {value}")
    
    print("\n" + "=" * 80)


if __name__ == "__main__":
    test_simple_case()
