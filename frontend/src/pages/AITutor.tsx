/**
 * AI助教对话界面
 * 24*7在线教学助手
 * ChatGPT风格对话界面
 */

import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Avatar, Space, Divider, Tag, message } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, ClearOutlined, StarOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './AITutor.css';

const { TextArea } = Input;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  topic?: string;
}

interface ChatSession {
  sessionId: string;
  messages: Message[];
  currentTopic?: string;
}

const AITutor: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [suggestions] = useState([
    '请讲解本节课的重点',
    '我不理解这个概念',
    '给我出一道练习题',
    '分析我的学习进度'
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  const API_BASE_URL = 'http://localhost:8000';

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      // 使用mock端点进行测试（不需要认证和数据库）
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/ai-tutor/chat-mock`,
        {
          course_id: courseId || '1',
          question: content
        }
      );

      if (response.data.success) {
        // 添加AI回复
        const aiMessage: Message = {
          role: 'assistant',
          content: response.data.answer,
          timestamp: response.data.timestamp,
          topic: response.data.topic
        };

        setMessages(prev => [...prev, aiMessage]);
        setSessionId(response.data.session_id);
        if (response.data.topic) {
          setCurrentTopic(response.data.topic);
        }
      } else {
        message.error('AI助教暂时无法回答，请稍后重试');
      }

    } catch (error: any) {
      console.error('发送消息失败:', error);
      message.error(error.response?.data?.detail || '发送失败，请稍后重试');

      // 添加错误提示消息
      const errorMessage: Message = {
        role: 'assistant',
        content: '抱歉，我暂时无法回答。请稍后重试或联系教师。',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      // 保持输入框焦点
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // 清除对话历史
  const clearHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/v1/ai-tutor/clear-context`,
        { course_id: courseId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessages([]);
      setSessionId('');
      setCurrentTopic('');
      message.success('对话历史已清除');

    } catch (error) {
      console.error('清除对话失败:', error);
      message.error('清除失败，请稍后重试');
    }
  };

  // 使用建议问题
  const useSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  // 渲染消息
  const renderMessage = (msg: Message, index: number) => {
    const isUser = msg.role === 'user';

    return (
      <div key={index} className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
        <div className="message-avatar">
          {isUser ? (
            <Avatar icon={<UserOutlined />} />
          ) : (
            <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890FF' }} />
          )}
        </div>

        <div className="message-content">
          <div className="message-header">
            <span className="message-role">
              {isUser ? '你' : 'AI助教'}
            </span>
            <span className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          <div className="message-text">
            {msg.content}
          </div>

          {msg.topic && (
            <Tag color="blue" className="message-topic">
              {msg.topic}
            </Tag>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="ai-tutor-container">
      {/* 头部 */}
      <div className="ai-tutor-header">
        <div className="header-left">
          <RobotOutlined className="header-icon" />
          <div>
            <h2 className="header-title">AI助教</h2>
            <p className="header-subtitle">24*7在线 · 智能答疑 · 学习指导</p>
          </div>
        </div>

        <div className="header-right">
          {currentTopic && (
            <Tag color="processing" className="current-topic-tag">
              当前主题: {currentTopic}
            </Tag>
          )}
          <Button
            icon={<ClearOutlined />}
            onClick={clearHistory}
            disabled={messages.length === 0}
          >
            清除对话
          </Button>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <RobotOutlined className="welcome-icon" />
            <h3>你好！我是你的AI助教 👋</h3>
            <p>我可以帮你：</p>
            <ul>
              <li>📚 解答课程相关问题</li>
              <li>💡 提供学习建议和指导</li>
              <li>📊 分析学习进度</li>
              <li>🎯 制定个性化学习计划</li>
            </ul>
            <p>随时向我提问，我随时在线！</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => renderMessage(msg, index))}
            {loading && (
              <div className="chat-message assistant">
                <div className="message-avatar">
                  <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890FF' }} />
                </div>
                <div className="message-content">
                  <div className="message-text typing">
                    <span>思考中</span>
                    <span className="dots">...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 建议问题 */}
      {messages.length === 0 && (
        <div className="suggestions">
          <p className="suggestions-title">试试问这些：</p>
          <Space wrap>
            {suggestions.map((suggestion, index) => (
              <Tag
                key={index}
                className="suggestion-tag"
                onClick={() => useSuggestion(suggestion)}
              >
                {suggestion}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      {/* 输入区域 */}
      <div className="chat-input-container">
        <div className="input-wrapper">
          <TextArea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={(e) => {
              if (e.shiftKey) return; // Shift+Enter换行
              e.preventDefault();
              sendMessage(inputValue);
            }}
            placeholder="输入你的问题... (Enter发送，Shift+Enter换行)"
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="chat-input"
            disabled={loading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => sendMessage(inputValue)}
            loading={loading}
            disabled={!inputValue.trim()}
            className="send-button"
          >
            发送
          </Button>
        </div>

        <div className="input-footer">
          <Space>
            <span className="footer-tip">
              💡 提示：可以连续提问，我会记住上下文
            </span>
            {sessionId && (
              <Tag color="success">会话活跃</Tag>
            )}
          </Space>
        </div>
      </div>
    </div>
  );
};

export default AITutor;