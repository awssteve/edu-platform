import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Rate } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Edit Question Page
export function EditQuestion() {
  const { courseId, questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem('token') || '');

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/questions/${questionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setQuestion(data);
    } catch (error) {
      message.error('获取题目详情失败: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      message.warning('请先登录');
      navigate('/auth/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(question),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('题目更新成功！');
        navigate(`/courses/${courseId}/questions`);
      } else {
        message.error(data.detail || '更新失败');
      }
    } catch (error) {
      message.error('更新失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questionId && courseId) fetchQuestion();
  }, [questionId, courseId]);

  if (!question && !loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '700px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#333', fontWeight: '700' }}>
          编辑题目
        </h1>

        {question && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px', background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                题目类型 *
              </label>
              <select
                value={question.type}
                onChange={(e) => setQuestion({ ...question, type: e.target.value })}
                required
                disabled
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '10px',
                  fontSize: '16px',
                  background: '#f9f9f9',
                  boxSizing: 'border-box',
                }}
              >
                <option value="multiple_choice">选择题</option>
                <option value="fill_blank">填空题</option>
                <option value="short_answer">简答题</option>
                <option value="essay">论述题</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                题目内容 *
              </label>
              <textarea
                value={question.content}
                onChange={(e) => setQuestion({ ...question, content: e.target.value })}
                placeholder="请输入题目内容"
                required
                disabled
                rows={4}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '10px',
                  fontSize: '16px',
                  background: '#f9f9f9',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {question.type === 'multiple_choice' && question.options && (
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                  选项 *
                </label>
                {question.options.map((option, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ padding: '10px 15px', background: '#667eea', color: 'white', borderRadius: '8px', fontSize: '16px', fontWeight: '600' }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="text"
                      value={option}
                      disabled
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '2px solid #e1e1e1',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                        background: '#f9f9f9',
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                正确答案 *
              </label>
              <input
                type="text"
                value={question.correct_answer}
                onChange={(e) => setQuestion({ ...question, correct_answer: e.target.value })}
                placeholder="请输入正确答案"
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

            {question.type === 'multiple_choice' && (
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                  难度
                </label>
                <select
                  value={question.difficulty}
                  onChange={(e) => setQuestion({ ...question, difficulty: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e1e1e1',
                    borderRadius: '10px',
                    fontSize: '16px',
                    background: 'white',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </select>
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                解析
              </label>
              <textarea
                value={question.explanation || ''}
                onChange={(e) => setQuestion({ ...question, explanation: e.target.value })}
                placeholder="请输入题目解析"
                rows={3}
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

            <div style={{ display: 'flex', gap: '15px', borderTop: '2px solid #f0f0f0', paddingTop: '25px' }}>
              <button
                type="button"
                onClick={() => navigate(`/courses/${courseId}/questions`)}
                style={{
                  flex: 1,
                  padding: '18px',
                  fontSize: '18px',
                  background: 'white',
                  color: '#666',
                  border: '2px solid #e1e1e1',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                }}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 2,
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
                {loading ? '更新中...' : '更新题目'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
