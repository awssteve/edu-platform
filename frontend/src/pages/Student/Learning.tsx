import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Layout,
  Menu,
  Card,
  List,
  Button,
  Space,
  Tag,
  Progress,
  message,
  Avatar,
} from 'antd';
import {
  PlayCircleOutlined,
  FileTextOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Sider, Content } = Layout;

interface Chapter {
  id: string;
  chapter_number: number;
  chapter_title: string;
  completed: boolean;
}

interface Material {
  id: string;
  title: string;
  file_type: string;
  file_url: string;
  duration_seconds?: number;
  pages?: number;
  completed_pages?: number;
}

const Learning = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const courseResponse = await axios.get(
        `http://localhost:8000/api/v1/courses/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      setCourse(courseResponse.data);

      // Mock chapters data
      const mockChapters: Chapter[] = [
        {
          id: '1',
          chapter_number: 1,
          chapter_title: '第一章：新能源汽车概述',
          completed: true,
        },
        {
          id: '2',
          chapter_number: 2,
          chapter_title: '第二章：电驱动系统组成',
          completed: false,
        },
        {
          id: '3',
          chapter_number: 3,
          chapter_title: '第三章：动力电池系统',
          completed: false,
        },
        {
          id: '4',
          chapter_number: 4,
          chapter_title: '第四章：电机控制系统',
          completed: false,
        },
      ];
      setChapters(mockChapters);
      setSelectedChapter(mockChapters[0]);

      // Mock materials data
      const mockMaterials: Material[] = [
        {
          id: '1',
          title: '1.1 新能源汽车概述',
          file_type: 'video',
          file_url: '',
          duration_seconds: 1800,
          completed_pages: 1,
        },
        {
          id: '2',
          title: '1.2 新能源汽车发展历程',
          file_type: 'video',
          file_url: '',
          duration_seconds: 1500,
          completed_pages: 1,
        },
        {
          id: '3',
          title: '1.3 课件 PPT',
          file_type: 'ppt',
          file_url: '',
          pages: 25,
          completed_pages: 25,
        },
        {
          id: '4',
          title: '1.4 参考资料',
          file_type: 'pdf',
          file_url: '',
          pages: 12,
          completed_pages: 5,
        },
      ];
      setMaterials(mockMaterials);
      setCurrentMaterial(mockMaterials[0]);
    } catch (error: any) {
      message.error('获取课程信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialClick = (material: Material) => {
    setCurrentMaterial(material);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0 分钟';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} 分钟`;
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'video':
        return <PlayCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
      case 'ppt':
        return <FileTextOutlined style={{ fontSize: 24, color: '#faad14' }} />;
      case 'pdf':
        return <FileTextOutlined style={{ fontSize: 24, color: '#f5222d' }} />;
      default:
        return <FileTextOutlined style={{ fontSize: 24, color: '#8c8c8c' }} />;
    }
  };

  const getProgress = (material: Material) => {
    if (material.file_type === 'video') {
      return material.completed_pages === 1 ? 100 : 0;
    }
    if (material.pages && material.completed_pages) {
      return Math.round((material.completed_pages / material.pages) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        加载中...
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* Left Sidebar - Chapter List */}
      <Sider
        width={280}
        style={{
          background: 'white',
          borderRadius: 12,
          margin: '0 24px 0 0',
          overflow: 'auto',
          height: '100%',
        }}
      >
        <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
            章节目录
          </h3>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedChapter?.id || '']}
          style={{ borderRight: 0 }}
        >
          {chapters.map((chapter) => (
            <Menu.Item
              key={chapter.id}
              onClick={() => setSelectedChapter(chapter)}
              style={{
                padding: '16px 24px',
                borderRadius: 8,
                margin: '4px 16px',
              }}
            >
              <Space>
                {chapter.completed ? (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <BookOutlined style={{ color: '#8c8c8c' }} />
                )}
                <span style={{ fontSize: 15, fontWeight: chapter.id === selectedChapter?.id ? 500 : 400 }}>
                  {chapter.chapter_title}
                </span>
              </Space>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>

      {/* Right Content - Materials */}
      <Content style={{ padding: '0', background: '#f5f5f5' }}>
        <div className="learning-content">
          {/* Course Header */}
          <Card
            style={{
              marginBottom: 24,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <div style={{ color: 'white' }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, marginBottom: 8 }}>
                {course?.title}
              </h2>
              <Space size="middle">
                <Avatar
                  size="small"
                  src={course?.teacher?.avatar_url}
                  icon={<UserOutlined />}
                />
                <span>{course?.teacher?.full_name}</span>
                <span>|</span>
                <Tag color="white">{course?.category}</Tag>
              </Space>
            </div>
          </Card>

          {/* Chapter Title */}
          <Card style={{ marginBottom: 24, borderRadius: 12 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>
              {selectedChapter?.chapter_title}
            </h2>
            <Progress
              percent={materials.filter(m => getProgress(m) === 100).length / materials.length * 100}
              strokeColor="#52c41a"
              style={{ marginTop: 12 }}
            />
          </Card>

          {/* Material List */}
          <List
            dataSource={materials}
            renderItem={(material) => (
              <List.Item
                onClick={() => handleMaterialClick(material)}
                style={{
                  padding: '20px 24px',
                  borderRadius: 12,
                  marginBottom: 16,
                  background: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                }}
              >
                <List.Item.Meta
                  avatar={getFileIcon(material.file_type)}
                  title={
                    <div style={{ fontSize: 16, fontWeight: 500 }}>
                      {material.title}
                    </div>
                  }
                  description={
                    <Space size="middle" style={{ marginTop: 8 }}>
                      <Space>
                        <ClockCircleOutlined />
                        <span>
                          {material.file_type === 'video'
                            ? formatDuration(material.duration_seconds)
                            : `${material.pages || 0} 页`}
                        </span>
                      </Space>
                      <Tag color="blue">{material.file_type.toUpperCase()}</Tag>
                      {getProgress(material) === 100 && (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          已完成
                        </Tag>
                      )}
                    </Space>
                  }
                />
                <Progress
                  percent={getProgress(material)}
                  size="small"
                  strokeColor={
                    getProgress(material) === 100 ? '#52c41a' : '#1890ff'
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </Content>
    </Layout>
  );
};

export default Learning;
