/**
 * 学习分析系统
 * 学习行为追踪、数据可视化、个性化洞察
 */

import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Progress, Tabs, List, Tag, Space,
  DatePicker, Select, Button, Divider, Empty, Spin, Rate, Timeline,
  Alert, Tooltip, Badge
} from 'antd';
import {
  RiseOutlined, FallOutlined, TrophyOutlined, ClockCircleOutlined,
  FireOutlined, BookOutlined, AimOutlined, LineChartOutlined,
  PieChartOutlined, BarChartOutlined, ThunderboltOutlined, StarOutlined,
  CheckCircleOutlined, WarningOutlined, InfoOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface LearningData {
  totalHours: number;
  completedCourses: number;
  averageScore: number;
  consistency: number;
  weeklyProgress: number[];
  strengths: string[];
  improvements: string[];
  recentActivity: ActivityItem[];
  predictions: Prediction[];
}

interface ActivityItem {
  id: string;
  type: 'course' | 'quiz' | 'assignment' | 'discussion';
  title: string;
  time: string;
  duration: string;
  score?: number;
}

interface Prediction {
  type: string;
  prediction: string;
  confidence: number;
  recommendation: string;
}

export function LearningAnalytics() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LearningData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // 模拟数据分析
      const mockData = generateMockAnalytics();
      setData(mockData);
    } catch (error) {
      console.error('加载分析数据失败');
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalytics = (): LearningData => ({
    totalHours: 127.5,
    completedCourses: 5,
    averageScore: 87.3,
    consistency: 85,
    weeklyProgress: [65, 72, 68, 85, 90, 78, 82],
    strengths: [
      '编程能力强，代码质量高',
      '学习积极主动，完成度高',
      '理论知识扎实，理解能力强'
    ],
    improvements: [
      '需要加强实践项目经验',
      '建议参与更多讨论交流',
      '可以尝试更有挑战性的内容'
    ],
    recentActivity: [
      {
        id: '1',
        type: 'course',
        title: '完成Python高级编程课程',
        time: '2小时前',
        duration: '45分钟',
        score: 95
      },
      {
        id: '2',
        type: 'quiz',
        title: '数据结构测验',
        time: '昨天',
        duration: '30分钟',
        score: 88
      },
      {
        id: '3',
        type: 'assignment',
        title: '提交算法作业',
        time: '2天前',
        duration: '2小时',
        score: 92
      },
      {
        id: '4',
        type: 'discussion',
        title: '参与Python讨论区',
        time: '3天前',
        duration: '15分钟'
      }
    ],
    predictions: [
      {
        type: 'course_completion',
        prediction: '预计将在2周内完成当前课程',
        confidence: 0.92,
        recommendation: '保持当前学习节奏，可以开始预习下一章内容'
      },
      {
        type: 'skill_development',
        prediction: 'Python技能即将达到高级水平',
        confidence: 0.85,
        recommendation: '建议挑战一些实际项目来巩固技能'
      },
      {
        type: 'learning_efficiency',
        prediction: '学习效率比上月提升23%',
        confidence: 0.88,
        recommendation: '当前学习方法很有效，继续保持'
      }
    ]
  });

  const getActivityIcon = (type: string) => {
    const icons = {
      course: <BookOutlined style={{ color: '#1890ff' }} />,
      quiz: <AimOutlined style={{ color: '#52c41a' }} />,
      assignment: <CheckCircleOutlined style={{ color: '#fa8c16' }} />,
      discussion: <ThunderboltOutlined style={{ color: '#722ed1' }} />
    };
    return icons[type as keyof typeof icons] || <InfoOutlined />;
  };

  const renderOverview = () => (
    <div>
      {/* 关键指标卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="学习时长"
              value={data?.totalHours}
              suffix="小时"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 12, fontSize: 13, color: '#52c41a' }}>
              <RiseOutlined /> 本月增加12.5小时
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="完成课程"
              value={data?.completedCourses}
              suffix="门"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 12, fontSize: 13, color: '#52c41a' }}>
              <RiseOutlined /> 超过82%的学习者
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均成绩"
              value={data?.averageScore}
              suffix="分"
              precision={1}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ marginTop: 12, fontSize: 13, color: '#52c41a' }}>
              <RiseOutlined /> 比上月提高3.2分
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="学习坚持度"
              value={data?.consistency}
              suffix="%"
              prefix={<FireOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
            <div style={{ marginTop: 12, fontSize: 13, color: '#52c41a' }}>
              <RiseOutlined /> 保持优秀水平
            </div>
          </Card>
        </Col>
      </Row>

      {/* 学习进度图表 */}
      <Card
        title={
          <Space>
            <LineChartOutlined />
            <span>学习趋势</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 12 }}>每周学习时长</h4>
              <div style={{ height: 200 }}>
                {data?.weeklyProgress.map((value, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'inline-block',
                      width: '10%',
                      height: `${value * 1.5}px`,
                      background: value > 80 ? '#52c41a' : value > 60 ? '#1890ff' : '#faad14',
                      margin: '0 2%',
                      borderRadius: '4px 4px 0 0',
                      position: 'relative',
                      transition: 'all 0.3s'
                    }}
                  >
                    <Tooltip title={`周${index + 1}: ${value}分钟`}>
                      <div style={{
                        position: 'absolute',
                        bottom: -25,
                        left: 0,
                        right: 0,
                        textAlign: 'center',
                        fontSize: 12,
                        color: '#666'
                      }}>
                        {index + 1}
                      </div>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div>
              <h4 style={{ marginBottom: 16 }}>学习分布</h4>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={75}
                    size={100}
                    strokeColor="#1890ff"
                  />
                  <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
                    视频学习
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={60}
                    size={100}
                    strokeColor="#52c41a"
                  />
                  <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
                    实践练习
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={45}
                    size={100}
                    strokeColor="#faad14"
                  />
                  <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
                    讨论交流
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 优势与改进建议 */}
      <Row gutter={24}>
        <Col span={12}>
          <Card
            title={
              <Space>
                <TrophyOutlined style={{ color: '#ffd700' }} />
                <span>学习优势</span>
              </Space>
            }
          >
            <List
              dataSource={data?.strengths}
              renderItem={(item, index) => (
                <List.Item key={index}>
                  <Space>
                    <Badge status="success" />
                    <span>{item}</span>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#faad14' }} />
                <span>改进建议</span>
              </Space>
            }
          >
            <List
              dataSource={data?.improvements}
              renderItem={(item, index) => (
                <List.Item key={index}>
                  <Space>
                    <Badge status="warning" />
                    <span>{item}</span>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderActivity = () => (
    <Card title="学习活动记录">
      <Timeline
        items={data?.recentActivity.map(item => ({
          dot: getActivityIcon(item.type),
          children: (
            <Card size="small" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#999' }}>
                    {item.time} · 学习时长: {item.duration}
                  </div>
                </div>
                {item.score && (
                  <Tag color="green" style={{ fontSize: 14 }}>
                    {item.score}分
                  </Tag>
                )}
              </div>
            </Card>
          )
        }))}
      />
    </Card>
  );

  const renderPredictions = () => (
    <div>
      <Alert
        message="AI智能预测"
        description="基于你的学习数据和AI算法，预测你的学习发展趋势"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
      <List
        dataSource={data?.predictions}
        renderItem={(item, index) => (
          <Card
            key={index}
            style={{ marginBottom: 16, borderRadius: 12 }}
            bodyStyle={{ padding: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>
                {index === 0 && '🎯 课程完成预测'}
                {index === 1 && '📈 技能发展预测'}
                {index === 2 && '⚡ 学习效率预测'}
              </h3>
              <Badge
                count={`置信度 ${(item.confidence * 100).toFixed(0)}%`}
                style={{
                  backgroundColor: item.confidence > 0.9 ? '#52c41a' : '#1890ff'
                }}
              />
            </div>
            <div style={{
              padding: '12px',
              background: '#f0f5ff',
              borderRadius: '8px',
              marginBottom: 12,
              fontSize: 14
            }}>
              {item.prediction}
            </div>
            <div style={{
              padding: '12px',
              background: '#f6ffed',
              borderRadius: '8px',
              fontSize: 13,
              color: '#52c41a'
            }}>
              💡 {item.recommendation}
            </div>
          </Card>
        )}
      />
    </div>
  );

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, color: '#333' }}>
          📊 学习分析
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          深入了解你的学习情况，优化学习效果
        </p>
      </div>

      {/* 时间范围选择 */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Space size="large">
          <span>时间范围:</span>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
          >
            <Select.Option value="week">最近一周</Select.Option>
            <Select.Option value="month">最近一月</Select.Option>
            <Select.Option value="all">全部时间</Select.Option>
          </Select>
          <Button
            icon={<LineChartOutlined />}
            onClick={loadAnalytics}
            loading={loading}
          >
            刷新数据
          </Button>
        </Space>
      </Card>

      {/* 内容区域 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : data ? (
        <Card bodyStyle={{ padding: '24px', borderRadius: 12 }}>
          <Tabs defaultActiveKey="overview" size="large">
            <TabPane
              tab={
                <span>
                  <BarChartOutlined />
                  学习概览
                </span>
              }
              key="overview"
            >
              {renderOverview()}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <ClockCircleOutlined />
                  活动记录
                </span>
              }
              key="activity"
            >
              {renderActivity()}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <PieChartOutlined />
                  AI预测
                </span>
              }
              key="predictions"
            >
              {renderPredictions()}
            </TabPane>
          </Tabs>
        </Card>
      ) : (
        <Empty description="暂无学习数据" />
      )}
    </div>
  );
}

export default LearningAnalytics;