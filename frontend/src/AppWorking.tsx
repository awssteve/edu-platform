import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';

const appTheme = {
  token: {
    colorPrimary: '#667eea',
    colorBgContainer: '#f5f5f5',
  },
};

function App() {
  return (
    <ConfigProvider theme={appTheme}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test" element={<TestBackend />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

function Home() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '30px', color: '#333' }}>
        高校教育平台
      </h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '40px' }}>
        AI 智慧教学新生态
      </p>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <button 
          onClick={() => navigate('/auth/login')}
          style={{
            padding: '14px 40px',
            fontSize: '16px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          登录
        </button>
        <button 
          onClick={() => navigate('/auth/register')}
          style={{
            padding: '14px 40px',
            fontSize: '16px',
            background: 'white',
            color: '#667eea',
            border: '2px solid #667eea',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          注册
        </button>
        <button 
          onClick={() => navigate('/test')}
          style={{
            padding: '14px 40px',
            fontSize: '16px',
            background: '#52c41a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          测试后端
        </button>
      </div>
    </div>
  );
}

function Login() {
  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>登录</h1>
      <div style={{ padding: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <p>登录功能开发中...</p>
      </div>
    </div>
  );
}

function Register() {
  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>注册</h1>
      <div style={{ padding: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <p>注册功能开发中...</p>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ marginBottom: '30px' }}>仪表板</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{ padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>我的课程</h3>
          <p style={{ color: '#999' }}>暂无课程</p>
        </div>
        <div style={{ padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>学习进度</h3>
          <p style={{ color: '#999' }}>暂无进度</p>
        </div>
        <div style={{ padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>我的证书</h3>
          <p style={{ color: '#999' }}>暂无证书</p>
        </div>
      </div>
    </div>
  );
}

function TestBackend() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const API_BASE_URL = 'http://localhost:8000';

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users`);
      const data = await response.json();
      setUsers(data.users || []);
      setSuccess(`成功获取 ${data.users?.length || 0} 个用户`);
    } catch (err) {
      setError(`获取失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: `frontend_test_${Date.now()}`,
          email: `frontend_test_${Date.now()}@example.com`,
          full_name: '前端测试用户',
          role: 'student',
        }),
      });
      const data = await response.json();
      setSuccess(`注册成功！用户 ID: ${data.id}, 用户名: ${data.username}`);
      await fetchUsers();
    } catch (err) {
      setError(`注册失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>
        前后端协同测试
      </h1>
      
      <div style={{ marginBottom: '30px' }}>
        <button 
          onClick={registerUser}
          disabled={loading}
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            marginRight: '15px',
          }}
        >
          {loading ? '注册中...' : '注册新用户'}
        </button>
        <button 
          onClick={fetchUsers}
          disabled={loading}
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            background: '#52c41a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
          }}
        >
          {loading ? '获取中...' : '获取用户列表'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '15px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c00',
          marginBottom: '20px',
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '15px',
          background: '#efe',
          border: '1px solid #cfc',
          borderRadius: '8px',
          color: '#090',
          marginBottom: '20px',
        }}>
          {success}
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>
          用户列表 ({users.length})
        </h3>
        {users.length === 0 ? (
          <p style={{ color: '#999' }}>暂无用户，请先注册</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {users.map((user) => (
              <div key={user.id} style={{
                padding: '15px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #eee',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}>
                <div style={{ fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                  {user.full_name}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '3px' }}>
                  用户名: {user.username}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '3px' }}>
                  邮箱: {user.email}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  角色: {user.role} | ID: {user.id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
