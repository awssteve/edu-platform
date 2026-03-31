import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Card, Statistic, Row, Col, Button, Table, Tag, DatePicker, Form, Input, Select, InputNumber, Modal } from 'antd';

const { Option } = Select;
const { RangePicker } = DatePicker;
const API_BASE_URL = 'http://localhost:8000';

// School Subscriptions Page
export function SchoolSubscriptions() {
  const { schoolId } = useParams();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/schools/${schoolId}/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSubscriptions(data || []);
    } catch (error) {
      message.error('获取订阅信息失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/schools/${schoolId}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('订阅创建成功！');
        setIsModalVisible(false);
        form.resetFields();
        fetchSubscriptions();
      } else {
        message.error(data.detail || '创建失败');
      }
    } catch (error) {
      message.error('创建失败: ' + error.message);
    }
  };

  useEffect(() => {
    if (schoolId) fetchSubscriptions();
  }, [schoolId]);

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', color: '#333', fontWeight: '700', margin: 0 }}>
            订阅管理
          </h1>
          <Button type="primary" onClick={() => setIsModalVisible(true)} size="large">
            创建订阅
          </Button>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: '30px' }}>
          <Col span={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic title="总收入" value={subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0)} suffix=" 元" />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic title="订阅数" value={subscriptions.length} suffix=" 个" />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic title="活跃订阅" value={subscriptions.filter(s => s.is_active).length} suffix=" 个" />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic title="即将到期" value={subscriptions.filter(s => s.days_until_expiry <= 7).length} suffix=" 个" />
            </Card>
          </Col>
        </Row>

        <Table
          dataSource={subscriptions}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          columns={[
            { title: '订阅ID', dataIndex: 'id', key: 'id' },
            { title: '套餐名称', dataIndex: 'plan_name', key: 'plan_name' },
            { 
              title: '金额', 
              dataIndex: 'amount', 
              key: 'amount',
              render: (amount) => `¥${amount?.toLocaleString() || 0}`
            },
            {
              title: '周期',
              dataIndex: 'billing_cycle',
              key: 'billing_cycle',
              render: (cycle) => {
                const labels = { monthly: '月付', quarterly: '季付', yearly: '年付' };
                return labels[cycle] || cycle;
              }
            },
            { title: '学生数', dataIndex: 'student_limit', key: 'student_limit' },
            { title: '开始时间', dataIndex: 'start_date', key: 'start_date', render: (date) => date ? new Date(date).toLocaleDateString('zh-CN') : '-' },
            { title: '结束时间', dataIndex: 'end_date', key: 'end_date', render: (date) => date ? new Date(date).toLocaleDateString('zh-CN') : '-' },
            {
              title: '状态',
              dataIndex: 'is_active',
              key: 'is_active',
              render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                  {isActive ? '活跃' : '已过期'}
                </Tag>
              )
            },
          ]}
          style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
        />

        <Modal
          title="创建新订阅"
          open={isModalVisible}
          onOk={() => form.validateFields().then(handleCreate)}
          onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
          okText="创建"
          cancelText="取消"
          width={600}
        >
          <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
            <Form.Item
              label="套餐名称"
              name="plan_name"
              rules={[{ required: true, message: '请输入套餐名称' }]}
            >
              <Input placeholder="请输入套餐名称" size="large" />
            </Form.Item>
            <Form.Item
              label="金额（元）"
              name="amount"
              rules={[{ required: true, message: '请输入金额' }]}
            >
              <InputNumber placeholder="请输入金额" min={0} size="large" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="计费周期"
              name="billing_cycle"
              rules={[{ required: true, message: '请选择计费周期' }]}
            >
              <Select placeholder="请选择计费周期" size="large">
                <Option value="monthly">月付</Option>
                <Option value="quarterly">季付</Option>
                <Option value="yearly">年付</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="学生数量限制"
              name="student_limit"
              rules={[{ required: true, message: '请输入学生数量限制' }]}
            >
              <InputNumber placeholder="请输入学生数量限制" min={1} size="large" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="订阅开始时间"
              name="start_date"
              rules={[{ required: true, message: '请选择开始时间' }]}
            >
              <DatePicker style={{ width: '100%' }} size="large" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

// Edit Course Page
export function EditCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem('token') || '');

  const fetchCourse = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      message.error('获取课程信息失败: ' + error.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(course),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('课程更新成功！');
        navigate(`/courses/${courseId}`);
      } else {
        message.error(data.detail || '更新失败');
      }
    } catch (error) {
      message.error('更新失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchCourse();
  }, [courseId]);

  if (!course && !loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        课程不存在
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '700px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#333', fontWeight: '700' }}>
          编辑课程
        </h1>

        {course && (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '25px', background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                课程标题 *
              </label>
              <input
                type="text"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                placeholder="请输入课程标题"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '10px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e1e1e1'}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                课程分类 *
              </label>
              <select
                value={course.category}
                onChange={(e) => setCourse({ ...course, category: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '10px',
                  fontSize: '16px',
                  background: 'white',
                  boxSizing: 'border-box',
                }}
              >
                <option value="数学">数学</option>
                <option value="物理">物理</option>
                <option value="化学">化学</option>
                <option value="生物">生物</option>
                <option value="计算机">计算机</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                课程描述 *
              </label>
              <textarea
                value={course.description}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                placeholder="请输入课程描述"
                required
                rows={6}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '10px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                type="button"
                onClick={() => navigate(`/courses/${courseId}`)}
                style={{
                  flex: 1,
                  padding: '18px',
                  fontSize: '18px',
                  background: 'white',
                  color: '#666',
                  border: '2px solid #e1e1e1',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                }}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 2,
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
                {loading ? '更新中...' : '更新课程'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
