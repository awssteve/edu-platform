import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Button, Table, Tag, Input, Modal } from 'antd';

const { TextArea } = Input;
const API_BASE_URL = 'http://localhost:8000';

// Permissions Page
export function PermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPermission, setNewPermission] = useState({
    name: '',
    description: '',
  });
  const navigate = useNavigate();

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPermissions(data || []);
    } catch (error) {
      message.error('获取权限列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPermission),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('权限创建成功！');
        setIsModalVisible(false);
        setNewPermission({ name: '', description: '' });
        fetchPermissions();
      } else {
        message.error(data.detail || '创建失败');
      }
    } catch (error) {
      message.error('创建失败: ' + error.message);
    }
  };

  const handleDelete = async (permissionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/permissions/${permissionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        message.success('权限删除成功！');
        fetchPermissions();
      } else {
        const data = await response.json();
        message.error(data.detail || '删除失败');
      }
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const columns = [
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? new Date(date).toLocaleDateString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button danger size="small" onClick={() => handleDelete(record.id)}>
          删除
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', color: '#333', fontWeight: '700', margin: 0 }}>
            权限管理
          </h1>
          <Button type="primary" onClick={() => setIsModalVisible(true)} size="large">
            创建权限
          </Button>
        </div>

        <Table
          dataSource={permissions}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="id"
          style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
        />

        <Modal
          title="创建新权限"
          open={isModalVisible}
          onOk={handleCreate}
          onCancel={() => { setIsModalVisible(false); setNewPermission({ name: '', description: '' }); }}
          okText="创建"
          cancelText="取消"
        >
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                权限名称 *
              </label>
              <Input
                value={newPermission.name}
                onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                placeholder="请输入权限名称"
                size="large"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                权限描述
              </label>
              <TextArea
                value={newPermission.description}
                onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                placeholder="请输入权限描述"
                rows={4}
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

// Roles Page
export function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setRoles(data || []);
    } catch (error) {
      message.error('获取角色列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '用户数',
      dataIndex: 'user_count',
      key: 'user_count',
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (perms) => (
        <div>
          {perms && perms.map((perm, idx) => (
            <Tag key={idx} color="blue" style={{ marginBottom: '5px' }}>
              {perm.name}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? new Date(date).toLocaleDateString('zh-CN') : '-',
    },
  ];

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '30px', color: '#333', fontWeight: '700' }}>
          角色管理
        </h1>

        <Table
          dataSource={roles}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="id"
          style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
        />
      </div>
    </div>
  );
}
