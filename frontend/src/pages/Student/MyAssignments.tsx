import { useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Tag,
  Space,
  Progress,
  message,
  Empty,
  Descriptions,
} from 'antd';
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  RightOutlined,
  BookOutlined,
} from '@ant-design/icons';
import axios from 'axios';

interface Assignment {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  total_questions: number;
  total_score: number;
  status: string;
  student_score?: number;
  submitted_at?: string;
}

const MyAssignments = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'http://localhost:8000/api/v1/assignments/my/submissions',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      setAssignments(response.data);
    } catch (error: any) {
      message.error('获取作业列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'default';
      case 'in_progress':
        return 'processing';
      case 'submitted':
        return 'success';
      case 'graded':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not_started':
        return '未开始';
      case 'in_progress':
        return '进行中';
      case 'submitted':
        return '已提交';
      case 'graded':
        return '已批改';
      default:
        return '未知';
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === 'all') return true;
    if (filter === 'pending') {
      return assignment.status === 'not_started' || assignment.status === 'in_progress';
    }
    if (filter === 'completed') {
      return assignment.status === 'submitted' || assignment.status === 'graded';
    }
    return true;
  });

  const isOverdue = (endTime: string) => {
    return new Date(endTime) < new Date();
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
          我的作业
        </h1>
        <p style={{ color: '#8c8c8c', fontSize: 16 }}>
          查看和管理所有课程作业
        </p>
      </div>

      {/* Filter Tabs */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
          background: 'white',
        }}
      >
        <Space size="large">
          <Button
            type={filter === 'all' ? 'primary' : 'default'}
            onClick={() => setFilter('all')}
            style={{
              borderRadius: 8,
              height: 40,
              minWidth: 100,
            }}
          >
            全部
          </Button>
          <Button
            type={filter === 'pending' ? 'primary' : 'default'}
            onClick={() => setFilter('pending')}
            style={{
              borderRadius: 8,
              height: 40,
              minWidth: 100,
            }}
          >
            待完成
          </Button>
          <Button
            type={filter === 'completed' ? 'primary' : 'default'}
            onClick={() => setFilter('completed')}
            style={{
              borderRadius: 8,
              height: 40,
              minWidth: 100,
            }}
          >
            已完成
          </Button>
        </Space>
      </Card>

      {/* Assignment List */}
      {filteredAssignments.length === 0 ? (
        <Empty
          description="暂无作业"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: 60 }}
        />
      ) : (
        <List
          dataSource={filteredAssignments}
          renderItem={(assignment: any) => (
            <Card
              key={assignment.id}
              hoverable
              style={{
                marginBottom: 16,
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
              bodyStyle={{ padding: 24 }}
            >
              <div style={{ marginBottom: 16 }}>
                <Space size="middle" align="start">
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      background: '#e6f7ff',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      color: '#1890ff',
                    }}
                  >
                    <FileTextOutlined />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        margin: '0 0 8px 0',
                        color: '#262626',
                      }}
                    >
                      {assignment.title}
                    </h3>
                    <Descriptions column={2} size="small">
                      <Descriptions.Item label="题目数量">
                        {assignment.total_questions || 0} 题
                      </Descriptions.Item>
                      <Descriptions.Item label="总分">
                        {assignment.total_score || 100} 分
                      </Descriptions.Item>
                      <Descriptions.Item label="开始时间">
                        {new Date(assignment.start_time).toLocaleString('zh-CN')}
                      </Descriptions.Item>
                      <Descriptions.Item label="截止时间">
                        <Space size="small">
                          <ClockCircleOutlined style={{ 
                            color: isOverdue(assignment.end_time) ? '#f5222d' : '#52c41a'
                          }} />
                          <span style={{ 
                            color: isOverdue(assignment.end_time) ? '#f5222d' : '#52c41a',
                            fontWeight: 500
                          }}>
                            {new Date(assignment.end_time).toLocaleString('zh-CN')}
                          </span>
                        </Space>
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                </Space>
              </div>

              {/* Status and Score */}
              <div style={{ marginBottom: 16 }}>
                <Space size="middle" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Tag color={getStatusColor(assignment.status)}>
                    {getStatusText(assignment.status)}
                  </Tag>
                  {isOverdue(assignment.end_time) && (
                    <Tag color="red">已逾期</Tag>
                  )}
                </Space>
              </div>

              {/* Score Display */}
              {assignment.student_score !== undefined && (
                <div style={{ marginBottom: 16 }}>
                  <Progress
                    percent={assignment.student_score || 0}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                    format={(percent) => (
                      <span style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>
                        {assignment.student_score} 分
                      </span>
                    )}
                  />
                </div>
              )}

              {/* Actions */}
              <Button
                type="primary"
                icon={<RightOutlined />}
                size="large"
                block
                style={{
                  height: 44,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                }}
              >
                {assignment.status === 'not_started' || assignment.status === 'in_progress'
                  ? '开始答题'
                  : '查看详情'}
              </Button>
            </Card>
          )}
        />
      )}
    </div>
  );
};

export default MyAssignments;
