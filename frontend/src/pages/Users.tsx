import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Button, Table, Modal, Input, Upload } from 'antd';

const { TextArea } = Input;
const { Dragger } = Upload;
const { InboxOutlined } = require('@ant-design/icons');
const API_BASE_URL = 'http://localhost:8000';

// Teachers List Page
export function TeachersList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    subject: '',
  });
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/teachers/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setTeachers(data || []);
    } catch (error) {
      message.error('获取教师列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/teachers/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(inviteForm),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('邀请邮件已发送！');
        setIsInviteModalVisible(false);
        setInviteForm({ email: '', name: '', subject: '' });
      } else {
        message.error(data.detail || '邀请失败');
      }
    } catch (error) {
      message.error('邀请失败：' + error.message);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const columns = [
    { title: '教师姓名', dataIndex: 'name', key: 'name' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <span style={{
          padding: '4px 12px',
          background: isActive ? '#f6ffed' : '#fff1f0',
          borderRadius: '20px',
          color: isActive ? '#52c41a' : '#ff4d4f',
          fontSize: '14px',
          fontWeight: '500',
        }}>
          {isActive ? '活跃' : '未激活'}
        </span>
      ),
    },
    { title: '加入时间', dataIndex: 'joined_at', key: 'joined_at', render: (date) => date ? new Date(date).toLocaleDateString('zh-CN') : '-' },
  ];

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', color: '#333', fontWeight: '700', margin: 0 }}>
            教师管理
          </h1>
          <Button type="primary" onClick={() => setIsInviteModalVisible(true)} size="large">
            邀请教师
          </Button>
        </div>

        <Table
          dataSource={teachers}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="id"
          style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
        />

        <Modal
          title="邀请新教师"
          open={isInviteModalVisible}
          onOk={handleInvite}
          onCancel={() => { setIsInviteModalVisible(false); setInviteForm({ email: '', name: '', subject: '' }); }}
          okText="发送邀请"
          cancelText="取消"
        >
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                教师邮箱 *
              </label>
              <Input
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="请输入教师邮箱"
                size="large"
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                教师姓名 *
              </label>
              <Input
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                placeholder="请输入教师姓名"
                size="large"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                邀件主题
              </label>
              <Input
                value={inviteForm.subject}
                onChange={(e) => setInviteForm({ ...inviteForm, subject: e.target.value })}
                placeholder="请输入邀请邮件主题"
                size="large"
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

// Students List Page
export function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [addForm, setAddForm] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
  });
  const [importFile, setImportFile] = useState(null);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/students/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setStudents(data || []);
    } catch (error) {
      message.error('获取学生列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/students/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addForm),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('学生添加成功！');
        setIsAddModalVisible(false);
        setAddForm({ username: '', email: '', full_name: '', password: '' });
        fetchStudents();
      } else {
        message.error(data.detail || '添加失败');
      }
    } catch (error) {
      message.error('添加失败：' + error.message);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      message.warning('请先选择文件');
      return;
    }

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/students/import`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        message.success(`成功导入 ${data.count || 0} 个学生！`);
        setIsImportModalVisible(false);
        setImportFile(null);
        fetchStudents();
      } else {
        message.error(data.detail || '导入失败');
      }
    } catch (error) {
      message.error('导入失败：' + error.message);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      setImportFile(file);
      return false;
    },
    onRemove: () => {
      setImportFile(null);
    },
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'full_name', key: 'full_name' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '角色', dataIndex: 'role', key: 'role', render: () => '学生' },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <span style={{
          padding: '4px 12px',
          background: isActive ? '#f6ffed' : '#fff1f0',
          borderRadius: '20px',
          color: isActive ? '#52c41a' : '#ff4d4f',
          fontSize: '14px',
          fontWeight: '500',
        }}>
          {isActive ? '活跃' : '未激活'}
        </span>
      ),
    },
    { title: '加入时间', dataIndex: 'created_at', key: 'created_at', render: (date) => date ? new Date(date).toLocaleDateString('zh-CN') : '-' },
  ];

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <Button type="primary" onClick={() => setIsAddModalVisible(true)} size="large">
            添加学生
          </Button>
          <Button onClick={() => setIsImportModalVisible(true)} size="large">
            批量导入
          </Button>
        </div>

        <Table
          dataSource={students}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 20 }}
          rowKey="id"
          style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
        />

        {/* Add Student Modal */}
        <Modal
          title="添加学生"
          open={isAddModalVisible}
          onOk={handleAdd}
          onCancel={() => { setIsAddModalVisible(false); setAddForm({ username: '', email: '', full_name: '', password: '' }); }}
          okText="添加"
          cancelText="取消"
        >
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                用户名 *
              </label>
              <Input
                value={addForm.username}
                onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                placeholder="请输入用户名"
                size="large"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                邮箱 *
              </label>
              <Input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="请输入邮箱"
                size="large"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                姓名 *
              </label>
              <Input
                value={addForm.full_name}
                onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                placeholder="请输入姓名"
                size="large"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                密码 *
              </label>
              <Input
                type="password"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                placeholder="请输入密码（至少6位）"
                size="large"
                minLength={6}
              />
            </div>
          </div>
        </Modal>

        {/* Import Students Modal */}
        <Modal
          title="批量导入学生"
          open={isImportModalVisible}
          onOk={handleImport}
          onCancel={() => { setIsImportModalVisible(false); setImportFile(null); }}
          okText="导入"
          cancelText="取消"
        >
          <div style={{ padding: '20px 0' }}>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px' }}>
              请上传 Excel (.xlsx) 或 CSV (.csv) 文件，文件格式如下：
            </p>
            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', color: '#666' }}>
              <div>用户名 | 邮箱 | 姓名 | 密码</div>
              <div>student1 | student1@example.com | 张三 | 123456</div>
              <div>student2 | student2@example.com | 李四 | 123456</div>
            </div>
            <Dragger {...uploadProps} style={{ padding: '40px', background: '#fafafa', borderRadius: '8px', border: '2px dashed #d9d9d9' }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ fontSize: '48px', color: '#667eea' }} />
              </p>
              <p style={{ color: '#666', fontSize: '16px', margin: '10px 0' }}>
                点击或拖拽文件到此处上传
              </p>
              <p style={{ color: '#999', fontSize: '14px' }}>
                支持 .xlsx、.csv 格式
              </p>
            </Dragger>
          </div>
        </Modal>
      </div>
    </div>
  );
}
