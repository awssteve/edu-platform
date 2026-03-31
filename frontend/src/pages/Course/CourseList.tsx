import { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Space, Button, Input, Select, Empty, message, Spin } from 'antd';
import {
  BookOutlined,
  UserOutlined,
  ClockCircleOutlined,
  StarOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;
const { Option } = Select;

interface Course {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  category: string;
  tags: string[];
  teacher: {
    full_name: string;
  };
  is_published: boolean;
}

const CourseList = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/v1/courses', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        params: {
          search: searchText,
          category: categoryFilter,
        },
      });
      setCourses(response.data);
    } catch (error: any) {
      message.error('获取课程列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [searchText, categoryFilter]);

  const categories = [
    { value: '新能源汽车', label: '新能源汽车' },
    { value: '人工智能', label: '人工智能' },
    { value: '软件工程', label: '软件工程' },
    { value: '物联网', label: '物联网' },
    { value: '其他', label: '其他' },
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
          课程中心
        </h1>
        <p style={{ color: '#8c8c8c' }}>
          探索丰富的课程资源，开启智能学习之旅
        </p>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Space size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Search
            placeholder="搜索课程..."
            allowClear
            enterButton
            size="large"
            style={{ width: 400 }}
            prefix={<SearchOutlined />}
            onSearch={(value) => setSearchText(value)}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="选择分类"
            allowClear
            style={{ width: 200 }}
            size="large"
            suffixIcon={<FilterOutlined />}
            onChange={setCategoryFilter}
          >
            {categories.map((cat) => (
              <Option key={cat.value} value={cat.value}>
                {cat.label}
              </Option>
            ))}
          </Select>
        </Space>
      </Card>

      {/* Course Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : courses.length === 0 ? (
        <Empty
          description="暂无课程"
          style={{ padding: 60 }}
        />
      ) : (
        <Row gutter={[24, 24]}>
          {courses.map((course) => (
            <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
              <Card
                hoverable
                className="course-card"
                cover={
                  course.cover_url ? (
                    <img
                      alt={course.title}
                      src={course.cover_url}
                      className="course-cover"
                    />
                  ) : (
                    <div
                      style={{
                        height: 200,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 48,
                        color: 'white',
                      }}
                    >
                      <BookOutlined />
                    </div>
                  )
                }
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="course-info">
                  {course.category && (
                    <Tag color="blue" style={{ marginBottom: 8 }}>
                      {course.category}
                    </Tag>
                  )}
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">
                    {course.description}
                  </p>
                  <div className="course-meta">
                    <Space>
                      <UserOutlined />
                      <span>{course.teacher?.full_name || '未知教师'}</span>
                    </Space>
                    <Space>
                      <StarOutlined />
                      <span>4.8</span>
                    </Space>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default CourseList;
