import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  DatePicker,
  Button,
  List,
  Tag,
  Space,
  message,
  Modal,
  InputNumber,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

interface Question {
  id: string;
  type: string;
  question_text: string;
  options?: string[];
  correct_answer?: string;
  difficulty: string;
}

const AssignmentCreator = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [creating, setCreating] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [questionSelectorVisible, setQuestionSelectorVisible] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/questions/assignments/course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      setAssignments(response.data);
    } catch (error: any) {
      message.error('获取作业列表失败');
    }
  };

  const fetchAvailableQuestions = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/questions/material/demo-material-1`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      setAvailableQuestions(response.data);
    } catch (error: any) {
      message.error('获取题目列表失败');
    }
  };

  const handleCreateAssignment = async (values: any) => {
    setCreating(true);
    try {
      await axios.post(
        `http://localhost:8000/api/v1/questions/assignments/?course_id=${courseId}`,
        {
          ...values,
          question_ids: selectedQuestions,
          start_time: values.start_time ? values.start_time.toISOString() : null,
          end_time: values.end_time ? values.end_time.toISOString() : null,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      message.success('作业创建成功！');
      form.resetFields();
      setSelectedQuestions([]);
      fetchAssignments();
    } catch (error: any) {
      message.error(error.response?.data?.detail || '创建作业失败');
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async (assignmentId: string) => {
    try {
      await axios.post(
        `http://localhost:8000/api/v1/questions/assignments/${assignmentId}/publish`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      message.success('作业已发布！');
      fetchAssignments();
    } catch (error: any) {
      message.error('发布失败');
    }
  };

  const handleDelete = async (assignmentId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个作业吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await axios.delete(
            `http://localhost:8000/api/v1/questions/assignments/${assignmentId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
              },
            }
          );
          message.success('作业删除成功！');
          fetchAssignments();
        } catch (error: any) {
          message.error('删除失败');
        }
      },
    });
  };

  const openQuestionSelector = () => {
    setQuestionSelectorVisible(true);
    fetchAvailableQuestions();
  };

  const handleSelectQuestion = (questionId: string, selected: boolean) => {
    if (selected) {
      setSelectedQuestions([...selectedQuestions, questionId]);
    } else {
      setSelectedQuestions(selectedQuestions.filter((id) => id !== questionId));
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          作业管理
        </h1>
        <p style={{ color: '#8c8c8c', fontSize: 16 }}>
          创建和管理课程作业与考试
        </p>
      </div>

      <Row gutter={[24, 24]}>
        {/* Create Assignment */}
        <Col xs={24} lg={10}>
          <Card
            title="创建作业"
            icon={<PlusOutlined />}
            style={{ borderRadius: 12 }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateAssignment}
            >
              <Form.Item
                name="title"
                label="作业标题"
                rules={[{ required: true, message: '请输入作业标题' }]}
              >
                <Input
                  placeholder="例如：第一章测验"
                  size="large"
                />
              </Form.Item>

              <Form.Item name="description" label="作业说明">
                <Input.TextArea
                  placeholder="输入作业说明或要求..."
                  rows={4}
                />
              </Form.Item>

              <Form.Item label="题目选择">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="dashed"
                    icon={<FileTextOutlined />}
                    block
                    onClick={openQuestionSelector}
                    style={{ height: 44, borderRadius: 8 }}
                  >
                    选择题目 ({selectedQuestions.length})
                  </Button>
                  <div style={{ color: '#8c8c8c', fontSize: 13 }}>
                    已选择 {selectedQuestions.length} 道题目
                  </div>
                </Space>
              </Form.Item>

              <Form.Item
                name="start_time"
                label="开始时间"
                rules={[{ required: true, message: '请选择开始时间' }]}
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  size="large"
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="选择开始时间"
                />
              </Form.Item>

              <Form.Item
                name="end_time"
                label="结束时间"
                rules={[{ required: true, message: '请选择结束时间' }]}
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  size="large"
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="选择结束时间"
                />
              </Form.Item>

              <Form.Item
                name="duration_minutes"
                label="限时（分钟）"
              >
                <InputNumber
                  min={1}
                  max={180}
                  style={{ width: '100%' }}
                  placeholder="不限制则留空"
                />
              </Form.Item>

              <Form.Item
                name="allow_multiple_attempts"
                label="允许多次提交"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={creating}
                  size="large"
                  block
                  style={{
                    height: 44,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                  }}
                >
                  创建作业
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Assignment List */}
        <Col xs={24} lg={14}>
          <Card
            title="作业列表"
            extra={
              <Button icon={<CalendarOutlined />}>全部作业</Button>
            }
            style={{ borderRadius: 12 }}
          >
            <List
              dataSource={assignments}
              renderItem={(item: any) => (
                <List.Item
                  actions={[
                    !item.is_published && (
                      <Button
                        type="link"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handlePublish(item.id)}
                      >
                        发布
                      </Button>
                    ),
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                    >
                      查看
                    </Button>,
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(item.id)}
                    >
                      删除
                    </Button>,
                  ]}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #f0f0f0',
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
                    title={
                      <div style={{ fontSize: 16, fontWeight: 500 }}>
                        {item.title}
                      </div>
                    }
                    description={
                      <Space size="middle" style={{ marginTop: 8 }}>
                        <Space>
                          <ClockCircleOutlined />
                          <span>{item.start_time}</span>
                        </Space>
                        {item.is_published ? (
                          <Tag color="green">已发布</Tag>
                        ) : (
                          <Tag color="orange">草稿</Tag>
                        )}
                        {item.allow_multiple_attempts && (
                          <Tag color="blue">允许多次提交</Tag>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Question Selector Modal */}
      <Modal
        title="选择题目"
        open={questionSelectorVisible}
        onCancel={() => setQuestionSelectorVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setQuestionSelectorVisible(false)}>
            取消
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={() => setQuestionSelectorVisible(false)}
          >
            确定
          </Button>,
        ]}
      >
        <List
          dataSource={availableQuestions}
          renderItem={(question) => (
            <List.Item
              style={{
                padding: '12px 0',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <List.Item.Meta
                avatar={
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(question.id)}
                    onChange={(e) => handleSelectQuestion(question.id, e.target.checked)}
                  />
                }
                title={question.question_text}
                description={
                  <Space size="middle">
                    <Tag color="blue">{question.type}</Tag>
                    <Tag color={question.difficulty === 'easy' ? 'green' : question.difficulty === 'hard' ? 'red' : 'orange'}>
                      {question.difficulty}
                    </Tag>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default AssignmentCreator;
