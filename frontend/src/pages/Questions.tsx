import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Questions List Page
export function QuestionsList() {
  const { courseId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/questions/?course_id=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setQuestions(data || []);
    } catch (error) {
      message.error('获取题目列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchQuestions();
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
            题目列表
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate(`/courses/${courseId}/questions/create`)}
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
              创建题目
            </button>
            <button
              onClick={() => navigate(`/courses/${courseId}/questions/ai-generate`)}
              style={{
                padding: '12px 25px',
                fontSize: '16px',
                background: '#52c41a',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(82, 196, 26, 0.4)',
              }}
            >
              AI 生成题目
            </button>
          </div>
        </div>

        {questions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>❓</div>
            <p style={{ color: '#999', fontSize: '18px' }}>暂无题目</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} courseId={courseId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ question, courseId }) {
  const navigate = useNavigate();

  const typeLabels = {
    'multiple_choice': '选择题',
    'fill_blank': '填空题',
    'short_answer': '简答题',
    'essay': '论述题',
  };

  return (
    <div
      onClick={() => navigate(`/courses/${courseId}/questions/${question.id}`)}
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
        <span style={{
          background: '#667eea',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '500',
        }}>
          {typeLabels[question.type] || question.type}
        </span>
        <div style={{ color: '#999', fontSize: '14px' }}>
          {question.difficulty || '难度未知'}
        </div>
      </div>
      <h3 style={{ fontSize: '20px', color: '#333', fontWeight: '600', marginBottom: '15px', margin: 0 }}>
        {question.content}
      </h3>
      {question.options && question.options.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          {question.options.map((option, idx) => (
            <div key={idx} style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '8px', fontSize: '14px', color: '#666' }}>
              {String.fromCharCode(65 + idx)}. {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Create Question Page
export function CreateQuestion() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    content: '',
    type: 'multiple_choice',
    difficulty: 'medium',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
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
      const response = await fetch(`${API_BASE_URL}/api/v1/questions/`, {
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
        message.success('题目创建成功！');
        navigate(`/courses/${courseId}/questions`);
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
          创建题目
        </h1>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                题目类型 *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
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
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="请输入题目内容"
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
                }}
              />
            </div>

            {formData.type === 'multiple_choice' && (
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                  选项 *
                </label>
                {formData.options.map((option, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ padding: '10px 15px', background: '#667eea', color: 'white', borderRadius: '8px', fontSize: '16px', fontWeight: '600' }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[idx] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      placeholder={`选项 ${String.fromCharCode(65 + idx)}`}
                      required
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '2px solid #e1e1e1',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box',
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
                value={formData.correct_answer}
                onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                placeholder="请输入正确答案"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '10px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                解析
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
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

            <div style={{ display: 'flex', gap: '15px' }}>
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
                {loading ? '创建中...' : '创建题目'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// AI Generate Questions Page
export function AIGenerateQuestions() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    material_id: '',
    question_count: 5,
    difficulty: 'medium',
    question_types: ['multiple_choice'],
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
      const response = await fetch(`${API_BASE_URL}/api/v1/questions/ai-generate`, {
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
        message.success(`成功生成 ${data.questions?.length || 0} 道题目！`);
        navigate(`/courses/${courseId}/questions`);
      } else {
        message.error(data.detail || '生成失败');
      }
    } catch (error) {
      message.error('生成失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#333', fontWeight: '700' }}>
          AI 生成题目
        </h1>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                选择课件 *
              </label>
              <select
                value={formData.material_id}
                onChange={(e) => setFormData({ ...formData, material_id: e.target.value })}
                required
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
                <option value="">请选择课件</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                题目数量 *
              </label>
              <input
                type="number"
                value={formData.question_count}
                onChange={(e) => setFormData({ ...formData, question_count: parseInt(e.target.value) })}
                min="1"
                max="50"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '10px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                题目难度 *
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                required
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

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                题目类型 *
              </label>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {['multiple_choice', 'fill_blank', 'short_answer', 'essay'].map((type) => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.question_types.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, question_types: [...formData.question_types, type] });
                        } else {
                          setFormData({ ...formData, question_types: formData.question_types.filter(t => t !== type) });
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '16px', color: '#666' }}>
                      {type === 'multiple_choice' ? '选择题' : type === 'fill_blank' ? '填空题' : type === 'short_answer' ? '简答题' : '论述题'}
                    </span>
                  </label>
                ))}
              </div>
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
              {loading ? 'AI 生成中...' : '开始生成'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
