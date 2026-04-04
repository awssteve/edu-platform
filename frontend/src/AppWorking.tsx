import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';

// 导入功能页面组件（只导入存在的文件）
import AITutor from './pages/AITutor';
import AIAgentsSystem from './pages/AIAgents';
import KnowledgeGraph from './pages/KnowledgeGraph';
import CollegeFeatures from './pages/CollegeFeatures';
import IntelligentRecommendation from './pages/IntelligentRecommendation';
import LearningAnalytics from './pages/LearningAnalytics';
import { SuperBlackboardFixed } from './pages/SuperBlackboardFixed';
import { AdaptiveLearning } from './pages/AdaptiveLearning';
import { RAGKnowledgeBase } from './pages/RAGKnowledgeBase';

// 创建简单的占位符组件用于缺失的页面
function SuperBlackboardPlaceholder() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>🖼️ 超级黑板</h1>
      <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <p>实时协作白板功能</p>
        <p style={{ color: '#999' }}>功能正在开发中...</p>
      </div>
    </div>
  );
}

function ProjectsPlaceholder() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>💼 项目管理</h1>
      <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <p>项目协作平台</p>
        <p style={{ color: '#999' }}>功能正在开发中...</p>
      </div>
    </div>
  );
}

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

          {/* 功能页面路由 */}
          <Route path="/ai-tutor/:courseId" element={<AITutor />} />
          <Route path="/ai-agents" element={<AIAgentsSystem />} />
          <Route path="/super-blackboard" element={<SuperBlackboardFixed />} />
          <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
          <Route path="/recommendations" element={<IntelligentRecommendation />} />
          <Route path="/college-features" element={<CollegeFeatures />} />
          <Route path="/learning-analytics" element={<LearningAnalytics />} />
          <Route path="/adaptive-learning" element={<AdaptiveLearning />} />
          <Route path="/knowledge-base" element={<RAGKnowledgeBase />} />
          <Route path="/projects" element={<ProjectsPlaceholder />} />

          {/* 兜底路由 */}
          <Route path="*" element={<div style={{ padding: '40px', textAlign: 'center' }}><h2>页面不存在</h2><button onClick={() => window.location.href = '/'} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>返回首页</button></div>} />
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
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('请输入用户名和密码');
      setLoading(false);
      return;
    }

    try {
      const API_BASE_URL = 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        // 保存token到localStorage
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // 跳转到仪表板
        navigate('/dashboard');
      } else {
        setError(data.detail || '登录失败，请检查用户名和密码');
      }
    } catch (err) {
      console.error('登录错误:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '40px',
      maxWidth: '400px',
      margin: '0 auto',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{ padding: '40px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginBottom: '10px', textAlign: 'center', color: '#333' }}>登录</h1>
        <p style={{ marginBottom: '30px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
          高校教育平台
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              background: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: '8px',
              color: '#ff4d4f',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#999' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#999' }}>
          <span>还没有账号？</span>
          <a
            onClick={() => navigate('/auth/register')}
            style={{ color: '#667eea', cursor: 'pointer', marginLeft: '5px' }}
          >
            立即注册
          </a>
        </div>

        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: '#f0f5ff',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#666'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>测试账号：</div>
          <div>学生: student / student123</div>
          <div>教师: teacher / teacher123</div>
        </div>
      </div>
    </div>
  );
}

function Register() {
  const [formData, setFormData] = React.useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.username || !formData.password || !formData.email) {
      setError('请填写所有必填项');
      setLoading(false);
      return;
    }

    try {
      const API_BASE_URL = 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      } else {
        setError(data.detail || '注册失败，请重试');
      }
    } catch (err) {
      console.error('注册错误:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        padding: '40px',
        maxWidth: '400px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          padding: '60px 40px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ color: '#52c41a', marginBottom: '10px' }}>注册成功！</h2>
          <p style={{ color: '#999' }}>即将跳转到登录页面...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '40px',
      maxWidth: '400px',
      margin: '0 auto',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{ padding: '40px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginBottom: '10px', textAlign: 'center', color: '#333' }}>注册</h1>
        <p style={{ marginBottom: '30px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
          创建您的账号
        </p>

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              用户名 *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="请输入用户名"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              邮箱 *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="请输入邮箱"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              姓名
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="请输入真实姓名"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              密码 *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="请输入密码（至少6位）"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              background: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: '8px',
              color: '#ff4d4f',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#999' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#999' }}>
          <span>已有账号？</span>
          <a
            onClick={() => navigate('/auth/login')}
            style={{ color: '#667eea', cursor: 'pointer', marginLeft: '5px' }}
          >
            立即登录
          </a>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [user, setUser] = React.useState<any>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/auth/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>加载中...</p>
      </div>
    );
  }

  const features = [
    {
      title: 'AI助教',
      icon: '🤖',
      description: '24*7在线教学助手',
      path: '/ai-tutor/1',
      color: '#667eea'
    },
    {
      title: 'AI智能体',
      icon: '👥',
      description: '6个专业AI助手团队',
      path: '/ai-agents',
      color: '#f5222d'
    },
    {
      title: '超级黑板',
      icon: '🖼️',
      description: '实时协作白板',
      path: '/super-blackboard',
      color: '#fa8c16'
    },
    {
      title: '知识图谱',
      icon: '🔗',
      description: '可视化知识结构',
      path: '/knowledge-graph',
      color: '#52c41a'
    },
    {
      title: '智能推荐',
      icon: '⭐',
      description: '个性化学习推荐',
      path: '/recommendations',
      color: '#1890ff'
    },
    {
      title: '学院专区',
      icon: '🏛️',
      description: '三院差异化功能',
      path: '/college-features',
      color: '#722ed1'
    },
    {
      title: '学习分析',
      icon: '📊',
      description: '学习行为洞察',
      path: '/learning-analytics',
      color: '#13c2c2'
    },
    {
      title: '自适应学习',
      icon: '🎯',
      description: 'AI动态调整学习路径',
      path: '/adaptive-learning',
      color: '#fa541c'
    },
    {
      title: 'RAG知识库',
      icon: '🔍',
      description: '智能文档检索',
      path: '/knowledge-base',
      color: '#9254de'
    },
    {
      title: '项目管理',
      icon: '💼',
      description: '项目协作平台',
      path: '/projects',
      color: '#eb2f96'
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* 顶部导航栏 */}
      <div style={{
        background: 'white',
        padding: '16px 40px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
            高校教育平台
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#999' }}>
            欢迎回来，{user.full_name || user.username}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{
            padding: '6px 12px',
            background: user.role === 'teacher' ? '#f0f5ff' : '#f6ffed',
            color: user.role === 'teacher' ? '#1890ff' : '#52c41a',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {user.role === 'teacher' ? '👨‍🏫 教师' : user.role === 'admin' ? '👨‍💼 管理员' : '👨‍🎓 学生'}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: 'white',
              color: '#ff4d4f',
              border: '1px solid #ff4d4f',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            退出登录
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div style={{ padding: '40px' }}>
        <h2 style={{ marginBottom: '24px', color: '#333' }}>功能导航</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => navigate(feature.path)}
              style={{
                padding: '24px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = feature.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {feature.icon}
              </div>
              <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '18px' }}>
                {feature.title}
              </h3>
              <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>
                {feature.description}
              </p>
              <div style={{
                marginTop: '16px',
                fontSize: '12px',
                color: feature.color,
                fontWeight: '500'
              }}>
                点击进入 →
              </div>
            </div>
          ))}
        </div>

        {/* 快速统计 */}
        <div style={{
          marginTop: '40px',
          padding: '24px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>学习概览</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', color: '#667eea', marginBottom: '8px' }}>3</div>
              <div style={{ color: '#999', fontSize: '14px' }}>在学课程</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', color: '#52c41a', marginBottom: '8px' }}>85%</div>
              <div style={{ color: '#999', fontSize: '14px' }}>平均进度</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', color: '#fa8c16', marginBottom: '8px' }}>12</div>
              <div style={{ color: '#999', fontSize: '14px' }}>完成课时</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', color: '#f5222d', marginBottom: '8px' }}>5</div>
              <div style={{ color: '#999', fontSize: '14px' }}>获得证书</div>
            </div>
          </div>
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
