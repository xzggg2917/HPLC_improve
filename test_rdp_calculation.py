"""
测试R、D、P因子计算
"""

# 模拟数据：基于用户截图的案例
# S=11.031, H=15.980, E=9.503, 期望R≠50, D≠50, P≠0

# 假设使用的试剂（需要用户确认）
# 例如：MeOH (甲醇), ACN (乙腈), H2O (水)

# 假设因子值（示例）
factors = {
    'MeOH': {
        'density': 0.791,
        'regeneration': 0.6,  # 假设值
        'disposal': 0.7       # 假设值
    },
    'ACN': {
        'density': 0.786,
        'regeneration': 0.5,  # 假设值
        'disposal': 0.6       # 假设值
    },
    'H2O': {
        'density': 1.0,
        'regeneration': 0.0,  # 水不可再生
        'disposal': 0.1       # 水易处理
    }
}

# 假设仪器使用量（mL）- 从gradient计算得出
instrument_volumes = {
    'MeOH': 50.0,   # 假设
    'ACN': 30.0,    # 假设
    'H2O': 20.0     # 假设
}

# 假设前处理使用量（mL）
prep_volumes = {
    'MeOH': 10.0,   # 假设
    'ACN': 5.0      # 假设
}

sample_count = 1  # 假设1个样品

# 色谱类型
chromatography_type = 'HPLC_UV'
baseline_mass_map = {
    'UPLC': 4.0,
    'HPLC_UV': 45.0,
    'HPLC_MS': 10.0,
    'PrepHPLC': 250.0,
    'SFC': 4.0
}
baseline_mass = baseline_mass_map[chromatography_type]

print("=" * 80)
print("R和D因子计算测试")
print("=" * 80)

# 计算R和D
r_weighted_sum = 0
d_weighted_sum = 0

print("\n仪器分析阶段:")
for reagent, volume in instrument_volumes.items():
    factor = factors[reagent]
    mass = volume * factor['density']
    r_contribution = mass * factor['regeneration']
    d_contribution = mass * factor['disposal']
    
    r_weighted_sum += r_contribution
    d_weighted_sum += d_contribution
    
    print(f"  {reagent}: 体积={volume}mL, 密度={factor['density']}, 质量={mass:.3f}g")
    print(f"    R贡献: {mass:.3f}g × {factor['regeneration']} = {r_contribution:.3f}")
    print(f"    D贡献: {mass:.3f}g × {factor['disposal']} = {d_contribution:.3f}")

print("\n前处理阶段:")
for reagent, volume in prep_volumes.items():
    factor = factors[reagent]
    total_volume = volume * sample_count
    mass = total_volume * factor['density']
    r_contribution = mass * factor['regeneration']
    d_contribution = mass * factor['disposal']
    
    r_weighted_sum += r_contribution
    d_weighted_sum += d_contribution
    
    print(f"  {reagent}: 体积={volume}mL×{sample_count}样品={total_volume}mL, 质量={mass:.3f}g")
    print(f"    R贡献: {mass:.3f}g × {factor['regeneration']} = {r_contribution:.3f}")
    print(f"    D贡献: {mass:.3f}g × {factor['disposal']} = {d_contribution:.3f}")

# 归一化
r_factor_0_1 = min(1.0, r_weighted_sum / baseline_mass)
d_factor_0_1 = min(1.0, d_weighted_sum / baseline_mass)

r_factor_100 = r_factor_0_1 * 100
d_factor_100 = d_factor_0_1 * 100

print("\n归一化计算:")
print(f"  基准质量 (baseline_mass): {baseline_mass}g")
print(f"  R加权和: {r_weighted_sum:.3f}")
print(f"  D加权和: {d_weighted_sum:.3f}")
print(f"  R因子 (0-1制): {r_factor_0_1:.4f}")
print(f"  D因子 (0-1制): {d_factor_0_1:.4f}")
print(f"  R因子 (0-100制): {r_factor_100:.2f}")
print(f"  D因子 (0-100制): {d_factor_100:.2f}")

print("\n" + "=" * 80)
print("P因子计算测试")
print("=" * 80)

# P因子计算
instrument_type = 'standard'  # 假设
power_map = {'low': 0.5, 'standard': 1.0, 'high': 2.0}
P_inst = power_map[instrument_type]

T_run = 30.0  # 假设运行时间30分钟

E_sample = P_inst * T_run / 60  # kWh

if E_sample <= 0.1:
    p_score = 0
elif E_sample >= 1.5:
    p_score = 100
else:
    p_score = ((E_sample - 0.1) / 1.4) * 100

print(f"  仪器类型: {instrument_type}")
print(f"  功率: {P_inst} kW")
print(f"  运行时间: {T_run} min")
print(f"  能耗 E_sample: {E_sample:.4f} kWh")
print(f"  P因子得分: {p_score:.2f}")

print("\n" + "=" * 80)
print("总结:")
print(f"  R因子: {r_factor_100:.2f} (期望≠50)")
print(f"  D因子: {d_factor_100:.2f} (期望≠50)")
print(f"  P因子: {p_score:.2f} (期望≠0)")
print("=" * 80)
