import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Modal, Input, Button } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Schools List Page
export function SchoolsList() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/schools/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSchools(data || []);
    } catch (error) {
      message.error('获取学校列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchool = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/schools/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newSchoolName }),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('学校创建成功！');
        setNewSchoolName('');
        setIsModalVisible(false);
        fetchSchools();
      } else {
        message.error(data.detail || '创建失败');
      }
    } catch (error) {
      message.error('创建失败: ' + error.message);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', color: '#333', fontWeight: '700', margin: 0 }}>
            学校管理
          </h1>
          <Button
            type="primary"
            onClick={() => setIsModalVisible(true)}
            style={{ borderRadius: '8px', height: '44px', fontSize: '16px' }}
          >
            创建学校
          </Button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#999', fontSize: '18px' }}>
            加载中...
          </div>
        ) : schools.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏫</div>
            <p style={{ color: '#999', fontSize: '18px' }}>暂无学校</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {schools.map((school) => (
              <SchoolCard key={school.id} school={school} navigate={navigate} />
            ))}
          </div>
        )}
      </div>

      <Modal
        title="创建新学校"
        open={isModalVisible}
        onOk={handleCreateSchool}
        onCancel={() => { setIsModalVisible(false); setNewSchoolName(''); }}
        okText="创建"
        cancelText="取消"
      >
        <div style={{ padding: '20px 0' }}>
          <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
            学校名称 *
          </label>
          <Input
            value={newSchoolName}
            onChange={(e) => setNewSchoolName(e.target.value)}
            placeholder="请输入学校名称"
            size="large"
          />
        </div>
      </Modal>
    </div>
  );
}

function SchoolCard({ school, navigate }) {
  return (
    <div
      onClick={() => navigate(`/schools/${school.id}`)}
      style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'all 0.3s',
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '28px', color: '#333', fontWeight: '600', margin: 0 }}>
          {school.name}
        </h3>
        <div style={{
          padding: '8px 16px',
          background: school.is_active ? '#f6ffed' : '#fff1f0',
          borderRadius: '20px',
          color: school.is_active ? '#52c41a' : '#ff4d4f',
          fontSize: '14px',
          fontWeight: '500',
        }}>
          {school.is_active ? '活跃' : '未激活'}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', borderTop: '2px solid #f0f0f0', paddingTop: '20px' }}>
        <div>
          <div style={{ color: '#999', fontSize: '14px', marginBottom: '8px' }}>学生数</div>
          <div style={{ color: '#333', fontSize: '24px', fontWeight: '600' }}>
            {school.student_count || 0}
          </div>
        </div>
        <div>
          <div style={{ color: '#999', fontSize: '14px', marginBottom: '8px' }}>教师数</div>
          <div style={{ color: '#333', fontSize: '24px', fontWeight: '600' }}>
            {school.teacher_count || 0}
          </div>
        </div>
        <div>
          <div style={{ color: '#999', fontSize: '14px', marginBottom: '8px' }}>课程数</div>
          <div style={{ color: '#333', fontSize: '24px', fontWeight: '600' }}>
            {school.course_count || 0}
          </div>
        </div>
      </div>
    </div>
  );
}

// School Detail Page
export function SchoolDetail() {
  const { schoolId } = useParams();
  const [school, setSchool] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchSchoolDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/schools/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSchool(data);

      const studentResponse = await fetch(`${API_BASE_URL}/api/v1/schools/${schoolId}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const studentData = await studentResponse.json();
      setStudents(studentData || []);

      const teacherResponse = await fetch(`${API_BASE_URL}/api/v1/schools/${schoolId}/teachers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const teacherData = await teacherResponse.json();
      setTeachers(teacherData || []);
    } catch (error) {
      message.error('获取学校详情失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId) fetchSchoolDetail();
  }, [schoolId]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        加载中...
      </div>
    );
  }

  if (!school) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        学校不存在
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Button
          onClick={() => navigate('/schools')}
          style={{ marginBottom: '20px' }}
        >
          ← 返回学校列表
        </Button>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '20px', color: '#333', fontWeight: '700', margin: 0 }}>
            {school.name}
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px', borderTop: '2px solid #f0f0f0', paddingTop: '20px' }}>
            <div>
              <div style={{ color: '#999', fontSize: '14px', marginBottom: '8px' }}>学生总数</div>
              <div style={{ color: '#333', fontSize: '24px', fontWeight: '600' }}>
                {school.student_count || 0}
              </div>
            </div>
            <div>
              <div style={{ color: '#999', fontSize: '14px', marginBottom: '8px' }}>教师总数</div>
              <div style={{ color: '#333', fontSize: '24px', fontWeight: '600' }}>
                {school.teacher_count || 0}
              </div>
            </div>
            <div>
              <div style={{ color: '#999', fontSize: '14px', marginBottom: '8px' }}>课程总数</div>
              <div style={{ color: '#333', fontSize: '24px', fontWeight: '600' }}>
                {school.course_count || 0}
              </div>
            </div>
            <div>
              <div style={{ color: '#999', fontSize: '14px', marginBottom: '8px' }}>创建时间</div>
              <div style={{ color: '#333', fontSize: '16px', fontWeight: '600' }}>
                {school.created_at ? new Date(school.created_at).toLocaleDateString('zh-CN') : '-'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', borderTop: '2px solid #f0f0f0', paddingTop: '20px' }}>
            <Button
              type="primary"
              onClick={() => navigate(`/schools/${schoolId}/students`)}
              style={{ borderRadius: '8px', height: '44px', fontSize: '16px', flex: 1 }}
            >
              学生管理 ({school.student_count || 0})
            </Button>
            <Button
              onClick={() => navigate(`/schools/${schoolId}/teachers`)}
              style={{ borderRadius: '8px', height: '44px', fontSize: '16px', flex: 1 }}
            >
              教师管理 ({school.teacher_count || 0})
            </Button>
            <Button
              onClick={() => navigate(`/schools/${schoolId}/subscriptions`)}
              style={{ borderRadius: '8px', height: '44px', fontSize: '16px', flex: 1 }}
            >
              订阅管理
            </Button>
          </div>
        </div>

        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>
            <Button
              type={activeTab === 'students' ? 'primary' : 'default'}
              onClick={() => setActiveTab('students')}
              style={{ borderRadius: '8px', height: '44px', fontSize: '16px' }}
            >
              学生列表 ({students.length})
            </Button>
            <Button
              type={activeTab === 'teachers' ? 'primary' : 'default'}
              onClick={() => setActiveTab('teachers')}
              style={{ borderRadius: '8px', height: '44px', fontSize: '16px' }}
            >
              教师列表 ({teachers.length})
            </Button>
          </div>

          {activeTab === 'students' && (
            <div>
              <h3 style={{ fontSize: '24px', color: '#333', fontWeight: '600', marginBottom: '20px', margin: 0 }}>
                学生列表
              </h3>
              {students.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '16px' }}>
                  暂无学生
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {students.map((student) => (
                    <div key={student.id} style={{ padding: '20px', background: '#f9f9f9', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                      <div style={{ marginBottom: '10px', color: '#333', fontSize: '18px', fontWeight: '600' }}>
                        {student.name || `学生${student.id}`}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>
                        {student.email || '-'}
                      </div>
                      <div style={{ marginTop: '10px', color: '#999', fontSize: '14px' }}>
                        加入时间: {student.joined_at ? new Date(student.joined_at).toLocaleDateString('zh-CN') : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'teachers' && (
            <div>
              <h3 style={{ fontSize: '24px', color: '#333', fontWeight: '600', marginBottom: '20px', margin: 0 }}>
                教师列表
              </h3>
              {teachers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '16px' }}>
                  暂无教师
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {teachers.map((teacher) => (
                    <div key={teacher.id} style={{ padding: '20px', background: '#f9f9f9', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                      <div style={{ marginBottom: '10px', color: '#333', fontSize: '18px', fontWeight: '600' }}>
                        {teacher.name || `教师${teacher.id}`}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>
                        {teacher.email || '-'}
                      </div>
                      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        <span style={{ padding: '4px 12px', background: teacher.is_active ? '#f6ffed' : '#fff1f0', borderRadius: '12px', color: teacher.is_active ? '#52c41a' : '#ff4d4f', fontSize: '12px', fontWeight: '500' }}>
                          {teacher.is_active ? '活跃' : '未激活'}
                        </span>
                        <span style={{ color: '#999', fontSize: '12px' }}>
                          加入时间: {teacher.joined_at ? new Date(teacher.joined_at).toLocaleDateString('zh-CN') : '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
