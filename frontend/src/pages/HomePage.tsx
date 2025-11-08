import React from 'react'
import { Card, Row, Col, Statistic, Typography } from 'antd'
import {
  ExperimentOutlined,
  BarChartOutlined,
  SafetyOutlined,
  RocketOutlined,
} from '@ant-design/icons'

const { Title, Paragraph } = Typography

const HomePage: React.FC = () => {
  return (
    <div>
      <Title level={2}>欢迎使用HPLC绿色化学分析系统</Title>
      <Paragraph>
        本系统集成了高效液相色谱（HPLC）数据分析与绿色化学评估功能，
        帮助您优化实验方案，减少环境影响，提高实验效率。
      </Paragraph>

      <Row gutter={16} style={{ marginTop: 32 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="绿色化学评估"
              value={0}
              prefix={<ExperimentOutlined />}
              suffix="次"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="色谱图分析"
              value={0}
              prefix={<BarChartOutlined />}
              suffix="次"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="溶剂安全性"
              value={95}
              prefix={<SafetyOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="优化建议"
              value={0}
              prefix={<RocketOutlined />}
              suffix="条"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="系统功能" bordered={false}>
            <Paragraph>
              <ul>
                <li>溶剂系统绿色化学评分</li>
                <li>Eco-Scale评估</li>
                <li>色谱图数据自动分析</li>
                <li>HPLC分析记录管理</li>
                <li>环境影响评估报告</li>
              </ul>
            </Paragraph>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="快速开始" bordered={false}>
            <Paragraph>
              <ol>
                <li>点击左侧菜单"绿色化学评估"开始溶剂评分</li>
                <li>使用"色谱图分析"上传或输入色谱数据</li>
                <li>在"分析记录"中查看历史分析结果</li>
                <li>根据评分结果优化您的实验方案</li>
              </ol>
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default HomePage
