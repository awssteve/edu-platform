import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Switch, Card, Form, Input, Button, Select } from 'antd';

const { Option } = Select;
const API_BASE_URL = 'http://localhost:8000';

// Profile Settings Page
export function ProfileSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: false,
    marketing_emails: false,
  });
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem('token') || '');

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUser(data);
    } catch (error) {
      message.error('获取用户信息失败: ' + error.message);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/profile/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('设置保存成功！');
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

  if (!user) {
    return (
      <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ color: '#999', fontSize: '18px' }}>加载中...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <Button
          onClick={() => navigate('/profile')}
          style={{ marginBottom: '20px' }}
        >
          ← 返回个人资料
        </Button>

        <h1 style={{ fontSize: '32px', marginBottom: '30px', color: '#333', fontWeight: '700' }}>
          设置
        </h1>

        <Card title="用户信息" style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>用户名</div>
            <div style={{ fontSize: '16px', color: '#333', fontWeight: '600' }}>{user.username}</div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>邮箱</div>
            <div style={{ fontSize: '16px', color: '#333', fontWeight: '600' }}>{user.email}</div>
          </div>
          <div>
            <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>角色</div>
            <div style={{ fontSize: '16px', color: '#667eea', fontWeight: '600' }}>
              {user.role === 'student' ? '学生' : user.role === 'teacher' ? '教师' : '管理员'}
            </div>
          </div>
        </Card>

        <Card title="通知设置" style={{ marginBottom: '20px' }}>
          <Form layout="vertical" onSubmit={handleSaveSettings}>
            <Form.Item label="邮件通知">
              <Switch
                checked={settings.email_notifications}
                onChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
              />
              <div style={{ fontSize: '14px', color: '#999', marginTop: '5px' }}>
                接收课程更新、作业提醒等邮件通知
              </div>
            </Form.Item>
            <Form.Item label="推送通知">
              <Switch
                checked={settings.push_notifications}
                onChange={(checked) => setSettings({ ...settings, push_notifications: checked })}
              />
              <div style={{ fontSize: '14px', color: '#999', marginTop: '5px' }}>
                接收浏览器和移动端推送通知
              </div>
            </Form.Item>
            <Form.Item label="营销邮件">
              <Switch
                checked={settings.marketing_emails}
                onChange={(checked) => setSettings({ ...settings, marketing_emails: checked })}
              />
              <div style={{ fontSize: '14px', color: '#999', marginTop: '5px' }}>
                接收产品更新、优惠活动等营销邮件
              </div>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{ width: '100%', height: '44px', fontSize: '18px', fontWeight: '600' }}
              >
                保存设置
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="隐私设置">
          <Form layout="vertical">
            <Form.Item label="公开资料">
              <Select defaultValue="all">
                <Option value="all">全部可见</Option>
                <Option value="contacts">仅联系人可见</Option>
                <Option value="none">不可见</Option>
              </Select>
              <div style={{ fontSize: '14px', color: '#999', marginTop: '5px' }}>
                控制谁可以看到您的公开资料
              </div>
            </Form.Item>
            <Form.Item label="显示在线状态">
              <Switch defaultChecked />
              <div style={{ fontSize: '14px', color: '#999', marginTop: '5px' }}>
                允许其他人看到您在线
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
