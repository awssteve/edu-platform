import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Discussion Topics List Page
export function DiscussionTopicsList() {
  const { courseId } = useParams();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/discussions/topics/?course_id=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setTopics(data || []);
    } catch (error) {
      message.error('获取讨论主题失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchTopics();
  }, [courseId]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', color: '#333', fontWeight: '700', margin: 0 }}>
            讨论区
          </h1>
          <button
            onClick={() => navigate(`/courses/${courseId}/discussions/create`)}
            style={{
              padding: '12px 25px',
              fontSize: '16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            }}
          >
            发起新讨论
          </button>
        </div>

        {topics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>💬</div>
            <p style={{ color: '#999', fontSize: '18px' }}>暂无讨论主题</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} courseId={courseId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TopicCard({ topic, courseId }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/courses/${courseId}/discussions/${topic.id}`)}
      style={{
        background: 'white',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'all 0.3s',
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <h3 style={{ fontSize: '22px', color: '#333', fontWeight: '600', margin: 0 }}>
          {topic.title}
        </h3>
        <div style={{ color: '#999', fontSize: '14px' }}>
          {topic.reply_count || 0} 回复
        </div>
      </div>
      <p style={{ color: '#666', fontSize: '16px', marginBottom: '15px', lineHeight: '1.6' }}>
        {topic.content}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #f0f0f0', paddingTop: '15px' }}>
        <div style={{ color: '#999', fontSize: '14px' }}>
          {topic.author_name || '匿名'} · {topic.created_at ? new Date(topic.created_at).toLocaleDateString('zh-CN') : '-'}
        </div>
        {topic.like_count !== undefined && (
          <div style={{ color: '#667eea', fontSize: '14px', fontWeight: '600' }}>
            👍 {topic.like_count}
          </div>
        )}
      </div>
    </div>
  );
}

// Create Discussion Topic Page
export function CreateTopic() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem('token') || '');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      message.warning('请先登录');
      navigate('/auth/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/discussions/topics/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          course_id: courseId,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('讨论主题创建成功！');
        navigate(`/courses/${courseId}/discussions/${data.id}`);
      } else {
        message.error(data.detail || '创建失败');
      }
    } catch (error) {
      message.error('创建失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '700px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#333', fontWeight: '700' }}>
          发起新讨论
        </h1>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                讨论标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="请输入讨论标题"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '10px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e1e1e1'}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                讨论内容 *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="请输入讨论内容"
                required
                rows={8}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '10px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '18px',
                fontSize: '18px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '发布中...' : '发布讨论'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Discussion Topic Detail Page
export function DiscussionTopicDetail() {
  const { courseId, topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');
  const [replyForm, setReplyForm] = useState({ content: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchTopic = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/discussions/topics/${topicId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setTopic(data);

      const replyResponse = await fetch(`${API_BASE_URL}/api/v1/discussions/topics/${topicId}/replies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const replyData = await replyResponse.json();
      setReplies(replyData || []);
    } catch (error) {
      message.error('获取讨论详情失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();

    if (!token) {
      message.warning('请先登录');
      navigate('/auth/login');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/discussions/topics/${topicId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(replyForm),
      });

      if (response.ok) {
        message.success('回复成功！');
        setReplyForm({ content: '' });
        fetchTopic();
      } else {
        const data = await response.json();
        message.error(data.detail || '回复失败');
      }
    } catch (error) {
      message.error('回复失败: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!token) {
      message.warning('请先登录');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/discussions/topics/${topicId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        message.success('点赞成功！');
        fetchTopic();
      } else {
        const data = await response.json();
        message.error(data.detail || '点赞失败');
      }
    } catch (error) {
      message.error('点赞失败: ' + error.message);
    }
  };

  useEffect(() => {
    if (topicId) fetchTopic();
  }, [topicId]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        加载中...
      </div>
    );
  }

  if (!topic) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        讨论主题不存在
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button
          onClick={() => navigate(`/courses/${courseId}/discussions`)}
          style={{
            padding: '10px 20px',
            background: 'white',
            border: '2px solid #667eea',
            borderRadius: '8px',
            color: '#667eea',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontWeight: '600',
          }}
        >
          ← 返回讨论列表
        </button>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#333', fontWeight: '700', margin: 0 }}>
            {topic.title}
          </h1>

          <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.8', marginBottom: '20px' }}>
            {topic.content}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #f0f0f0', paddingTop: '20px' }}>
            <div style={{ color: '#999', fontSize: '14px' }}>
              {topic.author_name || '匿名'} · {topic.created_at ? new Date(topic.created_at).toLocaleString('zh-CN') : '-'}
            </div>
            <button
              onClick={handleLike}
              style={{
                padding: '8px 20px',
                fontSize: '14px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s',
              }}
            >
              👍 {topic.like_count || 0}
            </button>
          </div>
        </div>

        <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#333', fontWeight: '700', margin: 0 }}>
          回复 ({replies.length})
        </h2>

        <form onSubmit={handleSubmitReply} style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
          <textarea
            value={replyForm.content}
            onChange={(e) => setReplyForm({ content: e.target.value })}
            placeholder="输入你的回复..."
            required
            rows={4}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '2px solid #e1e1e1',
              borderRadius: '10px',
              fontSize: '16px',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              resize: 'vertical',
              marginBottom: '15px',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? '回复中...' : '回复'}
            </button>
          </div>
        </form>

        {replies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px', color: '#999', fontSize: '16px' }}>
            暂无回复
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {replies.map((reply) => (
              <div key={reply.id} style={{
                padding: '20px',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e8e8e8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}>
                <div style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
                  {reply.author_name || '匿名'} · {reply.created_at ? new Date(reply.created_at).toLocaleString('zh-CN') : '-'}
                </div>
                <p style={{ color: '#333', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
                  {reply.content}
                </p>
                {reply.like_count !== undefined && (
                  <div style={{ marginTop: '10px', color: '#667eea', fontSize: '14px', fontWeight: '600' }}>
                    👍 {reply.like_count}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
