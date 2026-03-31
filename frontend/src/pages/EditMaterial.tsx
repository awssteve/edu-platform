import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Edit Material Page
export function EditMaterial() {
  const { courseId, materialId } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem('token') || '');

  const fetchMaterial = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/materials/${materialId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setMaterial(data);
      setFormData({
        title: data.title || '',
        description: data.description || '',
      });
    } catch (error) {
      message.error('获取课件详情失败: ' + error.message);
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
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/materials/${materialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('课件更新成功！');
        navigate(`/courses/${courseId}/materials`);
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
    if (materialId && courseId) fetchMaterial();
  }, [materialId, courseId]);

  if (!material && !loading) {
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
          编辑课件
        </h1>

        {material && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px', background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                课件标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="请输入课件标题"
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
                课件描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入课件描述"
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

            <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '25px' }}>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>
                  当前文件
                </div>
                <div style={{ color: '#333', fontSize: '16px', fontWeight: '500' }}>
                  {material.file_name || '-'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={() => navigate(`/courses/${courseId}/materials`)}
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
                  {loading ? '更新中...' : '更新课件'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
