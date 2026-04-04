import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Space, Dropdown } from 'antd';
import {
  HomeOutlined, UserOutlined, RobotOutlined, TeamOutlined,
  BarChartOutlined, BookOutlined, LineChartOutlined,
  BulbOutlined, SearchOutlined, SettingOutlined, LogoutOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, ThunderboltOutlined,
  AimOutlined, VideoCameraOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // 角色显示映射
  const roleDisplayMap: Record<string, string> = {
    'teacher': '教师',
    'student': '学生',
    'admin': '管理员'
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/ai-tutor-menu',
      icon: <RobotOutlined />,
      label: 'AI助教',
      children: [
        { key: '/ai-tutor/1', label: 'Python课程' },
        { key: '/ai-tutor/2', label: '数据结构' },
        { key: '/ai-tutor/3', label: '机器学习' },
      ]
    },
    {
      key: '/ai-agents',
      icon: <TeamOutlined />,
      label: 'AI智能体',
    },
    {
      key: '/video-conference-menu',
      icon: <VideoCameraOutlined />,
      label: '视频会议',
      children: [
        { key: '/video-conference/classroom-101', label: '教室101' },
        { key: '/video-conference/study-group', label: '学习小组' },
      ]
    },
    {
      key: '/super-blackboard',
      icon: <LineChartOutlined />,
      label: '超级黑板',
    },
    {
      key: '/knowledge-graph',
      icon: <BookOutlined />,
      label: '知识图谱',
    },
    {
      key: '/recommendations',
      icon: <BulbOutlined />,
      label: '智能推荐',
    },
    {
      key: '/learning-analytics',
      icon: <BarChartOutlined />,
      label: '学习分析',
    },
    {
      key: '/adaptive-learning',
      icon: <AimOutlined />,
      label: '自适应学习',
    },
    {
      key: '/knowledge-base',
      icon: <SearchOutlined />,
      label: 'RAG知识库',
    },
  ];

  const handleMenuClick = ({ key, keyPath }: { key: string; keyPath: string[] }) => {
    console.log('🔍 菜单点击:', { key, keyPath, currentPath: location.pathname });

    // 检查是否是父菜单项
    if (key === '/video-conference-menu' || key === '/ai-tutor-menu') {
      console.log('⚠️ 点击了父菜单，应该展开子菜单');
      return; // 父菜单不导航，只展开
    }

    // 视频会议子菜单 - 使用全局函数打开Modal
    if (key.startsWith('/video-conference/')) {
      const roomName = key.replace('/video-conference/', '');
      console.log('🎥 打开视频会议室:', roomName);

      // 检查全局函数是否存在
      console.log('🔍 检查全局函数:', typeof (window as any).openVideoConference);

      // 使用全局函数
      if ((window as any).openVideoConference) {
        console.log('✅ 调用全局函数 openVideoConference');
        (window as any).openVideoConference(roomName);
      } else {
        console.error('❌ 全局函数 openVideoConference 未定义！');
      }
      return;
    }

    // 其他子菜单项直接导航
    console.log('🚀 准备导航到:', key);
    navigate(key);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={240}
        style={{
          background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
          overflow: 'hidden',
          height: '100dvh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo区域 */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '10px',
          flexShrink: 0,
        }}>
          <div style={{
            color: 'white',
            fontSize: collapsed ? '20px' : '18px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
            {collapsed ? '🎓' : '高校教育平台'}
          </div>
        </div>

        {/* 导航菜单 - 可滚动区域 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
        }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={handleMenuClick}
            items={menuItems}
            style={{
              background: 'transparent',
              border: 'none',
            }}
          />
        </div>

        {/* 底部用户信息 */}
        <div style={{
          padding: '15px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.1)',
          flexShrink: 0,
          minHeight: '80px',
          maxHeight: '120px',
        }}>
          <Dropdown menu={{ items: userMenuItems }} placement="topLeft">
            <Space
              style={{ cursor: 'pointer', color: 'white', width: '100%' }}
              direction={collapsed ? 'vertical' : 'horizontal'}
            >
              <Avatar
                size={collapsed ? 'small' : 'default'}
                icon={<UserOutlined />}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white'
                }}
              />
              {!collapsed && (
                <div style={{ color: 'white', fontSize: '13px' }}>
                  <div style={{ fontWeight: 500 }}>{user.full_name || user.username}</div>
                  <div style={{ fontSize: '11px', opacity: 0.7 }}>
                    {roleDisplayMap[user.role] || '学生'}
                  </div>
                </div>
              )}
            </Space>
          </Dropdown>
        </div>
      </Sider>

      {/* 主内容区 */}
      <Layout style={{ marginLeft: collapsed ? 80 : 240 }}>
        {/* 顶部栏 */}
        <Header style={{
          background: 'white',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 999,
        }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px' }}
            />
            <span style={{ fontSize: 16, fontWeight: 500, color: '#333' }}>
              {getPageTitle(location.pathname)}
            </span>
          </Space>

          <Space>
            <Button
              type="text"
              icon={<ThunderboltOutlined />}
              style={{ fontSize: '16px', color: '#667eea' }}
            >
              AI助手
            </Button>
            <Button
              type="text"
              icon={<SearchOutlined />}
              style={{ fontSize: '16px' }}
            >
              搜索
            </Button>
          </Space>
        </Header>

        {/* 内容区域 */}
        <Content style={{
          margin: '24px 16px',
          minHeight: 'calc(100vh - 64px - 48px)',
          overflow: 'auto',
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/dashboard': '仪表板',
    '/ai-tutor/1': 'AI助教 - Python课程',
    '/ai-tutor/2': 'AI助教 - 数据结构',
    '/ai-tutor/3': 'AI助教 - 机器学习',
    '/ai-agents': 'AI智能体团队',
    '/super-blackboard': '超级黑板',
    '/knowledge-graph': '知识图谱',
    '/recommendations': '智能推荐',
    '/learning-analytics': '学习分析',
    '/adaptive-learning': '自适应学习路径',
    '/knowledge-base': 'RAG知识库',
  };
  return titles[pathname] || '教育平台';
}

export default MainLayout;