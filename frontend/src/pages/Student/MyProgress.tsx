import { useState, useEffect } from 'react';
import { Row, Col, Card, Progress, List, Tag, Space, Avatar, message } from 'antd';
import {
  TrophyOutlined,
  BookOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FireOutlined,
  UserOutlined,
  StarOutlined,
} from '@ant-design/icons';
import axios from 'axios';

interface Course {
  id: string;
  title: string;
  progress: number;
  total_study_time_minutes: number;
  final_score: number;
  teacher: {
    full_name: string;
  };
}

const MyProgress = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalStudyTime: 0,
    avgScore: 0,
  });

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      // Mock data - in production, fetch from API
      const mockCourses: Course[] = [
        {
          id: '1',
          title: '新能源汽车电驱动系统装调与质检',
          progress: 75,
          total_study_time_minutes: 1800,
          final_score: 85,
          teacher: { full_name: '张教授' },
        },
        {
          id: '2',
          title: '人工智能基础',
          progress: 45,
          total_study_time_minutes: 900,
          final_score: null,
          teacher: { full_name: '李老师' },
        },
        {
          id: '3',
          title: '物联网技术与应用',
          progress: 30,
          total_study_time_minutes: 600,
          final_score: null,
          teacher: { full_name: '王老师' },
        },
        {
          id: '4',
          title: '软件工程',
          progress: 100,
          total_study_time_minutes: 2400,
          final_score: 92,
          teacher: { full_name: '赵老师' },
        },
      ];

      setCourses(mockCourses);

      // Calculate stats
      const completedCount = mockCourses.filter(c => c.progress === 100).length;
      const totalTime = mockCourses.reduce((sum, c) => sum + c.total_study_time_minutes, 0);
      const avgScore = mockCourses
        .filter(c => c.final_score !== null)
        .reduce((sum, c, _, arr) => {
          return arr.length > 0 ? (sum + c.final_score) / arr.filter(c => c.final_score !== null).length : 0;
        }, 0);

      setStats({
        totalCourses: mockCourses.length,
        completedCourses: completedCount,
        totalStudyTime: totalTime,
        avgScore: Math.round(avgScore),
      });
    } catch (error: any) {
      message.error('获取学习进度失败');
    } finally {
      setLoading(false);
    }
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 80) return '#1890ff';
    if (score >= 70) return '#faad14';
    return '#f5222d';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        加载中...
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          学习进度
        </h1>
        <p style={{ color: '#8c8c8c', fontSize: 16 }}>
          查看所有课程的学习情况
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
            <TrophyOutlined className="stat-icon" style={{ color: '#f093fb' }} />
            <div className="stat-value">{stats.completedCourses}</div>
            <div className="stat-label">已完成课程</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <ClockCircleOutlined className="stat-icon" style={{ color: '#4facfe' }} />
            <div className="stat-value">{formatStudyTime(stats.totalStudyTime)}</div>
            <div className="stat-label">总学习时长</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <StarOutlined className="stat-icon" style={{ color: '#fa709a' }} />
            <div className="stat-value">{stats.avgScore}</div>
            <div className="stat-label">平均成绩</div>
          </Card>
        </Col>
      </Row>

      {/* Course Progress */}
      <Card title="课程进度" style={{ borderRadius: 12 }}>
        <List
          dataSource={courses}
          renderItem={(course) => (
            <List.Item
              style={{
                padding: '20px 0',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={48}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                    icon={<BookOutlined />}
                  />
                }
                title={
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                    {course.title}
                  </div>
                }
                description={
                  <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space size="middle">
                      <Space>
                        <UserOutlined />
                        <span>{course.teacher.full_name}</span>
                      </Space>
                      <Space>
                        <ClockCircleOutlined />
                        <span>{formatStudyTime(course.total_study_time_minutes)}</span>
                      </Space>
                    </Space>
                    {course.final_score !== null && (
                      <Space>
                        <TrophyOutlined />
                        <span style={{ 
                          fontWeight: 600,
                          color: getScoreColor(course.final_score)
                        }}>
                          {course.final_score} 分
                        </span>
                      </Space>
                    )}
                  </Space>
                }
              />
              <div style={{ width: '100%', marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Space size="small">
                    {course.progress === 100 && (
                      <Tag color="success" icon={<TrophyOutlined />}>
                        已完成
                      </Tag>
                    )}
                    {course.progress < 100 && course.progress > 50 && (
                      <Tag color="processing" icon={<RiseOutlined />}>
                        学习中
                      </Tag>
                    )}
                    {course.progress < 50 && (
                      <Tag color="default" icon={<FireOutlined />}>
                        开始学习
                      </Tag>
                    )}
                  </Space>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>
                    {course.progress}%
                  </span>
                </div>
                <Progress
                  percent={course.progress}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  size="large"
                />
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default MyProgress;
