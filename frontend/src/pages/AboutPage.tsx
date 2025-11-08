import React from 'react'
import { Card, Typography, Row, Col, Timeline, Tag, Image } from 'antd'
import { 
  ExperimentOutlined, 
  BarChartOutlined, 
  LineChartOutlined, 
  SafetyOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  ReconciliationOutlined
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <Title level={2}>关于 HPLC 绿色化学分析系统</Title>

      {/* 系统概述 */}
      <Card title="系统概述" style={{ marginBottom: 24 }}>
        <Paragraph>
          <Text strong>HPLC 绿色化学分析系统</Text>是一个专业的高效液相色谱（HPLC）分析平台，
          旨在帮助科研人员和实验室技术人员对HPLC实验方法进行<Text mark>绿色化学评估</Text>。
        </Paragraph>
        <Paragraph>
          本系统基于绿色化学十二原则，通过量化分析实验中使用的试剂对环境、健康和安全的影响，
          为优化实验方法、减少环境负担提供科学依据。
        </Paragraph>
      </Card>

      {/* 核心功能 */}
      <Card title="核心功能模块" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card type="inner" size="small">
              <SafetyOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 8 }} />
              <Text strong>Factors - 试剂因子管理</Text>
              <Paragraph style={{ marginTop: 8, fontSize: 14 }}>
                管理和配置实验中使用的各类试剂的基础参数：
                <ul>
                  <li><strong>密度 (Density)</strong>: 试剂的密度值 (g/ml)</li>
                  <li><strong>安全性 (S)</strong>: 试剂的安全等级评分</li>
                  <li><strong>健康危害 (H)</strong>: 对人体健康的影响评分</li>
                  <li><strong>环境影响 (E)</strong>: 对环境的影响评分</li>
                  <li><strong>可回收性 (R)</strong>: 试剂的可回收程度</li>
                  <li><strong>处置难度 (D)</strong>: 废弃物处置的复杂度</li>
                  <li><strong>耗能 (P)</strong>: 生产和使用过程的能耗</li>
                </ul>
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner" size="small">
              <ExperimentOutlined style={{ fontSize: 24, color: '#52c41a', marginRight: 8 }} />
              <Text strong>Methods - 实验方法配置</Text>
              <Paragraph style={{ marginTop: 8, fontSize: 14 }}>
                配置HPLC实验的详细参数：
                <ul>
                  <li><strong>样品数量</strong>: 实验处理的样品总数</li>
                  <li><strong>Sample PreTreatment</strong>: 样品前处理试剂及体积</li>
                  <li><strong>Mobile Phase A</strong>: 流动相A的组分配比</li>
                  <li><strong>Mobile Phase B</strong>: 流动相B的组分配比</li>
                </ul>
                系统自动计算每种试剂的使用量并生成绿色化学评估图表。
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner" size="small">
              <LineChartOutlined style={{ fontSize: 24, color: '#722ed1', marginRight: 8 }} />
              <Text strong>HPLC Gradient - 梯度程序</Text>
              <Paragraph style={{ marginTop: 8, fontSize: 14 }}>
                设置并可视化HPLC梯度洗脱程序：
                <ul>
                  <li><strong>梯度步骤</strong>: 定义每个时间节点的流动相比例</li>
                  <li><strong>流速控制</strong>: 设置每段的流速 (ml/min)</li>
                  <li><strong>曲线类型</strong>: 支持11种不同的梯度曲线（见下方说明）</li>
                  <li><strong>体积计算</strong>: 自动计算每段的积分面积和试剂体积</li>
                </ul>
                系统通过梯形法则计算曲线下面积，结合流速精确计算各试剂用量。
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner" size="small">
              <BarChartOutlined style={{ fontSize: 24, color: '#fa8c16', marginRight: 8 }} />
              <Text strong>Graph & Table - 数据可视化</Text>
              <Paragraph style={{ marginTop: 8, fontSize: 14 }}>
                <ul>
                  <li><strong>雷达图 (Graph)</strong>: 六维绿色化学评估雷达图，直观展示S、H、E、R、D、P总得分</li>
                  <li><strong>柱状图 (Methods)</strong>: 各试剂组的分类得分对比</li>
                  <li><strong>数据表格 (Table)</strong>: 详细的计算过程和结果汇总</li>
                </ul>
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 计算规则 */}
      <Card title="核心计算规则" style={{ marginBottom: 24 }}>
        <Timeline>
          <Timeline.Item color="green">
            <Text strong>第一步：体积到质量的转换</Text>
            <Paragraph style={{ marginLeft: 24, fontSize: 14 }}>
              质量 (g) = 体积 (ml) × 密度 (g/ml)
              <br />
              <Text type="secondary">从Factors页面获取每种试剂的密度值</Text>
            </Paragraph>
          </Timeline.Item>
          <Timeline.Item color="green">
            <Text strong>第二步：梯度曲线积分计算</Text>
            <Paragraph style={{ marginLeft: 24, fontSize: 14 }}>
              使用<Tag color="purple">梯形法则</Tag>计算梯度曲线下的面积（积分值）
              <br />
              体积 = Σ(各段积分面积 × 流速 / 100)
              <br />
              <Text type="secondary">对每个梯度步骤分别计算，然后累加得到总体积</Text>
            </Paragraph>
          </Timeline.Item>
          <Timeline.Item color="orange">
            <Text strong>第三步：试剂体积分配</Text>
            <Paragraph style={{ marginLeft: 24, fontSize: 14 }}>
              试剂体积 = Mobile Phase 总体积 × 试剂百分比 / 100
              <br />
              <Text type="secondary">根据Methods页面配置的百分比分配体积</Text>
            </Paragraph>
          </Timeline.Item>
          <Timeline.Item color="red">
            <Text strong>第四步：绿色化学得分计算</Text>
            <Paragraph style={{ marginLeft: 24, fontSize: 14 }}>
              各项得分 = 质量 (g) × 对应因子值
              <br />
              总得分 = Σ(所有试剂的对应得分)
              <br />
              <Text type="secondary">分别计算S、H、E、R、D、P六个维度的总得分</Text>
            </Paragraph>
          </Timeline.Item>
        </Timeline>
      </Card>

      {/* 梯度曲线类型说明 */}
      <Card title="HPLC 梯度曲线类型说明" style={{ marginBottom: 24 }}>
        <Paragraph>
          系统支持<Text strong>11种不同的梯度曲线类型</Text>，用于模拟不同的洗脱策略。
          每种曲线适用于不同的分离需求和样品特性。
        </Paragraph>
        
        <Row gutter={24} style={{ marginTop: 24 }}>
          <Col span={14}>
            <div style={{ textAlign: 'center' }}>
              <Image
                src="/gradient_curves.png"
                alt="11种梯度曲线对比图"
                width="100%"
                preview={true}
                placeholder={
                  <div style={{ 
                    width: '100%', 
                    height: 350, 
                    background: '#f0f0f0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#999'
                  }}>
                    梯度曲线对比图
                  </div>
                }
              />
            </div>
          </Col>
          
          <Col span={10}>
            <Row gutter={[12, 12]}>
              <Col span={24}>
                <Card size="small" type="inner">
                  <Tag color="blue">1. 预先骤曲线</Tag>
                  <Paragraph style={{ fontSize: 14, marginTop: 8, marginBottom: 0 }}>
                    起始时刻立即跳跃到终值。
                  </Paragraph>
                </Card>
              </Col>
              <Col span={24}>
                <Card size="small" type="inner">
                  <Tag color="red">2-4. 凸曲线系列</Tag>
                  <Paragraph style={{ fontSize: 14, marginTop: 8, marginBottom: 0 }}>
                    前期变化快，后期趋缓。
                  </Paragraph>
                </Card>
              </Col>
              <Col span={24}>
                <Card size="small" type="inner">
                  <Tag color="orange">5. 超凸曲线</Tag>
                  <Paragraph style={{ fontSize: 14, marginTop: 8, marginBottom: 0 }}>
                    极快的初期变化，后期几乎不变。
                  </Paragraph>
                </Card>
              </Col>
              <Col span={24}>
                <Card size="small" type="inner">
                  <Tag color="green">6. 线性曲线</Tag>
                  <Paragraph style={{ fontSize: 14, marginTop: 8, marginBottom: 0 }}>
                    匀速变化，最常用的梯度类型。
                  </Paragraph>
                </Card>
              </Col>
              <Col span={24}>
                <Card size="small" type="inner">
                  <Tag color="purple">7-9. 凹曲线系列</Tag>
                  <Paragraph style={{ fontSize: 14, marginTop: 8, marginBottom: 0 }}>
                    前期变化慢，后期加速。
                  </Paragraph>
                </Card>
              </Col>
              <Col span={24}>
                <Card size="small" type="inner">
                  <Tag color="magenta">10. 超凹曲线</Tag>
                  <Paragraph style={{ fontSize: 14, marginTop: 8, marginBottom: 0 }}>
                    前期几乎不变，后期急剧变化。
                  </Paragraph>
                </Card>
              </Col>
              <Col span={24}>
                <Card size="small" type="inner">
                  <Tag color="gold">11. 后步骤曲线</Tag>
                  <Paragraph style={{ fontSize: 14, marginTop: 8, marginBottom: 0 }}>
                    保持初值，最后时刻跳跃到终值。
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* 使用流程 */}
      <Card title="系统使用流程" style={{ marginBottom: 24 }}>
        <Timeline>
          <Timeline.Item color="blue">
            <Text strong>步骤 1：配置试剂因子 (Factors)</Text>
            <Paragraph style={{ fontSize: 14 }}>
              在Factors页面添加并配置实验中将使用的所有试剂的参数（密度、S、H、E、R、D、P）
            </Paragraph>
          </Timeline.Item>
          <Timeline.Item color="green">
            <Text strong>步骤 2：设置实验方法 (Methods)</Text>
            <Paragraph style={{ fontSize: 14 }}>
              输入样品数量、前处理试剂体积、流动相A和B的组分配比
            </Paragraph>
          </Timeline.Item>
          <Timeline.Item color="purple">
            <Text strong>步骤 3：配置梯度程序 (HPLC Gradient)</Text>
            <Paragraph style={{ fontSize: 14 }}>
              设置梯度步骤（时间、流动相比例、流速、曲线类型），保存后系统自动计算各试剂体积
            </Paragraph>
          </Timeline.Item>
          <Timeline.Item color="orange">
            <Text strong>步骤 4：查看结果 (Graph & Table)</Text>
            <Paragraph style={{ fontSize: 14 }}>
              在Graph页面查看雷达图，在Table页面查看详细数据报告
            </Paragraph>
          </Timeline.Item>
        </Timeline>
      </Card>

      {/* 绿色化学指标说明 */}
      <Card title="绿色化学评估指标" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card type="inner" size="small">
              <SafetyOutlined style={{ fontSize: 20, color: '#3f8600', marginRight: 8 }} />
              <Text strong>安全性 (S - Safety)</Text>
              <Paragraph style={{ fontSize: 14, marginTop: 8 }}>
                评估试剂的易燃、易爆、腐蚀性等安全风险。
                得分越低越安全。
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner" size="small">
              <EnvironmentOutlined style={{ fontSize: 20, color: '#cf1322', marginRight: 8 }} />
              <Text strong>健康危害 (H - Health)</Text>
              <Paragraph style={{ fontSize: 14, marginTop: 8 }}>
                评估试剂对人体的急性和慢性毒性影响。
                得分越低对健康影响越小。
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner" size="small">
              <EnvironmentOutlined style={{ fontSize: 20, color: '#1890ff', marginRight: 8 }} />
              <Text strong>环境影响 (E - Environment)</Text>
              <Paragraph style={{ fontSize: 14, marginTop: 8 }}>
                评估试剂对水体、土壤、大气的污染程度。
                得分越低对环境越友好。
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner" size="small">
              <ReconciliationOutlined style={{ fontSize: 20, color: '#faad14', marginRight: 8 }} />
              <Text strong>可回收性 (R - Recyclability)</Text>
              <Paragraph style={{ fontSize: 14, marginTop: 8 }}>
                评估试剂的回收利用难度和可行性。
                得分越低越容易回收。
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner" size="small">
              <EnvironmentOutlined style={{ fontSize: 20, color: '#722ed1', marginRight: 8 }} />
              <Text strong>处置难度 (D - Disposal)</Text>
              <Paragraph style={{ fontSize: 14, marginTop: 8 }}>
                评估废弃试剂的处理复杂度和成本。
                得分越低越容易处置。
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner" size="small">
              <ThunderboltOutlined style={{ fontSize: 20, color: '#eb2f96', marginRight: 8 }} />
              <Text strong>耗能 (P - Power)</Text>
              <Paragraph style={{ fontSize: 14, marginTop: 8 }}>
                评估试剂生产、运输和使用过程的能量消耗。
                得分越低能耗越小。
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 技术栈 */}
      <Card title="技术栈" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Paragraph>
              <Text strong>前端技术：</Text>
              <ul>
                <li>React 18 - UI框架</li>
                <li>TypeScript - 类型安全</li>
                <li>Ant Design - UI组件库</li>
                <li>Recharts - 数据可视化</li>
                <li>Vite - 构建工具</li>
              </ul>
            </Paragraph>
          </Col>
          <Col span={12}>
            <Paragraph>
              <Text strong>数据存储：</Text>
              <ul>
                <li>LocalStorage - 本地数据持久化</li>
                <li>自定义事件 - 跨组件通信</li>
                <li>React Hooks - 状态管理</li>
              </ul>
            </Paragraph>
          </Col>
        </Row>
      </Card>

      {/* 版本信息 */}
      <Card>
        <Paragraph>
          <Text strong>系统版本：</Text> 1.0.0
        </Paragraph>
        <Paragraph>
          <Text strong>开发日期：</Text> 2025年11月
        </Paragraph>
        <Paragraph>
          <Text type="secondary" style={{ fontSize: 14 }}>
            本系统遵循绿色化学原则，致力于推动实验室的可持续发展。
          </Text>
        </Paragraph>
      </Card>
    </div>
  )
}

export default AboutPage
