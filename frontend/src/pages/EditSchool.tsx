import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Input, Select, InputNumber } from 'antd';

const { Option } = Select;
const API_BASE_URL = 'http://localhost:8000';

// Edit School Page
export function EditSchool() {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem('token') || '');

  const fetchSchool = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/schools/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSchool(data);
    } catch (error) {
      message.error('获取学校详情失败: ' + error.message);
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
      const response = await fetch(`${API_BASE_URL}/api/v1/schools/${schoolId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(school),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('学校信息更新成功！');
        navigate(`/schools/${schoolId}`);
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
    if (schoolId) fetchSchool();
  }, [schoolId]);

  if (!school && !loading) {
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
          编辑学校
        </h1>

        {school && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px', background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                学校名称 *
              </label>
              <input
                type="text"
                value={school.name}
                onChange={(e) => setSchool({ ...school, name: e.target.value })}
                placeholder="请输入学校名称"
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                  学校类型 *
                </label>
                <select
                  value={school.type}
                  onChange={(e) => setSchool({ ...school, type: e.target.value })}
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
                  <option value="university">大学</option>
                  <option value="college">学院</option>
                  <option value="high_school">高中</option>
                  <option value="middle_school">中学</option>
                  <option value="elementary_school">小学</option>
                  <option value="vocational_school">职业学校</option>
                  <option value="training_institution">培训机构</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                  学校状态 *
                </label>
                <select
                  value={school.is_active ? 'true' : 'false'}
                  onChange={(e) => setSchool({ ...school, is_active: e.target.value === 'true' })}
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
                  <option value="true">活跃</option>
                  <option value="false">未激活</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                学校地址
              </label>
              <input
                type="text"
                value={school.address || ''}
                onChange={(e) => setSchool({ ...school, address: e.target.value })}
                placeholder="请输入学校地址"
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                  联系电话
                </label>
                <input
                  type="tel"
                  value={school.phone || ''}
                  onChange={(e) => setSchool({ ...school, phone: e.target.value })}
                  placeholder="请输入联系电话"
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
                  学校邮箱
                </label>
                <input
                  type="email"
                  value={school.email || ''}
                  onChange={(e) => setSchool({ ...school, email: e.target.value })}
                  placeholder="请输入学校邮箱"
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
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                学校简介
              </label>
              <textarea
                value={school.description || ''}
                onChange={(e) => setSchool({ ...school, description: e.target.value })}
                placeholder="请输入学校简介"
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

            <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '25px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  type="button"
                  onClick={() => navigate(`/schools/${schoolId}`)}
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
                  {loading ? '更新中...' : '更新学校'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
