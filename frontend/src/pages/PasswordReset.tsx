import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Forgot Password Page
export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        message.success('重置密码邮件已发送！');
      } else {
        message.error(data.detail || '发送失败');
      }
    } catch (error) {
      message.error('发送失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#333', fontWeight: '700' }}>
          忘记密码
        </h1>

        {success ? (
          <div style={{ background: 'white', padding: '60px', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>✉️</div>
            <h2 style={{ fontSize: '28px', marginBottom: '20px', color: '#333', fontWeight: '700', margin: 0 }}>
              邮件已发送
            </h2>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
              重置密码的链接已发送到你的邮箱 {email}，请查收邮件并按照提示重置密码。
            </p>
            <button
              onClick={() => navigate('/auth/login')}
              style={{
                padding: '16px 40px',
                fontSize: '18px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#5568d3'}
              onMouseOut={(e) => e.currentTarget.style.background = '#667eea'}
            >
              返回登录
            </button>
          </div>
        ) : (
          <div style={{ background: 'white', padding: '60px', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px', textAlign: 'center', lineHeight: '1.6' }}>
              请输入您的邮箱地址，我们将向您发送重置密码的链接。
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                  邮箱地址 *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入注册时使用的邮箱"
                  required
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: '2px solid #e1e1e1',
                    borderRadius: '12px',
                    fontSize: '18px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e1e1e1'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '18px',
                  fontSize: '20px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? '发送中...' : '发送重置邮件'}
              </button>
            </form>

            <div style={{ marginTop: '30px', textAlign: 'center', paddingTop: '30px', borderTop: '2px solid #f0f0f0' }}>
              <p style={{ color: '#999', fontSize: '16px' }}>
                还记得密码？
              </p>
              <button
                onClick={() => navigate('/auth/login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '18px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  transition: 'all 0.3s',
                  marginTop: '10px',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f0f9ff'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                立即登录
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Reset Password Page
export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.new_password !== formData.confirm_password) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.new_password.length < 6) {
      setError('新密码长度不能少于6位');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          new_password: formData.new_password,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        message.success('密码重置成功！');
      } else {
        setError(data.detail || '重置失败');
      }
    } catch (err) {
      setError('重置失败：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#333', fontWeight: '700' }}>
            密码重置成功
          </h1>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
            您的密码已成功重置，现在可以使用新密码登录。
          </p>
          <button
            onClick={() => navigate('/auth/login')}
            style={{
              padding: '18px 40px',
              fontSize: '20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#5568d3'}
            onMouseOut={(e) => e.currentTarget.style.background = '#667eea'}
          >
            返回登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#333', fontWeight: '700' }}>
          重置密码
        </h1>

        <div style={{ background: 'white', padding: '60px', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
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
                  padding: '16px 20px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '12px',
                  fontSize: '18px',
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
                  padding: '16px 20px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '12px',
                  fontSize: '18px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e1e1e1'}
              />
            </div>

            {error && (
              <div style={{
                padding: '15px',
                background: '#fff2f0',
                border: '1px solid #ffccc7',
                borderRadius: '8px',
                color: '#ff4d4f',
                fontSize: '16px',
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '18px',
                fontSize: '20px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '重置中...' : '重置密码'}
            </button>
          </form>

          <div style={{ marginTop: '30px', textAlign: 'center', paddingTop: '30px', borderTop: '2px solid #f0f0f0' }}>
            <button
              onClick={() => navigate('/auth/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '18px',
                padding: '10px 20px',
                borderRadius: '8px',
                transition: 'all 0.3s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f0f9ff'}
              onMouseOut={(e) => e.currentTarget.style.background = 'none'}
            >
              取消返回登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
