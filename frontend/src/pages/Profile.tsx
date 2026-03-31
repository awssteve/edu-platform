import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Profile Page
export function Profile() {
  const [user, setUser] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUser({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
      });
    } catch (error) {
      message.error('获取用户信息失败: ' + error.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('个人资料保存成功！');
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        message.error(data.detail || '保存失败');
      }
    } catch (error) {
      message.error('保存失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '700px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#333', fontWeight: '700' }}>
          个人资料
        </h1>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                  用户名
                </label>
                <input
                  type="text"
                  disabled
                  value={localStorage.getItem('username') || ''}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '2px solid #e8e8e8',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    background: '#f5f5f5',
                    color: '#999',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                  邮箱
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '2px solid #e8e8e8',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    background: '#f5f5f5',
                    color: '#999',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                  姓名 *
                </label>
                <input
                  type="text"
                  value={user.full_name}
                  onChange={(e) => setUser({ ...user, full_name: e.target.value })}
                  placeholder="请输入您的姓名"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '2px solid #e1e1e1',
                    borderRadius: '8px',
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
                  手机号
                </label>
                <input
                  type="tel"
                  value={user.phone}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  placeholder="请输入手机号"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '2px solid #e1e1e1',
                    borderRadius: '8px',
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
                个人简介
              </label>
              <textarea
                value={user.bio}
                onChange={(e) => setUser({ ...user, bio: e.target.value })}
                placeholder="请输入个人简介"
                rows={5}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '8px',
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
              {loading ? '保存中...' : '保存资料'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Upload Avatar Page
export function UploadAvatar() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      message.warning('请先选择头像文件');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        message.success('头像上传成功！');
        const userResponse = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await userResponse.json();
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/profile');
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
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#333', fontWeight: '700' }}>
          上传头像
        </h1>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '4px dashed #e1e1e1',
              }}>
                {preview ? (
                  <img src={preview} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '48px', color: '#999' }}>👤</span>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <label style={{
                padding: '14px 30px',
                background: '#667eea',
                color: 'white',
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s',
                display: 'inline-block',
              }}>
                选择头像文件
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <input
                type="file"
                ref={(input) => {
                  if (input && input.label) {
                    input.label.addEventListener('click', () => input.click());
                  }
                }}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>

            <p style={{ color: '#999', fontSize: '14px', textAlign: 'center', marginBottom: '10px' }}>
              支持 JPG、PNG 格式，文件大小不超过 2MB
            </p>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '18px 50px',
                fontSize: '18px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '上传中...' : '上传头像'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/profile')}
              style={{
                padding: '14px 30px',
                fontSize: '16px',
                background: 'white',
                color: '#666',
                border: '2px solid #e1e1e1',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                marginTop: '10px',
              }}
            >
              取消
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Change Password Page
export function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem('token') || '');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.new_password !== formData.confirm_password) {
      message.error('两次输入的密码不一致');
      return;
    }

    if (formData.new_password.length < 6) {
      message.error('新密码长度不能少于6位');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: formData.old_password,
          new_password: formData.new_password,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('密码修改成功！请重新登录');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/auth/login'), 1500);
      } else {
        message.error(data.detail || '修改失败');
      }
    } catch (error) {
      message.error('修改失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#333', fontWeight: '700' }}>
          修改密码
        </h1>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                旧密码 *
              </label>
              <input
                type="password"
                value={formData.old_password}
                onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
                placeholder="请输入旧密码"
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
                新密码 *
              </label>
              <input
                type="password"
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                placeholder="请输入新密码（至少6位）"
                required
                minLength="6"
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
                确认新密码 *
              </label>
              <input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                placeholder="请再次输入新密码"
                required
                minLength="6"
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

            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                type="button"
                onClick={() => navigate('/profile')}
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
                {loading ? '修改中...' : '确认修改'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
