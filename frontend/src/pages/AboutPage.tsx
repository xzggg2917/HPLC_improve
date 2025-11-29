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
      <Title level={2}>About HPLC Green Chemistry Analysis System</Title>

      {/* System Overview */}
      <Card title="System Overview" style={{ marginBottom: 24 }}>
        <Paragraph>
          <Text strong>HPLC Green Chemistry Analysis System</Text> is a professional High-Performance Liquid Chromatography (HPLC) analysis platform,
          designed to help researchers and laboratory technicians conduct <Text mark>green chemistry assessments</Text> of HPLC experimental methods.
        </Paragraph>
        <Paragraph>
          Based on the twelve principles of green chemistry, this system quantitatively analyzes the environmental, health, and safety impacts of reagents used in experiments,
          providing scientific evidence for optimizing experimental methods and reducing environmental burdens.
        </Paragraph>
      </Card>

      {/* Core Functions */}
      <Card title="Core Function Modules" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card type="inner" size="small">
              <SafetyOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 8 }} />
              <Text strong>Factors - Reagent Factor Management</Text>
              <Paragraph style={{ marginTop: 8, fontSize: 14 }}>
                Manage and configure basic parameters for all reagents used in experiments:
                <ul>
                  <li><strong>Density</strong>: Reagent density value (g/ml)</li>
                  <li><strong>Safety (S)</strong>: Reagent safety rating score</li>
                  <li><strong>Health Hazard (H)</strong>: Human health impact score</li>
                  <li><strong>Environmental Impact (E)</strong>: Environmental impact score</li>
                  <li><strong>Recyclability (R)</strong>: Degree of reagent recyclability</li>
                  <li><strong>Disposal Difficulty (D)</strong>: Waste disposal complexity</li>
                  <li><strong>Energy Consumption (P)</strong>: Production and usage energy consumption</li>
                </ul>
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner" size="small">
              <ExperimentOutlined style={{ fontSize: 24, color: '#52c41a', marginRight: 8 }} />
              <Text strong>Methods - Experimental Method Configuration</Text>
              <Paragraph style={{ marginTop: 8, fontSize: 14 }}>
                Configure detailed HPLC experiment parameters:
                <ul>
                  <li><strong>Sample Count</strong>: Total number of samples processed</li>
                  <li><strong>Sample PreTreatment</strong>: Pretreatment reagents and volumes</li>
                  <li><strong>Mobile Phase A</strong>: Component ratio of mobile phase A</li>
                  <li><strong>Mobile Phase B</strong>: Component ratio of mobile phase B</li>
                </ul>
                System automatically calculates reagent usage and generates green chemistry assessment charts.
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner" size="small">
              <LineChartOutlined style={{ fontSize: 24, color: '#722ed1', marginRight: 8 }} />
              <Text strong>HPLC Gradient - Gradient Program</Text>
              <Paragraph style={{ marginTop: 8, fontSize: 14 }}>
                Configure and visualize HPLC gradient elution program:
                <ul>
                  <li><strong>Gradient Steps</strong>: Define mobile phase ratio at each time point</li>
                  <li><strong>Flow Rate Control</strong>: Set flow rate for each segment (ml/min)</li>
                  <li><strong>Curve Type</strong>: Supports 11 different gradient curves (see explanation below)</li>
                  <li><strong>Volume Calculation</strong>: Automatically calculates integral area and reagent volume for each segment</li>
                </ul>
                System uses trapezoidal rule to calculate area under curve and precisely calculates reagent usage based on flow rate.
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner" size="small">
              <BarChartOutlined style={{ fontSize: 24, color: '#fa8c16', marginRight: 8 }} />
              <Text strong>Graph & Table - Data Visualization</Text>
              <Paragraph style={{ marginTop: 8, fontSize: 14 }}>
                <ul>
                  <li><strong>Radar Chart (Graph)</strong>: Six-dimensional green chemistry assessment radar chart displaying total scores for S, H, E, R, D, P</li>
                  <li><strong>Bar Chart (Methods)</strong>: Score comparison for each reagent group</li>
                  <li><strong>Data Table (Table)</strong>: Detailed calculation process and results summary</li>
                </ul>
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Calculation Rules */}
      <Card title="Core Calculation Rules" style={{ marginBottom: 24 }}>
        <Timeline>
          <Timeline.Item color="green">
            <Text strong>Step 1: Volume to Mass Conversion</Text>
            <Paragraph style={{ marginLeft: 24, fontSize: 14 }}>
              Mass (g) = Volume (ml) × Density (g/ml)
              <br />
              <Text type="secondary">Obtain density value for each reagent from Factors page</Text>
            </Paragraph>
          </Timeline.Item>
          <Timeline.Item color="green">
            <Text strong>Step 2: Gradient Curve Integration Calculation</Text>
            <Paragraph style={{ marginLeft: 24, fontSize: 14 }}>
              Use <Tag color="purple">Trapezoidal Rule</Tag> to calculate area under gradient curve (integral value)
              <br />
              Volume = Σ(Integral area of each segment × Flow rate / 100)
              <br />
              <Text type="secondary">Calculate for each gradient step separately, then sum to get total volume</Text>
            </Paragraph>
          </Timeline.Item>
          <Timeline.Item color="orange">
            <Text strong>Step 3: Reagent Volume Distribution</Text>
            <Paragraph style={{ marginLeft: 24, fontSize: 14 }}>
              Reagent volume = Total Mobile Phase volume × Reagent percentage / 100
              <br />
              <Text type="secondary">Distribute volume based on percentage configured on Methods page</Text>
            </Paragraph>
          </Timeline.Item>
          <Timeline.Item color="red">
            <Text strong>Step 4: Green Chemistry Score Calculation</Text>
            <Paragraph style={{ marginLeft: 24, fontSize: 14 }}>
              Score for each metric = Mass (g) × Corresponding factor value
              <br />
              Total score = Σ(Corresponding score for all reagents)
              <br />
              <Text type="secondary">Calculate total scores for six dimensions: S, H, E, R, D, P separately</Text>
            </Paragraph>
          </Timeline.Item>
        </Timeline>
      </Card>

      {/* Gradient Curve Type Explanation */}
      <Card title="HPLC Gradient Curve Type Explanation" style={{ marginBottom: 24 }}>
        <Paragraph>
          System supports <Text strong>11 different gradient curve types</Text> for simulating various elution strategies.
          Each curve type is suitable for different separation needs and sample characteristics.
        </Paragraph>
        
        <Row gutter={24} style={{ marginTop: 24 }}>
          <Col span={14}>
            <div style={{ textAlign: 'center' }}>
              <Image
                src="/gradient_curves.png"
                alt="11 gradient curve comparison chart"
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
                    Gradient Curve Comparison Chart
                  </div>
                }
              />
            </div>
          </Col>
          
          <Col span={10}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Card size="small" type="inner">
                <Tag color="blue">1. Pre-step Curve</Tag>
                <Paragraph style={{ fontSize: 14, marginTop: 8, marginBottom: 0 }}>
                  Jumps immediately to final value at start.
                </Paragraph>
              </Card>
              
              <Card size="small" type="inner">
                <Tag color="red">2-4. Convex Curve Series</Tag>
                <Paragraph style={{ fontSize: 14, marginTop: 8, marginBottom: 0 }}>
                  Rapid change in early stage, slower in later stage.
                </Paragraph>
              </Card>
              
              <Card size="small" type="inner">
                <Tag color="orange">5. Super Convex Curve</Tag>
                <Paragraph style={{ fontSize: 14, marginTop: 8, marginBottom: 0 }}>
                  Extremely rapid initial change, almost no change in later stage.
                </Paragraph>
              </Card>
              
              <Card size="small" type="inner">
                <Tag color="green">6. Linear Curve</Tag>
                <Paragraph style={{ fontSize: 14, marginTop: 8, marginBottom: 0 }}>
                  Uniform change, most commonly used gradient type.
                </Paragraph>
              </Card>
              
              <Card size="small" type="inner">
                <Tag color="purple">7-9. Concave Curve Series</Tag>
                <Paragraph style={{ fontSize: 14, marginTop: 8, marginBottom: 0 }}>
                  Slow change in early stage, accelerates in later stage.
                </Paragraph>
              </Card>
              
              <Card size="small" type="inner">
                <Tag color="magenta">10. Super Concave Curve</Tag>
                <Paragraph style={{ fontSize: 14, marginTop: 8, marginBottom: 0 }}>
                  Almost no change in early stage, rapid change in later stage.
                </Paragraph>
              </Card>
              
              <Card size="small" type="inner">
                <Tag color="gold">11. Post-step Curve</Tag>
                <Paragraph style={{ fontSize: 14, marginTop: 8, marginBottom: 0 }}>
                  Maintains initial value, jumps to final value at last moment.
                </Paragraph>
              </Card>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Usage Workflow */}
      <Card title="System Usage Workflow" style={{ marginBottom: 24 }}>
        <Timeline>
          <Timeline.Item color="blue">
            <Text strong>Step 1: Configure Reagent Factors (Factors)</Text>
            <Paragraph style={{ fontSize: 14 }}>
              Add and configure parameters (Density, S, H, E, R, D, P) for all reagents to be used in experiments on Factors page
            </Paragraph>
          </Timeline.Item>
          <Timeline.Item color="green">
            <Text strong>Step 2: Set Experimental Methods (Methods)</Text>
            <Paragraph style={{ fontSize: 14 }}>
              Enter sample count, pretreatment reagent volumes, component ratios for mobile phases A and B
            </Paragraph>
          </Timeline.Item>
          <Timeline.Item color="purple">
            <Text strong>Step 3: Configure Gradient Program (HPLC Gradient)</Text>
            <Paragraph style={{ fontSize: 14 }}>
              Set gradient steps (time, mobile phase ratio, flow rate, curve type), system automatically calculates reagent volumes after saving
            </Paragraph>
          </Timeline.Item>
          <Timeline.Item color="orange">
            <Text strong>Step 4: View Results (Graph & Table)</Text>
            <Paragraph style={{ fontSize: 14 }}>
              View radar chart on Graph page, view detailed data report on Table page
            </Paragraph>
          </Timeline.Item>
        </Timeline>
      </Card>

      {/* Green Chemistry Metrics Explanation */}
      <Card title="Green Chemistry Assessment Metrics" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card type="inner" size="small">
              <SafetyOutlined style={{ fontSize: 20, color: '#3f8600', marginRight: 8 }} />
              <Text strong>Safety (S)</Text>
              <Paragraph style={{ fontSize: 14, marginTop: 8 }}>
                Assesses safety risks such as flammability, explosiveness, and corrosiveness of reagents.
                Lower scores indicate higher safety.
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner" size="small">
              <EnvironmentOutlined style={{ fontSize: 20, color: '#cf1322', marginRight: 8 }} />
              <Text strong>Health Hazard (H)</Text>
              <Paragraph style={{ fontSize: 14, marginTop: 8 }}>
                Assesses acute and chronic toxic effects of reagents on human body.
                Lower scores indicate lower health impacts.
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner" size="small">
              <EnvironmentOutlined style={{ fontSize: 20, color: '#1890ff', marginRight: 8 }} />
              <Text strong>Environmental Impact (E)</Text>
              <Paragraph style={{ fontSize: 14, marginTop: 8 }}>
                Assesses pollution levels of reagents on water, soil, and atmosphere.
                Lower scores indicate more environmentally friendly.
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner" size="small">
              <ReconciliationOutlined style={{ fontSize: 20, color: '#faad14', marginRight: 8 }} />
              <Text strong>Recyclability (R)</Text>
              <Paragraph style={{ fontSize: 14, marginTop: 8 }}>
                Assesses difficulty and feasibility of reagent recycling and reuse.
                Lower scores indicate easier recycling.
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner" size="small">
              <EnvironmentOutlined style={{ fontSize: 20, color: '#722ed1', marginRight: 8 }} />
              <Text strong>Disposal Difficulty (D)</Text>
              <Paragraph style={{ fontSize: 14, marginTop: 8 }}>
                Assesses complexity and cost of waste reagent disposal.
                Lower scores indicate easier disposal.
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner" size="small">
              <ThunderboltOutlined style={{ fontSize: 20, color: '#eb2f96', marginRight: 8 }} />
              <Text strong>Energy Consumption (P)</Text>
              <Paragraph style={{ fontSize: 14, marginTop: 8 }}>
                Assesses energy consumption during reagent production, transportation, and usage.
                Lower scores indicate lower energy consumption.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Technology Stack */}
      <Card title="Technology Stack" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Paragraph>
              <Text strong>Frontend Technologies:</Text>
              <ul>
                <li>React 18 - UI Framework</li>
                <li>TypeScript - Type Safety</li>
                <li>Ant Design - UI Component Library</li>
                <li>Recharts - Data Visualization</li>
                <li>Vite - Build Tool</li>
              </ul>
            </Paragraph>
          </Col>
          <Col span={12}>
            <Paragraph>
              <Text strong>Data Storage:</Text>
              <ul>
                <li>LocalStorage - Local Data Persistence</li>
                <li>Custom Events - Cross-component Communication</li>
                <li>React Hooks - State Management</li>
              </ul>
            </Paragraph>
          </Col>
        </Row>
      </Card>

      {/* Version Information */}
      <Card>
        <Paragraph>
          <Text strong>System Version:</Text> 1.0.0
        </Paragraph>
        <Paragraph>
          <Text strong>Development Date:</Text> November 2025
        </Paragraph>
        <Paragraph>
          <Text type="secondary" style={{ fontSize: 14 }}>
            This system follows green chemistry principles and is committed to promoting sustainable laboratory development.
          </Text>
        </Paragraph>
      </Card>
    </div>
  )
}

export default AboutPage
