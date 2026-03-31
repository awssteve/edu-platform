import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Notifications List Page
export function NotificationsList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setNotifications(data || []);
    } catch (error) {
      message.error('获取通知列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        message.success('已标记为已读');
        fetchNotifications();
      } else {
        const data = await response.json();
        message.error(data.detail || '操作失败');
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/read-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        message.success('已全部标记为已读');
        fetchNotifications();
      } else {
        const data = await response.json();
        message.error(data.detail || '操作失败');
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        加载中...
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', color: '#333', fontWeight: '700', margin: 0 }}>
            通知中心
          </h1>
          {unreadCount > 0 && (
            <div style={{
              padding: '10px 20px',
              background: '#ff4d4f',
              color: 'white',
              borderRadius: '20px',
              fontSize: '16px',
              fontWeight: '600',
            }}>
              {unreadCount} 条未读
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              }}
            >
              全部标为已读
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔔</div>
            <p style={{ color: '#999', fontSize: '18px' }}>暂无通知</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} onMarkAsRead={handleMarkAsRead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationCard({ notification, onMarkAsRead }) {
  const typeLabels = {
    'system': { label: '系统通知', icon: '🔧', color: '#667eea' },
    'course': { label: '课程通知', icon: '📚', color: '#52c41a' },
    'assignment': { label: '作业通知', icon: '📝', color: '#faad14' },
    'discussion': { label: '讨论通知', icon: '💬', color: '#ff4d4f' },
  };

  const typeInfo = typeLabels[notification.type] || { label: '通知', icon: '📢', color: '#999' };

  return (
    <div
      style={{
        padding: notification.is_read ? '20px' : '25px',
        background: notification.is_read ? 'white' : '#f0f9ff',
        borderRadius: '16px',
        border: '1px solid #e8e8e8',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'all 0.3s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '28px' }}>{typeInfo.icon}</span>
          <div>
            <div style={{
              padding: '4px 12px',
              background: typeInfo.color,
              color: 'white',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              display: 'inline-block',
              marginBottom: '5px',
            }}>
              {typeInfo.label}
            </div>
            <h3 style={{ fontSize: '18px', color: '#333', fontWeight: '600', margin: 0 }}>
              {notification.title}
            </h3>
          </div>
        </div>
        <div style={{ color: '#999', fontSize: '14px' }}>
          {notification.created_at ? new Date(notification.created_at).toLocaleString('zh-CN') : '-'}
        </div>
      </div>

      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6', marginBottom: '15px', margin: 0 }}>
        {notification.content}
      </p>

      {!notification.is_read && (
        <button
          onClick={() => onMarkAsRead(notification.id)}
          style={{
            padding: '8px 20px',
            fontSize: '14px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s',
          }}
        >
          标记为已读
        </button>
      )}
    </div>
  );
}

// Notification Settings Page
export function NotificationSettings() {
  const [settings, setSettings] = useState({
    email_notifications: true,
    system_notifications: true,
    course_notifications: true,
    assignment_notifications: true,
    discussion_notifications: true,
  });
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data) {
        setSettings(data);
      }
    } catch (error) {
      message.error('获取通知设置失败: ' + error.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/settings`, {
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
    fetchSettings();
  }, []);

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', color: '#333', fontWeight: '700' }}>
          通知设置
        </h1>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <h3 style={{ fontSize: '24px', color: '#333', fontWeight: '600', marginBottom: '20px', margin: 0 }}>
                通知类型
              </h3>

              <div style={{ display: 'grid', gap: '20px' }}>
                {[
                  { key: 'email_notifications', label: '邮件通知', icon: '📧' },
                  { key: 'system_notifications', label: '系统通知', icon: '🔧' },
                  { key: 'course_notifications', label: '课程通知', icon: '📚' },
                  { key: 'assignment_notifications', label: '作业通知', icon: '📝' },
                  { key: 'discussion_notifications', label: '讨论通知', icon: '💬' },
                ].map((item) => (
                  <div key={item.key} style={{
                    padding: '20px',
                    border: '2px solid #e1e1e1',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    transition: 'border-color 0.3s',
                  }}>
                    <span style={{ fontSize: '32px' }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '18px', color: '#333', fontWeight: '600', marginBottom: '8px' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        接收此类型的系统通知
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings[item.key]}
                      onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                      style={{
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '30px' }}>
              <h3 style={{ fontSize: '24px', color: '#333', fontWeight: '600', marginBottom: '20px', margin: 0 }}>
                接收偏好
              </h3>

              <div style={{ display: 'grid', gap: '15px' }}>
                {[
                  { label: '实时推送', key: 'realtime_push' },
                  { label: '每日汇总', key: 'daily_digest' },
                  { label: '每周汇总', key: 'weekly_digest' },
                ].map((item) => (
                  <div key={item.key} style={{
                    padding: '15px',
                    background: '#f5f5f5',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                  }}>
                    <input
                      type="checkbox"
                      defaultChecked={false}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                      }}
                    />
                    <span style={{ fontSize: '16px', color: '#333' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
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
              {loading ? '保存中...' : '保存设置'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
