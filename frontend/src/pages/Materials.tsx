import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Materials List Page
export function MaterialsList() {
  const { courseId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/materials/?course_id=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setMaterials(data || []);
    } catch (error) {
      message.error('获取课件列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchMaterials();
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
            课件列表
          </h1>
          <button
            onClick={() => navigate(`/courses/${courseId}/materials/upload`)}
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
            上传课件
          </button>
        </div>

        {materials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📁</div>
            <p style={{ color: '#999', fontSize: '18px' }}>暂无课件</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {materials.map((material) => (
              <MaterialCard key={material.id} material={material} courseId={courseId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MaterialCard({ material, courseId }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/courses/${courseId}/materials/${material.id}`)}
      style={{
        background: 'white',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'all 0.3s',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ fontSize: '48px' }}>
        {material.file_type === 'pdf' ? '📄' : material.file_type === 'video' ? '🎬' : material.file_type === 'ppt' ? '📊' : '📁'}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '20px', color: '#333', fontWeight: '600', marginBottom: '10px', margin: 0 }}>
          {material.title}
        </h3>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
          {material.description || '暂无描述'}
        </p>
      </div>
      <div style={{ color: '#999', fontSize: '14px' }}>
        {material.created_at && new Date(material.created_at).toLocaleDateString('zh-CN')}
      </div>
    </div>
  );
}

// Upload Material Page
export function UploadMaterial() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('course_id', courseId);
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/materials/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      const data = await response.json();

      if (response.ok) {
        message.success('课件上传成功！');
        navigate(`/courses/${courseId}/materials`);
      } else {
        message.error(data.detail || '上传失败');
      }
    } catch (error) {
      message.error('上传失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#333', fontWeight: '700' }}>
          上传课件
        </h1>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
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

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                课件文件 *
              </label>
              <input
                type="file"
                onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                required
                accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4"
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
                {loading ? '上传中...' : '上传课件'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
