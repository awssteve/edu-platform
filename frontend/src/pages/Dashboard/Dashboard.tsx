import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, List, Tag, Space, Avatar, Button } from 'antd';
import {
  BookOutlined,
  UserOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCourses: 12,
    totalStudents: 156,
    totalAssignments: 48,
    avgScore: 85.6,
  });

  const [recentCourses, setRecentCourses] = useState([
    {
      id: '1',
      title: '新能源汽车电驱动系统装调与质检',
      progress: 75,
      lastStudy: '2 小时前',
    },
    {
      id: '2',
      title: '人工智能基础',
      progress: 45,
      lastStudy: '1 天前',
    },
    {
      id: '3',
      title: '物联网技术与应用',
      progress: 30,
      lastStudy: '3 天前',
    },
  ]);

  const [upcomingTasks, setUpcomingTasks] = useState([
    {
      id: '1',
      title: '新能源汽车电驱动系统 - 第一章测验',
      deadline: '2026-03-28 23:59',
      status: 'pending',
    },
    {
      id: '2',
      title: '人工智能基础 - 实验报告',
      deadline: '2026-03-30 18:00',
      status: 'pending',
    },
    {
      id: '3',
      title: '讨论区 - 回复同学问题',
      deadline: '2026-03-29 12:00',
      status: 'pending',
    },
  ]);

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          欢迎回来！
        </h1>
        <p style={{ color: '#8c8c8c', fontSize: 16 }}>
          今天是 {new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <BookOutlined className="stat-icon" style={{ color: '#667eea' }} />
            <div className="stat-value">{stats.totalCourses}</div>
            <div className="stat-label">在学课程</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <UserOutlined className="stat-icon" style={{ color: '#f093fb' }} />
            <div className="stat-value">{stats.totalStudents}</div>
            <div className="stat-label">同学总数</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <CheckCircleOutlined className="stat-icon" style={{ color: '#4facfe' }} />
            <div className="stat-value">{stats.totalAssignments}</div>
            <div className="stat-label">已完成作业</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <TrophyOutlined className="stat-icon" style={{ color: '#fa709a' }} />
            <div className="stat-value">{stats.avgScore}</div>
            <div className="stat-label">平均成绩</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Recent Courses */}
        <Col xs={24} lg={14}>
          <Card
            title="最近学习"
            extra={
              <Button
                type="link"
                onClick={() => navigate('/courses')}
                style={{ color: '#667eea', fontWeight: 500 }}
              >
                查看全部 <RightOutlined />
              </Button>
            }
            style={{ borderRadius: 12 }}
          >
            <List
              dataSource={recentCourses}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                  onClick={() => navigate(`/learning/${item.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="large"
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                        icon={<BookOutlined />}
                      />
                    }
                    title={
                      <div style={{ fontSize: 16, fontWeight: 500 }}>
                        {item.title}
                      </div>
                    }
                    description={
                      <Space size="middle">
                        <Space>
                          <ClockCircleOutlined />
                          <span>{item.lastStudy}</span>
                        </Space>
                        <Tag color="blue">学习中</Tag>
                      </Space>
                    }
                  />
                  <div style={{ width: 200, textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#667eea' }}>
                      {item.progress}%
                    </div>
                    <div style={{ color: '#8c8c8c', fontSize: 12 }}>
                      学习进度
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Upcoming Tasks */}
        <Col xs={24} lg={10}>
          <Card
            title="待办任务"
            extra={
              <Button
                type="link"
                onClick={() => navigate('/assignments')}
                style={{ color: '#667eea', fontWeight: 500 }}
              >
                查看全部 <RightOutlined />
              </Button>
            }
            style={{ borderRadius: 12 }}
          >
            <List
              dataSource={upcomingTasks}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <List.Item.Meta
                    title={item.title}
                    description={
                      <Space size="small">
                        <ClockCircleOutlined style={{ color: '#faad14' }} />
                        <span style={{ color: '#8c8c8c' }}>
                          {item.deadline}
                        </span>
                      </Space>
                    }
                  />
                  <Tag color={item.status === 'pending' ? 'orange' : 'green'}>
                    {item.status === 'pending' ? '待完成' : '已完成'}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
