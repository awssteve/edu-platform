import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Assignments List Page
export function AssignmentsList() {
  const { courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/assignments/?course_id=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAssignments(data || []);
    } catch (error) {
      message.error('获取作业列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchAssignments();
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
            作业列表
          </h1>
          <button
            onClick={() => navigate(`/courses/${courseId}/assignments/create`)}
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
            创建作业
          </button>
        </div>

        {assignments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📝</div>
            <p style={{ color: '#999', fontSize: '18px' }}>暂无作业</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {assignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} courseId={courseId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AssignmentCard({ assignment, courseId }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/courses/${courseId}/assignments/${assignment.id}`)}
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
      <h3 style={{ fontSize: '22px', color: '#333', fontWeight: '600', marginBottom: '15px', margin: 0 }}>
        {assignment.title}
      </h3>
      <p style={{ color: '#666', fontSize: '16px', marginBottom: '15px', lineHeight: '1.6' }}>
        {assignment.description || '暂无描述'}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #f0f0f0', paddingTop: '15px' }}>
        <div style={{ color: '#999', fontSize: '14px' }}>
          截止日期: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString('zh-CN') : '无'}
        </div>
        <div style={{ color: '#999', fontSize: '14px' }}>
          分值: {assignment.points || 0} 分
        </div>
      </div>
    </div>
  );
}

// Create Assignment Page
export function CreateAssignment() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    points: 100,
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
      const response = await fetch(`${API_BASE_URL}/api/v1/assignments/`, {
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
        message.success('作业创建成功！');
        navigate(`/courses/${courseId}/assignments`);
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
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#333', fontWeight: '700' }}>
          创建作业
        </h1>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                作业标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                截止日期
              </label>
              <input
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
                作业分值 *
              </label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                min="0"
                max="100"
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

            <div style={{ display: 'flex', gap: '15px' }}>
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
                {loading ? '创建中...' : '创建作业'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Submit Assignment Page
export function SubmitAssignment() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    content: '',
    file: null,
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
      const formDataToSend = new FormData();
      formDataToSend.append('content', formData.content);
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      const data = await response.json();

      if (response.ok) {
        message.success('作业提交成功！');
        navigate(`/courses/${courseId}/assignments/${assignmentId}`);
      } else {
        message.error(data.detail || '提交失败');
      }
    } catch (error) {
      message.error('提交失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#333', fontWeight: '700' }}>
          提交作业
        </h1>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                作业内容 *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="请输入作业内容"
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
                作业附件
              </label>
              <input
                type="file"
                onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
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

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
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
              {loading ? '提交中...' : '提交作业'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Assignment Detail Page
export function AssignmentDetail() {
  const { courseId, assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchAssignment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAssignment(data);

      const subResponse = await fetch(`${API_BASE_URL}/api/v1/assignments/${assignmentId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const subData = await subResponse.json();
      setSubmissions(subData || []);
    } catch (error) {
      message.error('获取作业详情失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) fetchAssignment();
  }, [assignmentId]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        加载中...
      </div>
    );
  }

  if (!assignment) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        作业不存在
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button
          onClick={() => navigate(`/courses/${courseId}/assignments`)}
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
          ← 返回作业列表
        </button>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '40px', marginBottom: '30px', color: '#333', fontWeight: '700', margin: 0 }}>
            {assignment.title}
          </h1>

          <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.8', marginBottom: '30px' }}>
            {assignment.description || '暂无描述'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', borderTop: '2px solid #f0f0f0', paddingTop: '30px' }}>
            <div>
              <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>截止日期</div>
              <div style={{ color: '#333', fontSize: '20px', fontWeight: '600' }}>
                {assignment.due_date ? new Date(assignment.due_date).toLocaleString('zh-CN') : '无'}
              </div>
            </div>
            <div>
              <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>作业分值</div>
              <div style={{ color: '#333', fontSize: '20px', fontWeight: '600' }}>
                {assignment.points || 0} 分
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '30px', color: '#333', fontWeight: '700', margin: 0 }}>
            提交记录 ({submissions.length})
          </h2>

          {submissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '16px' }}>
              暂无提交记录
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {submissions.map((submission) => (
                <div key={submission.id} style={{
                  padding: '20px',
                  background: '#f9f9f9',
                  borderRadius: '12px',
                  border: '1px solid #e8e8e8',
                }}>
                  <div style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
                    提交时间: {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString('zh-CN') : '-'}
                  </div>
                  <div style={{ marginBottom: '10px', color: '#333', fontSize: '16px' }}>
                    {submission.content}
                  </div>
                  {submission.score !== undefined && (
                    <div style={{ color: '#667eea', fontSize: '18px', fontWeight: '600' }}>
                      得分: {submission.score} / {assignment.points}
                    </div>
                  )}
                  {submission.feedback && (
                    <div style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
                      评语: {submission.feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
