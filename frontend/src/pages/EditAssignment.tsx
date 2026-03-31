import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, DatePicker, Select, InputNumber } from 'antd';

const { Option } = Select;
const { RangePicker } = DatePicker;
const API_BASE_URL = 'http://localhost:8000';

// Edit Assignment Page
export function EditAssignment() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem('token') || '');

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAssignment(data);
    } catch (error) {
      message.error('获取作业详情失败: ' + error.message);
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
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assignment),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('作业更新成功！');
        navigate(`/courses/${courseId}/assignments`);
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
    if (assignmentId && courseId) fetchAssignment();
  }, [assignmentId, courseId]);

  if (!assignment && !loading) {
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
          编辑作业
        </h1>

        {assignment && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px', background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                作业标题 *
              </label>
              <input
                type="text"
                value={assignment.title}
                onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
                placeholder="请输入作业标题"
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
                作业描述 *
              </label>
              <textarea
                value={assignment.description}
                onChange={(e) => setAssignment({ ...assignment, description: e.target.value })}
                placeholder="请输入作业描述"
                required
                rows={6}
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

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                可用题目
              </label>
              <select
                value={assignment.question_id}
                onChange={(e) => setAssignment({ ...assignment, question_id: e.target.value })}
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
                <option value="">无关联题目</option>
                {assignment.available_questions && assignment.available_questions.map((q, idx) => (
                  <option key={idx} value={q.id}>
                    {q.title} ({q.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                截止时间
              </label>
              <DatePicker
                showTime
                value={assignment.due_date ? new Date(assignment.due_date) : null}
                onChange={(date) => setAssignment({ ...assignment, due_date: date ? date.toISOString() : null })}
                style={{ width: '100%', fontSize: '16px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                  总分
                </label>
                <InputNumber
                  value={assignment.total_score}
                  onChange={(value) => setAssignment({ ...assignment, total_score: value })}
                  min={0}
                  style={{ width: '100%', fontSize: '16px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                  通过分数
                </label>
                <InputNumber
                  value={assignment.passing_score}
                  onChange={(value) => setAssignment({ ...assignment, passing_score: value })}
                  min={0}
                  style={{ width: '100%', fontSize: '16px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                是否可见
              </label>
              <select
                value={assignment.is_visible ? 'true' : 'false'}
                onChange={(e) => setAssignment({ ...assignment, is_visible: e.target.value === 'true' })}
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
                <option value="true">可见</option>
                <option value="false">隐藏</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '15px', borderTop: '2px solid #f0f0f0', paddingTop: '25px' }}>
              <button
                type="button"
                onClick={() => navigate(`/courses/${courseId}/assignments`)}
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
                {loading ? '更新中...' : '更新作业'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
