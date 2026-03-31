import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Button,
  Tag,
  Space,
  Descriptions,
  Tabs,
  List,
  Avatar,
  message,
  Spin,
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  BookOutlined,
  StarOutlined,
} from '@ant-design/icons';
import axios from 'axios';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  cover_url: string;
  tags: string[];
  teacher: {
    full_name: string;
    avatar_url: string;
  };
  materials: any[];
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/courses/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      setCourse(response.data);
    } catch (error: any) {
      message.error('获取课程详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="fade-in">
      {/* Course Header */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={24}>
          <Col span={8}>
            {course.cover_url ? (
              <img
                alt={course.title}
                src={course.cover_url}
                style={{ width: '100%', borderRadius: 8 }}
              />
            ) : (
              <div
                style={{
                  height: 240,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 64,
                  color: 'white',
                }}
              >
                <BookOutlined />
              </div>
            )}
          </Col>
          <Col span={16}>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
              {course.title}
            </h1>
            {course.category && (
              <Tag color="blue" style={{ marginBottom: 12 }}>
                {course.category}
              </Tag>
            )}
            <p style={{ fontSize: 16, color: '#595959', marginBottom: 16 }}>
              {course.description}
            </p>
            <Space size="middle">
              <Space>
                <Avatar
                  size="small"
                  src={course.teacher?.avatar_url}
                  icon={<UserOutlined />}
                />
                <span>{course.teacher?.full_name}</span>
              </Space>
              <Space>
                <StarOutlined style={{ color: '#faad14' }} />
                <span>4.8 分</span>
              </Space>
              <Space>
                <UserOutlined />
                <span>1,234 人学习</span>
              </Space>
            </Space>
            <div style={{ marginTop: 24 }}>
              <Button
                type="primary"
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: 8,
                  height: 44,
                  width: 160,
                }}
              >
                开始学习
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Course Content */}
      <Card>
        <Tabs
          defaultActiveKey="materials"
          items={[
            {
              key: 'materials',
              label: '课件资料',
              icon: <FileTextOutlined />,
              children: (
                <List
                  dataSource={course.materials || []}
                  renderItem={(item: any) => (
                    <List.Item
                      style={{
                        padding: '16px 24px',
                        borderRadius: 8,
                        marginBottom: 8,
                        background: '#fafafa',
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              background: '#e6f7ff',
                              borderRadius: 8,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 24,
                              color: '#1890ff',
                            }}
                          >
                            <FileTextOutlined />
                          </div>
                        }
                        title={item.title}
                        description={
                          <Space size="middle">
                            <Space>
                              <PlayCircleOutlined />
                              <span>{item.file_type}</span>
                            </Space>
                            <Space>
                              <ClockCircleOutlined />
                              <span>30 分钟</span>
                            </Space>
                          </Space>
                        }
                      />
                      <Button type="link">查看</Button>
                    </List.Item>
                  )}
                />
              ),
            },
            {
              key: 'assignments',
              label: '作业与考试',
              icon: <BookOutlined />,
              children: <p style={{ textAlign: 'center', color: '#8c8c8c' }}>
                暂无作业
              </p>,
            },
            {
              key: 'discussions',
              label: '讨论区',
              icon: <UserOutlined />,
              children: <p style={{ textAlign: 'center', color: '#8c8c8c' }}>
                暂无讨论
              </p>,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default CourseDetail;
