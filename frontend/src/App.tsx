import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ConfigProvider, message } from 'antd';

import { CourseList, CourseDetail, CreateCourse } from './pages/Courses';
import { MaterialsList, UploadMaterial } from './pages/Materials';
import { QuestionsList, CreateQuestion, AIGenerateQuestions } from './pages/Questions';
import { AssignmentsList, CreateAssignment, SubmitAssignment, AssignmentDetail } from './pages/Assignments';
import { LearningProgress, LearningRecords, LearningTimeline, LearningSummary } from './pages/Learning';
import { DiscussionTopicsList, CreateTopic, DiscussionTopicDetail } from './pages/Discussions';
import { CertificatesList, CertificateDetail, VerifyCertificate } from './pages/Certificates';
import { NotificationsList, NotificationSettings } from './pages/Notifications';
import { Profile, UploadAvatar, ChangePassword, ProfileSettings } from './pages/Profile';
import { ForgotPassword, ResetPassword } from './pages/PasswordReset';
import { CourseAnalytics, StudentAnalytics, TrendAnalytics } from './pages/Analytics';
import { SchoolsList, SchoolDetail } from './pages/Schools';
import { CourseReviewsList, CreateReview } from './pages/Reviews';
import { SearchPage } from './pages/Search';
import { ReportsList } from './pages/Reports';
import { PermissionsPage, RolesPage } from './pages/Admin';
import { TeachersList, StudentsList } from './pages/Users';
import { SchoolSubscriptions, EditCourse } from './pages/EditPages';
import { EditMaterial, EditQuestion, EditAssignment } from './pages/EditPages';

const API_BASE_URL = 'http://localhost:8000';

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
          {/* 核心页面 */}
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test" element={<TestBackend />} />

          {/* 课程管理 */}
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/create" element={<CreateCourse />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/courses/:courseId/edit" element={<EditCourse />} />

          {/* 课件管理 */}
          <Route path="/courses/:courseId/materials" element={<MaterialsList />} />
          <Route path="/courses/:courseId/materials/upload" element={<UploadMaterial />} />
          <Route path="/courses/:courseId/materials/:materialId/edit" element={<EditMaterial />} />

          {/* 题目管理 */}
          <Route path="/courses/:courseId/questions" element={<QuestionsList />} />
          <Route path="/courses/:courseId/questions/create" element={<CreateQuestion />} />
          <Route path="/courses/:courseId/questions/ai-generate" element={<AIGenerateQuestions />} />
          <Route path="/courses/:courseId/questions/:questionId/edit" element={<EditQuestion />} />

          {/* 作业管理 */}
          <Route path="/courses/:courseId/assignments" element={<AssignmentsList />} />
          <Route path="/courses/:courseId/assignments/create" element={<CreateAssignment />} />
          <Route path="/courses/:courseId/assignments/:assignmentId" element={<AssignmentDetail />} />
          <Route path="/courses/:courseId/assignments/:assignmentId/edit" element={<EditAssignment />} />
          <Route path="/courses/:courseId/assignments/:assignmentId/submit" element={<SubmitAssignment />} />

          {/* 学习进度 */}
          <Route path="/learning/progress" element={<LearningProgress />} />
          <Route path="/learning/records" element={<LearningRecords />} />
          <Route path="/learning/timeline" element={<LearningTimeline />} />
          <Route path="/learning/summary" element={<LearningSummary />} />

          {/* 讨论区 */}
          <Route path="/courses/:courseId/discussions" element={<DiscussionTopicsList />} />
          <Route path="/courses/:courseId/discussions/create" element={<CreateTopic />} />
          <Route path="/courses/:courseId/discussions/:topicId" element={<DiscussionTopicDetail />} />

          {/* 证书 */}
          <Route path="/certificates" element={<CertificatesList />} />
          <Route path="/certificates/:certificateId" element={<CertificateDetail />} />
          <Route path="/certificates/verify" element={<VerifyCertificate />} />

          {/* 通知 */}
          <Route path="/notifications" element={<NotificationsList />} />
          <Route path="/notifications/settings" element={<NotificationSettings />} />

          {/* 用户资料 */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/avatar" element={<UploadAvatar />} />
          <Route path="/profile/change-password" element={<ChangePassword />} />
          <Route path="/profile/settings" element={<ProfileSettings />} />

          {/* 学校管理 */}
          <Route path="/schools" element={<SchoolsList />} />
          <Route path="/schools/:schoolId" element={<SchoolDetail />} />
          <Route path="/schools/:schoolId/subscriptions" element={<SchoolSubscriptions />} />

          {/* 课程评价 */}
          <Route path="/courses/:courseId/reviews" element={<CourseReviewsList />} />
          <Route path="/courses/:courseId/reviews/create" element={<CreateReview />} />

          {/* 搜索 */}
          <Route path="/search" element={<SearchPage />} />
          <Route path="/courses/search" element={<SearchPage />} />

          {/* 数据分析 */}
          <Route path="/courses/:courseId/analytics" element={<CourseAnalytics />} />
          <Route path="/analytics/students/:studentId" element={<StudentAnalytics />} />
          <Route path="/analytics/trends" element={<TrendAnalytics />} />

          {/* 学习报告 */}
          <Route path="/reports" element={<ReportsList />} />
          <Route path="/reports/:reportId/export" element={<ReportsList />} />

          {/* 权限管理 */}
          <Route path="/admin/permissions" element={<PermissionsPage />} />
          <Route path="/admin/roles" element={<RolesPage />} />

          {/* 教师管理 */}
          <Route path="/teachers" element={<TeachersList />} />
          <Route path="/teachers/invite" element={<TeachersList />} />

          {/* 学生管理 */}
          <Route path="/students" element={<StudentsList />} />
          <Route path="/students/add" element={<StudentsList />} />
          <Route path="/students/import" element={<StudentsList />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

function Home() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '40px', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'white', padding: '60px', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: '600px', width: '100%' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#667eea', fontWeight: '800' }}>
          高校教育平台
        </h1>
        <p style={{ fontSize: '20px', color: '#666', marginBottom: '40px', fontWeight: '300' }}>
          AI 智慧教学新生态
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
            登录
          </button>
          <button
            onClick={() => navigate('/auth/register')}
            style={{
              padding: '16px 40px',
              fontSize: '18px',
              background: 'white',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#667eea'; e.currentTarget.style.color = 'white'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#667eea'; }}
          >
            注册
          </button>
          <button
            onClick={() => navigate('/courses')}
            style={{
              padding: '16px 40px',
              fontSize: '18px',
              background: '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(82, 196, 26, 0.4)',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#389e0d'}
            onMouseOut={(e) => e.currentTarget.style.background = '#52c41a'}
          >
            浏览课程
          </button>
          <button
            onClick={() => navigate('/test')}
            style={{
              padding: '16px 40px',
              fontSize: '18px',
              background: '#faad14',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(250, 173, 20, 0.4)',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#d48806'}
            onMouseOut={(e) => e.currentTarget.style.background = '#faad14'}
          >
            测试后端
          </button>
        </div>
      </div>
    </div>
  );
}

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.access_token);
        message.success('登录成功！');

        const userResponse = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        const userData = await userResponse.json();
        setUserInfo(userData);

        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(userData));

        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        message.error(data.detail || '登录失败，请检查用户名和密码');
      }
    } catch (error) {
      message.error('登录失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: '450px', width: '100%' }}>
        <h1 style={{ marginBottom: '40px', textAlign: 'center', color: '#333', fontSize: '32px', fontWeight: '700' }}>
          欢迎回来
        </h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontWeight: '500' }}>用户名</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 15px',
                border: '2px solid #e1e1e1',
                borderRadius: '10px',
                fontSize: '16px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box',
              }}
              placeholder="请输入用户名"
              required
              onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e1e1e1'}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontWeight: '500' }}>密码</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 15px',
                border: '2px solid #e1e1e1',
                borderRadius: '10px',
                fontSize: '16px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box',
              }}
              placeholder="请输入密码"
              required
              onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e1e1e1'}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
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
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center', color: '#999' }}>
          还没有账号？{' '}
          <button
            onClick={() => navigate('/auth/register')}
            style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontWeight: '600', padding: 0 }}
          >
            立即注册
          </button>
        </p>
        {userInfo && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#f0f9ff', border: '1px solid #bae7ff', borderRadius: '8px', fontSize: '14px', color: '#1890ff' }}>
            <div style={{ fontWeight: '600', marginBottom: '5px' }}>登录成功！</div>
            <div>用户名：{userInfo.username}</div>
            <div>邮箱：{userInfo.email}</div>
            <div>角色：{userInfo.role}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', full_name: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data);
        message.success('注册成功！');
        setTimeout(() => navigate('/auth/login'), 1500);
      } else {
        if (Array.isArray(data.detail)) {
          message.error(data.detail[0].msg);
        } else {
          message.error(data.detail || '注册失败');
        }
      }
    } catch (error) {
      message.error('注册失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: '450px', width: '100%' }}>
        <h1 style={{ marginBottom: '30px', textAlign: 'center', color: '#333', fontSize: '32px', fontWeight: '700' }}>
          创建账号
        </h1>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontWeight: '500', fontSize: '14px' }}>用户名</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box',
              }}
              placeholder="请输入用户名"
              required
              onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e1e1e1'}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontWeight: '500', fontSize: '14px' }}>邮箱</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box',
              }}
              placeholder="请输入邮箱"
              required
              onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e1e1e1'}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontWeight: '500', fontSize: '14px' }}>密码</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box',
              }}
              placeholder="请输入密码（至少6位）"
              required
              minLength="6"
              onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e1e1e1'}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontWeight: '500', fontSize: '14px' }}>姓名</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box',
              }}
              placeholder="请输入您的姓名"
              required
              onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e1e1e1'}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontWeight: '500', fontSize: '14px' }}>角色</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box',
                background: 'white',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e1e1e1'}
            >
              <option value="student">学生</option>
              <option value="teacher">教师</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
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
              marginTop: '10px',
            }}
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
          已有账号？{' '}
          <button
            onClick={() => navigate('/auth/login')}
            style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontWeight: '600', padding: 0 }}
          >
            立即登录
          </button>
        </p>
        {success && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '8px', fontSize: '14px', color: '#52c41a' }}>
            <div style={{ fontWeight: '600', marginBottom: '5px' }}>注册成功！</div>
            <div>用户 ID：{success.id}</div>
            <div>用户名：{success.username}</div>
            <div>邮箱：{success.email}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      navigate('/auth/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.success('已退出登录');
    navigate('/');
  };

  const handleCardHover = (e) => {
    e.currentTarget.style.transform = 'translateY(-5px)';
  };

  const handleItemHover = (e) => {
    e.currentTarget.style.transform = 'translateX(5px)';
  };

  if (!user) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>加载中...</div>;
  }

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', color: '#333', marginBottom: '10px', fontWeight: '700' }}>
              仪表板
            </h1>
            <p style={{ color: '#666', fontSize: '16px' }}>
              欢迎回来，{user.full_name || user.username}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 25px',
              fontSize: '16px',
              background: '#ff4d4f',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(255, 77, 79, 0.4)',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f5222d'}
            onMouseOut={(e) => e.currentTarget.style.background = '#ff4d4f'}
          >
            退出登录
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s' }} onMouseOver={handleCardHover}>
            <div style={{ fontSize: '48px', marginBottom: '15px', color: '#667eea' }}>📚</div>
            <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '20px', fontWeight: '600' }}>我的课程</h3>
            <p style={{ color: '#999', fontSize: '16px' }}>暂无课程</p>
          </div>
          <div style={{ padding: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s' }} onMouseOver={handleCardHover}>
            <div style={{ fontSize: '48px', marginBottom: '15px', color: '#52c41a' }}>📊</div>
            <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '20px', fontWeight: '600' }}>学习进度</h3>
            <p style={{ color: '#999', fontSize: '16px' }}>暂无进度</p>
          </div>
          <div style={{ padding: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s' }} onMouseOver={handleCardHover}>
            <div style={{ fontSize: '48px', marginBottom: '15px', color: '#faad14' }}>📜</div>
            <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '20px', fontWeight: '600' }}>我的证书</h3>
            <p style={{ color: '#999', fontSize: '16px' }}>暂无证书</p>
          </div>
          <div style={{ padding: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s' }} onMouseOver={handleCardHover}>
            <div style={{ fontSize: '48px', marginBottom: '15px', color: '#ff4d4f' }}>💬</div>
            <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '20px', fontWeight: '600' }}>讨论区</h3>
            <p style={{ color: '#999', fontSize: '16px' }}>暂无讨论</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestBackend() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
          password: 'test123456',
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
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '30px', textAlign: 'center', color: '#333', fontSize: '32px', fontWeight: '700' }}>
        前后端协同测试
      </h1>

      <div style={{ marginBottom: '30px', background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={registerUser}
            disabled={loading}
            style={{
              padding: '14px 30px',
              fontSize: '16px',
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
            {loading ? '注册中...' : '注册新用户'}
          </button>
          <button
            onClick={fetchUsers}
            disabled={loading}
            style={{
              padding: '14px 30px',
              fontSize: '16px',
              background: '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(82, 196, 26, 0.4)',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '获取中...' : '获取用户列表'}
          </button>
        </div>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '8px',
            color: '#ff4d4f',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: '8px',
            color: '#52c41a',
            fontSize: '14px',
          }}>
            {success}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '24px', fontWeight: '600' }}>
          用户列表 ({users.length})
        </h3>
        {users.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <p style={{ color: '#999', fontSize: '16px' }}>暂无用户，请先注册</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {users.map((user) => (
              <div key={user.id} style={{
                padding: '20px',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e8e8e8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.3s',
              }} onMouseOver={handleItemHover}>
                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#333', fontSize: '18px' }}>
                  {user.full_name}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  用户名: {user.username}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
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
