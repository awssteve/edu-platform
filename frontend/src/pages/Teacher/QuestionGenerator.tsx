import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  InputNumber,
  Select,
  message,
  Space,
  Tag,
  Progress,
  Spin,
  Empty,
} from 'antd';
import {
  RobotOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

interface Question {
  id: string;
  type: string;
  question_text: string;
  options?: string[];
  correct_answer?: string;
  reference_answer?: string;
  difficulty: string;
  ai_generated: boolean;
}

const QuestionGenerator = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleGenerate = async () => {
    const values = form.getFieldsValue();
    setGenerating(true);
    setGenerationProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => Math.min(prev + 10, 90));
    }, 500);

    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/questions/material/${values.material_id}/generate`,
        {
          choice_count: values.choice_count || 5,
          fill_blank_count: values.fill_blank_count || 3,
          short_answer_count: values.short_answer_count || 2,
          difficulty: values.difficulty || 'mixed',
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      clearInterval(progressInterval);
      setGenerationProgress(100);

      message.success(`成功生成 ${response.data.length} 道题目！`);
      setQuestions(response.data);
      setGenerating(false);
      setGenerationProgress(0);
    } catch (error: any) {
      clearInterval(progressInterval);
      message.error(error.response?.data?.detail || '题目生成失败');
      setGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleAddQuestion = () => {
    // TODO: Implement add question manually
    message.info('手动添加题目功能将在后续版本中实现');
  };

  const handleEditQuestion = (question: Question) => {
    // TODO: Implement edit question
    message.info('编辑题目功能将在后续版本中实现');
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/v1/questions/${questionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      message.success('题目删除成功！');
      setQuestions(questions.filter((q) => q.id !== questionId));
    } catch (error: any) {
      message.error('删除失败');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'green';
      case 'medium':
        return 'orange';
      case 'hard':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return '未知';
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'choice':
        return '选择题';
      case 'fill_blank':
        return '填空题';
      case 'short_answer':
        return '简答题';
      case 'essay':
        return '论述题';
      case 'experiment':
        return '实验题';
      default:
        return '未知';
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          AI 题目生成
        </h1>
        <p style={{ color: '#8c8c8c', fontSize: 16 }}>
          基于课件内容，智能生成各类题型
        </p>
      </div>

      <Row gutter={[24, 24]}>
        {/* Generation Settings */}
        <Col xs={24} lg={8}>
          <Card
            title="生成配置"
            icon={<RobotOutlined />}
            style={{ borderRadius: 12 }}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="material_id"
                label="选择课件"
                rules={[{ required: true, message: '请选择课件' }]}
              >
                <Select
                  placeholder="选择要生成题目的课件"
                  size="large"
                >
                  <Option value="demo-material-1">第一章：新能源汽车概述</Option>
                  <Option value="demo-material-2">第二章：电驱动系统组成</Option>
                  <Option value="demo-material-3">第三章：动力电池系统</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="choice_count"
                label="选择题数量"
                initialValue={5}
              >
                <InputNumber
                  min={0}
                  max={20}
                  size="large"
                  style={{ width: '100%' }}
                  prefix={<FileTextOutlined />}
                />
              </Form.Item>

              <Form.Item
                name="fill_blank_count"
                label="填空题数量"
                initialValue={3}
              >
                <InputNumber
                  min={0}
                  max={20}
                  size="large"
                  style={{ width: '100%' }}
                  prefix={<FileTextOutlined />}
                />
              </Form.Item>

              <Form.Item
                name="short_answer_count"
                label="简答题数量"
                initialValue={2}
              >
                <InputNumber
                  min={0}
                  max={20}
                  size="large"
                  style={{ width: '100%' }}
                  prefix={<FileTextOutlined />}
                />
              </Form.Item>

              <Form.Item
                name="difficulty"
                label="题目难度"
                initialValue="mixed"
              >
                <Select size="large">
                  <Option value="mixed">混合</Option>
                  <Option value="easy">简单</Option>
                  <Option value="medium">中等</Option>
                  <Option value="hard">困难</Option>
                </Select>
              </Form.Item>

              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                size="large"
                block
                onClick={handleGenerate}
                loading={generating}
                style={{
                  height: 48,
                  fontSize: 16,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                }}
              >
                {generating ? '生成中...' : '开始生成'}
              </Button>

              {generating && (
                <div style={{ marginTop: 16 }}>
                  <Progress
                    percent={generationProgress}
                    status="active"
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                  <p style={{ textAlign: 'center', color: '#8c8c8c', marginTop: 8 }}>
                    AI 正在分析课件并生成题目...
                  </p>
                </div>
              )}

              <Button
                icon={<PlusOutlined />}
                block
                size="large"
                onClick={handleAddQuestion}
                style={{ marginTop: 16, height: 44, borderRadius: 8 }}
              >
                手动添加题目
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Generated Questions */}
        <Col xs={24} lg={16}>
          <Card
            title={`已生成题目 (${questions.length}道)`}
            extra={
              <Button icon={<ReloadOutlined />}>刷新</Button>
            }
            style={{ borderRadius: 12 }}
          >
            {questions.length === 0 ? (
              <Empty
                description="还没有生成题目"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: 60 }}
              />
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {questions.map((question, index) => (
                  <Card
                    key={question.id}
                    size="small"
                    style={{
                      borderRadius: 8,
                      borderLeft: `4px solid ${getDifficultyColor(question.difficulty)}`,
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Space size="middle">
                        <Tag color="blue">{getQuestionTypeLabel(question.type)}</Tag>
                        <Tag color={getDifficultyColor(question.difficulty)}>
                          {getDifficultyLabel(question.difficulty)}
                        </Tag>
                        {question.ai_generated && (
                          <Tag color="purple" icon={<RobotOutlined />}>
                            AI 生成
                          </Tag>
                        )}
                      </Space>
                      <Space style={{ float: 'right' }}>
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEditQuestion(question)}
                        >
                          编辑
                        </Button>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          删除
                        </Button>
                      </Space>
                    </div>
                    <div style={{ fontSize: 16, marginBottom: 12 }}>
                      {index + 1}. {question.question_text}
                    </div>
                    {question.type === 'choice' && question.options && (
                      <div style={{ paddingLeft: 24, color: '#595959' }}>
                        {question.options.map((opt, i) => (
                          <div key={i}>
                            {String.fromCharCode(65 + i)}. {opt}
                          </div>
                        ))}
                      </div>
                    )}
                    {question.correct_answer && (
                      <div style={{ 
                        padding: 8, 
                        background: '#f6ffed', 
                        borderRadius: 4, 
                        marginTop: 8,
                        fontSize: 14,
                        color: '#52c41a'
                      }}>
                        <CheckCircleOutlined /> 正确答案：{question.correct_answer}
                      </div>
                    )}
                  </Card>
                ))}
              </Space>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default QuestionGenerator;
