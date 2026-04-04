/**
 * 自适应学习路径系统
 * 根据学习情况动态调整学习路径和推荐内容
 */

import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Steps, Progress, Button, Tag, Space, Timeline,
  List, Avatar, Rate, Modal, Form, Input, Select, Alert, Tooltip, Badge
} from 'antd';
import {
  CheckCircleOutlined, ClockCircleOutlined, StarOutlined,
  BookOutlined, TrophyOutlined, AimOutlined, LineChartOutlined,
  ThunderboltOutlined, RightOutlined, BulbOutlined, FlagFilled
} from '@ant-design/icons';

const { Step } = Steps;
const { Option } = Select;

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  completed: boolean;
  progress: number;
  estimatedTime: string;
  skills: string[];
  resources: Resource[];
}

interface Resource {
  id: string;
  type: 'video' | 'article' | 'quiz' | 'project';
  title: string;
  duration: string;
  completed: boolean;
}

interface AdaptiveRecommendation {
  type: 'adjustment' | 'acceleration' | 'review';
  reason: string;
  suggestion: string;
  confidence: number;
}

export function AdaptiveLearning() {
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AdaptiveRecommendation[]>([]);
  const [learningGoals, setLearningGoals] = useState({
    targetLevel: 'intermediate',
    weeklyHours: 10,
    focusAreas: ['Python', '算法']
  });

  useEffect(() => {
    loadAdaptivePath();
    generateRecommendations();
  }, []);

  const loadAdaptivePath = () => {
    // 模拟当前学习路径
    setCurrentPath({
      id: 'python-dev-path',
      title: 'Python全栈开发工程师',
      description: '从Python基础到Web开发的完整学习路径',
      difficulty: 3,
      completed: false,
      progress: 65,
      estimatedTime: '16周',
      skills: ['Python', 'Django', '数据库', '前端开发'],
      resources: [
        {
          id: '1',
          type: 'video',
          title: 'Python高级特性',
          duration: '2小时',
          completed: true
        },
        {
          id: '2',
          type: 'article',
          title: 'Django框架入门',
          duration: '1.5小时',
          completed: true
        },
        {
          id: '3',
          type: 'project',
          title: '博客系统实战项目',
          duration: '8小时',
          completed: false
        },
        {
          id: '4',
          type: 'quiz',
          title: '期中测试',
          duration: '30分钟',
          completed: false
        }
      ]
    });
  };

  const generateRecommendations = () => {
    // 模拟AI自适应推荐
    setRecommendations([
      {
        type: 'acceleration',
        reason: '你在Python基础测试中表现优秀(92分)',
        suggestion: '建议跳过基础部分，直接进入Django框架学习',
        confidence: 0.88
      },
      {
        type: 'adjustment',
        reason: '学习数据显示你对实践项目更感兴趣',
        suggestion: '增加项目实战比例，减少理论讲解时间',
        confidence: 0.82
      },
      {
        type: 'review',
        reason: '数据库部分掌握不够牢固',
        suggestion: '建议复习SQL基础和数据库设计',
        confidence: 0.75
      }
    ]);
  };

  const getResourceIcon = (type: string) => {
    const icons = {
      video: '🎥',
      article: '📄',
      quiz: '✅',
      project: '💻'
    };
    return icons[type as keyof typeof icons] || '📚';
  };

  const getRecommendationColor = (type: string) => {
    const colors = {
      acceleration: '#52c41a',
      adjustment: '#1890ff',
      review: '#faad14'
    };
    return colors[type as keyof typeof colors] || '#1890ff';
  };

  const handleStartResource = (resourceId: string) => {
    // 开始学习资源
    Modal.info({
      title: '开始学习',
      content: `即将加载学习资源...`,
    });
  };

  const handleAdjustPath = () => {
    Modal.confirm({
      title: '调整学习路径',
      content: '系统建议调整你的学习路径。是否接受AI推荐并进行调整？',
      onOk() {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(null);
          }, 1000);
        });
      },
    });
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, color: '#333' }}>
          🎯 自适应学习路径
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          AI智能分析学习情况，动态调整学习路径
        </p>
      </div>

      {/* AI自适应建议 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {recommendations.map((rec, index) => (
          <Col span={8} key={index}>
            <Card
              style={{
                borderRadius: 12,
                borderTop: `4px solid ${getRecommendationColor(rec.type)}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Tag color={getRecommendationColor(rec.type)}>
                  {rec.type === 'acceleration' ? '加速' : rec.type === 'adjustment' ? '调整' : '复习'}
                </Tag>
                <span style={{ fontSize: 12, color: '#999' }}>
                  置信度: {(rec.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ marginBottom: 12, fontSize: 13, color: '#666' }}>
                💡 {rec.reason}
              </div>
              <div style={{
                padding: '12px',
                background: '#f0f5ff',
                borderRadius: '8px',
                fontSize: 14,
                color: '#1890ff',
                marginBottom: 12
              }}>
                {rec.suggestion}
              </div>
              <Button type="primary" size="small" block onClick={handleAdjustPath}>
                应用建议
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 当前学习路径 */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }} bodyStyle={{ padding: '24px' }}>
        <Row gutter={24}>
          <Col span={16}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, marginBottom: 8 }}>
                {currentPath?.title}
              </h2>
              <p style={{ color: '#666', marginBottom: 16 }}>
                {currentPath?.description}
              </p>
              <Space wrap>
                {currentPath?.skills.map(skill => (
                  <Tag key={skill} color="blue">{skill}</Tag>
                ))}
                <Tag icon={<ClockCircleOutlined />}>{currentPath?.estimatedTime}</Tag>
                <Tag color="orange">难度: {'⭐'.repeat(currentPath?.difficulty || 3)}</Tag>
              </Space>
            </div>

            {/* 学习进度 */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>整体进度</span>
                <span style={{ fontWeight: 600 }}>{currentPath?.progress}%</span>
              </div>
              <Progress
                percent={currentPath?.progress}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                strokeWidth={12}
              />
            </div>

            {/* 学习资源列表 */}
            <div>
              <h3 style={{ marginBottom: 16 }}>学习内容</h3>
              <List
                dataSource={currentPath?.resources}
                renderItem={(item, index) => (
                  <List.Item
                    style={{
                      padding: '16px',
                      background: item.completed ? '#f6ffed' : 'white',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      border: item.completed ? '1px solid #b7eb8f' : '1px solid #f0f0f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <div style={{
                        fontSize: 32,
                        marginRight: 16,
                        opacity: item.completed ? 0.5 : 1
                      }}>
                        {getResourceIcon(item.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, marginRight: 12 }}>
                            {index + 1}. {item.title}
                          </span>
                          {item.completed && (
                            <Tag color="success" icon={<CheckCircleOutlined />}>
                              已完成
                            </Tag>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: '#999' }}>
                          时长: {item.duration}
                        </div>
                      </div>
                      {!item.completed && (
                        <Button
                          type="primary"
                          icon={<RightOutlined />}
                          onClick={() => handleStartResource(item.id)}
                        >
                          开始学习
                        </Button>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </Col>

          <Col span={8}>
            {/* 学习目标 */}
            <Card
              size="small"
              title={<span><AimOutlined /> 学习目标</span>}
              style={{ marginBottom: 16 }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <div style={{ marginBottom: 8, fontSize: 13, color: '#666' }}>
                    目标水平
                  </div>
                  <Select
                    value={learningGoals.targetLevel}
                    onChange={(value) => setLearningGoals(prev => ({ ...prev, targetLevel: value }))}
                    style={{ width: '100%' }}
                  >
                    <Option value="beginner">初级</Option>
                    <Option value="intermediate">中级</Option>
                    <Option value="advanced">高级</Option>
                  </Select>
                </div>
                <div>
                  <div style={{ marginBottom: 8, fontSize: 13, color: '#666' }}>
                    每周学习时长
                  </div>
                  <Select
                    value={learningGoals.weeklyHours}
                    onChange={(value) => setLearningGoals(prev => ({ ...prev, weeklyHours: value }))}
                    style={{ width: '100%' }}
                  >
                    <Option value={5}>5小时/周</Option>
                    <Option value={10}>10小时/周</Option>
                    <Option value={15}>15小时/周</Option>
                    <Option value={20}>20小时/周</Option>
                  </Select>
                </div>
              </Space>
            </Card>

            {/* 预计完成时间 */}
            <Card
              size="small"
              title={<span><FlagFilled /> 预计完成</span>}
            >
              <Timeline>
                <Timeline.Item color="green">
                  <div>已完成基础部分</div>
                  <div style={{ fontSize: 12, color: '#999' }}>2周前</div>
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <div>当前: Django框架</div>
                  <div style={{ fontSize: 12, color: '#999' }}>预计2周完成</div>
                </Timeline.Item>
                <Timeline.Item>
                  <div>前端开发</div>
                  <div style={{ fontSize: 12, color: '#999' }}>预计4周后</div>
                </Timeline.Item>
                <Timeline.Item>
                  <div>毕业项目</div>
                  <div style={{ fontSize: 12, color: '#999' }}>预计6周后</div>
                </Timeline.Item>
              </Timeline>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* AI智能分析 */}
      <Alert
        message="🤖 AI自适应分析"
        description="系统根据你的学习数据（测试成绩、学习时长、完成度等）实时分析并优化学习路径。当前分析认为你的学习进度良好，建议适当加快学习节奏。"
        type="info"
        showIcon
        style={{ borderRadius: 12 }}
      />
    </div>
  );
}

export default AdaptiveLearning;