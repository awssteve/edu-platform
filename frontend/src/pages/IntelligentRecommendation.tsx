/**
 * 智能推荐系统
 * 多维度个性化推荐：课程、知识点、学习路径、资源
 */

import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Tabs, Button, Tag, Progress, Rate, Space, Divider,
  List, Avatar, Tooltip, Badge, Empty, Spin, Select, Input, message
} from 'antd';
import {
  StarOutlined, ThunderboltOutlined, BookOutlined, BulbOutlined,
  FireOutlined, ClockCircleOutlined, EyeOutlined, RightOutlined,
  HeartOutlined, LineChartOutlined, TrophyOutlined, TeamOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { TabPane } = Tabs;
const { Search } = Input;
const API_BASE_URL = 'http://localhost:8000';

interface Recommendation {
  id: string;
  title: string;
  type: 'course' | 'knowledge' | 'path' | 'resource';
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  match_score: number;
  reason: string;
  tags: string[];
  estimated_time: string;
  enrolled_count?: number;
  rating?: number;
}

export function IntelligentRecommendation() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<{
    courses: Recommendation[];
    knowledge: Recommendation[];
    paths: Recommendation[];
    resources: Recommendation[];
  }>({
    courses: [],
    knowledge: [],
    paths: [],
    resources: []
  });
  const [activeTab, setActiveTab] = useState('courses');
  const [userPreferences, setUserPreferences] = useState({
    interests: [] as string[],
    level: 'beginner',
    goals: [] as string[]
  });

  useEffect(() => {
    loadRecommendations();
    loadUserPreferences();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // 使用mock数据
      const mockRecommendations = generateMockRecommendations();
      setRecommendations(mockRecommendations);
    } catch (error) {
      message.error('加载推荐失败');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = () => {
    // 模拟用户偏好
    setUserPreferences({
      interests: ['编程', '数据分析', '人工智能'],
      level: 'intermediate',
      goals: ['技能提升', '职业发展']
    });
  };

  const generateMockRecommendations = () => ({
    courses: [
      {
        id: '1',
        title: 'Python进阶编程',
        type: 'course',
        description: '深入学习Python高级特性，包括装饰器、生成器、元类等',
        difficulty: 3,
        match_score: 95,
        reason: '基于你最近的学习进度和Python基础课程完成情况',
        tags: ['Python', '高级编程', '实战'],
        estimated_time: '8周',
        enrolled_count: 1234,
        rating: 4.8
      },
      {
        id: '2',
        title: '数据结构与算法实战',
        type: 'course',
        description: '通过实际项目掌握常用数据结构和算法',
        difficulty: 4,
        match_score: 88,
        reason: '适合提升编程能力和解决复杂问题',
        tags: ['算法', '数据结构', '面试'],
        estimated_time: '10周',
        enrolled_count: 892,
        rating: 4.7
      },
      {
        id: '3',
        title: '机器学习入门',
        type: 'course',
        description: '从零开始学习机器学习核心概念和算法',
        difficulty: 3,
        match_score: 82,
        reason: '与你的数据分析兴趣高度匹配',
        tags: ['机器学习', 'AI', 'Python'],
        estimated_time: '12周',
        enrolled_count: 2341,
        rating: 4.9
      }
    ],
    knowledge: [
      {
        id: 'k1',
        title: 'Python装饰器详解',
        type: 'knowledge',
        description: '理解装饰器的工作原理和应用场景',
        difficulty: 3,
        match_score: 91,
        reason: '你在最近的学习中表现出对高级Python特性的兴趣',
        tags: ['Python', '高级', '函数式编程'],
        estimated_time: '2小时'
      },
      {
        id: 'k2',
        title: '二叉树遍历算法',
        type: 'knowledge',
        description: '掌握前序、中序、后序遍历的实现',
        difficulty: 2,
        match_score: 85,
        reason: '数据结构学习的重要基础',
        tags: ['算法', '树', '遍历'],
        estimated_time: '3小时'
      }
    ],
    paths: [
      {
        id: 'p1',
        title: '全栈Python开发工程师',
        type: 'path',
        description: '从Python基础到Web开发的完整学习路径',
        difficulty: 3,
        match_score: 94,
        reason: '结合你的学习目标和当前水平量身定制',
        tags: ['Python', 'Web开发', '数据库'],
        estimated_time: '6个月'
      },
      {
        id: 'p2',
        title: '数据分析师成长路径',
        type: 'path',
        description: '从数据收集到可视化分析的完整体系',
        difficulty: 3,
        match_score: 89,
        reason: '适合你的数据分析兴趣方向',
        tags: ['数据分析', '可视化', '统计学'],
        estimated_time: '4个月'
      }
    ],
    resources: [
      {
        id: 'r1',
        title: 'Python最佳实践指南',
        type: 'resource',
        description: '业界认可的Python代码风格和最佳实践',
        difficulty: 2,
        match_score: 87,
        reason: '提升代码质量和可维护性',
        tags: ['Python', '最佳实践', '文档'],
        estimated_time: '1小时'
      },
      {
        id: 'r2',
        title: '算法可视化工具推荐',
        type: 'resource',
        description: '帮助理解算法执行过程的在线工具',
        difficulty: 1,
        match_score: 83,
        reason: '辅助算法学习的实用资源',
        tags: ['算法', '工具', '可视化'],
        estimated_time: '30分钟'
      }
    ]
  });

  const handleEnroll = async (itemId: string) => {
    message.success('已加入学习计划！');
  };

  const handleBookmark = async (itemId: string) => {
    message.success('已添加到收藏！');
  };

  const renderRecommendationCard = (item: Recommendation) => (
    <Card
      key={item.id}
      hoverable
      style={{ marginBottom: 16, borderRadius: 12 }}
      bodyStyle={{ padding: '20px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 18, color: '#333' }}>
              {item.title}
            </h3>
            <Badge
              count={`${item.match_score}%匹配`}
              style={{
                backgroundColor: item.match_score >= 90 ? '#52c41a' : '#1890ff',
                marginLeft: 12
              }}
            />
          </div>
          <p style={{ color: '#666', margin: '8px 0', fontSize: 14 }}>
            {item.description}
          </p>
        </div>
        <div style={{ textAlign: 'right', marginLeft: 20 }}>
          <Progress
            type="circle"
            percent={item.match_score}
            width={60}
            strokeColor={item.match_score >= 90 ? '#52c41a' : '#1890ff'}
          />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <Space wrap>
          {item.tags.map(tag => (
            <Tag key={tag} color="blue">{tag}</Tag>
          ))}
          <Tag color={item.difficulty <= 2 ? 'green' : item.difficulty <= 3 ? 'blue' : 'orange'}>
            难度: {'⭐'.repeat(item.difficulty)}
          </Tag>
          <Tag icon={<ClockCircleOutlined />} color="default">
            {item.estimated_time}
          </Tag>
          {item.rating && (
            <Tag icon={<StarOutlined />} color="gold">
              {item.rating}
            </Tag>
          )}
        </Space>
      </div>

      <div style={{
        padding: '12px',
        background: '#f0f5ff',
        borderRadius: '8px',
        marginBottom: 12,
        fontSize: 13,
        color: '#1890ff'
      }}>
        💡 {item.reason}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: '#999' }}>
          {item.enrolled_count && `${item.enrolled_count}人已学习`}
        </div>
        <Space>
          <Button
            icon={<HeartOutlined />}
            onClick={() => handleBookmark(item.id)}
            style={{ borderRadius: 6 }}
          >
            收藏
          </Button>
          <Button
            type="primary"
            icon={<RightOutlined />}
            onClick={() => handleEnroll(item.id)}
            style={{ borderRadius: 6 }}
          >
            开始学习
          </Button>
        </Space>
      </div>
    </Card>
  );

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, color: '#333' }}>
          ⭐ 智能推荐系统
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          基于AI算法为你推荐最适合的学习内容
        </p>
      </div>

      {/* 用户偏好概览 */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }} bodyStyle={{ padding: '20px' }}>
        <Row gutter={24}>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>学习目标</div>
              <div style={{ color: '#666', fontSize: 14 }}>
                {userPreferences.goals.join('、')}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>兴趣领域</div>
              <div style={{ color: '#666', fontSize: 14 }}>
                {userPreferences.interests.join('、')}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>当前水平</div>
              <div style={{ color: '#666', fontSize: 14 }}>
                {userPreferences.level === 'beginner' ? '初级' :
                 userPreferences.level === 'intermediate' ? '中级' : '高级'}
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 推荐内容 */}
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: '24px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          tabBarStyle={{ marginBottom: 24 }}
        >
          <TabPane
            tab={
              <span>
                <BookOutlined />
                课程推荐
                <Badge count={recommendations.courses.length} style={{ marginLeft: 8 }} />
              </span>
            }
            key="courses"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" />
              </div>
            ) : recommendations.courses.length > 0 ? (
              recommendations.courses.map(item => renderRecommendationCard(item))
            ) : (
              <Empty description="暂无推荐课程" />
            )}
          </TabPane>

          <TabPane
            tab={
              <span>
                <BulbOutlined />
                知识点推荐
                <Badge count={recommendations.knowledge.length} style={{ marginLeft: 8 }} />
              </span>
            }
            key="knowledge"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" />
              </div>
            ) : recommendations.knowledge.length > 0 ? (
              recommendations.knowledge.map(item => renderRecommendationCard(item))
            ) : (
              <Empty description="暂无推荐知识点" />
            )}
          </TabPane>

          <TabPane
            tab={
              <span>
                <LineChartOutlined />
                学习路径
                <Badge count={recommendations.paths.length} style={{ marginLeft: 8 }} />
              </span>
            }
            key="paths"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" />
              </div>
            ) : recommendations.paths.length > 0 ? (
              recommendations.paths.map(item => renderRecommendationCard(item))
            ) : (
              <Empty description="暂无推荐路径" />
            )}
          </TabPane>

          <TabPane
            tab={
              <span>
                <FireOutlined />
                学习资源
                <Badge count={recommendations.resources.length} style={{ marginLeft: 8 }} />
              </span>
            }
            key="resources"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" />
              </div>
            ) : recommendations.resources.length > 0 ? (
              recommendations.resources.map(item => renderRecommendationCard(item))
            ) : (
              <Empty description="暂无推荐资源" />
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* 推荐说明 */}
      <Card
        style={{
          marginTop: 24,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none'
        }}
        bodyStyle={{ padding: '20px', color: 'white' }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: 40, marginRight: 16 }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              AI智能推荐算法
            </div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>
              基于你的学习行为、知识掌握情况、兴趣偏好等多维度数据，利用机器学习算法为你推荐最适合的学习内容。
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            style={{ background: 'white', color: '#667eea', border: 'none' }}
            onClick={loadRecommendations}
          >
            刷新推荐
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default IntelligentRecommendation;