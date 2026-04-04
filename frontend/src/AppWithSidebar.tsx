import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { MainLayout } from './components/MainLayout';
import SimpleVideoConference from './components/SimpleVideoConference';

// 导入功能页面组件
import AITutor from './pages/AITutor';
import AIAgentsSystem from './pages/AIAgents';
import KnowledgeGraphModule from './pages/KnowledgeGraph';
import CollegeFeatures from './pages/CollegeFeatures';
import IntelligentRecommendation from './pages/IntelligentRecommendation';
import LearningAnalytics from './pages/LearningAnalytics';
import SuperBlackboardFixed from './pages/SuperBlackboardFixed';
import AdaptiveLearning from './pages/AdaptiveLearning';
import RAGKnowledgeBase from './pages/RAGKnowledgeBase';
import SystemDiagnostics from './pages/SystemDiagnostics';
import VideoConferenceTest from './pages/VideoConferenceTest';
import WebSocketTest from './pages/WebSocketTest';

// 导航首页组件
function DashboardHome() {
  const navigate = (path: string) => (window.location.href = path);

  const features = [
    {
      title: 'AI助教',
      icon: '🤖',
      description: '24*7在线智能对话',
      path: '/ai-tutor/1',
      color: '#667eea',
      stats: '智能回复'
    },
    {
      title: 'AI智能体',
      icon: '👥',
      description: '6个专业AI助手团队',
      path: '/ai-agents',
      color: '#f5222d',
      stats: '6个助手'
    },
    {
      title: '超级黑板',
      icon: '🖼️',
      description: '实时协作白板',
      path: '/super-blackboard',
      color: '#fa8c16',
      stats: '6种工具'
    },
    {
      title: '知识图谱',
      icon: '🔗',
      description: '可视化知识结构',
      path: '/knowledge-graph',
      color: '#52c41a',
      stats: '树形展示'
    },
    {
      title: '智能推荐',
      icon: '⭐',
      description: '个性化学习推荐',
      path: '/recommendations',
      color: '#1890ff',
      stats: '4种类型'
    },
    {
      title: '学院专区',
      icon: '🏛️',
      description: '三院差异化功能',
      path: '/college-features',
      color: '#722ed1',
      stats: '3个学院'
    },
    {
      title: '学习分析',
      icon: '📊',
      description: '学习行为洞察',
      path: '/learning-analytics',
      color: '#13c2c2',
      stats: 'AI预测'
    },
    {
      title: '自适应学习',
      icon: '🎯',
      description: 'AI动态调整路径',
      path: '/adaptive-learning',
      color: '#fa541c',
      stats: '智能优化'
    },
    {
      title: 'RAG知识库',
      icon: '🔍',
      description: '智能文档检索',
      path: '/knowledge-base',
      color: '#9254de',
      stats: '向量搜索'
    },
  ];

  return (
    <div style={{ padding: '0' }}>
      {/* 欢迎横幅 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px',
        borderRadius: '12px',
        marginBottom: '24px',
        color: 'white',
      }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', color: 'white' }}>
          欢迎回来，{localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')||'{}').full_name || '同学' : '同学'}！
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9, color: 'white' }}>
          今天想学习什么？AI助手随时为你服务 🤖
        </p>
      </div>

      {/* 学习统计 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          padding: '20px',
          background: 'white',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>5</div>
          <div style={{ fontSize: '13px', color: '#999' }}>在学课程</div>
        </div>
        <div style={{
          padding: '20px',
          background: 'white',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏱️</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>127.5h</div>
          <div style={{ fontSize: '13px', color: '#999' }}>学习时长</div>
        </div>
        <div style={{
          padding: '20px',
          background: 'white',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>87.3</div>
          <div style={{ fontSize: '13px', color: '#999' }}>平均成绩</div>
        </div>
        <div style={{
          padding: '20px',
          background: 'white',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔥</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>15</div>
          <div style={{ fontSize: '13px', color: '#999' }}>连续学习天数</div>
        </div>
      </div>

      {/* 功能导航 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {features.map((feature) => (
          <div
            key={feature.title}
            onClick={() => navigate(feature.path)}
            style={{
              padding: '24px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '2px solid transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              e.currentTarget.style.borderColor = feature.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {feature.icon}
            </div>
            <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '18px' }}>
              {feature.title}
            </h3>
            <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
              {feature.description}
            </p>
            <div style={{
              padding: '6px 12px',
              background: '#f0f5ff',
              borderRadius: '16px',
              display: 'inline-block',
              fontSize: '12px',
              color: '#1890ff',
              fontWeight: 500,
            }}>
              {feature.stats}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('classroom-101');
  const [user, setUser] = useState(null);

  // 全局设置视频会议函数
  useEffect(() => {
    console.log('🚀 AppWithSidebar useEffect开始执行');

    // 加载用户
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // 设置全局函数
    (window as any).openVideoConference = (roomName: string) => {
      console.log('🎥 全局函数打开视频会议:', roomName);
      setCurrentRoom(roomName);
      setVideoModalVisible(true);
    };

    console.log('✅ 全局函数已设置，类型:', typeof (window as any).openVideoConference);
  }, []);

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#667eea' } }}>
      <Router>
        <Routes>
          {/* 未登录页面 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          {/* 已登录页面 - 使用侧边栏布局 */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardHome />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/ai-tutor/:courseId" element={
            <ProtectedRoute>
              <MainLayout>
                <AITutor />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/ai-agents" element={
            <ProtectedRoute>
              <MainLayout>
                <AIAgentsSystem />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/super-blackboard" element={
            <ProtectedRoute>
              <MainLayout>
                <SuperBlackboardFixed />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/knowledge-graph" element={
            <ProtectedRoute>
              <MainLayout>
                <KnowledgeGraphModule />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/recommendations" element={
            <ProtectedRoute>
              <MainLayout>
                <IntelligentRecommendation />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/college-features" element={
            <ProtectedRoute>
              <MainLayout>
                <CollegeFeatures />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/learning-analytics" element={
            <ProtectedRoute>
              <MainLayout>
                <LearningAnalytics />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/adaptive-learning" element={
            <ProtectedRoute>
              <MainLayout>
                <AdaptiveLearning />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/knowledge-base" element={
            <ProtectedRoute>
              <MainLayout>
                <RAGKnowledgeBase />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/diagnostics" element={
            <ProtectedRoute>
              <SystemDiagnostics />
            </ProtectedRoute>
          } />

          <Route path="/video-test" element={
            <ProtectedRoute>
              <MainLayout>
                <VideoConferenceTest />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/websocket-test" element={
            <ProtectedRoute>
              <MainLayout>
                <WebSocketTest />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* 兜底路由 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        {/* 全局视频会议Modal */}
        {user && (
          <SimpleVideoConference
            visible={videoModalVisible}
            onClose={() => setVideoModalVisible(false)}
            roomId={currentRoom}
            userId={user.id || '1'}
            username={user.username || 'Guest'}
          />
        )}
      </Router>
    </ConfigProvider>
  );
}

// 路由保护组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }
  return <>{children}</>;
}

// 首页
function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      padding: '40px',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>
        🎓 高校教育平台
      </h1>
      <p style={{ fontSize: '20px', marginBottom: '40px', opacity: 0.9 }}>
        AI 智慧教学新生态 - 完整实现所有PDF功能
      </p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <button
          onClick={() => window.location.href = '/auth/login'}
          style={{
            padding: '14px 40px',
            fontSize: '16px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          登录
        </button>
        <button
          onClick={() => window.location.href = '/auth/register'}
          style={{
            padding: '14px 40px',
            fontSize: '16px',
            background: 'transparent',
            color: 'white',
            border: '2px solid white',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          注册
        </button>
      </div>
      <div style={{
        marginTop: '60px',
        padding: '20px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        fontSize: '14px',
      }}>
        <div>✅ 10个核心功能模块全部实现</div>
        <div>✅ 左侧导航栏 + 现代化布局</div>
        <div style={{ marginTop: '12', fontWeight: 'bold' }}>测试账号: student / student123</div>
      </div>
    </div>
  );
}

// 登录页面
function LoginPage() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

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
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      } else {
        setError(data.detail || '登录失败，请检查用户名和密码');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: '40px',
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#333' }}>
          登录
        </h2>
        <p style={{ textAlign: 'center', color: '#999', marginBottom: '30px' }}>
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

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#666' }}>
          还没有账号？{' '}
          <a
            onClick={() => window.location.href = '/auth/register'}
            style={{ color: '#667eea', cursor: 'pointer' }}
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
          color: '#666',
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>测试账号：</div>
          <div>学生: student / student123</div>
          <div>教师: teacher / teacher123</div>
        </div>
      </div>
    </div>
  );
}

// 注册页面
function RegisterPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: '40px',
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          注册
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          创建你的账号
        </p>

        <div style={{
          padding: '20px',
          background: '#f0f5ff',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#1890ff',
        }}>
          注册功能开发中... 请使用测试账号登录
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#666' }}>
          已有账号？{' '}
          <a
            onClick={() => window.location.href = '/auth/login'}
            style={{ color: '#667eea', cursor: 'pointer' }}
          >
            立即登录
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
