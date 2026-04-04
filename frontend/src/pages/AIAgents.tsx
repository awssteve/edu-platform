/**
 * AI智能体系统 - 多个专业化AI助手
 * PDF核心功能：不同领域的专业AI助手团队
 */

import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, List, Tag, Badge, Button, Input, Space, Divider,
  Avatar, Progress, Rate, Tabs, Modal, Form, Select, message, Tooltip, Alert, Statistic
} from 'antd';
import {
  RobotOutlined, UserOutlined, BookOutlined, CodeOutlined,
  BulbOutlined, ExperimentOutlined, LineChartOutlined,
  CommentOutlined, FireOutlined, TrophyOutlined, ThunderboltOutlined,
  StarOutlined, CheckCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { SendOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const API_BASE_URL = 'http://localhost:8000';

// ==================== AI智能体定义 ====================

interface AIAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  specialty: string[];
  capability: number;
  status: 'online' | 'busy' | 'offline';
  total_interactions: number;
  satisfaction: number;
  description: string;
}

interface AgentMessage {
  id: string;
  agent_id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  rating?: number;
}

// ==================== AI智能体列表 ====================

const AI_AGENTS: AIAgent[] = [
  {
    id: 'tutor-agent',
    name: '学习导师',
    role: 'primary',
    avatar: '🎓',
    specialty: ['课程辅导', '作业答疑', '学习规划'],
    capability: 95,
    status: 'online',
    total_interactions: 1523,
    satisfaction: 4.8,
    description: '专业的学习导师，擅长课程讲解和作业指导'
  },
  {
    id: 'code-agent',
    name: '代码助教',
    avatar: '💻',
    role: 'coding',
    specialty: ['代码审查', 'Bug调试', '算法优化'],
    capability: 92,
    status: 'online',
    total_interactions: 892,
    satisfaction: 4.7,
    description: '专业的编程助手，精通多种编程语言'
  },
  {
    id: 'math-agent',
    name: '数学专家',
    avatar: '📐',
    role: 'math',
    specialty: ['数学解题', '公式推导', '定理证明'],
    capability: 90,
    status: 'online',
    total_interactions: 645,
    satisfaction: 4.6,
    description: '数学领域的专家，擅长各类数学问题'
  },
  {
    id: 'writing-agent',
    name: '写作助手',
    avatar: '✍️',
    role: 'writing',
    specialty: ['文章润色', '语法检查', '写作建议'],
    capability: 88,
    status: 'busy',
    total_interactions: 456,
    satisfaction: 4.5,
    description: '专业的写作辅导，帮助提升文章质量'
  },
  {
    id: 'science-agent',
    name: '科学实验',
    avatar: '🔬',
    role: 'science',
    specialty: ['实验设计', '数据分析', '科研方法'],
    capability: 91,
    status: 'online',
    total_interactions: 723,
    satisfaction: 4.7,
    description: '科学研究专家，提供实验和数据分析支持'
  },
  {
    id: 'career-agent',
    name: '职业规划',
    avatar: '💼',
    role: 'career',
    specialty: ['职业咨询', '简历优化', '面试准备'],
    capability: 85,
    status: 'online',
    total_interactions: 312,
    satisfaction: 4.4,
    description: '职业发展顾问，帮助规划职业路径'
  }
];

// ==================== 主组件 ====================

export function AIAgentsSystem() {
  const [agents] = useState<AIAgent[]>(AI_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);

  const handleChat = async (agent: AIAgent) => {
    setSelectedAgent(agent);
    setChatModalVisible(true);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedAgent) return;

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      agent_id: selectedAgent.id,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // 模拟AI回复
      await new Promise(resolve => setTimeout(resolve, 1000));

      const agentMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        agent_id: selectedAgent.id,
        role: 'agent',
        content: generateMockResponse(selectedAgent, inputValue),
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      message.error('发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const generateMockResponse = (agent: AIAgent, question: string): string => {
    const responses: Record<string, string[]> = {
      'tutor-agent': [
        `这是一个很好的学习问题！让我来详细解答...`,
        `根据你的问题，我建议从以下几个方面来理解...`,
        `这个知识点很重要，建议你多做练习巩固...`
      ],
      'code-agent': [
        `你的代码整体结构不错，但有几处可以优化...`,
        `让我帮你分析一下这段代码的逻辑...`,
        `这个Bug的原因是...我建议这样修复...`
      ],
      'math-agent': [
        `这道题的解题思路是...`,
        `我们可以使用这个公式来解决...`,
        `让我详细推导一下这个证明过程...`
      ],
      'writing-agent': [
        `你的文章结构清晰，但在措辞上可以优化...`,
        `建议在第二段增加一些过渡语句...`,
        `这篇文章的论点很有新意，值得进一步展开...`
      ],
      'science-agent': [
        `这个实验设计的思路很好，但需要注意...`,
        `根据数据分析结果，我们可以得出...`,
        `建议采用这种科学研究方法...`
      ],
      'career-agent': [
        `根据你的专业背景，我建议你往这个方向发展...`,
        `在简历中，你可以突出这些技能和经验...`,
        `面试时，可能会问到这类问题，建议提前准备...`
      ]
    };

    const agentResponses = responses[agent.id] || ['好的，让我来帮你解答这个问题...'];
    return agentResponses[Math.floor(Math.random() * agentResponses.length)];
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      online: { status: 'success', text: '在线' },
      busy: { status: 'warning', text: '忙碌' },
      offline: { status: 'default', text: '离线' }
    };
    const badge = badges[status as keyof typeof badges];
    return <Badge {...badge} />;
  };

  return (
    <div>
      <Alert
        message="AI智能体系统 - 多个专业化AI助手团队"
        description="不同领域的专业AI助手，提供精准的个性化服务"
        type="info"
        showIcon
        icon={<RobotOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[24, 24]}>
        {/* 统计卡片 */}
        <Col span={6}>
          <Card>
            <Statistic
              title="AI智能体"
              value={agents.length}
              prefix={<RobotOutlined />}
              valueStyle={{ color: '#1890FF' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总服务次数"
              value={agents.reduce((sum, a) => sum + a.total_interactions, 0)}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#52C41A' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均满意度"
              value={(agents.reduce((sum, a) => sum + a.satisfaction, 0) / agents.length).toFixed(1)}
              prefix={<StarOutlined />}
              suffix="/ 5.0"
              valueStyle={{ color: '#FAAD14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在线数量"
              value={agents.filter(a => a.status === 'online').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52C41A' }}
            />
          </Card>
        </Col>
      </Row>

      {/* AI智能体列表 */}
      <Card title="AI智能体团队" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          {agents.map(agent => (
            <Col xs={24} sm={12} lg={8} key={agent.id}>
              <Card
                hoverable
                onClick={() => handleChat(agent)}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: selectedAgent?.id === agent.id ? '2px solid #1890FF' : undefined
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{
                    fontSize: 48,
                    marginRight: 16,
                    filter: agent.status === 'offline' ? 'grayscale(100%)' : undefined
                  }}>
                    {agent.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 18, marginRight: 8 }}>
                        {agent.name}
                      </h3>
                      {getStatusBadge(agent.status)}
                    </div>
                    <div style={{ color: '#8c8c8c', fontSize: 12 }}>
                      {agent.description}
                    </div>
                  </div>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 'bold' }}>专业领域</div>
                  <Space wrap>
                    {agent.specialty.map(spec => (
                      <Tag key={spec} color="blue" style={{ fontSize: 11 }}>
                        {spec}
                      </Tag>
                    ))}
                  </Space>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>能力值</div>
                    <Progress
                      percent={agent.capability}
                      size="small"
                      strokeColor={agent.capability >= 90 ? '#52C41A' : agent.capability >= 80 ? '#1890FF' : '#FAAD14'}
                    />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>满意度</div>
                    <Rate disabled value={agent.satisfaction} style={{ fontSize: 12 }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8c8c8c' }}>
                  <span>服务 {agent.total_interactions} 次</span>
                  <Button type="primary" size="small" icon={<CommentOutlined />}>
                    开始对话
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 对话模态框 */}
      <Modal
        title={
          <Space>
            <span style={{ fontSize: 32 }}>{selectedAgent?.avatar}</span>
            <span>{selectedAgent?.name}</span>
            <Tag color="blue">{selectedAgent?.role}</Tag>
          </Space>
        }
        open={chatModalVisible}
        onCancel={() => setChatModalVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{
          height: '500px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* 消息列表 */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px',
            background: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            {messages.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 0',
                color: '#8c8c8c'
              }}>
                <RobotOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <p>你好！我是{selectedAgent?.name}</p>
                <p style={{ fontSize: 12 }}>{selectedAgent?.description}</p>
                <p style={{ fontSize: 12 }}>请问有什么可以帮助你的？</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: msg.role === 'user' ? '#1890FF' : 'white',
                    color: msg.role === 'user' ? 'white' : '#333',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.8 }}>
                      {msg.role === 'user' ? '我' : selectedAgent?.name}
                    </div>
                    <div style={{ lineHeight: '1.6' }}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 输入框 */}
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="输入你的问题... (按 Enter 发送)"
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendMessage}
              loading={loading}
              style={{ height: 'auto' }}
            >
              发送
            </Button>
          </Space.Compact>
        </div>
      </Modal>
    </div>
  );
}

export default AIAgentsSystem;
