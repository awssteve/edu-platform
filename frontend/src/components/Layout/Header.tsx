import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Space, Button, Avatar, Badge, Dropdown, Input } from 'antd';
import {
  BellOutlined,
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const AppHeader = () => {
  const navigate = useNavigate();
  const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [notificationCount] = useState(5);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
      },
    },
  ];

  return (
    <div
      style={{
        background: 'white',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        onClick={() => navigate('/')}
      >
        智慧教育
      </div>

      {/* Search */}
      <Input.Search
        placeholder="搜索课程、课件、讨论..."
        allowClear
        style={{ width: 400 }}
        prefix={<SearchOutlined />}
        onSearch={(value) => navigate(`/search?q=${value}`)}
      />

      {/* Actions */}
      <Space size="large">
        {/* Notifications */}
        <Badge count={notificationCount} size="small">
          <Button
            type="text"
            icon={<BellOutlined />}
            style={{ fontSize: 18 }}
            onClick={() => navigate('/notifications')}
          />
        </Badge>

        {/* User Menu */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              size="default"
              src={user.avatar_url}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#667eea' }}
            />
            <span style={{ fontWeight: 500 }}>
              {user.full_name || user.username}
            </span>
          </Space>
        </Dropdown>
      </Space>
    </div>
  );
};

export default AppHeader;
